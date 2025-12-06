import express from "express";
import * as db from '../db/index.ts'
import cors from 'cors';
import { extractArticle } from "./services/articles.service.ts";
import { askGemini } from "./services/gemini.service.ts";

const PORT = 3000

const app = express();

app.use(cors())
app.use(express.json());

app.get('/api/health', (req, res) => res.send('server is alive'));

app.get('/api/articles/all', async (req, res) => {
  try {
    const result = await db.query('SELECT id, pubmed_id, type FROM articles ORDER BY id desc', null)
    return res.json(result.rows)
  } catch (err) {
    return res.status(500).json({error: 'Could not fetch articles from database'})
  }
})

app.get('/api/articles/:id', async (req, res) => {
  const articleId = req.params.id;

  try {
    const result = await db.query('SELECT abstract FROM articles WHERE pubmed_id = $1', [req.params.id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({error: 'Article not found in database'})
    }

    const article = result.rows[0];

    if (article.abstract) {
      return res.json({abstract: article.abstract})
    }

    const extractedAbstract = await extractArticle(articleId);
    await db.query('UPDATE articles SET abstract = $1 WHERE pubmed_id = $2', [extractedAbstract, articleId])

    return res.json({abstract: extractedAbstract})
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch abstract' });
  }
})

app.post('/api/gemini/ask', async (req, res) => {
  const { abstract, question } = req.body;
  
  if (!abstract || !question) return res.status(400).json({ error: 'Missing data' });

  try {
    const answer = await askGemini(abstract, question);
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: 'AI Service Unavailable' });
  }
})

app.listen(PORT, () => {
  console.log('server running on port', PORT)
})