import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';

// Simple interfaces
interface MenuCategory {
  id: number;
  name: string;
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  available: boolean;
  category?: MenuCategory;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  menuItems: MenuItem[] = [];
  filteredItems: MenuItem[] = [];
  categories: MenuCategory[] = [];
  selectedCategory: MenuCategory | null = null;
  searchTerm: string = '';
  isLoading: boolean = false;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadMenuData();
  }

  loadMenuData(): void {
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      // Mock categories
      this.categories = [
        { id: 1, name: 'Appetizers' },
        { id: 2, name: 'Main Course' },
        { id: 3, name: 'Desserts' },
        { id: 4, name: 'Beverages' },
        { id: 5, name: 'Salads' }
      ];

      // Mock menu items
      this.menuItems = [
        {
          id: 1,
          name: 'Grilled Chicken',
          description: 'Juicy grilled chicken breast with herbs and roasted vegetables.',
          price: 16.99,
          imageUrl: 'https://images.unsplash.com/photo-1532550907401-c5c1c99d5a7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
          available: true,
          category: this.categories[1]
        },
        {
          id: 2,
          name: 'Caesar Salad',
          description: 'Fresh romaine lettuce with parmesan and croutons.',
          price: 12.99,
          imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
          available: true,
          category: this.categories[4]
        },
        {
          id: 3,
          name: 'Chocolate Cake',
          description: 'Rich chocolate cake with vanilla ice cream.',
          price: 8.99,
          imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
          available: true,
          category: this.categories[2]
        },
        {
          id: 4,
          name: 'Mango Smoothie',
          description: 'Refreshing blend of mango, yogurt and honey.',
          price: 6.99,
          imageUrl: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
          available: false,
          category: this.categories[3]
        },
        {
          id: 5,
          name: 'Garlic Bread',
          description: 'Toasted bread with garlic butter and herbs.',
          price: 5.99,
          imageUrl: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
          available: true,
          category: this.categories[0]
        },
        {
          id: 6,
          name: 'Special Pasta',
          description: 'Chef special pasta with seasonal ingredients.',
          price: 14.99,
          imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
          available: true,
          category: this.categories[1]
        }
      ];

      this.filteredItems = [...this.menuItems];
      this.isLoading = false;
    }, 1000);
  }

  filterByCategory(category: MenuCategory | null): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.menuItems];

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(item => 
        item.category?.id === this.selectedCategory?.id
      );
    }

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.category?.name.toLowerCase().includes(term)
      );
    }

    this.filteredItems = filtered;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedCategory = null;
    this.searchTerm = '';
    this.filteredItems = [...this.menuItems];
  }

  addToCart(item: MenuItem): void {
    if (!item.available) return;
    
    this.cartService.addToCart();
    
    // Simple feedback
    const button = event?.target as HTMLElement;
    if (button) {
      const originalText = button.innerHTML;
      button.innerHTML = '<i class="bi bi-check2 me-1"></i>Added!';
      button.classList.add('btn-success');
      button.classList.remove('btn-warning');
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.classList.remove('btn-success');
        button.classList.add('btn-warning');
      }, 1500);
    }
  }

  handleImageError(event: any): void {
    event.target.src = 'assets/default-food.jpg';
  }
}