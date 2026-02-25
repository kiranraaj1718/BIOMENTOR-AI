"""RAG (Retrieval-Augmented Generation) Service for BioMentor AI.
Works in two modes:
1. Full mode: With LangChain + ChromaDB + OpenAI embeddings (when packages are installed)
2. Lite mode: Keyword-based retrieval from curriculum content (always available)
"""

import os
import logging
from typing import List, Optional
from app.config import get_settings
from app.curriculum import get_all_content_chunks

logger = logging.getLogger(__name__)
settings = get_settings()

# Try importing LangChain (optional dependency)
try:
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain_community.vectorstores import Chroma
    from langchain_openai import OpenAIEmbeddings
    from langchain.schema import Document
    HAS_LANGCHAIN = True
except ImportError:
    HAS_LANGCHAIN = False
    logger.info("LangChain not installed. Using keyword-based retrieval (lite mode).")


class RAGService:
    """Service for managing the RAG pipeline — embeddings, vector store, and retrieval."""

    _instance = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if RAGService._initialized:
            return
        self.embeddings = None
        self.vector_store = None
        self._documents = []
        self._chunk_size = settings.CHUNK_SIZE
        self._chunk_overlap = settings.CHUNK_OVERLAP
        RAGService._initialized = True

    async def initialize(self):
        """Initialize the RAG service with embeddings and vector store."""
        try:
            # Use Gemini embeddings if available, otherwise fall back to keyword mode
            has_gemini_key = settings.GEMINI_API_KEY and settings.GEMINI_API_KEY not in ("", "your-gemini-api-key-here")
            if HAS_LANGCHAIN and has_gemini_key:
                try:
                    from langchain_google_genai import GoogleGenerativeAIEmbeddings
                    self.embeddings = GoogleGenerativeAIEmbeddings(
                        google_api_key=settings.GEMINI_API_KEY,
                        model="models/embedding-001"
                    )
                    logger.info("Using Google Gemini embeddings for vector retrieval.")
                except ImportError:
                    self.embeddings = None
                    logger.info("RAG lite mode: langchain-google-genai not installed. Using keyword retrieval.")
            else:
                self.embeddings = None
                if not HAS_LANGCHAIN:
                    logger.info("RAG lite mode: LangChain not available.")
                else:
                    logger.info("RAG lite mode: No Gemini API key configured.")

            # Load curriculum content
            await self._load_curriculum()
            logger.info("RAG service initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize RAG service: {e}")
            self.embeddings = None
            await self._load_curriculum_lite()

    async def _load_curriculum(self):
        """Load biotechnology curriculum content into the vector store or memory."""
        chunks = get_all_content_chunks()

        if HAS_LANGCHAIN:
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=self._chunk_size,
                chunk_overlap=self._chunk_overlap,
                separators=["\n\n", "\n", "**", ". ", ", ", " ", ""]
            )
            documents = []
            for chunk in chunks:
                texts = text_splitter.split_text(chunk["text"])
                for i, text in enumerate(texts):
                    doc = Document(
                        page_content=text,
                        metadata={**chunk["metadata"], "chunk_index": i}
                    )
                    documents.append(doc)

            if self.embeddings and documents:
                persist_dir = settings.CHROMA_PERSIST_DIR
                os.makedirs(persist_dir, exist_ok=True)
                self.vector_store = Chroma.from_documents(
                    documents=documents,
                    embedding=self.embeddings,
                    persist_directory=persist_dir,
                    collection_name="biotech_curriculum"
                )
                logger.info(f"Loaded {len(documents)} chunks into ChromaDB vector store.")
            else:
                self._store_lite(chunks)
        else:
            self._store_lite(chunks)

    async def _load_curriculum_lite(self):
        """Fallback: load curriculum for keyword search only."""
        chunks = get_all_content_chunks()
        self._store_lite(chunks)

    def _store_lite(self, chunks):
        """Store chunks in memory for keyword-based retrieval."""
        self._documents = []
        for chunk in chunks:
            text = chunk["text"]
            paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
            for i, para in enumerate(paragraphs):
                self._documents.append({
                    "content": para,
                    "metadata": {**chunk["metadata"], "chunk_index": i}
                })
        logger.info(f"Loaded {len(self._documents)} chunks in keyword mode.")

    async def retrieve(self, query: str, top_k: int = None, topic_filter: str = None) -> List[dict]:
        """Retrieve relevant documents for a given query."""
        if top_k is None:
            top_k = settings.TOP_K_RESULTS

        if self.vector_store and self.embeddings:
            return await self._vector_retrieve(query, top_k, topic_filter)
        else:
            return self._keyword_retrieve(query, top_k, topic_filter)

    async def _vector_retrieve(self, query: str, top_k: int, topic_filter: str = None) -> List[dict]:
        """Retrieve using vector similarity search."""
        try:
            filter_dict = None
            if topic_filter:
                filter_dict = {"topic_id": topic_filter}

            results = self.vector_store.similarity_search_with_score(
                query, k=top_k, filter=filter_dict
            )
            return [
                {
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "relevance_score": float(1 - score)
                }
                for doc, score in results
            ]
        except Exception as e:
            logger.error(f"Vector retrieval error: {e}")
            return self._keyword_retrieve(query, top_k, topic_filter)

    def _keyword_retrieve(self, query: str, top_k: int, topic_filter: str = None) -> List[dict]:
        """Keyword-based retrieval — works without any ML dependencies."""
        if not self._documents:
            return []

        query_terms = [t.lower() for t in query.lower().split() if len(t) > 2]
        scored_docs = []

        for doc in self._documents:
            if topic_filter and doc["metadata"].get("topic_id") != topic_filter:
                continue

            content_lower = doc["content"].lower()
            score = 0

            for term in query_terms:
                if term in content_lower:
                    score += content_lower.count(term)

            if query.lower() in content_lower:
                score += 10

            meta_text = f"{doc['metadata'].get('topic_name', '')} {doc['metadata'].get('subtopic', '')}".lower()
            for term in query_terms:
                if term in meta_text:
                    score += 3

            if score > 0:
                scored_docs.append({
                    "content": doc["content"],
                    "metadata": doc["metadata"],
                    "relevance_score": min(score / max(len(query_terms), 1), 1.0)
                })

        scored_docs.sort(key=lambda x: x["relevance_score"], reverse=True)
        return scored_docs[:top_k]

    def get_context_string(self, retrieved_docs: List[dict]) -> str:
        """Format retrieved documents into a context string for the LLM."""
        if not retrieved_docs:
            return "No specific curriculum content found for this query."

        context_parts = []
        for i, doc in enumerate(retrieved_docs, 1):
            source = doc["metadata"].get("subtopic", "Unknown")
            topic = doc["metadata"].get("topic_name", "Unknown")
            context_parts.append(
                f"[Source {i}: {topic} — {source}]\n{doc['content']}"
            )

        return "\n\n---\n\n".join(context_parts)


# Singleton instance
rag_service = RAGService()
