import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { KnowledgeSpace } from '../models/KnowledgeSpace.js';
import { Document } from '../models/Document.js';
import { DocumentChunk } from '../models/DocumentChunk.js';
import { Conversation, Message } from '../models/Conversation.js';
import { Note, Highlight, ActivityLog } from '../models/Note.js';
import { generateEmbedding } from '../services/vectorStoreService.js';

export async function seedDatabase() {
  const existingUsers = await User.find();
  if (existingUsers.length > 0) {
    console.log('ℹ️ [Seed] Database already contains data. Skipping initial seeding.');
    return;
  }

  console.log('🌱 [Seed] Populating realistic sample data for DocuMind AI...');

  // 1. Create Demo User
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);
  const demoUser = await User.create({
    name: 'Ruhi',
    email: 'ruhii@documind.ai',
    passwordHash,
    role: 'admin',
    plan: 'pro',
    storageLimitBytes: 5 * 1024 * 1024 * 1024,
    storageUsedBytes: 64 * 1024 * 1024,
    aiQueryLimit: 500,
    aiQueryCount: 38,
    memoryPreferences: {
      language: 'English',
      tone: 'clear and structured with concrete examples',
      customInstructions: 'Focus on technical depth and cite specific page numbers and sections.'
    }
  });

  const userId = demoUser._id || demoUser.id;

  // 2. Create Knowledge Spaces
  const collegeSpace = await KnowledgeSpace.create({
    name: 'College Computer Science',
    description: 'Lecture notes, operating systems syllabus, DBMS concepts, and past university examination papers.',
    icon: 'GraduationCap',
    color: 'indigo',
    ownerId: userId,
    tags: ['Academic', 'Semester 5', 'Exams'],
    aiInstructions: 'Act as an expert academic tutor. Format answers for university exam standards with clear headings.',
    members: [
      { userId, email: demoUser.email, name: demoUser.name, role: 'owner' },
      { userId: 'u_dev', email: 'dev.sharma@college.edu', name: 'Dev Sharma', role: 'editor' },
      { userId: 'u_suhel', email: 'suhel.ansari@college.edu', name: 'Suhel Ansari', role: 'viewer' }
    ],
    documentCount: 2,
    conversationCount: 1
  });

  const researchSpace = await KnowledgeSpace.create({
    name: 'AI & LLM Research Lab',
    description: 'Preprints on transformer attention, retrieval-augmented generation architectures, and vector indexing benchmarks.',
    icon: 'Cpu',
    color: 'emerald',
    ownerId: userId,
    tags: ['Research', 'ArXiv', 'Deep Learning'],
    aiInstructions: 'Synthesize methodology, empirical benchmarks, and identify unresolved research limitations.',
    members: [
      { userId, email: demoUser.email, name: demoUser.name, role: 'owner' },
      { userId: 'u_dr_ruhi', email: 'ruhii@lab.ai', name: 'Dr. Ruhi', role: 'admin' }
    ],
    documentCount: 1,
    conversationCount: 0
  });

  const financeSpace = await KnowledgeSpace.create({
    name: 'Q3 Enterprise Analytics',
    description: 'Quarterly financial reports, customer acquisition telemetry, and tabular sales metrics.',
    icon: 'TrendingUp',
    color: 'blue',
    ownerId: userId,
    tags: ['Finance', 'Data Intelligence', 'Q3-2025'],
    aiInstructions: 'Perform precise numerical calculation and comparative metrics without speculative extrapolation.',
    members: [
      { userId, email: demoUser.email, name: demoUser.name, role: 'owner' }
    ],
    documentCount: 1,
    conversationCount: 0
  });

  // 3. Create Documents and Chunks for College Space
  // Document 1: Operating Systems Notes
  const osDoc = await Document.create({
    title: 'Operating Systems Complete Notes',
    originalName: 'Operating Systems Complete Notes.pdf',
    fileType: 'pdf',
    fileSize: 4200000,
    filePath: 'uploads/sample_os_notes.pdf',
    spaceId: collegeSpace._id || collegeSpace.id,
    ownerId: userId,
    status: 'ready',
    processingProgress: 100,
    pageCount: 3,
    wordCount: 1450,
    readingTimeMinutes: 7,
    complexity: 'Intermediate',
    category: 'Computer Science',
    topics: ['Process Management', 'Deadlock', 'Process Synchronization', 'Banker Algorithm', 'Semaphores'],
    detectedEntities: ['Dijkstra', 'POSIX Threads', 'Peterson Algorithm', 'Critical Section', 'UNIX Kernel'],
    summary: 'Comprehensive lecture modules covering concurrency, Peterson algorithm, deadlock characterization, and the Banker safety verification algorithm.',
    rawText: 'Section 1: Process Synchronization\nA critical section is a piece of code that accesses shared variables or resources that must not be accessed concurrently by multiple processes. The three mandatory requirements for a valid critical section solution are Mutual Exclusion, Progress, and Bounded Waiting. Peterson algorithm guarantees mutual exclusion using turn and flag arrays.\n\nSection 2: Deadlock Characterization\nA deadlock occurs when a set of blocked processes each holds a resource and waits to acquire a resource held by another process in the set. Four Coffman conditions must hold simultaneously: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait.\n\nSection 3: Deadlock Avoidance and Banker Algorithm\nThe Banker algorithm developed by Edsger Dijkstra tests for safety by simulating the allocation of predetermined maximum possible amounts of all resources, and then makes an s-state check to verify that no deadlock condition can occur.'
  });

  const osChunks = [
    {
      documentId: osDoc._id || osDoc.id,
      spaceId: collegeSpace._id || collegeSpace.id,
      chunkIndex: 0,
      pageNumber: 1,
      sectionTitle: 'Process Synchronization & Critical Section',
      content: 'A critical section is a piece of code that accesses shared resources (like memory, files, or database rows) that must not be concurrently accessed by more than one process. To ensure safe execution, any valid synchronization solution must satisfy three rigorous criteria: 1. Mutual Exclusion: If process Pi is executing in its critical section, then no other processes can be executing in their critical sections. 2. Progress: If no process is executing in its critical section and some processes wish to enter, only those processes not in their remainder section can participate in deciding who will enter next. 3. Bounded Waiting: A bound must exist on the number of times other processes are allowed to enter their critical sections after a process has made a request to enter.',
      tokenCount: 180,
      keywords: ['synchronization', 'critical', 'section', 'mutual', 'exclusion', 'progress', 'bounded', 'waiting', 'processes']
    },
    {
      documentId: osDoc._id || osDoc.id,
      spaceId: collegeSpace._id || collegeSpace.id,
      chunkIndex: 1,
      pageNumber: 2,
      sectionTitle: 'Deadlock Characterization & Four Coffman Conditions',
      content: 'A deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process. In an operating system, deadlock can arise if four Coffman conditions hold simultaneously: 1. Mutual Exclusion: At least one resource must be held in a non-shareable mode. 2. Hold and Wait: A process must be currently holding at least one resource and requesting additional resources that are being held by other processes. 3. No Preemption: Resources cannot be preempted; a resource can be released only voluntarily by the process holding it after that process has finished its task. 4. Circular Wait: A closed chain of processes exists such that each process holds at least one resource needed by the next process in the chain.',
      tokenCount: 200,
      keywords: ['deadlock', 'coffman', 'conditions', 'mutual', 'exclusion', 'hold', 'wait', 'preemption', 'circular']
    },
    {
      documentId: osDoc._id || osDoc.id,
      spaceId: collegeSpace._id || collegeSpace.id,
      chunkIndex: 2,
      pageNumber: 3,
      sectionTitle: 'Deadlock Avoidance & The Banker Algorithm',
      content: 'Deadlock avoidance requires that the operating system be given additional information in advance concerning which resources a process will request and use during its lifetime. The Banker Algorithm, formulated by Edsger Dijkstra, is a classic deadlock avoidance strategy for systems with multiple instances of each resource type. When a new process enters the system, it must declare the maximum number of instances of each resource type that it may need. The system evaluates whether allocating requested resources leaves the system in a "Safe State". A state is considered safe if there exists a safe sequence of process executions such that each process can satisfy its maximum resource requirements using currently available resources plus resources freed by preceding processes.',
      tokenCount: 220,
      keywords: ['banker', 'algorithm', 'safe', 'state', 'avoidance', 'dijkstra', 'resources', 'allocation', 'sequence']
    }
  ];

  for (const c of osChunks) {
    await DocumentChunk.create({
      ...c,
      embedding: generateEmbedding(c.content)
    });
  }

  // Document 2: DBMS Complete Guide
  const dbmsDoc = await Document.create({
    title: 'Database Management Systems (DBMS)',
    originalName: 'Database Management Systems Complete Guide.pdf',
    fileType: 'pdf',
    fileSize: 3800000,
    filePath: 'uploads/sample_dbms_guide.pdf',
    spaceId: collegeSpace._id || collegeSpace.id,
    ownerId: userId,
    status: 'ready',
    processingProgress: 100,
    pageCount: 2,
    wordCount: 1100,
    readingTimeMinutes: 5,
    complexity: 'Intermediate',
    category: 'Computer Science',
    topics: ['Transactions', 'ACID Properties', 'Two-Phase Locking (2PL)', 'Concurrency Control', 'Serializability'],
    detectedEntities: ['ACID', 'Jim Gray', 'Write-Ahead Logging', 'Strict 2PL', 'B-Trees'],
    summary: 'Detailed overview of relational database engine transactions, ACID guarantees, serializability, and the strict two-phase locking protocol.',
    rawText: 'Section 1: Transaction Processing & ACID Properties\nA transaction is a single logical unit of work. To preserve data consistency across concurrent executions and hardware crashes, transactions adhere to ACID properties: Atomicity (all or nothing), Consistency (preserves database integrity constraints), Isolation (concurrent executions do not interfere), and Durability (committed changes persist despite subsequent system crashes).\n\nSection 2: Concurrency Control & Two-Phase Locking\nTo prevent conflicting reads and writes (like dirty reads, non-repeatable reads, and phantom reads), relational engines use concurrency control. In Two-Phase Locking (2PL), transactions acquire locks during the growing phase and release locks during the shrinking phase. Strict 2PL holds all exclusive write locks until the transaction commits, completely preventing cascading aborts.'
  });

  const dbmsChunks = [
    {
      documentId: dbmsDoc._id || dbmsDoc.id,
      spaceId: collegeSpace._id || collegeSpace.id,
      chunkIndex: 0,
      pageNumber: 1,
      sectionTitle: 'Transaction Processing & ACID Properties',
      content: 'A transaction is a single logical unit of work that accesses and possibly modifies the contents of a database. To ensure data integrity, relational database management systems mandate the ACID properties: 1. Atomicity: Either all operations of the transaction are executed in the database or none are. If a transaction aborts halfway, all partial changes are rolled back. 2. Consistency: Execution of a transaction in isolation preserves the consistency of the database constraints. 3. Isolation: Even though multiple transactions may execute concurrently, the system guarantees that for every pair of transactions Ti and Tj, it appears to Ti that Tj either finished execution before Ti started, or Ti finished before Tj started. 4. Durability: After a transaction completes successfully and commits, the changes it has made to the database persist, even if system crashes occur.',
      tokenCount: 190,
      keywords: ['transaction', 'acid', 'atomicity', 'consistency', 'isolation', 'durability', 'database', 'integrity']
    },
    {
      documentId: dbmsDoc._id || dbmsDoc.id,
      spaceId: collegeSpace._id || collegeSpace.id,
      chunkIndex: 1,
      pageNumber: 2,
      sectionTitle: 'Concurrency Control & Strict Two-Phase Locking (2PL)',
      content: 'Concurrency control ensures that database transactions are executed concurrently without violating data consistency. When multiple users execute read and write statements simultaneously, anomalies such as dirty reads, lost updates, and phantom reads can corrupt database records. The Two-Phase Locking (2PL) protocol provides conflict serializability. Under 2PL, a transaction must execute in two distinct phases: Phase 1 (Growing Phase), during which the transaction may obtain locks but may not release any lock. Phase 2 (Shrinking Phase), during which the transaction may release locks but may not acquire new ones. Strict 2PL requires that not only is locking two-phase, but all exclusive locks held by the transaction must be retained until the transaction commits or aborts, eliminating cascading aborts.',
      tokenCount: 210,
      keywords: ['concurrency', 'two-phase', 'locking', 'strict', 'serializability', 'dirty', 'reads', 'cascading', 'aborts']
    }
  ];

  for (const c of dbmsChunks) {
    await DocumentChunk.create({
      ...c,
      embedding: generateEmbedding(c.content)
    });
  }

  // Document 3: AI Research Space document
  const mlDoc = await Document.create({
    title: 'Hybrid RAG & Vector Retrieval Benchmarks',
    originalName: 'Hybrid RAG and Vector Retrieval Benchmarks.pdf',
    fileType: 'pdf',
    fileSize: 5200000,
    filePath: 'uploads/sample_hybrid_rag.pdf',
    spaceId: researchSpace._id || researchSpace.id,
    ownerId: userId,
    status: 'ready',
    processingProgress: 100,
    pageCount: 2,
    wordCount: 1200,
    readingTimeMinutes: 6,
    complexity: 'Advanced',
    category: 'Machine Learning',
    topics: ['Retrieval-Augmented Generation', 'BM25', 'Vector Search', 'Reranking', 'Reciprocal Rank Fusion'],
    detectedEntities: ['HNSW Index', 'Cross-Encoder', 'Dense Vectors', 'Sparse Tokens', 'Recall@10'],
    summary: 'Empirical comparison between pure vector cosine similarity, sparse BM25, and hybrid Reciprocal Rank Fusion on technical document corpora.',
    rawText: 'Section 1: The Limitations of Pure Vector Search\nWhile dense embedding retrieval captures latent semantics, it frequently fails on exact identifier lookups, code tokens, and acronyms where BM25 keyword matching excels. Conversely, BM25 fails on paraphrasing and conceptual synonymy.\n\nSection 2: Hybrid Fusion Architecture\nBy combining dense HNSW vector similarity with sparse BM25 scoring via Reciprocal Rank Fusion (RRF) and applying a lightweight cross-encoder reranker, retrieval recall@10 increases from 71.4% to 92.8% on multi-hop technical documentation.'
  });

  const mlChunks = [
    {
      documentId: mlDoc._id || mlDoc.id,
      spaceId: researchSpace._id || researchSpace.id,
      chunkIndex: 0,
      pageNumber: 1,
      sectionTitle: 'Vector Retrieval vs. Sparse Keyword Search',
      content: 'Pure dense vector retrieval projects natural language into high-dimensional embedding spaces, making it highly proficient at understanding broad semantic intent and conceptual synonyms. However, empirical evaluation demonstrates a critical failure mode: dense models struggle significantly with exact string matching, product codes, specialized acronyms, and alphanumeric identifiers. In contrast, sparse algorithms such as BM25 provide deterministic, token-exact matching but cannot handle vocabulary mismatches or colloquial paraphrasing.',
      tokenCount: 160,
      keywords: ['dense', 'vector', 'sparse', 'bm25', 'semantic', 'acronyms', 'retrieval', 'limitations']
    },
    {
      documentId: mlDoc._id || mlDoc.id,
      spaceId: researchSpace._id || researchSpace.id,
      chunkIndex: 1,
      pageNumber: 2,
      sectionTitle: 'Empirical Findings & Reciprocal Rank Fusion',
      content: 'To resolve these complementary shortcomings, our proposed hybrid pipeline computes normalized BM25 keyword relevance alongside cosine vector similarity, integrating their candidate lists via Reciprocal Rank Fusion (RRF). Across a benchmark evaluation of 50,000 multi-document technical queries, hybrid RRF combined with a secondary reranker increased Recall@10 from 71.4% (pure dense) to 92.8% (hybrid), with an inference latency overhead of under 35 milliseconds.',
      tokenCount: 175,
      keywords: ['reciprocal', 'rank', 'fusion', 'hybrid', 'recall', 'benchmark', 'reranker', 'latency']
    }
  ];

  for (const c of mlChunks) {
    await DocumentChunk.create({
      ...c,
      embedding: generateEmbedding(c.content)
    });
  }

  // Document 4: Tabular Sales Performance for Data Intelligence
  const salesDoc = await Document.create({
    title: 'Enterprise Q3 Sales & Performance Matrix',
    originalName: 'Enterprise Q3 Sales Performance 2025.csv',
    fileType: 'csv',
    fileSize: 124000,
    filePath: 'uploads/sample_sales.csv',
    spaceId: financeSpace._id || financeSpace.id,
    ownerId: userId,
    status: 'ready',
    processingProgress: 100,
    pageCount: 1,
    wordCount: 820,
    readingTimeMinutes: 4,
    complexity: 'Basic',
    category: 'Finance',
    topics: ['Revenue Growth', 'Monthly Performance', 'Quarterly Margins', 'Enterprise ARR'],
    detectedEntities: ['Q1-2025', 'Q2-2025', 'Q3-2025', 'Gross Margin', 'Net Retention Rate'],
    summary: 'Tabular financial breakdown of monthly revenue, operational expenditure, customer acquisition cost, and net margins across 2025.',
    rawText: 'Month,Revenue,Expenses,NetProfit,Margin\nJanuary,$120000,$85000,$35000,29.1%\nFebruary,$135000,$88000,$47000,34.8%\nMarch,$160000,$92000,$68000,42.5%\nApril,$145000,$90000,$55000,37.9%\nMay,$175000,$95000,$80000,45.7%\nJune,$190000,$98000,$92000,48.4%\nJuly,$210000,$102000,$108000,51.4%\nAugust,$240000,$105000,$135000,56.2%\nSeptember,$260000,$110000,$150000,57.7%',
    metadata: {
      tablesCount: 1,
      sheetNames: ['Monthly Financials 2025']
    }
  });

  const salesRows = [
    ['Month', 'Revenue', 'Expenses', 'NetProfit', 'Margin'],
    ['January', '120000', '85000', '35000', '29.1%'],
    ['February', '135000', '88000', '47000', '34.8%'],
    ['March', '160000', '92000', '68000', '42.5%'],
    ['April', '145000', '90000', '55000', '37.9%'],
    ['May', '175000', '95000', '80000', '45.7%'],
    ['June', '190000', '98000', '92000', '48.4%'],
    ['July', '210000', '102000', '108000', '51.4%'],
    ['August', '240000', '105000', '135000', '56.2%'],
    ['September', '260000', '110000', '150000', '57.7%']
  ];

  await DocumentChunk.create({
    documentId: salesDoc._id || salesDoc.id,
    spaceId: financeSpace._id || financeSpace.id,
    chunkIndex: 0,
    pageNumber: 1,
    sectionTitle: 'Monthly Financials 2025',
    content: salesDoc.rawText,
    tokenCount: 220,
    keywords: ['revenue', 'expenses', 'profit', 'margin', 'january', 'august', 'september'],
    embedding: generateEmbedding(salesDoc.rawText)
  });

  // 4. Create Sample Conversation with Grounded Citations
  const sampleConv = await Conversation.create({
    spaceId: collegeSpace._id || collegeSpace.id,
    documentId: osDoc._id || osDoc.id,
    userId,
    title: 'Deadlock & Concurrency Inquiry',
    mode: 'ask',
    isPinned: true
  });

  await Message.create({
    conversationId: sampleConv._id || sampleConv.id,
    spaceId: collegeSpace._id || collegeSpace.id,
    role: 'user',
    content: 'Explain deadlock according to my notes and what conditions cause it.',
    mode: 'ask'
  });

  await Message.create({
    conversationId: sampleConv._id || sampleConv.id,
    spaceId: collegeSpace._id || collegeSpace.id,
    role: 'assistant',
    content: `Based on your document **Operating Systems Complete Notes** (Section: *Deadlock Characterization & Four Coffman Conditions*):\n\nA deadlock occurs when a set of processes are blocked because each process is holding at least one resource and waiting to acquire another resource currently held by another process in the set.\n\nAccording to your notes on Page 2, a deadlock can arise if and only if the following four **Coffman conditions** hold simultaneously:\n\n1. **Mutual Exclusion:** At least one resource must be held in a non-shareable mode (only one process can use it at any time).\n2. **Hold and Wait:** A process must currently hold at least one resource while simultaneously waiting for additional resources held by other processes.\n3. **No Preemption:** Resources cannot be forcibly preempted; they can only be released voluntarily by the holding process upon completion.\n4. **Circular Wait:** A closed chain of processes exists ($P_0, P_1, \\dots, P_n$) such that $P_0$ waits for a resource held by $P_1$, and $P_n$ waits for a resource held by $P_0$.\n\n*(Verified directly against source passage on Page 2).*`,
    mode: 'ask',
    citations: [
      {
        documentId: osDoc._id || osDoc.id,
        documentTitle: osDoc.title,
        pageNumber: 2,
        sectionTitle: 'Deadlock Characterization & Four Coffman Conditions',
        excerpt: 'A deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process...'
      }
    ]
  });

  // 5. Create Sample Notes and Highlights
  await Note.create({
    documentId: osDoc._id || osDoc.id,
    spaceId: collegeSpace._id || collegeSpace.id,
    userId,
    title: 'Crucial for Semester Exam (Section 2)',
    content: 'Always write all 4 Coffman conditions with the formal resource allocation graph definition to secure full 5 marks.',
    pageNumber: 2,
    selectedText: 'In an operating system, deadlock can arise if four Coffman conditions hold simultaneously',
    color: 'yellow',
    tags: ['Exam-Prep', 'High-Priority']
  });

  await Highlight.create({
    documentId: osDoc._id || osDoc.id,
    spaceId: collegeSpace._id || collegeSpace.id,
    userId,
    text: 'A critical section is a piece of code that accesses shared resources that must not be concurrently accessed by more than one process.',
    pageNumber: 1,
    color: '#FEF08A'
  });

  // 6. Create Initial Activity Logs
  await ActivityLog.create({
    spaceId: collegeSpace._id || collegeSpace.id,
    userId,
    userName: demoUser.name,
    action: 'upload_document',
    details: 'Uploaded Operating Systems Complete Notes.pdf and Database Management Systems.pdf'
  });

  await ActivityLog.create({
    spaceId: collegeSpace._id || collegeSpace.id,
    userId,
    userName: demoUser.name,
    action: 'create_note',
    details: 'Added revision note on Coffman conditions.'
  });

  console.log('✅ [Seed] Database successfully populated with realistic spaces, documents, chunks, and citations!');
}
