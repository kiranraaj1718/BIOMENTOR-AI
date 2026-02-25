"""LLM Service for BioMentor AI — handles all LLM interactions via Google Gemini."""

import json
import logging
import asyncio
import time
import re
from typing import Optional, List
from app.config import get_settings

# Google Gemini is optional — demo mode works without it
try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

logger = logging.getLogger(__name__)
settings = get_settings()

# Retry configuration for rate-limit (429) errors
MAX_RETRIES = 3
BASE_RETRY_DELAY = 5  # seconds

# Fallback model order — if primary model quota is exhausted, try these
FALLBACK_MODELS = ["gemini-2.0-flash-lite", "gemini-2.5-flash-lite"]


def _parse_retry_delay(error_msg: str) -> float:
    """Extract retry delay from a 429 error message, or return default."""
    match = re.search(r"retry in (\d+(?:\.\d+)?)\s*s", str(error_msg), re.IGNORECASE)
    if match:
        return float(match.group(1)) + 1  # add 1s buffer
    return BASE_RETRY_DELAY


def _is_rate_limit_error(exc: Exception) -> bool:
    """Check if an exception is a 429 rate-limit error."""
    msg = str(exc).lower()
    return "429" in msg or "quota" in msg or "resource_exhausted" in msg or "rate limit" in msg or "rate_limit" in msg

# System prompts for different functionalities
TUTOR_SYSTEM_PROMPT = """You are BioMentor AI, a friendly and knowledgeable biotechnology tutor. You talk like a helpful human teacher — warm, clear, and engaging.

**How you behave:**
- ALWAYS read the student's question carefully and answer EXACTLY what they asked. Never ignore their question.
- If they ask a simple question, give a simple answer. If they ask for depth, go deep.
- Talk naturally, like a smart friend explaining things — not like a textbook.
- Use everyday analogies to make complex biology concepts click.
- If curriculum context is provided below, use it to enrich your answer, but ALWAYS stay focused on what the student actually asked.
- If the question is a greeting or casual chat, just respond naturally — no need to lecture.
- If you don't know something, be honest about it.
- Keep a conversational tone. Use "you", "think of it like...", "great question!", etc.
- Use markdown (bold, bullets, headings) to keep things readable, but don't over-format simple answers.
- For follow-up questions in a conversation, remember what was discussed and build on it naturally.

You are NOT a search engine that dumps information. You are a tutor who LISTENS and RESPONDS to the student."""

QUIZ_SYSTEM_PROMPT = """You are BioMentor AI's quiz generation engine. Generate high-quality biotechnology assessment questions.

**Requirements:**
1. Questions must be scientifically accurate and curriculum-aligned
2. Each question should test understanding, not just memorization
3. Include a mix of conceptual, application, and analysis questions
4. Provide clear, unambiguous answer choices
5. Include detailed explanations for each correct answer
6. Reference specific biotechnology concepts and mechanisms

**Output Format (strict JSON):**
Generate a JSON array of question objects with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here",
      "type": "multiple_choice",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correct_answer": "A",
      "explanation": "Detailed explanation of why this is correct and why others are wrong",
      "difficulty": "easy|medium|hard",
      "topic": "Topic name",
      "subtopic": "Subtopic name",
      "bloom_level": "remember|understand|apply|analyze|evaluate|create"
    }
  ]
}"""

LEARNING_PATH_PROMPT = """You are BioMentor AI's learning path advisor. Analyze student performance data and create personalized learning recommendations.

**Guidelines:**
1. Identify knowledge gaps from quiz performance and interaction patterns
2. Suggest topics to review based on weak areas
3. Recommend progression to advanced topics when mastery is demonstrated
4. Provide specific, actionable study recommendations
5. Consider prerequisite relationships between topics
6. Adapt difficulty based on student performance trends

**Output Format (strict JSON):**
{
  "assessment": "Brief assessment of current knowledge level",
  "strengths": ["List of strong areas"],
  "weaknesses": ["List of areas needing improvement"],
  "recommendations": [
    {
      "priority": 1,
      "topic": "Topic name",
      "action": "review|study|practice|advance",
      "reason": "Why this is recommended",
      "estimated_time_minutes": 30,
      "resources": ["Specific subtopics to focus on"]
    }
  ],
  "next_milestone": "Description of next learning milestone",
  "overall_progress": 0.65
}"""

