
// menu.component.ts
import { Component, OnInit } from '@angular/core';
import { CartService, AddToCartRequest } from 'src/app/services/cart.service';
import { MenuService, MenuItem, MenuCategory } from 'src/app/services/menu.service';

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
  sortBy: string = 'name';
  addingToCart: { [itemId: number]: boolean } = {};
  error: string = '';

  constructor(
    private cartService: CartService,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    this.loadMenuData();
  }

  loadMenuData(): void {
    this.isLoading = true;
    this.error = '';

    // Load categories first
    this.menuService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        // Then load menu items
        this.loadMenuItems();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.error = 'Failed to load categories';
        this.isLoading = false;
        // Fallback to loading menu items directly
        this.loadMenuItems();
      }
    });
  }

  loadMenuItems(): void {
    this.menuService.getAllMenuItems().subscribe({
      next: (items) => {
        this.menuItems = this.enrichMenuItems(items);
        this.filteredItems = [...this.menuItems];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading menu items:', error);
        this.error = 'Failed to load menu items';
        this.isLoading = false;
        // Fallback to empty array
        this.menuItems = [];
        this.filteredItems = [];
      }
    });
  }

  // Enrich menu items with additional frontend properties
  private enrichMenuItems(items: MenuItem[]): MenuItem[] {
    return items.map(item => ({
      ...item,
      // Add frontend-specific properties
      isPopular: this.determineIfPopular(item),
      isSpicy: this.determineIfSpicy(item),
      cookingTime: this.generateCookingTime(item),
      // Ensure imageUrl has a fallback
      imageUrl: item.imageUrl || this.getDefaultImage(item.category?.name)
    }));
  }

  private determineIfPopular(item: MenuItem): boolean {
    // Logic to determine if item is popular
    // You can modify this based on your business logic
    const popularItems = [1, 3, 6, 11]; // Example popular item IDs
    return popularItems.includes(item.id);
  }

  private determineIfSpicy(item: MenuItem): boolean {
    // Logic to determine if item is spicy based on name or description
    const spicyKeywords = ['spicy', 'মসলাদার', 'ঝাল', 'তেঁতুল', 'সর্ষে'];
    const text = (item.name + ' ' + item.description).toLowerCase();
    return spicyKeywords.some(keyword => text.includes(keyword));
  }

  private generateCookingTime(item: MenuItem): number {
    // Generate cooking time based on category or other factors
    const baseTimes: { [key: string]: number } = {
      'starters': 10,
      'main': 25,
      'desserts': 15,
      'beverages': 5
    };
    
    const categoryName = item.category?.name?.toLowerCase() || '';
    if (categoryName.includes('শুরু') || categoryName.includes('starters')) return 10;
    if (categoryName.includes('মূল') || categoryName.includes('main')) return 25;
    if (categoryName.includes('মিষ্টি') || categoryName.includes('desserts')) return 15;
    if (categoryName.includes('পানীয়') || categoryName.includes('beverages')) return 5;
    
    return 15; // Default
  }

  private getDefaultImage(categoryName?: string): string {
    const defaultImages: { [key: string]: string } = {
      'starters': 'assets/images/default-starter.jpg',
      'main': 'assets/images/default-main.jpg',
      'desserts': 'assets/images/default-dessert.jpg',
      'beverages': 'assets/images/default-beverage.jpg'
    };
    
    const category = categoryName?.toLowerCase() || '';
    if (category.includes('শুরু') || category.includes('starters')) return defaultImages['starters'];
    if (category.includes('মূল') || category.includes('main')) return defaultImages['main'];
    if (category.includes('মিষ্টি') || category.includes('desserts')) return defaultImages['desserts'];
    if (category.includes('পানীয়') || category.includes('beverages')) return defaultImages['beverages'];
    
    return 'assets/images/default-food.jpg';
  }

  // Filter methods (keep the same as before)
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

    // Sort items
    filtered = this.sortItems(filtered);

    this.filteredItems = filtered;
  }

  sortItems(items: MenuItem[]): MenuItem[] {
    const sortedItems = [...items];
    switch (this.sortBy) {
      case 'price-low':
        return sortedItems.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sortedItems.sort((a, b) => b.price - a.price);
      case 'popular':
        return sortedItems.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
      case 'name':
      default:
        return sortedItems.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  onSortChange(sortType: string): void {
    this.sortBy = sortType;
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedCategory = null;
    this.searchTerm = '';
    this.sortBy = 'name';
    this.filteredItems = [...this.menuItems];
  }

  addToCart(item: MenuItem, event?: Event): void {
    if (!item.available) return;
    
    this.addingToCart[item.id] = true;

    const request: AddToCartRequest = {
      menuItemId: item.id,
      quantity: 1,
      specialInstructions: ''
    };

    this.cartService.addToCart(request).subscribe({
      next: (cart) => {
        this.addingToCart[item.id] = false;
        this.showAddToCartSuccess(event);
      },
      error: (error) => {
        this.addingToCart[item.id] = false;
        console.error('Error adding to cart:', error);
        this.showAddToCartError(event);
      }
    });
  }

  private showAddToCartSuccess(event?: Event): void {
    if (event) {
      const button = event.target as HTMLElement;
      const originalText = button.innerHTML;
      const originalClass = button.className;
      
      button.innerHTML = '<i class="bi bi-check2 me-1"></i>যোগ করা হয়েছে!';
      button.className = 'btn btn-success btn-sm';
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.className = originalClass;
      }, 1500);
    }
  }

  private showAddToCartError(event?: Event): void {
    if (event) {
      const button = event.target as HTMLElement;
      const originalText = button.innerHTML;
      const originalClass = button.className;
      
      button.innerHTML = '<i class="bi bi-x me-1"></i>ব্যর্থ হয়েছে!';
      button.className = 'btn btn-danger btn-sm';
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.className = originalClass;
      }, 1500);
    }
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/default-food.jpg';
  }

  getSpicyBadgeClass(item: MenuItem): string {
    return item.isSpicy ? 'bg-danger' : 'bg-secondary';
  }

  getCookingTimeText(item: MenuItem): string {
    return item.cookingTime ? `${item.cookingTime} মিনিট` : 'শীঘ্রই প্রস্তুত';
  }

  retryLoad(): void {
    this.loadMenuData();
  }

  // Add this method to your component class
