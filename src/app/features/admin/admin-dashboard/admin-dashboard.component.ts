import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from 'src/app/services/category.service';
import { MenuCategory } from 'src/app/services/menu-category.service';
import { MenuItem } from 'src/app/services/menu-item.service';
import { MenuService } from 'src/app/services/menu.service';


interface DashboardStats {
  totalItems: number;
  availableItems: number;
  unavailableItems: number;
  totalCategories: number;
  categoriesWithItems: number;
  averagePrice: number;
  mostExpensiveItem: MenuItem | null;
  leastExpensiveItem: MenuItem | null;
}

interface Activity {
  type: 'created' | 'updated' | 'deleted';
  title: string;
  category: string;
  time: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalItems: 0,
    availableItems: 0,
    unavailableItems: 0,
    totalCategories: 0,
    categoriesWithItems: 0,
    averagePrice: 0,
    mostExpensiveItem: null,
    leastExpensiveItem: null
  };

  categoryData: any[] = [];
  priceRangeData: any[] = [];
  recentActivities: Activity[] = [];
  isLoading: boolean = true;

  private categoryColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

  constructor(
    private router: Router,
    private menuService: MenuService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.generateRecentActivities();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    Promise.all([
      this.menuService.getAllMenuItems().toPromise(),
      this.categoryService.getCategories().toPromise()
    ]).then(([items, categories]) => {
      const menuItems = items || [];
      const menuCategories = categories || [];

      this.calculateStats(menuItems, menuCategories);
      this.generateCharts(menuItems, menuCategories);
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading dashboard data:', error);
      this.isLoading = false;
    });
  }

  calculateStats(items: MenuItem[], categories: MenuCategory[]): void {
    const totalItems = items.length;
    const availableItems = items.filter(item => item.available).length;
    const unavailableItems = totalItems - availableItems;
    
    const totalPrice = items.reduce((sum, item) => sum + Number(item.price), 0);
    const averagePrice = totalItems > 0 ? totalPrice / totalItems : 0;
    
    const categoriesWithItems = categories.filter(cat => 
      cat.items && cat.items.length > 0
    ).length;

    const mostExpensiveItem = items.length > 0 ? 
      items.reduce((max, item) => Number(item.price) > Number(max.price) ? item : max) : null;
    
    const leastExpensiveItem = items.length > 0 ? 
      items.reduce((min, item) => Number(item.price) < Number(min.price) ? item : min) : null;

    this.stats = {
      totalItems,
      availableItems,
      unavailableItems,
      totalCategories: categories.length,
      categoriesWithItems,
      averagePrice: Number(averagePrice.toFixed(2)),
      mostExpensiveItem,
      leastExpensiveItem
    };
  }

  generateCharts(items: MenuItem[], categories: MenuCategory[]): void {
    this.generateCategoryData(categories);
    this.generatePriceRangeData(items);
  }

  generateCategoryData(categories: MenuCategory[]): void {
    this.categoryData = categories
      .filter(category => category.items && category.items.length > 0)
      .map((category, index) => ({
        name: category.name,
        count: category.items!.length,
        color: this.categoryColors[index % this.categoryColors.length]
      }))
      .sort((a, b) => b.count - a.count);
  }

  generatePriceRangeData(items: MenuItem[]): void {
    const ranges = [
      { label: '$0-10', min: 0, max: 10 },
      { label: '$10-20', min: 10, max: 20 },
      { label: '$20-30', min: 20, max: 30 },
      { label: '$30-50', min: 30, max: 50 },
      { label: '$50+', min: 50, max: Infinity }
    ];

    this.priceRangeData = ranges.map(range => ({
      label: range.label,
      count: items.filter(item => {
        const price = Number(item.price);
        return price >= range.min && price < range.max;
      }).length
    }));
  }

  generateRecentActivities(): void {
    this.recentActivities = [
      {
        type: 'created',
        title: 'Added Grilled Salmon to menu',
        category: 'Main Course',
        time: '2 hours ago'
      },
      {
        type: 'updated',
        title: 'Updated Caesar Salad price',
        category: 'Appetizers',
        time: '5 hours ago'
      },
      {
        type: 'updated',
        title: 'Marked Chocolate Cake as available',
        category: 'Desserts',
        time: '1 day ago'
      },
      {
        type: 'created',
        title: 'Created new Mango Smoothie',
        category: 'Beverages',
        time: '1 day ago'
      }
    ];
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'created': return 'bi-plus-circle';
      case 'updated': return 'bi-pencil-square';
      case 'deleted': return 'bi-trash';
      default: return 'bi-info-circle';
    }
  }

  getActivityTypeClass(type: string): string {
    return `activity-${type}`;
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }

  navigateToMenu(): void {
    this.router.navigate(['/admin/menu']);
  }

  navigateToCategories(): void {
    this.router.navigate(['/admin/categories']);
  }

  navigateToOrders(): void {
    this.router.navigate(['/admin/orders']);
  }

  exportMenuData(): void {
    const data = {
      stats: this.stats,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `restaurant-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }
}