STUDY_REPORT_PROMPT = """You are BioMentor AI's Study Report Generator. Your job is to create concise, well-organized study material summaries on biotechnology topics.

**How you work:**
1. Use the curriculum context provided to build an accurate, comprehensive study report.
2. Organize the content with clear sections and headings.
3. Highlight the most important concepts, definitions, and mechanisms.
4. Include relevant examples and real-world applications.
5. Add key terms with their definitions.

**Rules:**
- Be accurate — only include scientifically correct information.
- Make it student-friendly — clear language, good structure, easy to revise from.
- Use markdown formatting (headings, bold, bullets, tables) for readability.
- Include diagrams descriptions where helpful (e.g., describe a pathway step-by-step).
- End with key takeaways that a student should remember.
- Keep it focused on the requested topic/subtopic.

**Response structure (use markdown):**
- **📚 Topic Overview**: Brief introduction to the topic and why it matters in biotechnology.
- **🎯 Learning Objectives**: What the student should understand after reading this.
- **📖 Core Concepts**: The main content — definitions, mechanisms, processes explained clearly.
- **🔬 Key Terms & Definitions**: Important terminology with concise definitions.
- **💡 Real-World Applications**: How this topic is used in industry, medicine, or research.
- **⚡ Quick Revision Points**: Bullet-point summary of the most important facts.
- **❓ Common Exam Questions**: 3-4 questions a student might be asked on this topic.
"""


