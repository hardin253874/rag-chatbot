import dotenv from 'dotenv';
dotenv.config();

import { ingest } from './services/ingest';

async function main() {
  // Test with a web page first (no file needed)
  await ingest('https://en.wikipedia.org/wiki/Retrieval-augmented_generation', 'url');
  console.log('Test ingestion complete!');
}

main().catch(console.error);