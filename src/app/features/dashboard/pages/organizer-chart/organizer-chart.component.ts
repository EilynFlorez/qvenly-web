import { Component } from '@angular/core';
import { DashboardService } from '../../../../core/services/dashboard/dashboard.service';
import { Chart } from 'chart.js';
import { FilterService } from '../../../../core/services/dashboard/filter.service';
import { EventByOrganizer } from '../../../../core/models/dashboard/dashboard';

@Component({
  selector: 'app-organizer-chart',
  templateUrl: './organizer-chart.component.html',
  styleUrl: './organizer-chart.component.scss'
})
export class OrganizerChartComponent {

  topOrganizers: string[] = [];

  loading = true;
  error = false;
  topOrganizer = '';
  chart: Chart | null = null;

  constructor(private dashboardService: DashboardService, private filterService: FilterService){}

  ngOnInit(): void{

    this.filterService.filters$.subscribe(filters=>{
      this.loading = true;
    if (this.chart) { this.chart.destroy(); this.chart = null;
    }
    this.dashboardService.getEventsByOrganizer(
      filters.startDate,
      filters.endDate,
      filters.plan
    ).subscribe({
      next: (data) => {
        this.topOrganizers = data.topOrganizer.split(', ');
        this.loading = false;
        setTimeout(() => this.buildChart(data.organizers), 0);
      },

      error: (err) => {
        console.error(err);
        this.error = true;
        this.loading = false;
      }
    });
    });
  }

  buildChart(organizers: EventByOrganizer[]): void{
    const labels = organizers.map(o => o.organizerName);
    const values = organizers.map(o => o.numberEvents);

    const colors = organizers.map(o =>
    this.topOrganizers.includes(o.organizerName) ? '#F8B739' : '#00B8A9'
    );

    const hoverColors = organizers.map(o =>
    o.organizerName === this.topOrganizer
      ? 'rgba(230, 168, 32, 0.04)'
      : '#008A7D'
  );
    
    this.chart = new Chart('organizerChart', {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Eventos creados',
          data: values,
          backgroundColor: colors,
          borderRadius: 3,
         
          borderSkipped: false,
          barThickness: 48
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins:{
          legend: {
            display: false
          },
          tooltip:{
            callbacks:{
              label: (ctx) => ` ${ctx.parsed.y} eventos creados`
            }
          }
        },
        scales:{
          x:{
            grid: {
              display: false
            },

            ticks:{
              font: {
                size: 12
              },
              color: '#6B7280'
            }
          },

          y:{
            beginAtZero: true,
            grid:{
              color: 'rgba(0,0,0,0.04)'
            },
            ticks:{
              stepSize: 1,
              font: {
                size: 12
              },
              color: '#6B7280'
            }
          }
        }
      }
    })
  }
}