scrollCategories(direction: number): void {
  const scrollContainer = document.querySelector('.category-scroll-wrapper');
  if (scrollContainer) {
    scrollContainer.scrollBy({
      left: direction,
      behavior: 'smooth'
    });
  }
}

// Optional: Auto-hide scroll buttons based on scroll position
ngAfterViewInit(): void {
  const scrollContainer = document.querySelector('.category-scroll-wrapper');
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', this.updateScrollButtons.bind(this));
  }
}

updateScrollButtons(): void {
  const scrollContainer = document.querySelector('.category-scroll-wrapper');
  if (scrollContainer) {
    const scrollLeft = scrollContainer.scrollLeft;
    const scrollWidth = scrollContainer.scrollWidth;
    const clientWidth = scrollContainer.clientWidth;
    
    // You can use these values to enable/disable scroll buttons
    // const canScrollLeft = scrollLeft > 0;
    // const canScrollRight = scrollLeft < scrollWidth - clientWidth;
  }
}
}













// import { Component, OnInit } from '@angular/core';
// import { CartService, AddToCartRequest } from 'src/app/services/cart.service';

// // Simple interfaces
// interface MenuCategory {
//   id: number;
//   name: string;
//   icon?: string;
// }

// interface MenuItem {
//   id: number;
//   name: string;
//   description: string;
//   price: number;
//   imageUrl?: string;
//   available: boolean;
//   category?: MenuCategory;
//   isPopular?: boolean;
//   isSpicy?: boolean;
//   cookingTime?: number;
// }

