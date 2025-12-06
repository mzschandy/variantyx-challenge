import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private apiUrl = 'http://localhost:3000/api';

  public askQuestion = async (payload: { abstract: string; question: string }) => {
    const response = await axios.post(`${this.apiUrl}/gemini/ask`, payload);
    return response.data;
  }
}
