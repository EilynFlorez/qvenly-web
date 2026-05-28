import { Component } from '@angular/core';
import { DashboardService } from '../../../../core/core-dashboard/services/dashboard.service';
import { Chart } from 'chart.js';
import { FilterService } from '../../../../core/core-dashboard/services/filter.service';
import { MonthlyGrowh } from '../../../../core/core-dashboard/models/dashboard';

@Component({
  selector: 'app-monthly-chart',
  templateUrl: './monthly-chart.component.html',
  styleUrl: './monthly-chart.component.scss'
})
export class MonthlyChartComponent {

   loading = true;
  error = false;
  peakMonth = '';
  chart: Chart | null = null;

  constructor(private dashboardService: DashboardService, private filterService: FilterService) { }

  ngOnInit(): void {

    this.filterService.filters$.subscribe(filters=>{
      this.loading = true;
    if (this.chart) { this.chart.destroy(); this.chart = null;
    }
    this.dashboardService.getMonthlyGrowth(
      filters.startDate,
      filters.endDate,
      filters.plan
    ).subscribe({
      next: (data) => {
        this.peakMonth = data.peakMonth;
        this.loading = false;
        setTimeout(() => this.buildChart(data.months), 0);
      },
      error: (err) => {
        console.error(err);
        this.error = true;
        this.loading = false;
      }
    });
  });
  }

  buildChart(months: MonthlyGrowh[]): void {
    const labels = months.map(m => m.month);
    const values = months.map(m => m.newUsers);

    const pointColors = months.map(m =>
      m.month === this.peakMonth ? '#F8B739' : '#00B8A9'
    );

    const pointSizes = months.map(m =>
      m.month === this.peakMonth ? 8 : 4
    );

    this.chart = new Chart('monthlyChart', {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Nuevos usuarios',
          data: values,
          borderColor: '#00B8A9',
          backgroundColor: 'rgba(0, 184, 169, 0.08)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: pointColors,
          pointBorderColor: pointColors,
          pointRadius: pointSizes,
          pointHoverRadius: 7
        }]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1A2332',
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y} nuevos usuarios`
            }
          }
        },

        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 12 },
              color: '#6B7280'
            }
          },

          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: {
              stepSize: 5,
              font: { size: 12 },
              color: '#6B7280'
            }
          }
        }
      }
    });
  }
}