// @Component({
//   selector: 'app-menu',
//   templateUrl: './menu.component.html',
//   styleUrls: ['./menu.component.scss']
// })
// export class MenuComponent implements OnInit {
//   menuItems: MenuItem[] = [];
//   filteredItems: MenuItem[] = [];
//   categories: MenuCategory[] = [];
//   selectedCategory: MenuCategory | null = null;
//   searchTerm: string = '';
//   isLoading: boolean = false;
//   sortBy: string = 'name';
//   addingToCart: { [itemId: number]: boolean } = {};

//   constructor(private cartService: CartService) {}

//   ngOnInit(): void {
//     this.loadMenuData();
//   }

//   loadMenuData(): void {
//     this.isLoading = true;
    
//     // Simulate API call
//     setTimeout(() => {
//       // Mock categories for Bangladeshi restaurant
//       this.categories = [
//         { id: 1, name: 'শুরু করুন (Starters)', icon: '🥟' },
//         { id: 2, name: 'মূল খাবার (Main Course)', icon: '🍛' },
//         { id: 3, name: 'মিষ্টান্ন (Desserts)', icon: '🍮' },
//         { id: 4, name: 'পানীয় (Beverages)', icon: '🥤' },
//         { id: 5, name: 'ভাত ও রুটি (Rice & Bread)', icon: '🍚' },
//         { id: 6, name: 'স্পেশালিটি (Specialty)', icon: '🌟' }
//       ];

//       // Authentic Bangladeshi menu items with proper images
//       this.menuItems = [
//         {
//           id: 1,
//           name: 'বিরিয়ানি (Biryani)',
//           description: 'সুগন্ধি বাসমতি চালে রান্না বিশেষ মসলায় তৈরী মুরগির বিরিয়ানি',
//           price: 320,
//           imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[5],
//           isPopular: true,
//           isSpicy: true,
//           cookingTime: 25
//         },
//         {
//           id: 2,
//           name: 'ভুনা খিচুড়ি (Bhuna Khichuri)',
//           description: 'বৃষ্টির দিনের জন্য স্পেশাল ভুনা খিচুড়ি সাথে বেগুন ভর্তা ও ডাল',
//           price: 180,
//           imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[4],
//           isPopular: true,
//           isSpicy: false,
//           cookingTime: 30
//         },
//         {
//           id: 3,
//           name: 'হিলসা ফ্রাই (Hilsa Fry)',
//           description: 'তাজা ইলিশ মাছ সর্ষে বাটা ও মসলা দিয়ে কড়া ভাজা',
//           price: 450,
//           imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[1],
//           isPopular: true,
//           isSpicy: true,
//           cookingTime: 20
//         },
//         {
//           id: 4,
//           name: 'চিকেন কারি (Chicken Curry)',
//           description: 'বাংলাদেশী স্টাইলে রান্না মুরগির কারি সাথে পিয়াজ ও মসলা',
//           price: 220,
//           imageUrl: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[1],
//           isSpicy: true,
//           cookingTime: 35
//         },
//         {
//           id: 5,
//           name: 'সমুচা (Samosa)',
//           description: 'ক্রিস্পি সমুচা ভর্তি মসলাদার আলু ও মটরশুটি',
//           price: 80,
//           imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[0],
//           cookingTime: 15
//         },
//         {
//           id: 6,
//           name: 'রসমালাই (Rasmalai)',
//           description: 'নরম রসমালাই ভাসানো মিষ্টি দুধে',
//           price: 120,
//           imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[2],
//           isPopular: true,
//           cookingTime: 10
//         },
//         {
//           id: 7,
//           name: 'লাচ্ছি (Lassi)',
//           description: 'সতেজ দই ও গোলাপী সিরাপ দিয়ে তৈরি মিষ্টি লাচ্ছি',
//           price: 90,
//           imageUrl: 'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[3],
//           cookingTime: 5
//         },
//         {
//           id: 8,
//           name: 'বেগুনী (Beguni)',
//           description: 'চিকন করে কাটা বেগুন বেসনে ডুবিয়ে ভাজা',
//           price: 60,
//           imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[0],
//           cookingTime: 10
//         },
//         {
//           id: 9,
//           name: 'পান্তা ভাত (Panta Bhat)',
//           description: 'ঐতিহ্যবাহী পান্তা ভাত সাথে শুঁটকি ভর্তা ও পেঁয়াজ',
//           price: 100,
//           imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[4],
//           isPopular: true,
//           cookingTime: 12
//         },
//         {
//           id: 10,
//           name: 'চমচম (Chomchom)',
//           description: 'বাংলাদেশের বিখ্যাত মিষ্টি চমচম ড্রেন করা সিরাপে',
//           price: 110,
//           imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[2],
//           cookingTime: 8
//         },
//         {
//           id: 11,
//           name: 'ফুচকা (Fuchka)',
//           description: 'স্পাইসি তেঁতুলের পানি ও আলু ভর্তি ক্রিস্পি ফুচকা',
//           price: 70,
//           imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[0],
//           isPopular: true,
//           isSpicy: true,
//           cookingTime: 8
//         },
//         {
//           id: 12,
//           name: 'লাচ্ছা সেমাই (Lachcha Semai)',
//           description: 'সুগন্ধি লাচ্ছা সেমাই সাথে বাদাম ও কিসমিস',
//           price: 95,
//           imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: false,
//           category: this.categories[2],
//           cookingTime: 12
//         },
//         {
//           id: 13,
//           name: 'বোটা কাবাব (Botta Kebab)',
//           description: 'মসলাদার গ্রাউন্ড মিট দিয়ে তৈরি নরম কাবাব',
//           price: 150,
//           imageUrl: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[1],
//           isSpicy: true,
//           cookingTime: 18
//         },
//         {
//           id: 14,
//           name: 'চা (Cha)',
//           description: 'বাংলাদেশী স্টাইলে রান্না মিষ্টি দুধ চা',
//           price: 40,
//           imageUrl: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[3],
//           cookingTime: 5
//         },
//         {
//           id: 15,
//           name: 'নান রুটি (Naan Roti)',
//           description: 'তন্দুরে বেক করা মাখন নান রুটি',
//           price: 50,
//           imageUrl: 'https://images.unsplash.com/photo-1598866594230-a7c12756260f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[4],
//           cookingTime: 7
//         }
//       ];

