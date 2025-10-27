
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from 'src/app/services/category.service';
import { MenuCategory, MenuItem, MenuService } from 'src/app/services/menu.service';

// Define MenuCategory interface if not already defined
// interface MenuCategory {
//   id: number;
//   name: string;
//   description?: string;
//   items?: MenuItem[];
// }

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
  itemName?: string;
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
  error: string = '';

  private categoryColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];

  constructor(
    private router: Router,
    private menuService: MenuService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = '';

    // Using observables instead of Promise.all for better error handling
    this.menuService.getAllMenuItems().subscribe({
      next: (items) => {
        this.categoryService.getCategories().subscribe({
          next: (categories) => {
            this.calculateStats(items, categories);
            this.generateCharts(items, categories);
            this.generateRecentActivities(items);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading categories:', error);
            this.error = 'Failed to load categories';
            this.isLoading = false;
            // Still calculate stats with available items
            this.calculateStats(items, []);
            this.generateCharts(items, []);
            this.generateRecentActivities(items);
          }
        });
      },
      error: (error) => {
        console.error('Error loading menu items:', error);
        this.error = 'Failed to load menu data';
        this.isLoading = false;
      }
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
      items.reduce((max, item) => Number(item.price) > Number(max.price) ? item : max, items[0]) : null;
    
    const leastExpensiveItem = items.length > 0 ? 
      items.reduce((min, item) => Number(item.price) < Number(min.price) ? item : min, items[0]) : null;

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
    this.generateCategoryData(items, categories);
    this.generatePriceRangeData(items);
  }

  generateCategoryData(items: MenuItem[], categories: MenuCategory[]): void {
    // Group items by category
    const categoryMap = new Map<string, number>();
    
    items.forEach(item => {
      if (item.category) {
        const categoryName = item.category.name;
        categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
      }
    });

    // Convert to chart data
    this.categoryData = Array.from(categoryMap.entries()).map(([name, count], index) => ({
      name: name,
      count: count,
      color: this.categoryColors[index % this.categoryColors.length]
    })).sort((a, b) => b.count - a.count);

    // If no categories with items, show message
    if (this.categoryData.length === 0) {
      this.categoryData = [{
        name: 'No categorized items',
        count: 0,
        color: this.categoryColors[0]
      }];
    }
  }

  generatePriceRangeData(items: MenuItem[]): void {
    const ranges = [
      { label: '৳0-100', min: 0, max: 100 },
      { label: '৳100-200', min: 100, max: 200 },
      { label: '৳200-300', min: 200, max: 300 },
      { label: '৳300-500', min: 300, max: 500 },
      { label: '৳500+', min: 500, max: Infinity }
    ];

    this.priceRangeData = ranges.map(range => ({
      label: range.label,
      count: items.filter(item => {
        const price = Number(item.price);
        return price >= range.min && price < range.max;
      }).length
    })).filter(range => range.count > 0); // Only show ranges with items
  }

  generateRecentActivities(items: MenuItem[]): void {
    // Generate activities based on actual data
    const activities: Activity[] = [];
    
    // Add some sample activities based on current data
    if (items.length > 0) {
      // Most expensive item as featured
      if (this.stats.mostExpensiveItem) {
        activities.push({
          type: 'created',
          title: `Added ${this.stats.mostExpensiveItem.name} to premium items`,
          category: this.stats.mostExpensiveItem.category?.name || 'Uncategorized',
          time: 'Recently',
          itemName: this.stats.mostExpensiveItem.name
        });
      }

      // New items (last 5 items as "recently added")
      const recentItems = items.slice(-3);
      recentItems.forEach(item => {
        activities.push({
          type: 'created',
          title: `Added new item: ${item.name}`,
          category: item.category?.name || 'Uncategorized',
          time: 'Today',
          itemName: item.name
        });
      });

      // Unavailable items
      const unavailableItems = items.filter(item => !item.available).slice(0, 2);
      unavailableItems.forEach(item => {
        activities.push({
          type: 'updated',
          title: `Marked ${item.name} as unavailable`,
          category: item.category?.name || 'Uncategorized',
          time: 'Recently',
          itemName: item.name
        });
      });
    }

    // If no activities from data, use sample data
    if (activities.length === 0) {
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
    } else {
      this.recentActivities = activities.slice(0, 6); // Limit to 6 activities
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'created': return 'bi-plus-circle';
      case 'updated': return 'bi-pencil-square';
      case 'deleted': return 'bi-trash';
      default: return 'bi-info-circle';
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'created': return 'success';
      case 'updated': return 'warning';
      case 'deleted': return 'danger';
      default: return 'info';
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

  navigateToAddItem(): void {
    this.router.navigate(['/admin/menu/new']);
  }

  exportMenuData(): void {
    this.menuService.getAllMenuItems().subscribe({
      next: (items) => {
        const data = {
          stats: this.stats,
          menuItems: items,
          exportDate: new Date().toISOString(),
          totalItems: items.length
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `restaurant-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        // Clean up
        URL.revokeObjectURL(link.href);
      },
      error: (error) => {
        console.error('Error exporting data:', error);
        alert('Failed to export menu data');
      }
    });
  }

  // Helper method to get category distribution percentage
  getCategoryPercentage(categoryCount: number): string {
    if (this.stats.totalItems === 0) return '0%';
    return ((categoryCount / this.stats.totalItems) * 100).toFixed(1) + '%';
  }

  // Helper method to get price range percentage
  getPriceRangePercentage(rangeCount: number): string {
    if (this.stats.totalItems === 0) return '0%';
    return ((rangeCount / this.stats.totalItems) * 100).toFixed(1) + '%';
  }

  // Quick stats calculations
  getAvailabilityPercentage(): string {
    if (this.stats.totalItems === 0) return '0%';
    return ((this.stats.availableItems / this.stats.totalItems) * 100).toFixed(1) + '%';
  }

  getCategoryCoveragePercentage(): string {
    if (this.stats.totalCategories === 0) return '0%';
    return ((this.stats.categoriesWithItems / this.stats.totalCategories) * 100).toFixed(1) + '%';
  }
}




// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { MenuItem } from 'src/app/models/menu.interface';
// import { CategoryService } from 'src/app/services/category.service';
// import { MenuCategory } from 'src/app/services/menu-category.service';
// import { MenuService } from 'src/app/services/menu.service';


// interface DashboardStats {
//   totalItems: number;
//   availableItems: number;
//   unavailableItems: number;
//   totalCategories: number;
//   categoriesWithItems: number;
//   averagePrice: number;
//   mostExpensiveItem: MenuItem | null;
//   leastExpensiveItem: MenuItem | null;
// }

// interface Activity {
//   type: 'created' | 'updated' | 'deleted';
//   title: string;
//   category: string;
//   time: string;
// }

// @Component({
//   selector: 'app-admin-dashboard',
//   templateUrl: './admin-dashboard.component.html',
//   styleUrls: ['./admin-dashboard.component.scss']
// })
// export class AdminDashboardComponent implements OnInit {
//   stats: DashboardStats = {
//     totalItems: 0,
//     availableItems: 0,
//     unavailableItems: 0,
//     totalCategories: 0,
//     categoriesWithItems: 0,
//     averagePrice: 0,
//     mostExpensiveItem: null,
//     leastExpensiveItem: null
//   };

//   categoryData: any[] = [];
//   priceRangeData: any[] = [];
//   recentActivities: Activity[] = [];
//   isLoading: boolean = true;

//   private categoryColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

//   constructor(
//     private router: Router,
//     private menuService: MenuService,
//     private categoryService: CategoryService
//   ) {}

//   ngOnInit(): void {
//     this.loadDashboardData();
//     this.generateRecentActivities();
//   }

//   loadDashboardData(): void {
//     this.isLoading = true;

//     Promise.all([
//       this.menuService.getAllMenuItems().toPromise(),
//       this.categoryService.getCategories().toPromise()
//     ]).then(([items, categories]) => {
//       const menuItems = items || [];
//       const menuCategories = categories || [];

//       this.calculateStats(menuItems, menuCategories);
//       this.generateCharts(menuItems, menuCategories);
//       this.isLoading = false;
//     }).catch(error => {
//       console.error('Error loading dashboard data:', error);
//       this.isLoading = false;
//     });
//   }

//   calculateStats(items: MenuItem[], categories: MenuCategory[]): void {
//     const totalItems = items.length;
//     const availableItems = items.filter(item => item.available).length;
//     const unavailableItems = totalItems - availableItems;
    
//     const totalPrice = items.reduce((sum, item) => sum + Number(item.price), 0);
//     const averagePrice = totalItems > 0 ? totalPrice / totalItems : 0;
    
//     const categoriesWithItems = categories.filter(cat => 
//       cat.items && cat.items.length > 0
//     ).length;

//     const mostExpensiveItem = items.length > 0 ? 
//       items.reduce((max, item) => Number(item.price) > Number(max.price) ? item : max) : null;
    
//     const leastExpensiveItem = items.length > 0 ? 
//       items.reduce((min, item) => Number(item.price) < Number(min.price) ? item : min) : null;

//     this.stats = {
//       totalItems,
//       availableItems,
//       unavailableItems,
//       totalCategories: categories.length,
//       categoriesWithItems,
//       averagePrice: Number(averagePrice.toFixed(2)),
//       mostExpensiveItem,
//       leastExpensiveItem
//     };
//   }

//   generateCharts(items: MenuItem[], categories: MenuCategory[]): void {
//     this.generateCategoryData(categories);
//     this.generatePriceRangeData(items);
//   }

//   generateCategoryData(categories: MenuCategory[]): void {
//     this.categoryData = categories
//       .filter(category => category.items && category.items.length > 0)
//       .map((category, index) => ({
//         name: category.name,
//         count: category.items!.length,
//         color: this.categoryColors[index % this.categoryColors.length]
//       }))
//       .sort((a, b) => b.count - a.count);
//   }

//   generatePriceRangeData(items: MenuItem[]): void {
//     const ranges = [
//       { label: '$0-10', min: 0, max: 10 },
//       { label: '$10-20', min: 10, max: 20 },
//       { label: '$20-30', min: 20, max: 30 },
//       { label: '$30-50', min: 30, max: 50 },
//       { label: '$50+', min: 50, max: Infinity }
//     ];

//     this.priceRangeData = ranges.map(range => ({
//       label: range.label,
//       count: items.filter(item => {
//         const price = Number(item.price);
//         return price >= range.min && price < range.max;
//       }).length
//     }));
//   }

//   generateRecentActivities(): void {
//     this.recentActivities = [
//       {
//         type: 'created',
//         title: 'Added Grilled Salmon to menu',
//         category: 'Main Course',
//         time: '2 hours ago'
//       },
//       {
//         type: 'updated',
//         title: 'Updated Caesar Salad price',
//         category: 'Appetizers',
//         time: '5 hours ago'
//       },
//       {
//         type: 'updated',
//         title: 'Marked Chocolate Cake as available',
//         category: 'Desserts',
//         time: '1 day ago'
//       },
//       {
//         type: 'created',
//         title: 'Created new Mango Smoothie',
//         category: 'Beverages',
//         time: '1 day ago'
//       }
//     ];
//   }

//   getActivityIcon(type: string): string {
//     switch (type) {
//       case 'created': return 'bi-plus-circle';
//       case 'updated': return 'bi-pencil-square';
//       case 'deleted': return 'bi-trash';
//       default: return 'bi-info-circle';
//     }
//   }

//   getActivityTypeClass(type: string): string {
//     return `activity-${type}`;
//   }

//   refreshDashboard(): void {
//     this.loadDashboardData();
//   }

//   navigateToMenu(): void {
//     this.router.navigate(['/admin/menu']);
//   }

//   navigateToCategories(): void {
//     this.router.navigate(['/admin/categories']);
//   }

//   navigateToOrders(): void {
//     this.router.navigate(['/admin/orders']);
//   }

//   exportMenuData(): void {
//     const data = {
//       stats: this.stats,
//       exportDate: new Date().toISOString()
//     };

//     const dataStr = JSON.stringify(data, null, 2);
//     const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(dataBlob);
//     link.download = `restaurant-data-${new Date().toISOString().split('T')[0]}.json`;
//     link.click();
//   }
// }