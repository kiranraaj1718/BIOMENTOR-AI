"""
Biotechnology Curriculum Content Module.
Provides structured, curriculum-aligned biotechnology content for RAG ingestion.
Each topic contains detailed educational content organized by difficulty levels.
"""

BIOTECH_CURRICULUM = {
    "molecular_biology_fundamentals": {
        "id": "mol_bio_101",
        "name": "Molecular Biology Fundamentals",
        "description": "Core concepts of molecular biology essential for biotechnology",
        "difficulty": "beginner",
        "prerequisites": [],
        "subtopics": [
            "DNA Structure and Replication",
            "RNA Types and Transcription",
            "Protein Synthesis and Translation",
            "Gene Expression Regulation",
            "Central Dogma of Molecular Biology"
        ],
        "content": [
            {
                "title": "DNA Structure and Replication",
                "text": """DNA (Deoxyribonucleic Acid) is the hereditary material in nearly all living organisms. Its structure was elucidated by Watson and Crick in 1953, building on X-ray crystallography work by Rosalind Franklin.

**Double Helix Structure:**
DNA consists of two polynucleotide chains that coil around each other to form a double helix. Each nucleotide contains:
1. A deoxyribose sugar (5-carbon sugar)
2. A phosphate group
3. A nitrogenous base (Adenine, Thymine, Guanine, or Cytosine)

**Base Pairing Rules (Chargaff's Rules):**
- Adenine (A) always pairs with Thymine (T) via 2 hydrogen bonds
- Guanine (G) always pairs with Cytosine (C) via 3 hydrogen bonds
- This complementary base pairing is fundamental to DNA replication and transcription

**DNA Replication:**
DNA replication is semi-conservative, meaning each new DNA molecule contains one original strand and one newly synthesized strand. Key enzymes include:
- **Helicase**: Unwinds the double helix by breaking hydrogen bonds
- **Primase**: Synthesizes short RNA primers
- **DNA Polymerase III**: Main replication enzyme, adds nucleotides 5' to 3'
- **DNA Polymerase I**: Removes RNA primers, replaces with DNA
- **Ligase**: Joins Okazaki fragments on the lagging strand
- **Topoisomerase**: Relieves tension ahead of the replication fork

The leading strand is synthesized continuously, while the lagging strand is synthesized discontinuously as Okazaki fragments (100-200 nucleotides in eukaryotes, 1000-2000 in prokaryotes).

**Applications in Biotechnology:**
Understanding DNA structure is critical for PCR, gene cloning, DNA sequencing, and CRISPR gene editing technologies."""
            },
            {
                "title": "RNA Types and Transcription",
                "text": """RNA (Ribonucleic Acid) serves multiple roles in gene expression. Unlike DNA, RNA is typically single-stranded, contains ribose sugar, and uses Uracil instead of Thymine.

**Types of RNA:**
1. **mRNA (Messenger RNA)**: Carries genetic information from DNA to ribosomes for protein synthesis. In eukaryotes, mRNA undergoes processing: 5' capping, 3' polyadenylation, and splicing.
2. **tRNA (Transfer RNA)**: Adapter molecules that carry amino acids to the ribosome. Each tRNA has an anticodon that base-pairs with mRNA codons. Approximately 61 different tRNAs exist.
3. **rRNA (Ribosomal RNA)**: Structural and catalytic component of ribosomes. Makes up about 80% of cellular RNA. In eukaryotes: 28S, 18S, 5.8S, and 5S rRNA.
4. **miRNA (MicroRNA)**: Small regulatory RNAs (21-23 nucleotides) that silence gene expression post-transcriptionally.
5. **siRNA (Small Interfering RNA)**: Used in RNA interference (RNAi) technology for gene silencing.
6. **lncRNA (Long Non-coding RNA)**: Regulatory RNAs >200 nucleotides involved in chromatin remodeling and gene regulation.

**Transcription Process:**
1. **Initiation**: RNA Polymerase binds to the promoter region (TATA box in eukaryotes at -25 position). Transcription factors (TFIIA, TFIIB, TFIID, TFIIE, TFIIF, TFIIH) assemble at the promoter.
2. **Elongation**: RNA Polymerase synthesizes mRNA in the 5' to 3' direction, reading the template strand 3' to 5'. Transcription bubble is ~17 base pairs.
3. **Termination**: In prokaryotes via rho-dependent or rho-independent mechanisms. In eukaryotes, linked to polyadenylation signal (AAUAAA).

**Biotechnology Applications:**
- mRNA vaccines (e.g., COVID-19 vaccines using modified nucleosides)
- RNAi therapeutics for gene silencing
- Antisense oligonucleotides for treating genetic diseases"""
            },
            {
                "title": "Protein Synthesis and Translation",
                "text": """Translation is the process of synthesizing proteins from mRNA templates at the ribosome. This is the final step in gene expression.

**The Genetic Code:**
- 64 codons encoding 20 amino acids + 3 stop codons
- Start codon: AUG (Methionine)
- Stop codons: UAA (ochre), UAG (amber), UGA (opal)
- The code is degenerate (multiple codons per amino acid), universal (with minor exceptions), and non-overlapping

**Translation Stages:**
1. **Initiation**: Small ribosomal subunit binds mRNA at the Shine-Dalgarno sequence (prokaryotes) or 5' cap (eukaryotes). Initiator tRNA (Met-tRNA) binds to the start codon in the P site. Large subunit joins.
2. **Elongation**: Three-step cycle repeated for each codon:
   - Aminoacyl-tRNA binds to the A site (requires EF-Tu and GTP)
   - Peptide bond formation (catalyzed by peptidyl transferase in the large subunit)
   - Translocation: ribosome moves 3 nucleotides along mRNA (requires EF-G and GTP)
3. **Termination**: Stop codon reaches the A site. Release factors (RF1, RF2, RF3) trigger hydrolysis of the polypeptide from the final tRNA.

**Post-translational Modifications:**
- Phosphorylation, glycosylation, acetylation, methylation
- Proteolytic cleavage, disulfide bond formation
- Ubiquitination (targeting for degradation)

**Biotechnology Applications:**
- Recombinant protein production in E. coli, yeast, CHO cells
- Codon optimization for heterologous expression
- Unnatural amino acid incorporation
- Cell-free protein synthesis systems"""
            },
            {
                "title": "Gene Expression Regulation",
                "text": """Gene expression regulation is critical for cellular function, differentiation, and response to environmental stimuli. Regulation occurs at multiple levels.

**Prokaryotic Gene Regulation:**
- **Operon Model (Jacob & Monod)**: Genes with related functions are clustered and co-regulated
- **Lac Operon**: Inducible system for lactose metabolism. Regulated by lac repressor and CAP-cAMP complex (positive regulation)
- **Trp Operon**: Repressible system for tryptophan biosynthesis. Uses attenuation mechanism with leader peptide

**Eukaryotic Gene Regulation:**
1. **Chromatin Level**: 
   - Histone modifications (acetylation activates, methylation context-dependent)
   - DNA methylation at CpG islands (typically silencing)
   - Chromatin remodeling complexes (SWI/SNF)
2. **Transcriptional Level**: 
   - Enhancers and silencers (can act from kilobases away)
   - Transcription factors (activators and repressors)
   - Mediator complex bridges enhancers to RNA Polymerase
3. **Post-transcriptional Level**: 
   - Alternative splicing (>95% of human multi-exon genes)
   - mRNA stability and decay (AU-rich elements)
   - miRNA-mediated silencing
4. **Translational Level**: Regulation by initiation factors, upstream ORFs
5. **Post-translational Level**: Protein modifications, degradation via ubiquitin-proteasome

**Epigenetics:**
Heritable changes in gene expression without DNA sequence changes. Key mechanisms include DNA methylation, histone modifications, and non-coding RNA regulation.

**Biotechnology Applications:**
- Inducible expression systems (T7, tetracycline-regulated)
- Epigenetic drugs (HDAC inhibitors, DNA methyltransferase inhibitors)
- CRISPR activation/interference (CRISPRa/CRISPRi)"""
            },
            {
                "title": "Central Dogma of Molecular Biology",
                "text": """The Central Dogma, proposed by Francis Crick in 1958 and refined in 1970, describes the flow of genetic information in biological systems.

**Classical Central Dogma:**
DNA → (Transcription) → RNA → (Translation) → Protein

**Extended Central Dogma (including exceptions):**
- **Reverse Transcription**: RNA → DNA (discovered by Temin and Baltimore, 1970). Used by retroviruses (HIV) and retrotransposons. Key enzyme: Reverse Transcriptase.
- **RNA Replication**: RNA → RNA. Found in RNA viruses and used by RNA-dependent RNA polymerases (RdRp).
- **Prions**: Protein → Protein (conformational change). Exceptions to information flow.

**Key Principles:**
1. Information flows from nucleic acids to proteins (never protein → nucleic acid)
2. DNA is the primary information storage molecule
3. RNA serves as an intermediary and regulatory molecule
4. The code is read in triplets (codons)

**Modern Understanding:**
The central dogma has been expanded to include:
- Non-coding RNAs as functional endpoints
- Epigenetic information transfer
- RNA editing (ADAR enzymes)
- Ribosome-mediated quality control (no-go decay, non-stop decay)

**Biotechnology Implications:**
- Gene therapy strategies target different levels of the central dogma
- mRNA therapeutics bypass DNA integration risks
- RNAi therapeutics target mRNA degradation
- Protein engineering modifies the final product directly"""
            }
        ]
    },
    "genetic_engineering": {
        "id": "gen_eng_201",
        "name": "Genetic Engineering",
        "description": "Techniques and tools for manipulating genetic material",
        "difficulty": "intermediate",
        "prerequisites": ["mol_bio_101"],
        "subtopics": [
            "Restriction Enzymes and Cloning",
            "PCR and DNA Amplification",
            "CRISPR-Cas9 Gene Editing",
            "Gene Therapy Approaches",
            "Recombinant DNA Technology"
        ],
        "content": [
            {
                "title": "Restriction Enzymes and Molecular Cloning",
                "text": """Restriction enzymes (restriction endonucleases) are molecular scissors that cut DNA at specific recognition sequences. They are fundamental tools in genetic engineering.

**Types of Restriction Enzymes:**
1. **Type I**: Cut randomly, far from recognition site. Require ATP, SAM.
2. **Type II**: Most useful in biotechnology. Cut at specific sites within or near recognition sequence. Examples: EcoRI (GAATTC), BamHI (GGATCC), HindIII (AAGCTT).
3. **Type III**: Cut 25-27 bp from recognition site.

**Sticky Ends vs. Blunt Ends:**
- Sticky ends (cohesive): Overhanging single-stranded regions that facilitate ligation (e.g., EcoRI cuts between G and A on both strands)
- Blunt ends: No overhangs (e.g., SmaI cuts CCCGGG in the middle)
- Sticky ends are preferred for cloning as they provide directional insertion

**Molecular Cloning Workflow:**
1. **Isolation**: Extract DNA from organism
2. **Digestion**: Cut DNA and vector with same restriction enzyme(s)
3. **Ligation**: Join DNA fragment with vector using DNA ligase
4. **Transformation**: Introduce recombinant DNA into host cells (E. coli)
5. **Selection**: Identify cells containing recombinant DNA (antibiotic resistance, blue-white screening with lacZ)
6. **Screening**: Confirm insert by colony PCR, restriction analysis, or sequencing

**Cloning Vectors:**
- **Plasmids**: 0.1-10 kb inserts (pBR322, pUC series)
- **Bacteriophage λ**: 9-23 kb inserts
- **Cosmids**: 30-45 kb inserts
- **BACs (Bacterial Artificial Chromosomes)**: 100-300 kb
- **YACs (Yeast Artificial Chromosomes)**: 200-2000 kb

**Modern Cloning Methods:**
- Gateway cloning (site-specific recombination)
- Gibson Assembly (isothermal, seamless)
- Golden Gate Assembly (Type IIS restriction enzymes)
- TOPO cloning (topoisomerase-mediated)"""
            },
            {
                "title": "PCR and DNA Amplification",
                "text": """Polymerase Chain Reaction (PCR), invented by Kary Mullis in 1983, revolutionized molecular biology by enabling exponential amplification of specific DNA sequences.

**Basic PCR Components:**
- Template DNA (even single molecule sufficient)
- Two oligonucleotide primers (forward and reverse, typically 18-25 bp)
- Thermostable DNA polymerase (Taq, Pfu, Phusion)
- dNTPs (dATP, dTTP, dGTP, dCTP)
- Buffer with Mg²⁺ ions

**PCR Cycle Steps:**
1. **Denaturation** (94-98°C, 15-30 sec): Separates double-stranded DNA
2. **Annealing** (50-65°C, 15-30 sec): Primers bind to complementary sequences
3. **Extension** (72°C, 1 min/kb): DNA polymerase synthesizes new strands

After n cycles: 2ⁿ copies (30 cycles = ~1 billion copies)

**PCR Variants:**
- **RT-PCR**: Reverse transcription PCR for RNA analysis
- **qPCR (Real-time PCR)**: Quantitative, uses fluorescent probes (TaqMan, SYBR Green)
- **Digital PCR (dPCR)**: Absolute quantification by partitioning
- **Multiplex PCR**: Multiple primer pairs amplify several targets simultaneously
- **Nested PCR**: Two rounds with inner primers for increased specificity
- **Inverse PCR**: Amplifies unknown flanking sequences
- **Overlap Extension PCR**: Creates chimeric genes or introduces mutations
- **Touchdown PCR**: Decreasing annealing temperature for specificity

**Applications in Biotechnology:**
- Gene cloning and expression construct assembly
- Diagnostic testing (pathogen detection, genetic screening)
- Forensic DNA analysis (STR profiling)
- Mutagenesis (site-directed, random)
- Next-generation sequencing library preparation
- Genotyping and SNP analysis"""
            },
            {
                "title": "CRISPR-Cas9 Gene Editing",
                "text": """CRISPR-Cas9 (Clustered Regularly Interspaced Short Palindromic Repeats) is a revolutionary gene editing technology adapted from bacterial adaptive immunity.

**Discovery and Development:**
- CRISPR sequences discovered in E. coli (1987, Ishino)
- Function as adaptive immune system identified (2007, Barrangou)
- Programmed as gene editing tool (2012, Doudna & Charpentier — Nobel Prize 2020)
- Applied in human cells (2013, Zhang)

**CRISPR-Cas9 Mechanism:**
1. **Guide RNA (sgRNA)** design: 20-nucleotide sequence complementary to target DNA
2. **PAM Recognition**: Cas9 requires a Protospacer Adjacent Motif (NGG for SpCas9) downstream of the target
3. **R-loop Formation**: sgRNA base-pairs with target DNA strand
4. **DNA Cleavage**: Cas9 creates a double-strand break (DSB) 3 bp upstream of PAM
5. **Repair Pathways**:
   - **NHEJ (Non-Homologous End Joining)**: Error-prone, creates insertions/deletions (indels) → Gene knockouts
   - **HDR (Homology-Directed Repair)**: Precise editing using donor template → Gene insertions, corrections

**CRISPR Variants and Extensions:**
- **Cas12a (Cpf1)**: Different PAM (TTTV), staggered cuts, processes own crRNA
- **Base Editing**: CBE (cytosine → thymine), ABE (adenine → guanine) without DSB
- **Prime Editing**: "Search and replace" editing using reverse transcriptase-fused Cas9 nickase
- **CRISPRa/CRISPRi**: Activation or interference using catalytically dead dCas9 fused to transcriptional regulators
- **Cas13**: RNA-targeting CRISPR for RNA editing and diagnostics (SHERLOCK)
- **Epigenome Editing**: dCas9 fused to epigenetic modifiers

**Delivery Methods:**
- Plasmid transfection, viral vectors (AAV, lentivirus)
- Ribonucleoprotein (RNP) delivery (transient, reduced off-target effects)
- Lipid nanoparticles, electroporation

**Applications:**
- Gene therapy (sickle cell disease, beta-thalassemia — FDA approved Casgevy 2023)
- Crop improvement (disease resistance, yield, nutritional content)
- Disease modeling (organoids, animal models)
- Antimicrobial development
- Gene drives for vector control
- Diagnostics (DETECTR, SHERLOCK platforms)

**Ethical Considerations:**
- Germline editing concerns (He Jiankui controversy, 2018)
- Off-target effects and mosaicism
- Equitable access to gene therapies
- Ecological risks of gene drives"""
            },
            {
                "title": "Gene Therapy Approaches",
                "text": """Gene therapy involves introducing, altering, or replacing genetic material within a person's cells to treat or prevent disease.

**Types of Gene Therapy:**
1. **Somatic Gene Therapy**: Targets non-reproductive cells; changes not inherited
2. **Germline Gene Therapy**: Targets reproductive cells; heritable changes (currently prohibited in most countries)

**Strategies:**
- **Gene Replacement**: Provide functional copy of defective gene (e.g., Luxturna for RPE65-related blindness)
- **Gene Silencing**: Knock down overactive or harmful gene (RNAi, antisense)
- **Gene Editing**: Correct specific mutations (CRISPR-based)
- **Gene Addition**: Add new gene for therapeutic protein production

**Viral Vectors:**
1. **Adeno-Associated Virus (AAV)**:
   - Small (4.7 kb capacity), non-pathogenic
   - Multiple serotypes for tissue tropism (AAV9 for CNS, AAV8 for liver)
   - Episomal (mostly non-integrating)
   - FDA-approved: Luxturna, Zolgensma
2. **Lentivirus**:
   - Derived from HIV, integrating vector
   - Large capacity (~8 kb)
   - Efficient transduction of dividing and non-dividing cells
   - Used in CAR-T cell therapy manufacturing
3. **Adenovirus**:
   - Large capacity (~36 kb), non-integrating
   - Strong immune response (can be advantageous for vaccines)
4. **Retrovirus**:
   - Integrating, only transduces dividing cells
   - Risk of insertional mutagenesis (X-SCID trial complications)

**Non-Viral Methods:**
- Lipid nanoparticles (LNPs) — used in mRNA vaccines
- Electroporation
- Naked DNA/plasmid injection
- Polymer-based nanoparticles

**FDA-Approved Gene Therapies (as of 2025):**
- Luxturna (voretigene neparvovec) — inherited retinal dystrophy
- Zolgensma (onasemnogene abeparvovec) — spinal muscular atrophy
- Casgevy (exagamglogene autotemcel) — sickle cell disease, beta-thalassemia
- Hemgenix — hemophilia B
- Multiple CAR-T therapies (Kymriah, Yescarta, Tecartus, Breyanzi, Abecma, Carvykti)

**Challenges:**
- Manufacturing scalability and cost
- Immune responses to viral vectors
- Durability of expression
- Off-target effects and insertional mutagenesis
- Redosing limitations due to anti-vector immunity"""
            },
            {
                "title": "Recombinant DNA Technology",
                "text": """Recombinant DNA (rDNA) technology combines DNA from different sources to create new genetic combinations not found in nature.

**Historical Milestones:**
- 1972: First rDNA molecule (Paul Berg — Nobel Prize 1980)
- 1973: Cohen-Boyer experiment — plasmid-based cloning
- 1975: Asilomar Conference on rDNA safety
- 1982: First rDNA product approved — recombinant human insulin (Humulin)

**Key Components:**
1. **Source DNA**: Gene of interest from any organism
2. **Vector**: Vehicle to carry DNA into host (plasmids, phages, viral vectors)
3. **Host Organism**: Cell that receives and expresses rDNA
4. **Selection System**: Method to identify successful recombinants

**Expression Systems:**
1. **E. coli**: Fast growth, simple genetics, inexpensive. Limitations: no post-translational modifications, inclusion body formation. Products: insulin, growth hormone, interferons.
2. **Yeast (S. cerevisiae, P. pastoris)**: Eukaryotic processing, secretion, GRAS status. Products: Hepatitis B vaccine, insulin.
3. **Insect Cells (Baculovirus)**: Complex post-translational modifications. Products: Cervarix (HPV vaccine).
4. **Mammalian Cells (CHO, HEK293)**: Full human-like modifications. Most expensive. Products: Most monoclonal antibodies, clotting factors.
5. **Transgenic Animals**: Produce proteins in milk. Products: ATryn (antithrombin).
6. **Transgenic Plants**: Molecular farming. Potential for oral vaccines.

**Recombinant Products:**
- **Therapeutic Proteins**: Insulin, EPO, growth hormone, clotting factors
- **Monoclonal Antibodies**: Trastuzumab, adalimumab, pembrolizumab
- **Vaccines**: Hepatitis B (recombinant HBsAg), HPV
- **Industrial Enzymes**: Amylases, proteases, lipases
- **Diagnostic Reagents**: Recombinant antigens for immunoassays

**Regulatory Framework:**
- NIH Guidelines for Research Involving rDNA Molecules
- FDA approval pathway for biologics (BLA)
- Biosafety levels (BSL-1 through BSL-4)
- Institutional Biosafety Committees (IBCs)"""
            }
        ]
    },
    "bioinformatics": {
        "id": "bioinfo_301",
        "name": "Bioinformatics and Computational Biology",
        "description": "Computational approaches to biological data analysis",
        "difficulty": "intermediate",
        "prerequisites": ["mol_bio_101"],
        "subtopics": [
            "Sequence Alignment and Analysis",
            "Genomics and Genome Assembly",
            "Proteomics and Protein Structure",
            "Phylogenetics and Evolution",
            "Systems Biology and Networks"
        ],
        "content": [
            {
                "title": "Sequence Alignment and Analysis",
                "text": """Sequence alignment is the arrangement of DNA, RNA, or protein sequences to identify regions of similarity that may be consequence of functional, structural, or evolutionary relationships.

**Types of Alignment:**
1. **Pairwise Alignment**: Comparing two sequences
   - **Global Alignment (Needleman-Wunsch)**: Aligns entire length of both sequences. Uses dynamic programming. Best when sequences are similar length and homologous throughout.
   - **Local Alignment (Smith-Waterman)**: Finds best matching subsequences. Identifies conserved domains and motifs within larger sequences.
2. **Multiple Sequence Alignment (MSA)**: Aligning three or more sequences
   - **ClustalW/Omega**: Progressive alignment
   - **MUSCLE**: Iterative refinement
   - **T-Coffee**: Consistency-based
   - **MAFFT**: Fast Fourier Transform-based

**BLAST (Basic Local Alignment Search Tool):**
- Most widely used bioinformatics tool
- Variants: BLASTn (nucleotide), BLASTp (protein), BLASTx (translated query), tBLASTn (protein query vs translated database), tBLASTx (translated vs translated)
- E-value: Expected number of hits by chance. Lower = more significant (typically E < 10⁻⁵ considered significant)
- Bit score: Normalized alignment score

**Scoring Matrices:**
- **DNA**: Simple match/mismatch scores
- **Protein**: Substitution matrices
  - PAM (Point Accepted Mutation): PAM250 for distant relationships
  - BLOSUM (Blocks Substitution Matrix): BLOSUM62 (default in BLAST) for moderate relationships
  - Gap penalties: Opening penalty (higher) + extension penalty (lower)

**Sequence Analysis Tools:**
- ORF finding and annotation (ORFfinder, Glimmer)
- Motif discovery (MEME, JASPAR)
- Domain identification (Pfam, InterPro)
- Signal peptide prediction (SignalP)
- Transmembrane topology (TMHMM)

**Applications in Biotechnology:**
- Gene identification and annotation
- Functional prediction of unknown proteins
- Primer design for PCR
- Identifying drug targets through homology
- Understanding evolutionary adaptation mechanisms"""
            },
            {
                "title": "Genomics and Genome Assembly",
                "text": """Genomics is the study of an organism's complete set of DNA, including all genes and non-coding sequences.

**DNA Sequencing Technologies:**
1. **First Generation — Sanger Sequencing** (1977):
   - Chain termination method using ddNTPs
   - Read length: 700-1000 bp
   - Gold standard for validation
2. **Second Generation — Next-Generation Sequencing (NGS)**:
   - **Illumina**: Sequencing by synthesis, short reads (150-300 bp), highest throughput (billions of reads)
   - **Ion Torrent**: Semiconductor sequencing, measures pH change
3. **Third Generation — Long-Read Sequencing**:
   - **PacBio (HiFi)**: Single-molecule real-time, reads >15 kb, ~99.9% accuracy
   - **Oxford Nanopore**: Direct DNA/RNA sequencing through nanopores, ultra-long reads (>1 Mb possible)

**Genome Assembly:**
- **De novo assembly**: No reference genome needed
  - Overlap-Layout-Consensus (OLC): For long reads
  - De Bruijn Graph: For short reads (k-mer based)
  - Assemblers: SPAdes, MEGAHIT (short reads), Flye, Hifiasm (long reads)
- **Reference-based assembly**: Map reads to known genome
  - Aligners: BWA, Bowtie2, Minimap2
  - Variant calling: GATK, DeepVariant

**Functional Genomics:**
- **Transcriptomics (RNA-Seq)**: Gene expression profiling, alternative splicing analysis
- **ChIP-Seq**: Protein-DNA interactions, histone modifications
- **ATAC-Seq**: Chromatin accessibility
- **Metagenomics**: Studying microbial communities from environmental samples
- **Single-cell Genomics**: Gene expression at individual cell level (10x Genomics)

**Human Genome Project:**
- Completed in 2003, cost ~$3 billion
- ~3.2 billion base pairs, ~20,000-25,000 protein-coding genes
- T2T (Telomere-to-Telomere) Consortium completed remaining 8% in 2022

**Applications:**
- Precision medicine and pharmacogenomics
- Genetic testing and disease risk assessment
- Agricultural genomics for crop improvement
- Forensic genomics
- Microbiome analysis for health applications"""
            },
            {
                "title": "Proteomics and Protein Structure Prediction",
                "text": """Proteomics is the large-scale study of proteins, particularly their structures, functions, and interactions.

**Protein Structure Levels:**
1. **Primary**: Linear amino acid sequence
2. **Secondary**: Local folding — alpha helices, beta sheets, loops (determined by backbone hydrogen bonds)
3. **Tertiary**: 3D structure of single polypeptide (hydrophobic core, disulfide bonds, ionic interactions)
4. **Quaternary**: Multi-subunit assembly (e.g., hemoglobin — 2α + 2β subunits)

**Experimental Proteomics:**
1. **Mass Spectrometry**:
   - MALDI-TOF: Molecular weight determination
   - LC-MS/MS: Peptide identification and quantification
   - Shotgun proteomics: Digest → separate → identify → assemble
2. **2D Gel Electrophoresis**: Separate by pI (IEF) then molecular weight (SDS-PAGE)
3. **Protein Microarrays**: High-throughput protein-protein interaction studies
4. **Yeast Two-Hybrid**: Detect protein-protein interactions in vivo

**Structure Determination:**
- **X-ray Crystallography**: Atomic resolution, requires crystals
- **Cryo-EM**: Near-atomic resolution, no crystals needed (revolution since 2013)
- **NMR Spectroscopy**: Solution structure, limited to smaller proteins (<50 kDa)

**Computational Protein Structure Prediction:**
- **AlphaFold2 (DeepMind)**: Revolutionary AI-based prediction, ~atomic accuracy for many proteins. AlphaFold Protein Structure Database contains >200 million predicted structures.
- **RoseTTAFold**: Similar deep learning approach
- **Homology Modeling**: Template-based prediction (SWISS-MODEL)
- **Molecular Dynamics**: Simulate protein behavior over time (GROMACS, AMBER)
- **Protein Design**: Rosetta, ProteinMPNN for de novo design

**Biotechnology Applications:**
- Drug target identification and validation
- Biomarker discovery for disease diagnosis
- Enzyme engineering for industrial applications
- Antibody engineering and optimization
- Understanding disease mechanisms at molecular level"""
            }
        ]
    },
    "bioprocess_engineering": {
        "id": "bpe_401",
        "name": "Bioprocess Engineering",
        "description": "Industrial-scale biotechnology production processes",
        "difficulty": "advanced",
        "prerequisites": ["mol_bio_101", "gen_eng_201"],
        "subtopics": [
            "Fermentation Technology",
            "Upstream Processing",
            "Downstream Processing",
            "Bioreactor Design",
            "Scale-up Principles"
        ],
        "content": [
            {
                "title": "Fermentation Technology",
                "text": """Fermentation technology encompasses the use of microorganisms or cells to produce valuable biological products at industrial scale.

**Types of Fermentation:**
1. **Batch Fermentation**: 
   - All nutrients added at start, no addition/removal during process
   - Growth phases: lag, exponential (log), stationary, death
   - Simple operation, batch-to-batch variation
   
2. **Fed-Batch Fermentation**:
   - Nutrients added incrementally during process
   - Avoids substrate inhibition, catabolite repression
   - Most common for recombinant protein production
   - Allows higher cell densities (>100 g/L dry cell weight for E. coli)
   
3. **Continuous Fermentation (Chemostat)**:
   - Fresh medium added, culture removed at same rate
   - Steady-state operation, defined by dilution rate (D = F/V)
   - Washout occurs when D > μmax
   - Used for biomass production, ethanol, some antibiotics

4. **Perfusion Culture**:
   - Continuous medium exchange while retaining cells
   - Cell retention devices: filters, settlers, centrifuges
   - Very high cell densities possible
   - Common for mammalian cell culture (monoclonal antibodies)

**Microbial Growth Kinetics:**
- **Monod Equation**: μ = μmax × S / (Ks + S)
  - μ: specific growth rate, S: substrate concentration, Ks: half-saturation constant
- **Yield Coefficients**: Yx/s (biomass/substrate), Yp/s (product/substrate)
- **Oxygen Transfer Rate**: OTR = kLa × (C* - CL)
  - kLa: volumetric mass transfer coefficient
  - Critical parameter in aerobic fermentation

**Industrial Fermentation Products:**
- Antibiotics (penicillin, streptomycin)
- Amino acids (L-glutamate, L-lysine)
- Organic acids (citric acid, lactic acid)
- Enzymes (amylases, proteases, lipases)
- Biofuels (ethanol, butanol)
- Recombinant proteins (insulin, growth hormone)
- Monoclonal antibodies
- Vaccines"""
            },
            {
                "title": "Downstream Processing and Purification",
                "text": """Downstream processing (DSP) refers to the recovery and purification of biosynthetic products from natural sources. It typically accounts for 50-80% of total production costs.

**General DSP Workflow:**
1. **Cell Harvesting/Removal**:
   - Centrifugation (disc stack, tubular bowl)
   - Microfiltration (0.1-0.45 μm membranes)
   - Flocculation and sedimentation

2. **Cell Disruption** (for intracellular products):
   - Mechanical: High-pressure homogenization (500-1500 bar), bead milling
   - Chemical: Detergents (Triton X-100), alkali treatment
   - Enzymatic: Lysozyme (bacteria), zymolyase (yeast)
   - Physical: Freeze-thaw, sonication (lab scale only)

3. **Primary Recovery (Capture)**:
   - Aqueous two-phase extraction
   - Precipitation (ammonium sulfate, ethanol, PEG)
   - Expanded bed adsorption

4. **Purification (Chromatography)**:
   - **Ion Exchange (IEX)**: Charge-based separation (DEAE, CM, Q, S resins)
   - **Size Exclusion (SEC/GFC)**: Molecular weight-based
   - **Affinity Chromatography**: Specific binding (Protein A for antibodies, IMAC for His-tagged proteins)
   - **Hydrophobic Interaction (HIC)**: Hydrophobicity-based
   - **Mixed-mode Chromatography**: Multiple interaction types

5. **Polishing**:
   - Final chromatography steps
   - Virus inactivation (low pH, detergent)
   - Virus filtration (20 nm filters)
   - Endotoxin removal

6. **Formulation**:
   - Ultrafiltration/diafiltration (UF/DF)
   - Lyophilization (freeze-drying)
   - Sterile filtration (0.22 μm)
   - Fill and finish

**Critical Quality Attributes (CQAs):**
- Purity: >99% for therapeutics
- Endotoxin levels: <5 EU/kg/hr
- Host cell proteins: <100 ppm
- DNA: <10 pg/dose
- Aggregation: <2%

**Quality by Design (QbD):**
Modern approach using process understanding to define critical process parameters (CPPs) and their impact on CQAs. Uses Design of Experiments (DoE) and Process Analytical Technology (PAT)."""
            }
        ]
    },
    "immunology_and_vaccines": {
        "id": "imm_vax_501",
        "name": "Immunology and Vaccine Technology",
        "description": "Immune system biology and modern vaccine development",
        "difficulty": "advanced",
        "prerequisites": ["mol_bio_101", "gen_eng_201"],
        "subtopics": [
            "Innate and Adaptive Immunity",
            "Antibody Engineering",
            "Vaccine Platforms",
            "CAR-T Cell Therapy",
            "Immunodiagnostics"
        ],
        "content": [
            {
                "title": "Innate and Adaptive Immunity",
                "text": """The immune system is a complex network of cells, tissues, and organs that defends against pathogens and abnormal cells.

**Innate Immunity (Non-specific):**
- First line of defense, rapid response (minutes to hours)
- **Physical Barriers**: Skin, mucous membranes, cilia
- **Chemical Barriers**: Lysozyme, defensins, complement system, low pH
- **Cellular Components**:
  - Macrophages: Phagocytosis, antigen presentation, cytokine secretion
  - Neutrophils: Most abundant WBC, rapid responders, form NETs
  - Dendritic Cells: Professional antigen-presenting cells (APCs), bridge to adaptive immunity
  - Natural Killer (NK) Cells: Kill virus-infected and tumor cells (missing-self recognition)
  - Mast Cells: Release histamine, allergy responses
- **Pattern Recognition Receptors (PRRs)**: Toll-like receptors (TLRs), NOD-like receptors, recognize PAMPs

**Adaptive Immunity (Specific):**
- Slower initial response (days), but generates memory
- **Humoral Immunity (B cells)**:
  - B cell activation → plasma cells (antibody factories) + memory B cells
  - Antibody classes: IgG (most abundant, crosses placenta), IgM (first response, pentamer), IgA (mucosal defense, dimer), IgE (allergy, parasites), IgD (B cell signaling)
  - Antibody structure: 2 heavy chains + 2 light chains, Fab (antigen binding) + Fc (effector function)
  - Class switching and somatic hypermutation in germinal centers
  
- **Cell-Mediated Immunity (T cells)**:
  - CD4⁺ T Helper Cells: Th1 (intracellular pathogens), Th2 (parasites, allergy), Th17 (extracellular bacteria, fungi), Treg (immune regulation)
  - CD8⁺ Cytotoxic T Cells: Kill infected/abnormal cells via perforin/granzyme
  - MHC Restriction: CD4 recognizes MHC Class II (on APCs), CD8 recognizes MHC Class I (on all nucleated cells)

**Immunological Memory:**
- Long-lived memory cells enable faster, stronger secondary responses
- Basis for vaccination
- Memory B cells can persist for decades
- Tissue-resident memory T cells provide local protection"""
            },
            {
                "title": "Modern Vaccine Platforms",
                "text": """Vaccines train the immune system to recognize and fight specific pathogens without causing disease.

**Traditional Vaccine Types:**
1. **Live Attenuated**: Weakened pathogen (MMR, oral polio, yellow fever)
   - Strong immune response, long-lasting protection
   - Risk: reversion to virulence
2. **Inactivated**: Killed pathogen (influenza, hepatitis A, rabies)
   - Safer but weaker response, often needs adjuvants/boosters
3. **Toxoid**: Inactivated toxin (tetanus, diphtheria)
4. **Subunit/Conjugate**: Purified antigens (hepatitis B, pneumococcal)

**Modern Vaccine Platforms:**
1. **mRNA Vaccines**:
   - Encode viral antigen, translated by host ribosomes
   - Modified nucleosides (N1-methylpseudouridine) reduce immunogenicity
   - Lipid nanoparticle (LNP) delivery
   - Rapid development (Pfizer-BioNTech, Moderna COVID-19 vaccines)
   - Self-amplifying mRNA (saRNA) for enhanced expression
   - Advantages: Rapid design, cell-free manufacturing, no genome integration risk

2. **Viral Vector Vaccines**:
   - Replication-deficient virus carries antigen gene
   - Adenovirus-based: Oxford-AstraZeneca (ChAdOx1), J&J (Ad26) COVID-19 vaccines
   - VSV-based: Ervebo (Ebola vaccine)
   - Strong cellular and humoral immunity

3. **Protein Subunit + Adjuvant**:
   - Recombinant protein antigens + modern adjuvants
   - Novavax COVID-19 vaccine (Matrix-M adjuvant with saponin nanoparticles)
   - Shingrix (AS01B adjuvant)

4. **VLP (Virus-Like Particle)**:
   - Self-assembling protein shells mimicking virus structure
   - No genetic material, non-infectious
   - HPV vaccines (Gardasil 9, Cervarix)

5. **DNA Vaccines**:
   - Plasmid DNA encoding antigen
   - Delivered by electroporation or gene gun
   - ZyCoV-D (first approved DNA vaccine, COVID-19, India)

6. **Nanoparticle Vaccines**:
   - Engineered nanoparticles displaying antigens
   - Ferritin-based, computationally designed particles
   - Pan-coronavirus and universal influenza vaccine candidates

**Adjuvants:**
- Aluminum salts (alum) — most common, Th2 bias
- AS01/AS04 (MPL + liposomes/alum) — enhanced responses
- MF59 (squalene emulsion) — enhanced influenza vaccines
- Matrix-M (saponin-based) — strong Th1/Th2 balance
- CpG ODN — TLR9 agonist

**Vaccine Development Pipeline:**
Preclinical → Phase I (safety, ~20-100 people) → Phase II (immunogenicity, ~100-1000) → Phase III (efficacy, ~1000-30,000+) → Regulatory approval → Phase IV (post-marketing surveillance)"""
            },
            {
                "title": "CAR-T Cell Therapy",
                "text": """Chimeric Antigen Receptor T-cell (CAR-T) therapy is a revolutionary immunotherapy that engineers a patient's own T cells to target and destroy cancer cells.

**CAR Structure:**
1. **Extracellular Domain**: scFv (single-chain variable fragment) derived from antibody — provides antigen specificity
2. **Hinge/Spacer**: Connects scFv to transmembrane domain (CD8α or IgG4-based)
3. **Transmembrane Domain**: Anchors CAR in T cell membrane (usually CD28 or CD8α)
4. **Intracellular Signaling**:
   - 1st Generation: CD3ζ only (insufficient persistence)
   - 2nd Generation: CD3ζ + one co-stimulatory domain (CD28 or 4-1BB)
   - 3rd Generation: CD3ζ + two co-stimulatory domains
   - 4th Generation (TRUCKs): Inducible cytokine release (e.g., IL-12)
   - 5th Generation: Incorporation of cytokine receptor signaling domains

**Manufacturing Process:**
1. Leukapheresis: Collect patient's T cells from blood
2. T cell activation: Anti-CD3/CD28 beads or antibodies
3. Transduction: Viral vector (lentiviral or retroviral) delivers CAR gene
4. Expansion: Culture for 7-14 days to billions of cells
5. Quality control: CAR expression, sterility, identity, viability
6. Lymphodepletion: Patient receives chemotherapy before infusion
7. Infusion: CAR-T cells administered to patient

**FDA-Approved CAR-T Therapies:**
- Kymriah (tisagenlecleucel) — B-ALL, DLBCL (anti-CD19, 4-1BB)
- Yescarta (axicabtagene ciloleucel) — DLBCL (anti-CD19, CD28)
- Tecartus (brexucabtagene autoleucel) — MCL (anti-CD19)
- Breyanzi (lisocabtagene maraleucel) — LBCL (anti-CD19, 4-1BB)
- Abecma (idecabtagene vicleucel) — Multiple myeloma (anti-BCMA)
- Carvykti (ciltacabtagene autoleucel) — Multiple myeloma (anti-BCMA)

**Challenges and Toxicities:**
- **Cytokine Release Syndrome (CRS)**: Massive cytokine release, managed with tocilizumab (IL-6R blocker)
- **Neurotoxicity (ICANS)**: Confusion, seizures, cerebral edema
- **On-target, off-tumor**: CAR targets normal cells expressing the antigen
- **Antigen escape**: Tumor cells lose target antigen
- **Manufacturing complexity**: Autologous, patient-specific, expensive ($400K-500K per treatment)

**Next-Generation Approaches:**
- Allogeneic (off-the-shelf) CAR-T using gene editing to remove TCR
- Armored CARs with cytokine or checkpoint inhibitor secretion
- Logic-gated CARs (AND, OR, NOT gates) for specificity
- CAR-NK cells as alternative effector cells
- In vivo CAR-T generation using LNP-delivered mRNA"""
            }
        ]
    },
    "industrial_biotechnology": {
        "id": "ind_bio_601",
        "name": "Industrial and Environmental Biotechnology",
        "description": "Applications of biotechnology in industry and environmental management",
        "difficulty": "intermediate",
        "prerequisites": ["mol_bio_101"],
        "subtopics": [
            "Enzyme Technology",
            "Metabolic Engineering",
            "Biofuels and Bioenergy",
            "Bioremediation",
            "Agricultural Biotechnology"
        ],
        "content": [
            {
                "title": "Enzyme Technology and Engineering",
                "text": """Enzymes are biological catalysts that accelerate chemical reactions with remarkable specificity and efficiency. Industrial enzyme technology is a multi-billion dollar industry.

**Enzyme Kinetics:**
- **Michaelis-Menten**: v = Vmax × [S] / (Km + [S])
  - Km: Substrate concentration at half Vmax (reflects affinity)
  - kcat: Turnover number (reactions per enzyme per second)
  - kcat/Km: Catalytic efficiency (diffusion limit ~10⁸-10⁹ M⁻¹s⁻¹)
- **Lineweaver-Burk Plot**: Double reciprocal (1/v vs 1/[S]) for parameter determination
- **Inhibition Types**: Competitive (↑Km), Non-competitive (↓Vmax), Uncompetitive (↓both)

**Enzyme Engineering:**
1. **Rational Design**: Structure-guided mutagenesis based on mechanistic understanding
2. **Directed Evolution**: 
   - Create library (error-prone PCR, DNA shuffling, saturation mutagenesis)
   - Screen/select for improved variants
   - Iterate (Frances Arnold — Nobel Prize 2018)
   - Techniques: phage display, ribosome display, cell surface display
3. **Semi-rational Design**: Combine structural knowledge with focused libraries
4. **Computational Design**: Rosetta, machine learning-guided design
5. **Ancestral Sequence Reconstruction**: Infer ancestral enzymes with enhanced stability

**Enzyme Immobilization:**
- **Adsorption**: Simple, mild, reversible (weak binding)
- **Covalent Binding**: Stable, uses activated supports (glutaraldehyde crosslinking)
- **Entrapment**: Gel matrices (alginate, polyacrylamide), sol-gel
- **Cross-linked Enzyme Aggregates (CLEAs)**: Carrier-free, simple preparation
- Benefits: Reusability, continuous processing, improved stability

**Industrial Enzyme Applications:**
- **Food**: Amylases (starch processing), proteases (cheese, meat tenderizing), lipases (flavor), pectinases (juice clarification)
- **Detergents**: Proteases, lipases, amylases, cellulases (largest market segment)
- **Textiles**: Cellulases (biopolishing), laccases (denim finishing)
- **Paper/Pulp**: Xylanases (biobleaching), laccases
- **Biofuels**: Cellulases, hemicellulases (lignocellulose saccharification)
- **Pharmaceuticals**: Lipases (chiral resolution), penicillin acylase
- **Diagnostics**: Glucose oxidase (glucose monitoring), horseradish peroxidase (ELISA)"""
            },
            {
                "title": "Metabolic Engineering and Synthetic Biology",
                "text": """Metabolic engineering is the targeted modification of metabolic pathways to enhance production of desired compounds or create novel biosynthetic capabilities.

**Core Principles:**
1. **Flux Analysis**: Metabolic Flux Analysis (MFA), Flux Balance Analysis (FBA)
   - Stoichiometric modeling of metabolic networks
   - Constraint-based optimization (COBRA toolbox)
2. **Pathway Optimization**: 
   - Overexpress rate-limiting enzymes
   - Remove competing pathways
   - Cofactor engineering (NADH/NADPH balance)
   - Transport engineering (secretion of products)
3. **Dynamic Regulation**: Biosensors, genetic circuits for autonomous pathway control

**Synthetic Biology Tools:**
- **Standardized Biological Parts (BioBricks)**: Registry of standard biological parts (iGEM)
- **Genetic Circuits**: Toggle switches, oscillators, logic gates
- **Genome-Scale Engineering**: MAGE (Multiplex Automated Genome Engineering)
- **Cell-Free Systems**: In vitro transcription-translation for prototyping
- **Minimal Genomes**: JCVI-syn3.0 (473 genes — minimal viable genome)
- **Xenobiology**: Expanded genetic alphabet (unnatural base pairs)

**Metabolic Engineering Success Stories:**
1. **Artemisinin (Anti-malarial)**: Engineered yeast (S. cerevisiae) produces artemisinic acid. Amyris/Sanofi — first semi-synthetic antimalarial at scale.
2. **1,3-Propanediol**: DuPont/Genencor engineered E. coli for bio-based PDO (polymer precursor)
3. **Farnesene**: Amyris engineered yeast for renewable fuels and chemicals
4. **Vanillin**: Evolva used engineered yeast for natural vanillin production
5. **Cannabinoids**: Engineered yeast producing THC and CBD precursors

**Synthetic Biology Applications:**
- Biosensors for environmental monitoring and diagnostics
- Living therapeutics (engineered probiotics)
- Biomaterials (spider silk, engineered collagen)
- Cell-based computing
- Terraforming and space biotechnology

**Design-Build-Test-Learn (DBTL) Cycle:**
The iterative engineering framework:
- **Design**: Computational modeling, pathway design
- **Build**: DNA assembly, genome engineering
- **Test**: High-throughput screening, omics analysis
- **Learn**: Machine learning, data integration, model refinement"""
            }
        ]
    }
}

