import dotenv from 'dotenv';
dotenv.config();

import { ragQuery } from './services/rag';

async function main() {
  const question = 'What is retrieval-augmented generation?';
  console.log(`\nQuestion: ${question}\n`);
  console.log('Answer:');

  await ragQuery(question, (chunk) => {
    process.stdout.write(chunk);
  });

  console.log('\n\nDone!');
}

main().catch(console.error);