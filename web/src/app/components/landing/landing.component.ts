import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ArticleService } from '../../services/article/article.service';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { Article } from '../../../../../shared/article';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';
import { GeminiService } from '../../services/gemini/gemini.service';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmScrollAreaImports } from '@spartan-ng/helm/scroll-area';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { lucideSparkles } from '@ng-icons/lucide';
import { HlmItemImports } from '@spartan-ng/helm/item';
import { ArticleItemComponent } from '../article-item/article-item.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    HlmButtonImports, 
    HlmScrollAreaImports, 
    NgScrollbarModule,
    HlmInputImports,
    HlmAlertImports,
    HlmSpinnerImports,
    HlmItemImports,
    NgIcon,
    HlmIcon,
    ArticleItemComponent,
  ],
  providers: [provideIcons({ lucideSparkles })],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
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
    }})
  )

  public selectArticleEvent = (articleId: string) => {
    this.selectedPubMedId.set(articleId);
    this.chatMutation.reset();
    this.questionText = '';
  }

  public askAbstractQuestion = (abstract: string) => {
    if (!this.questionText) return;
    this.chatMutation.mutate({abstract, question: this.questionText})
  }
}
