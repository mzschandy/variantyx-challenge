import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ArticleService } from '../../services/article.service';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { Article } from '../../../../../shared/article';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent {
  public articleService = inject(ArticleService);
  public selectedPubMedId = signal<string | null>(null);

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

  public selectArticleId = (articleId: string) => {
    this.selectedPubMedId.set(articleId);
  }

}
