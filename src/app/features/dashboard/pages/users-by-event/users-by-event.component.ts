import { Component } from '@angular/core';
import { EventUserDetail } from '../../../../core/core-dashboard/models/dashboard';
import { DashboardService } from '../../../../core/core-dashboard/services/dashboard.service';

@Component({
  selector: 'app-users-by-event',
  templateUrl: './users-by-event.component.html',
  styleUrl: './users-by-event.component.scss'
})
export class UsersByEventComponent {

  
          loading = true;
          error = false;
          events: EventUserDetail[] = [];

          constructor(private dashboardService: DashboardService){}

          ngOnInit(): void{
            this.dashboardService.getUserByEvent().subscribe({
              next: (data) => {
                this.events = data;
                this.loading = false;
              },
              error: (err) =>{
                console.error(err);
                this.error = true;
                this.loading = false;
              }
            });
          }

          getTotal(event: EventUserDetail): number{
            return event.staff + event.assistants + event.judges + event.participants;
          }
}
