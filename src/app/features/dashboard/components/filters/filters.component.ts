import { Component, EventEmitter, Output } from '@angular/core';
import { DashboardFilters } from '../../../../core/core-dashboard/models/dashboard-filters';
import { FilterService } from '../../../../core/core-dashboard/services/filter.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../../../core/core-dashboard/services/toast.service';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss'
})
export class FiltersComponent {

   @Output() filtersChanged = new EventEmitter<DashboardFilters>();

   filterForm!: FormGroup;
   plans = ['Básico', 'Estándar', 'Premium'];

   constructor(private fb:FormBuilder, private filterService: FilterService,  private toastService: ToastService){}

   ngOnInit(): void{
    this.filterForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: [''],
      plan: ['']
    });
   }

   applyFilters(): void{
    console.log('Filtros aplicados:', this.filterForm.value);
    this.filterService.updateFilters(this.filterForm.value);

     // Muestra el toast
    this.toastService.show(
      'Los filtros aplicados también se reflejarán en los reportes de PDF y Excel.',
      
    );
   }

   clearFilters(): void{
      this.filterForm.reset({
        startDate: '',
        endDate: '',
        plan: ''
      });

      this.filterService.updateFilters(this.filterForm.value);
   }
}
