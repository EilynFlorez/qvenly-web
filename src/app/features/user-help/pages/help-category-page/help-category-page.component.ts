import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { HelpArticleSection, HelpCategoryDetail, HelpFrequentlyAskedQuestion } from '../../../../core/core-user-help/models/user-help.model';
import { UserHelpService } from '../../../../core/core-user-help/services/user-help.service';

@Component({
  selector: 'app-help-category-page',
  templateUrl: './help-category-page.component.html',
  styleUrl: './help-category-page.component.scss'
})
export class HelpCategoryPageComponent implements OnInit {

  category: HelpCategoryDetail | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userHelpService: UserHelpService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const slug = params.get('slug') || '';
        this.loading = true;
        return this.userHelpService.getCategory(slug);
      })
    ).subscribe(category => {
      this.category = category;
      this.loading = false;
    });
  }

  goToCategory(slug?: string): void {
    if (slug) {
      this.router.navigate(['/help/category', slug]);
    }
  }

  trackBySection(_: number, section: HelpArticleSection): string {
    return section.title;
  }

  trackByStep(_: number, step: string): string {
    return step;
  }

  trackByFaq(_: number, faq: HelpFrequentlyAskedQuestion): string {
    return faq.question;
  }
}
