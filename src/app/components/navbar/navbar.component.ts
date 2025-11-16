
import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { CartService, CartResponse } from 'src/app/services/cart.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  searchTerm: string = '';
  searchResults: any[] = [];
  showSearchResults: boolean = false;
  isLoggedIn: boolean = false;
  userName: string = '';
  userRole: string = '';
  cartItemsCount: number = 0;
  
  // Login/Signup modal properties
  showAuthModal: boolean = false;
  isLoginMode: boolean = true;
  authFormData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  authError: string = '';
  isLoading: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
    this.setupAuthSubscription();
    this.setupCartSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupAuthSubscription(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isLoggedIn = !!user;
        this.userName = user?.name || '';
        this.userRole = user?.role || '';
      });
  }

  private setupCartSubscription(): void {
    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cart => {
        this.cartItemsCount = cart?.totalItems || 0;
      });
  }

  checkAuthStatus(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.name;
      this.userRole = user.role;
    }
    
    // Get initial cart count
    const currentCart = this.cartService.getCurrentCart();
    this.cartItemsCount = currentCart?.totalItems || 0;
  }

  // Search functionality
  onSearch(): void {
    if (this.searchTerm.length > 2) {
      this.searchResults = this.getMockSearchResults();
      this.showSearchResults = true;
    } else {
      this.showSearchResults = false;
      this.searchResults = [];
    }
  }

  private getMockSearchResults(): any[] {
    // Mock data - replace with actual API call
    const mockItems = [
      { 
        id: 1, 
        name: 'Grilled Chicken', 
        description: 'Freshly grilled chicken with herbs', 
        price: 16.99, 
        available: true, 
        imageUrl: 'assets/chicken.jpg', 
        category: 'Main Course' 
      },
      { 
        id: 2, 
        name: 'Caesar Salad', 
        description: 'Classic caesar with croutons', 
        price: 12.99, 
        available: true, 
        imageUrl: 'assets/salad.jpg', 
        category: 'Salads' 
      },
      { 
        id: 3, 
        name: 'Chocolate Cake', 
        description: 'Rich chocolate dessert', 
        price: 8.99, 
        available: false, 
        imageUrl: 'assets/cake.jpg', 
        category: 'Desserts' 
      }
    ];
    
    return mockItems.filter(item => 
      item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.showSearchResults = false;
    this.searchResults = [];
  }

  navigateToMenuItem(item: any): void {
    this.router.navigate(['/menu'], { 
      fragment: `item-${item.id}`,
      queryParams: { highlight: item.id }
    });
    this.clearSearch();
  }

  // Auth Modal Methods
  openAuthModal(isLogin: boolean = true): void {
    this.isLoginMode = isLogin;
    this.showAuthModal = true;
    this.authError = '';
    this.resetAuthForm();
  }

  closeAuthModal(): void {
    this.showAuthModal = false;
    this.authError = '';
    this.resetAuthForm();
  }

  switchAuthMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.authError = '';
    this.resetAuthForm();
  }

  private resetAuthForm(): void {
    this.authFormData = {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
  }

  // Authentication Methods
  async onSubmitAuth(): Promise<void> {
    this.authError = '';
    this.isLoading = true;

    try {
      if (this.isLoginMode) {
        await this.handleLogin();
      } else {
        await this.handleRegister();
      }
    } catch (error: any) {
      this.authError = error.message || 'An error occurred. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  private async handleLogin(): Promise<void> {
    const { email, password } = this.authFormData;
    
    if (!email || !password) {
      this.authError = 'Please fill in all fields';
      return;
    }

    const success = await this.authService.login(email, password);
    if (success) {
      this.closeAuthModal();
      // Optional: Navigate to a specific page after login
      // this.router.navigate(['/profile']);
    } else {
      this.authError = 'Invalid email or password';
    }
  }

  private async handleRegister(): Promise<void> {
    const { name, email, password, confirmPassword } = this.authFormData;
    
    if (!name || !email || !password || !confirmPassword) {
      this.authError = 'Please fill in all fields';
      return;
    }

    if (password !== confirmPassword) {
      this.authError = 'Passwords do not match';
      return;
    }

    if (password.length < 6) {
      this.authError = 'Password must be at least 6 characters long';
      return;
    }

    const success = await this.authService.register({ name, email, password });
    if (success) {
      this.closeAuthModal();
    } else {
      this.authError = 'Registration failed. Please try again.';
    }
  }

  logout(): void {
    this.authService.logout();
    // Optionally clear cart on logout
    this.cartService.clearCart().subscribe();
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  navigateToOrders(): void {
    this.router.navigate(['/orders']);
  }

  navigateToCart(): void {
    this.router.navigate(['/cart']);
  }

  navigateToAdmin(): void {
    if (this.userRole === 'admin') {
      this.router.navigate(['admin']);
    } else {
      this.authError = 'Access denied. Admin privileges required.';
    }
  }

  // Host Listeners
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    if (!target.closest('.search-container') && !target.closest('.search-results-dropdown')) {
      this.showSearchResults = false;
    }
    
    if (this.showAuthModal && target.classList.contains('auth-modal-backdrop')) {
      this.closeAuthModal();
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

@HostListener('document:keydown.escape', ['$event'])
onEscapePressed(event: KeyboardEvent): void{
    if (this.showAuthModal) {
      this.closeAuthModal();
    }
    if (this.showSearchResults) {
      this.clearSearch();
    }
  }
}



// import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
// import { Router } from '@angular/router'; // Add this import
// import { Subject } from 'rxjs';
// import { takeUntil } from 'rxjs/operators';
// import { AuthService } from 'src/app/services/auth.service'; // Add this import
// import { CartService } from 'src/app/services/cart.service'; // Add this import

// @Component({
//   selector: 'app-navbar',
//   templateUrl: './navbar.component.html',
//   styleUrls: ['./navbar.component.scss']
// })
// export class NavbarComponent implements OnInit, OnDestroy {
//   searchTerm: string = '';
//   searchResults: any[] = [];
//   showSearchResults: boolean = false;
//   isLoggedIn: boolean = false;
//   userName: string = '';
//   userRole: string = '';
//   cartItemsCount: number = 0;
  
//   // Login/Signup modal properties
//   showAuthModal: boolean = false;
//   isLoginMode: boolean = true;
//   authFormData = {
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: ''
//   };
//   authError: string = '';
//   isLoading: boolean = false;

//   private destroy$ = new Subject<void>();

//   constructor(
//     private router: Router, // Now properly injected
//     private authService: AuthService, // Now properly injected
//     private cartService: CartService // Now properly injected
//   ) {}

//   ngOnInit(): void {
//     this.checkAuthStatus();
//     this.setupAuthSubscription();
//     this.setupCartSubscription();
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   private setupAuthSubscription(): void {
//     this.authService.currentUser$
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(user => {
//         this.isLoggedIn = !!user;
//         this.userName = user?.name || '';
//         this.userRole = user?.role || '';
//       });
//   }

//   private setupCartSubscription(): void {
//     this.cartService.cartItemsCount$
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(count => {
//         this.cartItemsCount = count;
//       });
//   }

//   checkAuthStatus(): void {
//     this.isLoggedIn = this.authService.isAuthenticated();
//     const user = this.authService.getCurrentUser();
//     if (user) {
//       this.userName = user.name;
//       this.userRole = user.role;
//     }
//     this.cartItemsCount = this.cartService.getCartItemsCount();
//   }

//   // Search functionality
//   onSearch(): void {
//     if (this.searchTerm.length > 2) {
//       this.searchResults = this.getMockSearchResults();
//       this.showSearchResults = true;
//     } else {
//       this.showSearchResults = false;
//       this.searchResults = [];
//     }
//   }

//   private getMockSearchResults(): any[] {
//     // Mock data - replace with actual API call
//     const mockItems = [
//       { 
//         id: 1, 
//         name: 'Grilled Chicken', 
//         description: 'Freshly grilled chicken with herbs', 
//         price: 16.99, 
//         available: true, 
//         imageUrl: 'assets/chicken.jpg', 
//         category: 'Main Course' 
//       },
//       { 
//         id: 2, 
//         name: 'Caesar Salad', 
//         description: 'Classic caesar with croutons', 
//         price: 12.99, 
//         available: true, 
//         imageUrl: 'assets/salad.jpg', 
//         category: 'Salads' 
//       },
//       { 
//         id: 3, 
//         name: 'Chocolate Cake', 
//         description: 'Rich chocolate dessert', 
//         price: 8.99, 
//         available: false, 
//         imageUrl: 'assets/cake.jpg', 
//         category: 'Desserts' 
//       }
//     ];
    
//     return mockItems.filter(item => 
//       item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
//       item.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
//       item.category.toLowerCase().includes(this.searchTerm.toLowerCase())
//     );
//   }

//   clearSearch(): void {
//     this.searchTerm = '';
//     this.showSearchResults = false;
//     this.searchResults = [];
//   }

//   navigateToMenuItem(item: any): void {
//     this.router.navigate(['/menu'], { 
//       fragment: `item-${item.id}`,
//       queryParams: { highlight: item.id }
//     });
//     this.clearSearch();
//   }

//   // Auth Modal Methods
//   openAuthModal(isLogin: boolean = true): void {
//     this.isLoginMode = isLogin;
//     this.showAuthModal = true;
//     this.authError = '';
//     this.resetAuthForm();
//   }

//   closeAuthModal(): void {
//     this.showAuthModal = false;
//     this.authError = '';
//     this.resetAuthForm();
//   }

//   switchAuthMode(): void {
//     this.isLoginMode = !this.isLoginMode;
//     this.authError = '';
//     this.resetAuthForm();
//   }

//   private resetAuthForm(): void {
//     this.authFormData = {
//       name: '',
//       email: '',
//       password: '',
//       confirmPassword: ''
//     };
//   }

//   // Authentication Methods
//   async onSubmitAuth(): Promise<void> {
//     this.authError = '';
//     this.isLoading = true;

//     try {
//       if (this.isLoginMode) {
//         await this.handleLogin();
//       } else {
//         await this.handleRegister();
//       }
//     } catch (error: any) {
//       this.authError = error.message || 'An error occurred. Please try again.';
//     } finally {
//       this.isLoading = false;
//     }
//   }

//   private async handleLogin(): Promise<void> {
//     const { email, password } = this.authFormData;
    
//     if (!email || !password) {
//       this.authError = 'Please fill in all fields';
//       return;
//     }

//     const success = await this.authService.login(email, password);
//     if (success) {
//       this.closeAuthModal();
//       // Optional: Navigate to a specific page after login
//       // this.router.navigate(['/profile']);
//     } else {
//       this.authError = 'Invalid email or password';
//     }
//   }

//   private async handleRegister(): Promise<void> {
//     const { name, email, password, confirmPassword } = this.authFormData;
    
//     if (!name || !email || !password || !confirmPassword) {
//       this.authError = 'Please fill in all fields';
//       return;
//     }

//     if (password !== confirmPassword) {
//       this.authError = 'Passwords do not match';
//       return;
//     }

//     if (password.length < 6) {
//       this.authError = 'Password must be at least 6 characters long';
//       return;
//     }

//     const success = await this.authService.register({ name, email, password });
//     if (success) {
//       this.closeAuthModal();
//     } else {
//       this.authError = 'Registration failed. Please try again.';
//     }
//   }

//   logout(): void {
//     this.authService.logout();
//   }

//   navigateToProfile(): void {
//     this.router.navigate(['/profile']);
//   }

//   navigateToOrders(): void {
//     this.router.navigate(['/orders']);
//   }

//   navigateToAdmin(): void {
//     if (this.userRole === 'admin') {
//       this.router.navigate(['/admin']);
//     } else {
//       this.authError = 'Access denied. Admin privileges required.';
//     }
//   }

//   // Host Listeners
//   @HostListener('document:click', ['$event'])
//   onDocumentClick(event: Event): void {
//     const target = event.target as HTMLElement;
    
//     if (!target.closest('.search-container') && !target.closest('.search-results-dropdown')) {
//       this.showSearchResults = false;
//     }
    
//     if (this.showAuthModal && target.classList.contains('auth-modal-backdrop')) {
//       this.closeAuthModal();
//     }
//   }

//   @HostListener('window:scroll', [])
//   onWindowScroll(): void {
//     const navbar = document.querySelector('.navbar');
//     if (window.scrollY > 50) {
//       navbar?.classList.add('navbar-scrolled');
//     } else {
//       navbar?.classList.remove('navbar-scrolled');
//     }
//   }

//   @HostListener('document:keydown.escape', ['$event'])
//   onEscapePressed(event: KeyboardEvent): void {
//     if (this.showAuthModal) {
//       this.closeAuthModal();
//     }
//     if (this.showSearchResults) {
//       this.clearSearch();
//     }
//   }
// }