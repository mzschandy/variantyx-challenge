import { Injectable } from '@angular/core';
import axios from 'axios'
import { Article } from '../../../../../shared/article';

export interface Abstract {
  abstract: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = 'http://localhost:3000/api'

  public getAllArticles = async (): Promise<Article[]> => {
    const response = await axios<Article[]>(`${this.apiUrl}/articles/all`)
    return response.data;
  }

  public getAbstractByArticleId = async (articleId: string) => {
    console.log('article id to be searched', articleId);
    const response = await axios<Abstract>(`${this.apiUrl}/articles/${articleId}`)
    console.log('get abstract by article id response', response.data);
    return response.data;
  }
}
