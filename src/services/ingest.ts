import { loadPDF, loadText, loadWebPage } from './loaders';
import { splitDocuments } from './splitter';
import { storeDocuments } from './vectorstore';

export type SourceType = 'pdf' | 'text' | 'url';

export async function ingest(source: string, type: SourceType): Promise<void> {
  console.log(`\nIngesting [${type}]: ${source}`);

  let docs;
  if (type === 'pdf') {
    docs = await loadPDF(source);
  } else if (type === 'text') {
    docs = await loadText(source);
  } else {
    docs = await loadWebPage(source);
  }

  const chunks = await splitDocuments(docs);

  if (chunks.length === 0) {
    throw new Error('No content could be extracted from this document.');
  }

  await storeDocuments(chunks);
  console.log(`Ingestion complete for: ${source}\n`);
}