import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ArticleService } from '../../services/article/article.service';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { Article } from '../../../../../shared/article';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';
import { GeminiService } from '../../services/gemini/gemini.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent {
  private articleService = inject(ArticleService);
  private geminiService = inject(GeminiService); 
  public selectedPubMedId = signal<string | null>(null);
  public questionText = '';

  public articlesQuery = injectQuery(() => ({
    queryKey: ['todos'],
    queryFn: async () => {
      const articles: Article[] = await this.articleService.getAllArticles();
      return articles;
    },
  }))

  public abstractQuery = injectQuery(() => ({
    queryKey: ['abstract', this.selectedPubMedId()],
    queryFn: async () => {
      const pubMedId = this.selectedPubMedId();
      if (pubMedId === null) {
        return null;
      }
      const abstract = await this.articleService.getAbstractByArticleId(pubMedId);
      console.log('abstract >> ', abstract.abstract)

      if (abstract.abstract === '') {
        return 'No abstract available'
      }
      return abstract.abstract;
    },
    enabled: !!this.selectedPubMedId()
  }))

  public chatMutation = injectMutation(() => ({
    mutationFn: async (payload: {abstract: string, question: string}) => {
      const response = await this.geminiService.askQuestion(payload)
      return response.answer;
    },
    onSuccess: (data) => {
      console.log('success', data);
    }
  })
)
  public selectArticleId = (articleId: string) => {
    this.selectedPubMedId.set(articleId);
    this.chatMutation.reset();
    this.questionText = '';
  }

  public askAbstractQuestion = (abstract: string) => {
    console.log('question', this.questionText);
    console.log('gemini abstract', abstract)
    if (!this.questionText) return;
    this.chatMutation.mutate({abstract, question: this.questionText})
  }

}
