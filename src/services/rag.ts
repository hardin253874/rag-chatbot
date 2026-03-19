import { ChatOpenAI } from '@langchain/openai';
import { retrieveChunks } from './retriever';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Questions that refer to prior conversation rather than documents
function isConversational(question: string): boolean {
  const q = question.toLowerCase();
  return (
    q.includes('you just said') ||
    q.includes('you mentioned') ||
    q.includes('summarise') ||
    q.includes('summarize') ||
    q.includes('what did you') ||
    q.includes('previous') ||
    q.includes('last answer') ||
    q.includes('above') ||
    q.includes('repeat')
  );
}

function getLLM() {
  return new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: 'gpt-4o-mini',
    streaming: true,
    temperature: 0.2,
  });
}

function buildPrompt(context: string, question: string, history: Message[]): string {
  const historyText = history.length > 0
    ? '\n\nConversation so far:\n' + history
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n')
    : '';

  return `You are a helpful assistant. Answer the question based only on the context and conversation history provided below.
If the answer is not available, say "I don't have enough information to answer that."

Context:
${context}${historyText}

Question: ${question}`;
}

function buildConversationalPrompt(question: string, history: Message[]): string {
  const historyText = history
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  return `You are a helpful assistant. Based on the conversation below, answer the user's latest question.

Conversation:
${historyText}

Question: ${question}`;
}

export async function ragQuery(
  question: string,
  onChunk: (text: string) => void,
  history: Message[] = []
): Promise<void> {
  // If it's a follow-up question about prior conversation, skip retrieval
  if (isConversational(question) && history.length > 0) {
    const prompt = buildConversationalPrompt(question, history);
    const stream = await getLLM().stream(prompt);
    for await (const chunk of stream) {
      const text = chunk.content?.toString() ?? '';
      if (text) onChunk(text);
    }
    return;
  }

  const chunks = await retrieveChunks(question);
  if (chunks.length === 0) {
    onChunk("I couldn't find any relevant information in the knowledge base.");
    return;
  }

  const context = chunks.map((c, i) => `[${i + 1}] ${c.pageContent}`).join('\n\n');
  const stream = await getLLM().stream(buildPrompt(context, question, history));
  for await (const chunk of stream) {
    const text = chunk.content?.toString() ?? '';
    if (text) onChunk(text);
  }
}

export async function ragQueryWithSources(
  question: string,
  onChunk: (text: string) => void,
  history: Message[] = []
): Promise<string[]> {
  // If it's a follow-up question about prior conversation, skip retrieval
  if (isConversational(question) && history.length > 0) {
    const prompt = buildConversationalPrompt(question, history);
    const stream = await getLLM().stream(prompt);
    for await (const chunk of stream) {
      const text = chunk.content?.toString() ?? '';
      if (text) onChunk(text);
    }
    return [];
  }

  const chunks = await retrieveChunks(question);
  if (chunks.length === 0) {
    onChunk("I couldn't find any relevant information in the knowledge base.");
    return [];
  }

  const context = chunks.map((c, i) => `[${i + 1}] ${c.pageContent}`).join('\n\n');
  const stream = await getLLM().stream(buildPrompt(context, question, history));
  for await (const chunk of stream) {
    const text = chunk.content?.toString() ?? '';
    if (text) onChunk(text);
  }

  return [...new Set(chunks.map(c => c.metadata?.source).filter(Boolean))];
}