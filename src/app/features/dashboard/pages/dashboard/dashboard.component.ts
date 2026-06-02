import { Component } from '@angular/core';
import { DashboardFilters } from '../../../../core/core-dashboard/models/dashboard-filters';
import { DashboardService } from '../../../../core/core-dashboard/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  backendOnline = false;
  checking = true;
  private interval: any;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.checkBackend();
    this.interval = setInterval(() => this.checkBackend(), 5000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  checkBackend(): void {
    this.dashboardService.getGeneralStats().subscribe({
      next: () => {
        this.backendOnline = true;
        this.checking = false;
        clearInterval(this.interval);
      },

      error: () => {
        this.backendOnline = false;
        this.checking = false;
      }
    });
  }


  currenFilters: DashboardFilters = {
    startDate: '',
    endDate: '',
    plan: ''
  };

  onFiltersChanged(filters: DashboardFilters): void {
    this.currenFilters = filters;
  }
}
