import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent {
  isMenuOpen = false;
  activeDropdown: string | null = null;
  mobileExpanded: string | null = null;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (!this.isMenuOpen) this.mobileExpanded = null;
  }

  toggleDropdown(name: string): void {
    this.activeDropdown = this.activeDropdown === name ? null : name;
  }

  closeDropdowns(): void {
    this.activeDropdown = null;
  }

  toggleMobileSection(name: string): void {
    this.mobileExpanded = this.mobileExpanded === name ? null : name;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!(event.target as HTMLElement).closest('.nav-dropdown')) {
      this.activeDropdown = null;
    }
  }
}
