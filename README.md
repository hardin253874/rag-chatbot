# RAG Chatbot

A local Retrieval-Augmented Generation (RAG) chatbot built with TypeScript, OpenAI, and ChromaDB. Ask questions grounded in your own documents — PDFs, text files, and web pages.

![RAG Chatbot](https://img.shields.io/badge/status-complete-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue) ![Node.js](https://img.shields.io/badge/Node.js-v24-green)

---

## What It Does

- **Ingest** documents from PDFs, text/markdown files, or any URL
- **Embed** content into vectors using OpenAI `text-embedding-3-small`
- **Store** vectors locally in ChromaDB
- **Retrieve** the most relevant chunks when you ask a question
- **Stream** a grounded answer from `gpt-4o-mini` in real time
- **Cite** the source documents used in every answer
- **Remember** conversation history for multi-turn dialogue

---

## How It Works

**Ingestion (one-time per document):**
```
Document → Extract Text → Split into Chunks → Embed → Store in ChromaDB
```

**Chat (every question):**
```
Question → Embed → Search ChromaDB → Build Prompt → GPT → Stream Answer
```

---

## Tech Stack

| Layer | Tool |
|---|---|
| Language | TypeScript (Node.js v24) |
| LLM | OpenAI `gpt-4o-mini` |
| Embeddings | OpenAI `text-embedding-3-small` |
| RAG Framework | LangChain.js |
| Vector Store | ChromaDB `0.5.20` (Docker) |
| Backend | Express.js |
| Frontend | Vanilla HTML/CSS/JS |

---

## Prerequisites

- Node.js v18+
- Docker Desktop
- OpenAI API key

---

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd rag-chatbot
npm install --legacy-peer-deps
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
OPENAI_API_KEY=your-openai-api-key-here
CHROMA_URL=http://localhost:8000
CHROMA_SERVER_VERSION=0.5.20
PORT=3010
```

### 3. Start ChromaDB

```bash
docker run -d --name chromadb -p 8000:8000 chromadb/chroma:0.5.20
```

### 4. Start the dev server

```bash
npm run dev
```

### 5. Open the UI

```
http://localhost:3010
```

---

## Project Structure

```
rag-chatbot/
├── public/
│   └── index.html              # Chat UI
├── src/
│   ├── routes/
│   │   ├── ingest.route.ts     # POST /ingest, DELETE /ingest/reset
│   │   └── chat.route.ts       # POST /chat (SSE streaming)
│   ├── services/
│   │   ├── loaders.ts          # PDF, text, and web page loaders
│   │   ├── splitter.ts         # Chunk documents into pieces
│   │   ├── vectorstore.ts      # ChromaDB client — store & search
│   │   ├── ingest.ts           # Ingestion pipeline orchestrator
│   │   ├── retriever.ts        # Similarity search wrapper
│   │   └── rag.ts              # Prompt builder + GPT streaming
│   ├── types/
│   │   └── pdf-parse.d.ts      # Type declaration for pdf-parse
│   └── index.ts                # Express app entry point
├── uploads/                    # Temporary file upload storage
├── documents/                  # Your source documents (optional)
├── .env                        # Environment variables (never commit)
├── .gitignore
├── tsconfig.json
└── package.json
```

---

## API Endpoints

### `POST /ingest`

Ingest a URL:
```bash
Invoke-WebRequest -Method POST http://localhost:3010/ingest \
  -ContentType "application/json" \
  -Body '{"url": "https://example.com/article"}'
```

Upload a file:
```bash
Invoke-WebRequest -Method POST http://localhost:3010/ingest \
  -Body (New-Object System.Net.Http.MultipartFormDataContent)
```

### `POST /chat`

Send a question (returns Server-Sent Events stream):
```bash
Invoke-WebRequest -Method POST http://localhost:3010/chat \
  -ContentType "application/json" \
  -Body '{"question": "What is RAG?", "history": []}'
```

SSE response format:
```
data: {"type":"chunk","text":"Retrieval"}
data: {"type":"chunk","text":"-augmented"}
...
data: {"type":"sources","sources":["https://..."]}
data: {"type":"done"}
```

### `DELETE /ingest/reset`

Clear the entire knowledge base:
```bash
Invoke-WebRequest -Method DELETE http://localhost:3010/ingest/reset
```

### `GET /health`

```bash
curl http://localhost:3010/health
# {"status":"ok"}
```

---

## Supported Document Types

| Type | Extensions | Notes |
|---|---|---|
| PDF | `.pdf` | Text extracted via `pdf-parse` directly |
| Text | `.txt`, `.md` | Loaded via LangChain TextLoader |
| Web Page | Any URL | Scraped via Cheerio |

---

## Key Dependency Versions

> ⚠️ These versions are pinned intentionally. Do not upgrade without testing.

```json
"chromadb": "1.9.2",
"langchain": "0.3.6",
"@langchain/core": "0.3.26",
"@langchain/community": "0.3.20",
"@langchain/openai": "0.3.16",
"dotenv": "16.4.5",
"pdf-parse": "1.1.1"
```

ChromaDB Docker image: `chromadb/chroma:0.5.20`

Always install with:
```bash
npm install --legacy-peer-deps
```

---

## Scripts

```bash
npm run dev      # Start dev server with hot reload (ts-node + nodemon)
npm run build    # Compile TypeScript to dist/
npm run start    # Run compiled output
```

---

## Notes

- ChromaDB must be running before starting the server
- Restart ChromaDB container after system reboots: `docker start chromadb`
- On Windows, use `Invoke-WebRequest` instead of `curl` for API testing
- The `uploads/` folder stores temporary files during ingestion and is auto-cleaned
- Chat history is stored in browser memory only — it resets on page refresh