//       this.filteredItems = [...this.menuItems];
//       this.isLoading = false;
//     }, 1500);
//   }

//   filterByCategory(category: MenuCategory | null): void {
//     this.selectedCategory = category;
//     this.applyFilters();
//   }

//   applyFilters(): void {
//     let filtered = [...this.menuItems];

//     // Category filter
//     if (this.selectedCategory) {
//       filtered = filtered.filter(item => 
//         item.category?.id === this.selectedCategory?.id
//       );
//     }

//     // Search filter
//     if (this.searchTerm) {
//       const term = this.searchTerm.toLowerCase();
//       filtered = filtered.filter(item =>
//         item.name.toLowerCase().includes(term) ||
//         item.description.toLowerCase().includes(term) ||
//         item.category?.name.toLowerCase().includes(term)
//       );
//     }

//     // Sort items
//     filtered = this.sortItems(filtered);

//     this.filteredItems = filtered;
//   }

//   sortItems(items: MenuItem[]): MenuItem[] {
//     const sortedItems = [...items];
//     switch (this.sortBy) {
//       case 'price-low':
//         return sortedItems.sort((a, b) => a.price - b.price);
//       case 'price-high':
//         return sortedItems.sort((a, b) => b.price - a.price);
//       case 'popular':
//         return sortedItems.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
//       case 'name':
//       default:
//         return sortedItems.sort((a, b) => a.name.localeCompare(b.name));
//     }
//   }

//   onSortChange(sortType: string): void {
//     this.sortBy = sortType;
//     this.applyFilters();
//   }

//   clearSearch(): void {
//     this.searchTerm = '';
//     this.applyFilters();
//   }

//   clearFilters(): void {
//     this.selectedCategory = null;
//     this.searchTerm = '';
//     this.sortBy = 'name';
//     this.filteredItems = [...this.menuItems];
//   }

//   addToCart(item: MenuItem, event?: Event): void {
//     if (!item.available) return;
    
//     this.addingToCart[item.id] = true;

