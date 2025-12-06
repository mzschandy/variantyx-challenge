import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmItemImports } from '@spartan-ng/helm/item';

@Component({
  selector: 'app-article-item',
  imports: [HlmItemImports, HlmButtonImports],
  standalone: true,
  templateUrl: './article-item.component.html',
  styleUrl: './article-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleItemComponent {
  public articleId = input<string>();
  public selectArticle = output<string>();

  public onSelectArticle = (articleId: string | undefined) => {
    if (articleId === undefined) {
      return;
    }
    this.selectArticle.emit(articleId);
  }
}
