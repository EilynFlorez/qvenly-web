import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DashboardFilters } from '../models/dashboard-filters';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

   private filtersSubject = new BehaviorSubject<DashboardFilters>({
    startDate: '',
    endDate: '',
    plan: ''
  });

  filters$ = this.filtersSubject.asObservable();

  updateFilters(filters: DashboardFilters): void{
    this.filtersSubject.next(filters);
  }
}