//     const request: AddToCartRequest = {
//       menuItemId: item.id,
//       quantity: 1,
//       specialInstructions: ''
//     };

//     this.cartService.addToCart(request).subscribe({
//       next: (cart) => {
//         this.addingToCart[item.id] = false;
//         this.showAddToCartSuccess(event);
//       },
//       error: (error) => {
//         this.addingToCart[item.id] = false;
//         console.error('Error adding to cart:', error);
//         this.showAddToCartError(event);
//       }
//     });
//   }

//   private showAddToCartSuccess(event?: Event): void {
//     if (event) {
//       const button = event.target as HTMLElement;
//       const originalText = button.innerHTML;
//       const originalClass = button.className;
      
//       button.innerHTML = '<i class="bi bi-check2 me-1"></i>যোগ করা হয়েছে!';
//       button.className = 'btn btn-success btn-sm';
      
//       setTimeout(() => {
//         button.innerHTML = originalText;
//         button.className = originalClass;
//       }, 1500);
//     }
//   }

//   private showAddToCartError(event?: Event): void {
//     if (event) {
//       const button = event.target as HTMLElement;
//       const originalText = button.innerHTML;
//       const originalClass = button.className;
      
//       button.innerHTML = '<i class="bi bi-x me-1"></i>ব্যর্থ হয়েছে!';
//       button.className = 'btn btn-danger btn-sm';
      
//       setTimeout(() => {
//         button.innerHTML = originalText;
//         button.className = originalClass;
//       }, 1500);
//     }
//   }

//   handleImageError(event: Event): void {
//     const imgElement = event.target as HTMLImageElement;
//     imgElement.src = 'assets/images/default-bangladeshi-food.jpg';
//   }

//   // Helper method to get badge class for spicy items
//   getSpicyBadgeClass(item: MenuItem): string {
//     return item.isSpicy ? 'bg-danger' : 'bg-secondary';
//   }

//   // Helper method to get cooking time text
//   getCookingTimeText(item: MenuItem): string {
//     return item.cookingTime ? `${item.cookingTime} মিনিট` : 'শীঘ্রই প্রস্তুত';
//   }
// }




// import { Component, OnInit } from '@angular/core';
// import { CartService } from 'src/app/services/cart.service';

// // Simple interfaces
// interface MenuCategory {
//   id: number;
//   name: string;
//   icon?: string;
// }

// interface MenuItem {
//   id: number;
//   name: string;
//   description: string;
//   price: number;
//   imageUrl?: string;
//   available: boolean;
//   category?: MenuCategory;
//   isPopular?: boolean;
//   isSpicy?: boolean;
//   cookingTime?: number;
// }

// @Component({
//   selector: 'app-menu',
//   templateUrl: './menu.component.html',
//   styleUrls: ['./menu.component.scss']
// })
// export class MenuComponent implements OnInit {
//   menuItems: MenuItem[] = [];
//   filteredItems: MenuItem[] = [];
//   categories: MenuCategory[] = [];
//   selectedCategory: MenuCategory | null = null;
//   searchTerm: string = '';
//   isLoading: boolean = false;
//   sortBy: string = 'name';

//   constructor(private cartService: CartService) {}

//   ngOnInit(): void {
//     this.loadMenuData();
//   }

//   loadMenuData(): void {
//     this.isLoading = true;
    
//     // Simulate API call
//     setTimeout(() => {
//       // Mock categories for Bangladeshi restaurant
//       this.categories = [
//         { id: 1, name: 'শুরু করুন (Starters)', icon: '🥟' },
//         { id: 2, name: 'মূল খাবার (Main Course)', icon: '🍛' },
//         { id: 3, name: 'মিষ্টান্ন (Desserts)', icon: '🍮' },
//         { id: 4, name: 'পানীয় (Beverages)', icon: '🥤' },
//         { id: 5, name: 'ভাত ও রুটি (Rice & Bread)', icon: '🍚' },
//         { id: 6, name: 'স্পেশালিটি (Specialty)', icon: '🌟' }
//       ];

