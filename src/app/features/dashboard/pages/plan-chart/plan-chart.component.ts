import { Component, OnInit } from '@angular/core';
import { PlanStats } from '../../../../core/models/dashboard/dashboard';
import { DashboardService } from '../../../../core/services/dashboard/dashboard.service';
import { FilterService } from '../../../../core/services/dashboard/filter.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-plan-chart',
  templateUrl: './plan-chart.component.html',
  styleUrl: './plan-chart.component.scss'
})
export class PlanChartComponent implements OnInit {

  loading = true;
  error = false;
  featuredPlan = '';
  chart: Chart | null = null;

  constructor(
    private dashboardService: DashboardService,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.filterService.filters$.subscribe(filters => {
      this.loading = true;

      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }

      this.dashboardService.getOrganizersByPlan(
        filters.startDate,
        filters.endDate,
        filters.plan
      ).subscribe({
        next: (data) => {
          this.featuredPlan = data.featuredPlan;
          this.loading = false;
          setTimeout(() => this.buildChart(data.plans), 0);
        },
        error: (err) => {
          console.error(err);
          this.error = true;
          this.loading = false;
        }
      });
    });
  }

  buildChart(plans: PlanStats[]): void {
    const labels: string[] = plans.map(p => p.planName);
    const values: number[] = plans.map(p => p.numberOrganizers);

    this.chart = new Chart('planChart', {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: ['#00B8A9', '#F8B739', '#8b5cf6', '#3b82f6', '#ec4899'],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 16,
              font: { family: 'DM Sans', size: 13 },
              color: '#6B7280'
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx: any) => `${ctx.label}: ${ctx.parsed} organizadores`
            }
          }
        }
      }
    } as any);
  }
}