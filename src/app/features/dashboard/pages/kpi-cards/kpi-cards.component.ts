import { Component } from '@angular/core';
import { DashboardService } from '../../../../core/services/dashboard/dashboard.service';
import { GeneralStats } from '../../../../core/models/dashboard/dashboard';

@Component({
  selector: 'app-kpi-cards',
  templateUrl: './kpi-cards.component.html',
  styleUrl: './kpi-cards.component.scss'
})
export class KpiCardsComponent {

   stats: GeneralStats | null = null;
      loading = true;
      error = false;

      constructor(private dashboardService: DashboardService){}

      ngOnInit(): void{
        this.dashboardService.getGeneralStats().subscribe({
          next: (data) =>{
            this.stats = data;
            this.loading = false;
          },

          error: (err) => {
            console.error(err);
            this.error = true;
            this.loading = false;
          }
        })
      } 
}
