import * as cheerio from 'cheerio'; 
import axios from "axios";

const BASE_EXTRACTION_URL = 'https://pubmed.ncbi.nlm.nih.gov'

export const extractArticle = async (articleId: string) => {
  const articleUrl = `${BASE_EXTRACTION_URL}/${articleId}`;
  const response = await axios.get(articleUrl);
  const $ = cheerio.load(response.data)
  const abstract=  $('#eng-abstract').text().trim();
  return abstract;
}