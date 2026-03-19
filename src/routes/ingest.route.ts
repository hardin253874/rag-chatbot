import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ingest } from '../services/ingest';
import { resetCollection } from '../services/vectorstore';
const router = Router();

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    // Handle URL ingestion
    if (req.body.url) {
      await ingest(req.body.url, 'url');
      res.json({ success: true, message: `Ingested URL: ${req.body.url}` });
      return;
    }

    // Handle file ingestion
    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      const type = ext === '.pdf' ? 'pdf' : 'text';
      await ingest(req.file.path, type);

      // Clean up temp file
      fs.unlinkSync(req.file.path);

      res.json({ success: true, message: `Ingested file: ${req.file.originalname}` });
      return;
    }

    res.status(400).json({ error: 'Provide either a file or a url in the request body' });

  } catch (err) {
    console.error('Ingest error:', err);
    res.status(500).json({ error: 'Ingestion failed', detail: String(err) });
  }
});

router.delete('/reset', async (req: Request, res: Response) => {
  try {
    await resetCollection();
    res.json({ success: true, message: 'Knowledge base cleared.' });
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ error: 'Reset failed', detail: String(err) });
  }
});

export default router;