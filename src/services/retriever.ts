import { similaritySearch } from './vectorstore';
import { Document } from '@langchain/core/documents';

export async function retrieveChunks(
  question: string,
  topK: number = 5
): Promise<Document[]> {
  const results = await similaritySearch(question, topK);
  console.log(`Retrieved ${results.length} chunks for: "${question}"`);
  return results;
}