//       // Authentic Bangladeshi menu items with proper images
//       this.menuItems = [
//         {
//           id: 1,
//           name: 'বিরিয়ানি (Biryani)',
//           description: 'সুগন্ধি বাসমতি চালে রান্না বিশেষ মসলায় তৈরী মুরগির বিরিয়ানি',
//           price: 320,
//           imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[5],
//           isPopular: true,
//           isSpicy: true,
//           cookingTime: 25
//         },
//         {
//           id: 2,
//           name: 'ভুনা খিচুড়ি (Bhuna Khichuri)',
//           description: 'বৃষ্টির দিনের জন্য স্পেশাল ভুনা খিচুড়ি সাথে বেগুন ভর্তা ও ডাল',
//           price: 180,
//           imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[4],
//           isPopular: true,
//           isSpicy: false,
//           cookingTime: 30
//         },
//         {
//           id: 3,
//           name: 'হিলসা ফ্রাই (Hilsa Fry)',
//           description: 'তাজা ইলিশ মাছ সর্ষে বাটা ও মসলা দিয়ে কড়া ভাজা',
//           price: 450,
//           imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[1],
//           isPopular: true,
//           isSpicy: true,
//           cookingTime: 20
//         },
//         {
//           id: 4,
//           name: 'চিকেন কারি (Chicken Curry)',
//           description: 'বাংলাদেশী স্টাইলে রান্না মুরগির কারি সাথে পিয়াজ ও মসলা',
//           price: 220,
//           imageUrl: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[1],
//           isSpicy: true,
//           cookingTime: 35
//         },
//         {
//           id: 5,
//           name: 'সমুচা (Samosa)',
//           description: 'ক্রিস্পি সমুচা ভর্তি মসলাদার আলু ও মটরশুটি',
//           price: 80,
//           imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[0],
//           cookingTime: 15
//         },
//         {
//           id: 6,
//           name: 'রসমালাই (Rasmalai)',
//           description: 'নরম রসমালাই ভাসানো মিষ্টি দুধে',
//           price: 120,
//           imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[2],
//           isPopular: true,
//           cookingTime: 10
//         },
//         {
//           id: 7,
//           name: 'লাচ্ছি (Lassi)',
//           description: 'সতেজ দই ও গোলাপী সিরাপ দিয়ে তৈরি মিষ্টি লাচ্ছি',
//           price: 90,
//           imageUrl: 'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[3],
//           cookingTime: 5
//         },
//         {
//           id: 8,
//           name: 'বেগুনী (Beguni)',
//           description: 'চিকন করে কাটা বেগুন বেসনে ডুবিয়ে ভাজা',
//           price: 60,
//           imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[0],
//           cookingTime: 10
//         },
//       {
//     id: 9,
//     name: 'পান্তা ভাত (Panta Bhat)',
//     description: 'ঐতিহ্যবাহী পান্তা ভাত সাথে শুঁটকি ভর্তা ও পেঁয়াজ',
//     price: 100,
//     imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//     available: true,
//     category: this.categories[4],
//     isPopular: true,
//     cookingTime: 12
//   },
//         {
//           id: 10,
//           name: 'চমচম (Chomchom)',
//           description: 'বাংলাদেশের বিখ্যাত মিষ্টি চমচম ড্রেন করা সিরাপে',
//           price: 110,
//           imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[2],
//           cookingTime: 8
//         },
//         {
//           id: 11,
//           name: 'ফুচকা (Fuchka)',
//           description: 'স্পাইসি তেঁতুলের পানি ও আলু ভর্তি ক্রিস্পি ফুচকা',
//           price: 70,
//           imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[0],
//           isPopular: true,
//           isSpicy: true,
//           cookingTime: 8
//         },
//         {
//           id: 12,
//           name: 'লাচ্ছা সেমাই (Lachcha Semai)',
//           description: 'সুগন্ধি লাচ্ছা সেমাই সাথে বাদাম ও কিসমিস',
//           price: 95,
//           imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: false,
//           category: this.categories[2],
//           cookingTime: 12
//         },
//         {
//           id: 13,
//           name: 'বোটা কাবাব (Botta Kebab)',
//           description: 'মসলাদার গ্রাউন্ড মিট দিয়ে তৈরি নরম কাবাব',
//           price: 150,
//           imageUrl: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[1],
//           isSpicy: true,
//           cookingTime: 18
//         },
//         {
//           id: 14,
//           name: 'চা (Cha)',
//           description: 'বাংলাদেশী স্টাইলে রান্না মিষ্টি দুধ চা',
//           price: 40,
//           imageUrl: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//           available: true,
//           category: this.categories[3],
//           cookingTime: 5
//         },
// {
//   id: 15,
//   name: 'নান রুটি (Naan Roti)',
//   description: 'তন্দুরে বেক করা মাখন নান রুটি',
//   price: 50,
//   imageUrl: 'https://images.unsplash.com/photo-1598866594230-a7c12756260f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
//   available: true,
//   category: this.categories[4],
//   cookingTime: 7
// }
// ];