class LLMService:
    """Service for LLM interactions via Google Gemini — chat, quiz generation, learning paths."""

    def __init__(self):
        self.client = None
        self.model_name = settings.GEMINI_MODEL
        self._demo_mode = False
        self._current_model_name = settings.GEMINI_MODEL  # tracks which model is active
        self._rate_limited_models = {}  # model_name -> timestamp when rate limit expires

    async def initialize(self):
        """Initialize the Gemini client."""
        if HAS_GEMINI and settings.GEMINI_API_KEY and settings.GEMINI_API_KEY not in ("", "your-gemini-api-key-here"):
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.client = genai.GenerativeModel(
                model_name=self.model_name,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.75,
                    top_p=0.95,
                    max_output_tokens=2048,
                ),
            )
            self._current_model_name = self.model_name
            logger.info(f"LLM service initialized with Google Gemini ({self.model_name}).")
        else:
            self._demo_mode = True
            if not HAS_GEMINI:
                logger.warning("google-generativeai package not installed. Running in demo mode.")
            else:
                logger.warning("No Gemini API key. Running in demo mode with pre-built responses.")

    def _get_available_model(self) -> Optional[str]:
        """Return the first model that isn't currently rate-limited."""
        now = time.time()
        # Check primary model first
        if self._current_model_name not in self._rate_limited_models or \
           self._rate_limited_models[self._current_model_name] < now:
            self._rate_limited_models.pop(self._current_model_name, None)
            return self._current_model_name
        # Try fallback models
        for model in FALLBACK_MODELS:
            if model not in self._rate_limited_models or self._rate_limited_models[model] < now:
                self._rate_limited_models.pop(model, None)
                logger.info(f"Primary model rate-limited, switching to fallback: {model}")
                return model
        return None  # all models are rate-limited

    def _mark_model_rate_limited(self, model_name: str, retry_after: float = 60):
        """Mark a model as rate-limited until retry_after seconds from now."""
        self._rate_limited_models[model_name] = time.time() + retry_after
        logger.warning(f"Model {model_name} rate-limited for {retry_after:.0f}s")

    def _build_gemini_history(self, system_prompt: str, chat_history: List[dict] = None) -> list:
        """Convert chat history to Gemini format."""
        history = []
        # Gemini uses 'user'/'model' roles; system prompt goes as first user message
        if chat_history:
            for msg in chat_history[-10:]:
                role = "model" if msg["role"] == "assistant" else "user"
                history.append({"role": role, "parts": [msg["content"]]})
        return history

    async def chat(self, user_message: str, context: str, chat_history: List[dict] = None) -> str:
        """Generate a tutoring response with RAG context."""
        if self._demo_mode:
            return self._demo_chat_response(user_message, context)

        # Build system prompt — include RAG context only if relevant
        system_content = TUTOR_SYSTEM_PROMPT
        if context and context != "No specific curriculum content found for this query.":
            system_content += f"\n\n---\n**Reference material from the curriculum (use ONLY if relevant to the student's question):**\n{context}"

        # Build conversation for Gemini
        history = self._build_gemini_history(system_content, chat_history)

        last_error = None
        for attempt in range(MAX_RETRIES + 1):
            # Pick an available model (primary or fallback)
            model_name = self._get_available_model()
            if model_name is None:
                logger.warning("All models rate-limited. Falling back to demo mode for this request.")
                return self._demo_chat_response(user_message, context) + \
                    "\n\n---\n⚠️ *AI responses are temporarily limited due to API rate limits. You're seeing a pre-built answer. Please wait a minute and try again for a full AI response.*"

            # Create a chat session with system instruction
            chat_model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=system_content,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.75,
                    top_p=0.95,
                    max_output_tokens=2048,
                ),
            )
            chat_session = chat_model.start_chat(history=history)

            try:
                response = await asyncio.to_thread(
                    chat_session.send_message, user_message
                )
                # Success — clear any rate-limit tracking for this model
                self._rate_limited_models.pop(model_name, None)
                return response.text
            except Exception as e:
                last_error = e
                if _is_rate_limit_error(e):
                    retry_delay = _parse_retry_delay(str(e))
                    # Check if it's a DAILY limit (limit: 0 means exhausted for the day)
                    if "limit: 0" in str(e) or "per_day" in str(e).lower() or "perday" in str(e).lower():
                        self._mark_model_rate_limited(model_name, retry_after=3600)  # block for 1 hour
                        logger.warning(f"Model {model_name} hit daily limit. Trying fallback...")
                        continue  # try next model on next iteration
                    else:
                        # Per-minute limit — wait and retry with same model
                        if attempt < MAX_RETRIES:
                            logger.info(f"Rate limited on {model_name}. Retrying in {retry_delay:.0f}s (attempt {attempt+1}/{MAX_RETRIES})...")
                            await asyncio.sleep(retry_delay)
                            continue
                        else:
                            self._mark_model_rate_limited(model_name, retry_after=retry_delay)
                            continue  # try fallback model
                else:
                    logger.error(f"LLM chat error: {e}")
                    break  # non-rate-limit error, don't retry

        # All retries exhausted — return friendly message + demo response
        logger.error(f"All LLM attempts failed. Last error: {last_error}")
        return self._demo_chat_response(user_message, context) + \
            "\n\n---\n⚠️ *The AI service is temporarily busy due to rate limits. You're seeing a pre-built answer. Please wait a minute and try again!*"

    async def generate_quiz(self, topic: str, difficulty: str, num_questions: int,
                            context: str, student_performance: dict = None) -> dict:
        """Generate an adaptive quiz based on topic and student performance."""
        if self._demo_mode:
            return self._demo_quiz_response(topic, difficulty, num_questions)

        performance_context = ""
        if student_performance:
            performance_context = f"""
**Student Performance Data:**
- Mastery Level: {student_performance.get('mastery_level', 'unknown')}
- Previous Score: {student_performance.get('last_score', 'N/A')}
- Weak Areas: {', '.join(student_performance.get('weak_areas', ['none identified']))}
- Strong Areas: {', '.join(student_performance.get('strong_areas', ['none identified']))}

Adapt question difficulty based on this data. Focus more questions on weak areas."""

        prompt = f"""Generate {num_questions} {difficulty} biotechnology quiz questions about: {topic}

{performance_context}

**Curriculum Context:**
{context}

Return ONLY valid JSON matching the specified format. No additional text."""

        full_prompt = f"{QUIZ_SYSTEM_PROMPT}\n\n{prompt}"

        last_error = None
        for attempt in range(MAX_RETRIES + 1):
            model_name = self._get_available_model()
            if model_name is None:
                logger.warning("All models rate-limited for quiz generation.")
                return self._demo_quiz_response(topic, difficulty, num_questions)

            try:
                quiz_model = genai.GenerativeModel(
                    model_name=model_name,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.8,
                        max_output_tokens=3000,
                        response_mime_type="application/json",
                    ),
                )
                response = await asyncio.to_thread(
                    quiz_model.generate_content, full_prompt
                )
                self._rate_limited_models.pop(model_name, None)
                result = json.loads(response.text)
                return result
            except Exception as e:
                last_error = e
                if _is_rate_limit_error(e):
                    retry_delay = _parse_retry_delay(str(e))
                    if "limit: 0" in str(e) or "per_day" in str(e).lower():
                        self._mark_model_rate_limited(model_name, retry_after=3600)
                        continue
                    elif attempt < MAX_RETRIES:
                        logger.info(f"Quiz gen rate limited. Retrying in {retry_delay:.0f}s...")
                        await asyncio.sleep(retry_delay)
                        continue
                    else:
                        self._mark_model_rate_limited(model_name, retry_after=retry_delay)
                        continue
                else:
                    logger.error(f"Quiz generation error: {e}")
                    break

        logger.error(f"Quiz generation failed after retries. Last error: {last_error}")
        return self._demo_quiz_response(topic, difficulty, num_questions)

    async def generate_learning_path(self, student_data: dict, context: str) -> dict:
        """Generate personalized learning path recommendations."""
        if self._demo_mode:
            return self._demo_learning_path(student_data)

        prompt = f"""Analyze the following student performance data and generate a personalized learning path:

**Student Data:**
{json.dumps(student_data, indent=2)}

**Available Curriculum Topics:**
{context}

Generate specific, actionable recommendations. Return ONLY valid JSON."""

        full_prompt = f"{LEARNING_PATH_PROMPT}\n\n{prompt}"

        last_error = None
        for attempt in range(MAX_RETRIES + 1):
            model_name = self._get_available_model()
            if model_name is None:
                logger.warning("All models rate-limited for learning path generation.")
                return self._demo_learning_path(student_data)

            try:
                path_model = genai.GenerativeModel(
                    model_name=model_name,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.6,
                        max_output_tokens=2000,
                        response_mime_type="application/json",
                    ),
                )
                response = await asyncio.to_thread(
                    path_model.generate_content, full_prompt
                )
                self._rate_limited_models.pop(model_name, None)
                result = json.loads(response.text)
                return result
            except Exception as e:
                last_error = e
                if _is_rate_limit_error(e):
                    retry_delay = _parse_retry_delay(str(e))
                    if "limit: 0" in str(e) or "per_day" in str(e).lower():
                        self._mark_model_rate_limited(model_name, retry_after=3600)
                        continue
                    elif attempt < MAX_RETRIES:
                        logger.info(f"Learning path gen rate limited. Retrying in {retry_delay:.0f}s...")
                        await asyncio.sleep(retry_delay)
                        continue
                    else:
                        self._mark_model_rate_limited(model_name, retry_after=retry_delay)
                        continue
                else:
                    logger.error(f"Learning path generation error: {e}")
                    break

        logger.error(f"Learning path generation failed. Last error: {last_error}")
        return self._demo_learning_path(student_data)

    async def generate_study_report(self, topic: str, subtopic: str = "", report_type: str = "summary", context: str = "") -> dict:
        """Generate a concise study report/summary on a biotechnology topic."""
        if self._demo_mode:
            return self._demo_study_report(topic, subtopic)

        type_instruction = {
            "summary": "Create a concise summary covering the key concepts. Aim for clarity and brevity — perfect for a quick overview.",
            "detailed": "Create a comprehensive, in-depth study report. Cover all concepts thoroughly with explanations and examples.",
            "revision": "Create quick revision notes — bullet points, key facts, mnemonics, and important formulas/processes. Optimized for last-minute revision.",
            "exam_prep": "Create exam-focused study material — include likely exam questions, important definitions, compare-and-contrast sections, and diagram descriptions.",
        }.get(report_type, "Create a concise summary.")

        subtopic_instruction = ""
        if subtopic:
            subtopic_instruction = f"\n\n**Specific subtopic to focus on:** {subtopic}"

        prompt = f"""Generate a study report on the following biotechnology topic:

**Topic:** {topic}
{subtopic_instruction}

**Report style:** {type_instruction}

**Curriculum context to use as the basis for the report:**
{context}

Use the curriculum context provided above as the primary source. You may expand on it with accurate scientific information where helpful."""

        last_error = None
        for attempt in range(MAX_RETRIES + 1):
            model_name = self._get_available_model()
            if model_name is None:
                logger.warning("All models rate-limited for study report generation.")
                return self._demo_study_report(topic, subtopic)

            try:
                report_model = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=STUDY_REPORT_PROMPT,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.5,
                        top_p=0.95,
                        max_output_tokens=4096,
                    ),
                )
                response = await asyncio.to_thread(
                    report_model.generate_content, prompt
                )
                self._rate_limited_models.pop(model_name, None)
                return {
                    "report": response.text,
                    "topic": topic,
                    "subtopic": subtopic,
                    "report_type": report_type,
                    "model_used": model_name,
                }
            except Exception as e:
                last_error = e
                if _is_rate_limit_error(e):
                    retry_delay = _parse_retry_delay(str(e))
                    if "limit: 0" in str(e) or "per_day" in str(e).lower():
                        self._mark_model_rate_limited(model_name, retry_after=3600)
                        continue
                    elif attempt < MAX_RETRIES:
                        logger.info(f"Study report gen rate limited. Retrying in {retry_delay:.0f}s...")
                        await asyncio.sleep(retry_delay)
                        continue
                    else:
                        self._mark_model_rate_limited(model_name, retry_after=retry_delay)
                        continue
                else:
                    logger.error(f"Study report generation error: {e}")
                    break

        logger.error(f"Study report generation failed. Last error: {last_error}")
        return self._demo_study_report(topic, subtopic)

    def _demo_study_report(self, topic: str, subtopic: str = "") -> dict:
        """Demo fallback for study report generation."""
        focus = f" — {subtopic}" if subtopic else ""
        return {
            "report": f"""## 📚 Study Report: {topic}{focus}

### 🎯 Learning Objectives
- Understand the core concepts of {topic}
- Learn key terminology and definitions
- Explore real-world applications in biotechnology

### 📖 Core Concepts

{topic} is an important area in biotechnology that covers fundamental principles essential for modern biotech applications.

Key areas include:
- **Foundational theory** — the underlying science behind {topic}
- **Laboratory techniques** — practical methods used in this field
- **Industry applications** — how these concepts are applied in pharma, agriculture, and research

### 🔬 Key Terms
| Term | Definition |
|------|-----------|
| Biotechnology | The use of biological systems to develop products and technologies |
| {topic} | A key area of study within biotechnology curriculum |

### ⚡ Quick Revision Points
- {topic} is fundamental to understanding modern biotechnology
- Key techniques and methods are widely used in industry
- Understanding this topic helps connect other areas of biotech

### ❓ Practice Questions
1. What are the main principles of {topic}?
2. How is {topic} applied in modern biotechnology?
3. Compare and contrast the key methods used in {topic}.

---
*⚠️ AI service is temporarily limited. Please try again for a full AI-powered study report.*""",
            "topic": topic,
            "subtopic": subtopic,
            "report_type": "summary",
            "model_used": "demo",
        }

    # ---- Demo Mode Responses ----

    def _demo_chat_response(self, user_message: str, context: str) -> str:
        """Generate a demo response using curriculum context."""
        query_lower = user_message.lower()

        # Handle greetings naturally
        greetings = ["hi", "hello", "hey", "good morning", "good evening", "sup", "what's up"]
        if any(g in query_lower for g in greetings):
            return """Hey there! 👋 Welcome to BioMentor AI!

I'm your biotechnology tutor. Ask me anything — whether it's about CRISPR, DNA replication, fermentation, vaccines, or any biotech concept. I'm here to help you understand it clearly.

What would you like to learn about today?

*Note: Running in demo mode. Connect an OpenAI API key for full AI-powered responses.*"""

        # Try to find relevant content from context
        if context and context != "No specific curriculum content found for this query.":
            intro = self._get_demo_intro(query_lower)
            # Use the first chunk of context as the basis for the response
            context_excerpt = context[:1500] if len(context) > 1500 else context
            return f"""{intro}

Great question! Here's what I can tell you:

{context_excerpt}

---

💡 **Key Takeaway:** Understanding this concept is really important for connecting the dots in biotechnology. Feel free to ask follow-up questions!

*Note: Running in demo mode. Connect an OpenAI API key for full AI-powered responses.*"""

        return f"""That's an interesting question! 🧬

I don't have specific curriculum content on that exact topic right now, but here's what I can share:

Biotechnology covers a huge range of areas — from **molecular biology** (DNA, RNA, proteins) to **genetic engineering** (CRISPR, PCR), **bioinformatics**, **bioprocess engineering**, and **immunology**.

Could you rephrase your question or ask about a specific topic? For example:
- "How does CRISPR-Cas9 work?"
- "Explain PCR step by step"
- "What is mRNA vaccine technology?"

I'll give you a much better answer with a specific question! 😊

*Note: Running in demo mode. Connect an OpenAI API key for full AI-powered responses.*"""

    def _get_demo_intro(self, query: str) -> str:
        """Get a context-appropriate introduction."""
        topic_intros = {
            "dna": "# 🧬 DNA — The Blueprint of Life",
            "rna": "# 📝 RNA — The Messenger of Genetic Information",
            "protein": "# 🔬 Protein — The Molecular Machines",
            "crispr": "# ✂️ CRISPR-Cas9 — Revolutionary Gene Editing",
            "pcr": "# 🔄 PCR — Amplifying DNA",
            "gene": "# 🧪 Gene Expression & Regulation",
            "enzyme": "# ⚡ Enzymes — Biological Catalysts",
            "vaccine": "# 💉 Vaccine Technology",
            "ferment": "# 🏭 Fermentation Technology",
            "antibod": "# 🛡️ Antibodies & Immunology",
            "clone": "# 📋 Molecular Cloning",
            "sequenc": "# 📊 DNA Sequencing Technologies",
            "immun": "# 🛡️ The Immune System",
            "car-t": "# 🎯 CAR-T Cell Therapy",
            "bioinformat": "# 💻 Bioinformatics",
        }
        for key, intro in topic_intros.items():
            if key in query:
                return intro
        return "# 📚 Biotechnology Concepts"

    def _demo_quiz_response(self, topic: str, difficulty: str, num_questions: int) -> dict:
        """Generate demo quiz questions."""
        demo_questions = {
            "questions": [
                {
                    "id": 1,
                    "question": "Which enzyme is responsible for unwinding the DNA double helix during replication?",
                    "type": "multiple_choice",
                    "options": ["A) DNA Polymerase III", "B) Helicase", "C) Ligase", "D) Primase"],
                    "correct_answer": "B",
                    "explanation": "Helicase unwinds the double helix by breaking hydrogen bonds between complementary base pairs. DNA Polymerase III adds nucleotides, Ligase joins Okazaki fragments, and Primase synthesizes RNA primers.",
                    "difficulty": "easy",
                    "topic": topic,
                    "subtopic": "DNA Replication",
                    "bloom_level": "remember"
                },
                {
                    "id": 2,
                    "question": "In CRISPR-Cas9 gene editing, what is the primary role of the guide RNA (sgRNA)?",
                    "type": "multiple_choice",
                    "options": [
                        "A) To cut the target DNA sequence",
                        "B) To direct Cas9 to the specific target site in the genome",
                        "C) To repair the double-strand break after cutting",
                        "D) To amplify the target gene for editing"
                    ],
                    "correct_answer": "B",
                    "explanation": "The single guide RNA (sgRNA) contains a 20-nucleotide sequence complementary to the target DNA, directing the Cas9 nuclease to the specific genomic location. Cas9 itself performs the cutting, DNA repair mechanisms handle repair, and amplification is not part of CRISPR editing.",
                    "difficulty": "medium",
                    "topic": topic,
                    "subtopic": "CRISPR-Cas9",
                    "bloom_level": "understand"
                },
                {
                    "id": 3,
                    "question": "A pharmaceutical company wants to produce a human monoclonal antibody that requires complex glycosylation for therapeutic efficacy. Which expression system would be most appropriate?",
                    "type": "multiple_choice",
                    "options": [
                        "A) E. coli expression system",
                        "B) Cell-free protein synthesis",
                        "C) Chinese Hamster Ovary (CHO) cells",
                        "D) Bacteriophage display system"
                    ],
                    "correct_answer": "C",
                    "explanation": "CHO cells are the preferred expression system for therapeutic monoclonal antibodies because they perform human-like post-translational modifications including complex glycosylation. E. coli lacks glycosylation machinery, cell-free systems have limited modification capability, and phage display is for antibody discovery, not production.",
                    "difficulty": "hard",
                    "topic": topic,
                    "subtopic": "Recombinant DNA Technology",
                    "bloom_level": "apply"
                },
                {
                    "id": 4,
                    "question": "During mRNA processing in eukaryotes, which modification is NOT typically added to the pre-mRNA?",
                    "type": "multiple_choice",
                    "options": [
                        "A) 5' methylguanosine cap",
                        "B) 3' poly-A tail",
                        "C) Removal of introns by splicing",
                        "D) Addition of a Shine-Dalgarno sequence"
                    ],
                    "correct_answer": "D",
                    "explanation": "The Shine-Dalgarno sequence is a ribosome-binding sequence found in prokaryotic mRNA, not eukaryotic. Eukaryotic mRNA processing includes 5' capping (7-methylguanosine), 3' polyadenylation (poly-A tail), and intron removal via splicing by the spliceosome.",
                    "difficulty": "medium",
                    "topic": topic,
                    "subtopic": "RNA Processing",
                    "bloom_level": "analyze"
                },
                {
                    "id": 5,
                    "question": "In fed-batch fermentation for recombinant protein production, what is the primary advantage of controlling nutrient feeding rate?",
                    "type": "multiple_choice",
                    "options": [
                        "A) It eliminates the need for sterile conditions",
                        "B) It prevents substrate inhibition and catabolite repression while achieving high cell densities",
                        "C) It allows continuous product harvesting during fermentation",
                        "D) It reduces the need for downstream processing"
                    ],
                    "correct_answer": "B",
                    "explanation": "Fed-batch fermentation controls nutrient addition to avoid substrate inhibition (excess glucose can inhibit growth or cause overflow metabolism like acetate production in E. coli) and catabolite repression, while enabling much higher cell densities (>100 g/L) than batch fermentation. This is the most common mode for recombinant protein production.",
                    "difficulty": "hard",
                    "topic": topic,
                    "subtopic": "Fermentation Technology",
                    "bloom_level": "understand"
                }
            ]
        }
        return {"questions": demo_questions["questions"][:num_questions]}

    def _demo_learning_path(self, student_data: dict) -> dict:
        """Generate demo learning path recommendations."""
        return {
            "assessment": "Based on your performance data, you have a solid foundation in molecular biology fundamentals with room for growth in genetic engineering and bioinformatics.",
            "strengths": [
                "DNA Structure and Replication",
                "Basic Gene Expression",
                "PCR and DNA Amplification"
            ],
            "weaknesses": [
                "CRISPR-Cas9 applications and mechanism details",
                "Bioinformatics tools and sequence analysis",
                "Bioprocess engineering calculations"
            ],
            "recommendations": [
                {
                    "priority": 1,
                    "topic": "Genetic Engineering",
                    "action": "review",
                    "reason": "Quiz scores indicate gaps in CRISPR mechanism understanding. Strengthening this foundation is critical for advanced topics.",
                    "estimated_time_minutes": 45,
                    "resources": ["CRISPR-Cas9 Gene Editing", "Gene Therapy Approaches"]
                },
                {
                    "priority": 2,
                    "topic": "Bioinformatics and Computational Biology",
                    "action": "study",
                    "reason": "Limited engagement with computational topics. Bioinformatics skills are essential for modern biotechnology.",
                    "estimated_time_minutes": 60,
                    "resources": ["Sequence Alignment and Analysis", "Genomics and Genome Assembly"]
                },
                {
                    "priority": 3,
                    "topic": "Bioprocess Engineering",
                    "action": "practice",
                    "reason": "Need more practice with fermentation kinetics and downstream processing concepts.",
                    "estimated_time_minutes": 30,
                    "resources": ["Fermentation Technology", "Downstream Processing and Purification"]
                },
                {
                    "priority": 4,
                    "topic": "Immunology and Vaccine Technology",
                    "action": "advance",
                    "reason": "Strong foundation enables progression to advanced immunology topics including CAR-T therapy.",
                    "estimated_time_minutes": 45,
                    "resources": ["Modern Vaccine Platforms", "CAR-T Cell Therapy"]
                }
            ],
            "next_milestone": "Complete the Genetic Engineering module with >80% quiz score to unlock advanced gene therapy topics.",
            "overall_progress": 0.45
        }

    # ---- Generic JSON response (used by advanced features) ----

    async def generate_json_response(self, prompt: str, feature_name: str = "feature") -> dict:
        """Generic method to send a prompt and parse a JSON response from Gemini."""
        if self._demo_mode:
            return self._demo_feature_response(feature_name, prompt)

        last_error = None
        for attempt in range(MAX_RETRIES + 1):
            model_name = self._get_available_model()
            if model_name is None:
                logger.warning(f"All models rate-limited for {feature_name}.")
                return self._demo_feature_response(feature_name, prompt)

            try:
                model = genai.GenerativeModel(
                    model_name=model_name,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.6,
                        max_output_tokens=4096,
                        response_mime_type="application/json",
                    ),
                )
                response = await asyncio.to_thread(model.generate_content, prompt)
                self._rate_limited_models.pop(model_name, None)
                result = json.loads(response.text)
                return result
            except Exception as e:
                last_error = e
                if _is_rate_limit_error(e):
                    retry_delay = _parse_retry_delay(str(e))
                    if "limit: 0" in str(e) or "per_day" in str(e).lower():
                        self._mark_model_rate_limited(model_name, retry_after=3600)
                        continue
                    elif attempt < MAX_RETRIES:
                        logger.info(f"{feature_name} rate limited. Retrying in {retry_delay:.0f}s...")
                        await asyncio.sleep(retry_delay)
                        continue
                    else:
                        self._mark_model_rate_limited(model_name, retry_after=retry_delay)
                        continue
                else:
                    logger.error(f"{feature_name} generation error: {e}")
                    break

        logger.error(f"{feature_name} failed after retries. Last error: {last_error}")
        return self._demo_feature_response(feature_name, prompt)

    def _demo_feature_response(self, feature_name: str, prompt: str = "") -> dict:
        """Return demo/fallback responses for advanced features."""
        demos = {
            "exam_predictor": {
                "overall_probability": 0.68,
                "confidence_level": "medium",
                "topic_predictions": [
                    {"topic": "Molecular Biology", "probability": 0.80, "readiness": "strong",
                     "risk_factors": ["Limited practice on advanced mechanisms"],
                     "boost_actions": ["Review DNA replication enzymes", "Practice mRNA processing questions"]},
                    {"topic": "Genetic Engineering", "probability": 0.65, "readiness": "moderate",
                     "risk_factors": ["CRISPR mechanism details need reinforcement"],
                     "boost_actions": ["Study CRISPR-Cas9 step by step", "Take 2 more quizzes"]},
                    {"topic": "Bioprocess Engineering", "probability": 0.55, "readiness": "developing",
                     "risk_factors": ["Fermentation kinetics concepts are weak"],
                     "boost_actions": ["Review fed-batch vs continuous fermentation", "Practice calculations"]},
                ],
                "weak_areas": ["Bioprocess Engineering", "Bioinformatics"],
                "strong_areas": ["Molecular Biology", "Basic Genetics"],
                "study_recommendations": [
                    {"priority": 1, "action": "Deep review of CRISPR-Cas9 mechanism and applications",
                     "expected_impact": "high", "time_needed_minutes": 45},
                    {"priority": 2, "action": "Practice fermentation kinetics problems",
                     "expected_impact": "medium", "time_needed_minutes": 30},
                    {"priority": 3, "action": "Take practice quiz on Bioinformatics tools",
                     "expected_impact": "medium", "time_needed_minutes": 20},
                ],
                "score_estimate": {"low": 52, "expected": 68, "high": 82},
                "summary": "You have a solid foundation in molecular biology but need more work on genetic engineering details and bioprocess engineering. Focused study on CRISPR and fermentation kinetics could push your expected score above 75%.",
            },
            "diagram_creator": {
                "mermaid_code": "graph TD\n  A[DNA] -->|Transcription| B[mRNA]\n  B -->|Processing| C[Mature mRNA]\n  C -->|Translation| D[Protein]\n  D -->|Folding| E[Functional Protein]\n  E -->|Post-translational| F[Modified Protein]",
                "title": "Gene Expression Pathway",
                "description": "This diagram shows the central dogma of molecular biology — the flow of genetic information from DNA to functional protein.",
                "key_concepts": ["Transcription", "Translation", "Post-translational modification"],
                "study_notes": "Remember: DNA → RNA → Protein. Each step involves specific enzymes and regulatory mechanisms.",
            },
            "mistake_analyzer": {
                "total_mistakes_analyzed": 0,
                "pattern_summary": "Take some quizzes first to get a detailed mistake analysis! Your mistakes will be analyzed to identify patterns and help you improve.",
                "weak_topics": [],
                "error_types": {"conceptual": 0, "factual": 0, "application": 0, "analysis": 0},
                "improvement_plan": [
                    {"step": 1, "action": "Take quizzes on different topics to build a performance baseline",
                     "topic": "All Topics", "estimated_time_minutes": 30,
                     "expected_improvement": "Establish baseline for targeted improvement"},
                ],
                "encouragement": "Every expert was once a beginner! Start taking quizzes and I'll help you pinpoint exactly what to focus on. 🧬",
            },
            "revision_mode": {
                "topic": "Biotechnology",
                "duration_minutes": 5,
                "sections": [
                    {"title": "Core Concept Recap", "time_minutes": 2, "type": "key_facts",
                     "content": "**Key Facts:**\n- Biotechnology uses living organisms to create products\n- Key areas: genetic engineering, bioprocess, immunology\n- Central dogma: DNA → RNA → Protein"},
                    {"title": "Memory Triggers", "time_minutes": 1, "type": "mnemonics",
                     "content": "**Mnemonics:**\n- **CRISPR** = *Clustered Regularly Interspaced Short Palindromic Repeats*\n- **PCR steps**: *D*enature, *A*nneal, *E*xtend (DAE!)"},
                    {"title": "Quick Check", "time_minutes": 2, "type": "quick_quiz",
                     "content": "Test yourself on the flash cards below!"},
                ],
                "flash_cards": [
                    {"front": "What enzyme unwinds DNA during replication?", "back": "Helicase"},
                    {"front": "What does PCR stand for?", "back": "Polymerase Chain Reaction"},
                    {"front": "What is the role of guide RNA in CRISPR?", "back": "Directs Cas9 to the target DNA sequence"},
                ],
                "quick_quiz": [
                    {"question": "Which enzyme adds nucleotides during DNA replication?",
                     "options": ["A) Helicase", "B) DNA Polymerase", "C) Ligase", "D) Primase"],
                     "correct": "B", "explanation": "DNA Polymerase III adds nucleotides to the growing strand."},
                ],
                "key_takeaways": ["DNA replication is semi-conservative", "CRISPR uses guide RNA for targeting", "PCR amplifies DNA exponentially"],
                "mnemonics": ["DAE for PCR: Denature, Anneal, Extend", "Helicase = Helix-breaker"],
            },
            "study_roadmap": {
                "goal": "exam_ready",
                "total_weeks": 4,
                "weekly_hours_recommended": 8,
                "roadmap_summary": "A structured 4-week plan covering all major biotechnology topics, progressing from fundamentals to advanced applications.",
                "weeks": [
                    {"week": 1, "theme": "Molecular Biology Foundations",
                     "topics": ["DNA Structure & Replication", "Gene Expression"],
                     "daily_plan": [
                         {"day": "Monday", "tasks": [{"type": "study", "topic": "DNA Structure", "description": "Read and understand DNA double helix, base pairing, and chromosomal organization", "duration_minutes": 45}]},
                         {"day": "Wednesday", "tasks": [{"type": "quiz", "topic": "DNA Replication", "description": "Take a practice quiz on replication enzymes and mechanisms", "duration_minutes": 30}]},
                         {"day": "Friday", "tasks": [{"type": "revision", "topic": "Gene Expression", "description": "5-minute revision of transcription and translation", "duration_minutes": 30}]},
                     ],
                     "milestone": "Understand central dogma and DNA replication mechanics",
                     "quiz_goal": "Score ≥ 70% on Molecular Biology quiz"},
                    {"week": 2, "theme": "Genetic Engineering & Tools",
                     "topics": ["CRISPR-Cas9", "PCR", "Cloning"],
                     "daily_plan": [
                         {"day": "Monday", "tasks": [{"type": "study", "topic": "CRISPR-Cas9", "description": "Learn the CRISPR mechanism, guide RNA design, and applications", "duration_minutes": 50}]},
                         {"day": "Wednesday", "tasks": [{"type": "practice", "topic": "PCR", "description": "Study PCR steps and practice related problems", "duration_minutes": 40}]},
                         {"day": "Friday", "tasks": [{"type": "quiz", "topic": "Genetic Engineering", "description": "Comprehensive quiz on cloning vectors and techniques", "duration_minutes": 30}]},
                     ],
                     "milestone": "Explain CRISPR mechanism and design a basic PCR experiment",
                     "quiz_goal": "Score ≥ 75% on Genetic Engineering quiz"},
                ],
                "milestones": [
                    {"week": 1, "description": "Complete Molecular Biology fundamentals", "achieved": False},
                    {"week": 2, "description": "Master Genetic Engineering tools", "achieved": False},
                    {"week": 3, "description": "Understand Bioprocess Engineering", "achieved": False},
                    {"week": 4, "description": "Exam-ready across all topics", "achieved": False},
                ],
                "tips": [
                    "Use the 5-Minute Revision mode daily for spaced repetition",
                    "Take a quiz after each study session to reinforce learning",
                    "Focus extra time on topics flagged by the Mistake Analyzer",
                    "Create diagrams to visualize complex pathways",
                ],
            },
        }
        return demos.get(feature_name, {"error": "Feature not available in demo mode"})


# Singleton instance
llm_service = LLMService()