# Topic mapping for quick lookup
TOPIC_MAP = {}
for key, topic in BIOTECH_CURRICULUM.items():
    TOPIC_MAP[topic["id"]] = topic
    TOPIC_MAP[key] = topic

# All topics list for curriculum overview
CURRICULUM_TOPICS = [
    {
        "id": topic["id"],
        "name": topic["name"],
        "description": topic["description"],
        "difficulty": topic["difficulty"],
        "prerequisites": topic["prerequisites"],
        "subtopics": topic["subtopics"]
    }
    for topic in BIOTECH_CURRICULUM.values()
]

def get_all_content_chunks():
    """Get all curriculum content as chunks for RAG ingestion."""
    chunks = []
    for topic_key, topic in BIOTECH_CURRICULUM.items():
        for content_item in topic["content"]:
            chunks.append({
                "topic_id": topic["id"],
                "topic_name": topic["name"],
                "subtopic": content_item["title"],
                "difficulty": topic["difficulty"],
                "text": content_item["text"],
                "metadata": {
                    "topic_id": topic["id"],
                    "topic_name": topic["name"],
                    "subtopic": content_item["title"],
                    "difficulty": topic["difficulty"],
                    "source": "BioMentor AI Curriculum"
                }
            })
    return chunks

def get_topic_names():
    """Get list of all topic names."""
    return [t["name"] for t in BIOTECH_CURRICULUM.values()]

def get_topic_by_id(topic_id: str):
    """Get a topic by its ID."""
    return TOPIC_MAP.get(topic_id)