//       this.filteredItems = [...this.menuItems];
//       this.isLoading = false;
//     }, 1500);
//   }

//   filterByCategory(category: MenuCategory | null): void {
//     this.selectedCategory = category;
//     this.applyFilters();
//   }

//   applyFilters(): void {
//     let filtered = [...this.menuItems];

//     // Category filter
//     if (this.selectedCategory) {
//       filtered = filtered.filter(item => 
//         item.category?.id === this.selectedCategory?.id
//       );
//     }

//     // Search filter
//     if (this.searchTerm) {
//       const term = this.searchTerm.toLowerCase();
//       filtered = filtered.filter(item =>
//         item.name.toLowerCase().includes(term) ||
//         item.description.toLowerCase().includes(term) ||
//         item.category?.name.toLowerCase().includes(term)
//       );
//     }

//     // Sort items
//     filtered = this.sortItems(filtered);

//     this.filteredItems = filtered;
//   }

//   sortItems(items: MenuItem[]): MenuItem[] {
//     const sortedItems = [...items];
//     switch (this.sortBy) {
//       case 'price-low':
//         return sortedItems.sort((a, b) => a.price - b.price);
//       case 'price-high':
//         return sortedItems.sort((a, b) => b.price - a.price);
//       case 'popular':
//         return sortedItems.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
//       case 'name':
//       default:
//         return sortedItems.sort((a, b) => a.name.localeCompare(b.name));
//     }
//   }

//   onSortChange(sortType: string): void {
//     this.sortBy = sortType;
//     this.applyFilters();
//   }

//   clearSearch(): void {
//     this.searchTerm = '';
//     this.applyFilters();
//   }

//   clearFilters(): void {
//     this.selectedCategory = null;
//     this.searchTerm = '';
//     this.sortBy = 'name';
//     this.filteredItems = [...this.menuItems];
//   }

//   addToCart(item: MenuItem, event?: Event): void {
//     if (!item.available) return;
    
//     // Fixed: Call without parameters to match your service
//     this.cartService.addToCart();
    
//     // Simple feedback with null check for event
//     if (event) {
//       const button = event.target as HTMLElement;
//       if (button) {
//         const originalText = button.innerHTML;
//         button.innerHTML = '<i class="bi bi-check2 me-1"></i>যোগ করা হয়েছে!';
//         button.classList.add('btn-success');
//         button.classList.remove('btn-warning');
        
//         setTimeout(() => {
//           button.innerHTML = originalText;
//           button.classList.remove('btn-success');
//           button.classList.add('btn-warning');
//         }, 1500);
//       }
//     }
//   }

//   handleImageError(event: Event): void {
//     const imgElement = event.target as HTMLImageElement;
//     imgElement.src = 'assets/images/default-bangladeshi-food.jpg';
//   }

//   // Helper method to get badge class for spicy items
//   getSpicyBadgeClass(item: MenuItem): string {
//     return item.isSpicy ? 'bg-danger' : 'bg-secondary';
//   }

//   // Helper method to get cooking time text
//   getCookingTimeText(item: MenuItem): string {
//     return item.cookingTime ? `${item.cookingTime} মিনিট` : 'শীঘ্রই প্রস্তুত';
//   }
// }