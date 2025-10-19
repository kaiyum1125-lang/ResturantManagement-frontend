import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'src/app/services/menu-item.service';
import { MenuService } from 'src/app/services/menu.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  searchTerm: string = '';
  searchResults: MenuItem[] = [];
  showSearchResults: boolean = false;
  isLoggedIn: boolean = false;
  userName: string = 'John Doe';
  cartItemsCount: number = 3;

  constructor(
    private router: Router,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  checkAuthStatus(): void {
    // Implement your authentication check logic
    // For now, setting to false - update based on your auth service
    this.isLoggedIn = false;
  }

  onSearch(): void {
    if (this.searchTerm.length > 2) {
      this.menuService.getAllMenuItems().subscribe(items => {
        this.searchResults = items.filter(item =>
          item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          item.category?.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
        this.showSearchResults = true;
      });
    } else {
      this.showSearchResults = false;
      this.searchResults = [];
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.showSearchResults = false;
    this.searchResults = [];
  }

  navigateToMenuItem(item: MenuItem): void {
    this.router.navigate(['/menu'], { 
      fragment: `item-${item.id}`,
      queryParams: { highlight: item.id }
    });
    this.clearSearch();
  }

  logout(): void {
    // Implement logout logic
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }

  // Close search results when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-container') && !target.closest('.search-results-dropdown')) {
      this.showSearchResults = false;
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
      navbar?.classList.add('navbar-scrolled');
    } else {
      navbar?.classList.remove('navbar-scrolled');
    }
  }
}