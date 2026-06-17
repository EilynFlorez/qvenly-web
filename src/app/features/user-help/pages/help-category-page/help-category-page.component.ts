import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { HelpCategoryDetail } from '../../../../core/core-user-help/models/user-help.model';
import { UserHelpService } from '../../../../core/core-user-help/services/user-help.service';

@Component({
  selector: 'app-help-category-page',
  templateUrl: './help-category-page.component.html',
  styleUrl: './help-category-page.component.scss'
})
export class HelpCategoryPageComponent implements OnInit {

  category: HelpCategoryDetail | null = null;
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private userHelpService: UserHelpService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const slug = params.get('slug') || '';
        this.loading = true;
        this.errorMessage = '';
        return this.userHelpService.getCategory(slug).pipe(
          catchError(() => {
            this.errorMessage = 'No pudimos cargar esta categoria desde el servidor.';
            return of(this.buildFallback(slug));
          })
        );
      })
    ).subscribe(category => {
      this.category = category;
      this.loading = false;
    });
  }

  private buildFallback(slug: string): HelpCategoryDetail {
    const title = slug.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    return {
      slug,
      title: title || 'Categoria de ayuda',
      description: '',
      icon: 'ti ti-help-circle',
      content: 'Consulta las guias disponibles o vuelve al centro de ayuda para buscar otro tema.',
      articles: []
    };
  }
}
