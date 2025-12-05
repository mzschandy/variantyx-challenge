import express from "express";
import axios from "axios";
import * as cheerio from 'cheerio'; 
import * as db from '../db/index.ts'
import cors from 'cors';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

const PORT = 3000
const BASE_EXTRACTION_URL = 'https://pubmed.ncbi.nlm.nih.gov'

const app = express();

app.use(cors())
app.use(express.json());

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

app.post('/api/gemini/ask', async (req, res) => {
  // const response = await ai.models.generateContent({
  //   model: "gemini-2.5-flash",
  //   contents: "How does AI work?",
  // });
  // console.log(response.text);
console.log('req body', req.body)
  const { abstract, question } = req.body;

  
  
  if (!abstract || !question) return res.status(400).json({ error: 'Missing data' });
  console.log('abstract is >>', abstract)
  console.log('quesiton is >>', question)
  try {
    const answer = await askGemini(abstract, question);
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: 'AI Service Unavailable' });
  }
})

export const askGemini = async (abstract: string, question: string) => {
  console.log("activating ask gemini")
  const prompt = `
    You are a medical researcher skilled in answering questions in a way that a non-scientist would understand.
    While explaining, make sure to explain concepts in a way a layperson would understand. Do not assume the
    user is familiar with the scientific concepts in the abstract.

    Return text only, if there are non data parts ignore them.
      
    Abstract: "${abstract}"
    
    Question: "${question}"
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  console.log('gemini response text >>', response.text)

  return response.text;
};

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