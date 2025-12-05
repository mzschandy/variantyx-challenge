import express from "express";
import axios from "axios";
import * as cheerio from 'cheerio'; 
import * as db from '../db/index.ts'
import cors from 'cors';

const PORT = 3000
const BASE_EXTRACTION_URL = 'https://pubmed.ncbi.nlm.nih.gov'

const app = express();

app.use(cors())

app.get('/api/health', (req, res) => res.send('HAAAAAAA'));

app.get('/api/articles/all', async (req, res) => {
  console.log('getting all articles')
  try {
    const result = await db.query('SELECT id, pubmed_id, type FROM articles ORDER BY id desc', null)
    return res.json(result.rows)
  } catch (err) {
    console.log('error', err);
    return res.status(500).json({error: 'Could not fetch articles from database'})
  }
})

app.get('/api/articles/:id', async (req, res) => {
  const articleId = req.params.id;

  try {
    console.log('article id', articleId)
    const result = await db.query('SELECT abstract FROM articles WHERE pubmed_id = $1', [req.params.id]);
    console.log('initial resul (all articles)', result);
  
  if (result.rowCount === 0) {
    //get article abstraction
    console.log('article does not exist does not have it')
    return res.status(404).json({error: 'Article not found in database'})
  }

  const article = result.rows[0];
  console.log('found article by its id', article);

  //found abstract
  if (article.abstract) {
    console.log('hit for abstract in article', articleId)
    return res.json({abstract: article.abstract})
  }

  //did not find abstract
  const extractedAbstract = await extractArticle(articleId);
  console.log('extractedAbstract', extractedAbstract)
  await db.query('UPDATE articles SET abstract = $1 WHERE pubmed_id = $2', [extractedAbstract, articleId])
  console.log('abstract', article);

  return res.json({abstract: extractedAbstract})
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch abstract' });
  }
})

const extractArticle = async (articleId: string) => {
  const articleUrl = `${BASE_EXTRACTION_URL}/${articleId}`;
  console.log('article url is', articleUrl);
  const response = await axios.get(articleUrl);
  console.log('article data from axios', response.data);
  const $ = cheerio.load(response.data)
  console.log('$', $)
  const abstract=  $('#eng-abstract').text().trim();
  console.log('cheerioed abstract', abstract);
  return abstract;
}

app.listen(PORT, () => {
  console.log('server running on port', PORT)
})