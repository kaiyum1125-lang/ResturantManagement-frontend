

// cart.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartResponse, CartService, CartItem } from 'src/app/services/cart.service';

declare var bootstrap: any;

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  cart: CartResponse | null = null;
  orderNotes: string = '';
  orderType: string = 'dine-in';
  tableNumber: string = '';
  paymentMethod: string = 'cash';
  customerName: string = '';
  customerPhone: string = '';
  deliveryAddress: string = '';
  
  // Constants
  taxRate: number = 0.1; // 10%
  deliveryFee: number = 0;
  discount: number = 0;
  
  // Order management
  isPlacingOrder: boolean = false;
  orderId: string = '';
  
  // Available tables
  availableTables: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  private cartSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit(): void {


      this.initializeModals();
  
  console.log('Current session ID:', this.cartService.sessionId);
  
  this.cartSubscription = this.cartService.cart$.subscribe(cart => {
    console.log('Cart updated:', cart);
    this.cart = cart;
  });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  initializeModals(): void {
    const modalElements = document.querySelectorAll('.modal');
    modalElements.forEach((modalEl) => {
      new bootstrap.Modal(modalEl);
    });
  }

  calculateDeliveryFee(): void {
    this.deliveryFee = this.orderType === 'delivery' ? 3.99 : 0;
  }

  // QUANTITY MANAGEMENT
  // increaseQuantity(item: CartItem): void {
  //   this.cartService.updateCartItem(item.id, { 
  //     quantity: item.quantity + 1,
  //     specialInstructions: item.specialInstructions 
  //   }).subscribe();
  // }

  // decreaseQuantity(item: CartItem): void {
  //   if (item.quantity > 1) {
  //     this.cartService.updateCartItem(item.id, {
  //       quantity: item.quantity - 1,
  //       specialInstructions: item.specialInstructions
  //     }).subscribe();
  //   }
  // }
increaseQuantity(item: CartItem): void {
  item.quantity++;
  this.cartService.updateCartItem(item.id, { 
    quantity: item.quantity,
    specialInstructions: item.specialInstructions
  }).subscribe({
    error: () => item.quantity-- // rollback if API fails
  });
}

decreaseQuantity(item: CartItem): void {
  if (item.quantity > 1) {
    item.quantity--;
    this.cartService.updateCartItem(item.id, { 
      quantity: item.quantity,
      specialInstructions: item.specialInstructions
    }).subscribe({
      error: () => item.quantity++ // rollback if API fails
    });
  }
}

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.id).subscribe();
  }
  printOrder(): void {
  // If you just want to print the page:
  window.print();
}


  // CALCULATION METHODS (using backend calculations)
  // getTotalItems(): number {
  //   return this.cart?.totalItems || 0;
  // }

  // getSubtotal(): number {
  //   return this.cart?.subtotal || 0;
  // }

  // getTaxAmount(): number {
  //   return this.getSubtotal() * this.taxRate;
  // }

  // getTotalAmount(): number {
  //   return (this.cart?.total || 0) + this.getTaxAmount() + this.deliveryFee - this.discount;
  // }

  // ORDER TYPE CHANGE
  onOrderTypeChange(): void {
    this.calculateDeliveryFee();
  }

  // CHECKOUT PROCESS
  proceedToCheckout(): void {
    if (!this.cart || this.cart.cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    if (this.orderType === 'dine-in' && !this.tableNumber) {
      alert('Please select a table number for dine-in orders.');
      return;
    }

    this.showModal('checkoutModal');
  }

  placeOrder(): void {
    if (this.orderType === 'delivery' && (!this.customerName || !this.customerPhone || !this.deliveryAddress)) {
      alert('Please fill in all delivery information.');
      return;
    }

    if (!this.paymentMethod) {
      alert('Please select a payment method.');
      return;
    }

    this.isPlacingOrder = true;

    // Simulate API call to place order
    setTimeout(() => {
      this.orderId = this.generateOrderId();
      
      // Create order object
      const order = {
        id: this.orderId,
        items: this.cart?.cartItems || [],
        subtotal: this.getSubtotal(),
        tax: this.getTaxAmount(),
        deliveryFee: this.deliveryFee,
        discount: this.discount,
        total: this.getTotalAmount(),
        orderType: this.orderType,
        tableNumber: this.tableNumber,
        paymentMethod: this.paymentMethod,
        customerName: this.customerName,
        customerPhone: this.customerPhone,
        deliveryAddress: this.deliveryAddress,
        orderNotes: this.orderNotes,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Save order to localStorage (in real app, send to backend)
      this.saveOrder(order);
      
      // Clear cart
      this.clearCart();
      
      this.isPlacingOrder = false;
      this.hideModal('checkoutModal');
      this.showModal('successModal');
      
    }, 2000);
  }

  generateOrderId(): string {
    return 'ORD-' + Date.now().toString().slice(-6).toUpperCase();
  }

  saveOrder(order: any): void {
    const orders = JSON.parse(localStorage.getItem('restaurant_orders') || '[]');
    orders.push(order);
    localStorage.setItem('restaurant_orders', JSON.stringify(orders));
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe();
  }

  // MODAL METHODS
  private showModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  private hideModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  // NAVIGATION
  continueShopping(): void {
    this.router.navigate(['/menu']);
  }

  getTotalItems(): number {
    return this.cart?.totalItems || 0;
  }

  getSubtotal(): number {
    return this.cart?.subtotal || 0;
  }

  getTaxAmount(): number {
    return this.cart?.taxAmount || 0; // Use backend calculated tax
  }

  getTotalAmount(): number {
    return (this.cart?.totalAmount || 0) + this.deliveryFee - this.discount;
  }

  // Use cartItems instead of items in template
  get cartItems(): CartItem[] {
    return this.cart?.cartItems || [];
  }
  trackByItemId(index: number, item: CartItem): number {
  return item.id;
}
}

// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';

// // Declare Bootstrap
// declare var bootstrap: any;

// interface CartItem {
//   id: number;
//   name: string;
//   price: number;
//   quantity: number;
//   imageUrl?: string;
//   category?: {
//     id: number;
//     name: string;
//   };
//   specialInstructions?: string;
// }

// @Component({
//   selector: 'app-cart',
//   templateUrl: './cart.component.html',
//   styleUrls: ['./cart.component.scss']
// })
// export class CartComponent implements OnInit {
//   cartItems: CartItem[] = [];
//   orderNotes: string = '';
//   orderType: string = 'dine-in';
//   tableNumber: string = '';
//   paymentMethod: string = 'cash';
//   customerName: string = '';
//   customerPhone: string = '';
//   deliveryAddress: string = '';
  
//   // Constants
//   taxRate: number = 0.1; // 10%
//   deliveryFee: number = 0;
//   discount: number = 0;
  
//   // Order management
//   isPlacingOrder: boolean = false;
//   orderId: string = '';
  
//   // Available tables
//   availableTables: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

//   constructor(private router: Router) {}

//   ngOnInit(): void {
//     this.loadCartItems();
//     this.calculateDeliveryFee();
//     this.initializeModals();
//   }

//   initializeModals(): void {
//     const modalElements = document.querySelectorAll('.modal');
//     modalElements.forEach((modalEl) => {
//       new bootstrap.Modal(modalEl);
//     });
//   }

//   loadCartItems(): void {
//     // Load from localStorage or service
//     const savedCart = localStorage.getItem('restaurant_cart');
//     if (savedCart) {
//       this.cartItems = JSON.parse(savedCart);
//     }
    
//     // If no items in cart, you might want to load some sample data for demo
//     if (this.cartItems.length === 0) {
//       // For demo purposes - remove in production
//       this.cartItems = [
//         {
//           id: 1,
//           name: 'Grilled Chicken',
//           price: 16.99,
//           quantity: 2,
//           imageUrl: 'https://images.unsplash.com/photo-1532550907401-c5c1c99d5a7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
//           category: { id: 1, name: 'Main Course' }
//         },
//         {
//           id: 2,
//           name: 'Caesar Salad',
//           price: 12.99,
//           quantity: 1,
//           imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
//           category: { id: 2, name: 'Salads' }
//         }
//       ];
//       this.saveCart();
//     }
//   }

//   calculateDeliveryFee(): void {
//     this.deliveryFee = this.orderType === 'delivery' ? 3.99 : 0;
//   }

//   saveCart(): void {
//     localStorage.setItem('restaurant_cart', JSON.stringify(this.cartItems));
//   }

//   // QUANTITY MANAGEMENT
//   increaseQuantity(item: CartItem): void {
//     item.quantity++;
//     this.saveCart();
//   }

//   decreaseQuantity(item: CartItem): void {
//     if (item.quantity > 1) {
//       item.quantity--;
//       this.saveCart();
//     }
//   }

//   removeItem(item: CartItem): void {
//     this.cartItems = this.cartItems.filter(cartItem => cartItem.id !== item.id);
//     this.saveCart();
//   }

//   // CALCULATION METHODS
//   getTotalItems(): number {
//     return this.cartItems.reduce((total, item) => total + item.quantity, 0);
//   }

//   getSubtotal(): number {
//     return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
//   }

//   getTaxAmount(): number {
//     return this.getSubtotal() * this.taxRate;
//   }

//   getTotalAmount(): number {
//     return this.getSubtotal() + this.getTaxAmount() + this.deliveryFee - this.discount;
//   }

//   // ORDER TYPE CHANGE
//   onOrderTypeChange(): void {
//     this.calculateDeliveryFee();
//   }

//   // CHECKOUT PROCESS
//   proceedToCheckout(): void {
//     // Validate order type specific requirements
//     if (this.orderType === 'dine-in' && !this.tableNumber) {
//       alert('Please select a table number for dine-in orders.');
//       return;
//     }

//     if (this.orderType === 'delivery' && (!this.customerName || !this.customerPhone || !this.deliveryAddress)) {
//       // We'll collect this info in the checkout modal
//     }

//     this.showModal('checkoutModal');
//   }

//   placeOrder(): void {
//     // Validate required fields
//     if (this.orderType === 'delivery' && (!this.customerName || !this.customerPhone || !this.deliveryAddress)) {
//       alert('Please fill in all delivery information.');
//       return;
//     }

//     if (!this.paymentMethod) {
//       alert('Please select a payment method.');
//       return;
//     }

//     this.isPlacingOrder = true;

//     // Simulate API call to place order
//     setTimeout(() => {
//       this.orderId = this.generateOrderId();
      
//       // Create order object
//       const order = {
//         id: this.orderId,
//         items: this.cartItems,
//         subtotal: this.getSubtotal(),
//         tax: this.getTaxAmount(),
//         deliveryFee: this.deliveryFee,
//         discount: this.discount,
//         total: this.getTotalAmount(),
//         orderType: this.orderType,
//         tableNumber: this.tableNumber,
//         paymentMethod: this.paymentMethod,
//         customerName: this.customerName,
//         customerPhone: this.customerPhone,
//         deliveryAddress: this.deliveryAddress,
//         orderNotes: this.orderNotes,
//         status: 'pending',
//         createdAt: new Date().toISOString()
//       };

//       // Save order to localStorage (in real app, send to backend)
//       this.saveOrder(order);
      
//       // Clear cart
//       this.clearCart();
      
//       this.isPlacingOrder = false;
//       this.hideModal('checkoutModal');
//       this.showModal('successModal');
      
//     }, 2000);
//   }

//   generateOrderId(): string {
//     return 'ORD-' + Date.now().toString().slice(-6).toUpperCase();
//   }

//   saveOrder(order: any): void {
//     const orders = JSON.parse(localStorage.getItem('restaurant_orders') || '[]');
//     orders.push(order);
//     localStorage.setItem('restaurant_orders', JSON.stringify(orders));
//   }

//   clearCart(): void {
//     this.cartItems = [];
//     localStorage.removeItem('restaurant_cart');
//   }

//   // MODAL METHODS
//   private showModal(modalId: string): void {
//     const modalElement = document.getElementById(modalId);
//     if (modalElement) {
//       const modal = new bootstrap.Modal(modalElement);
//       modal.show();
//     }
//   }

//   private hideModal(modalId: string): void {
//     const modalElement = document.getElementById(modalId);
//     if (modalElement) {
//       const modal = bootstrap.Modal.getInstance(modalElement);
//       if (modal) {
//         modal.hide();
//       }
//     }
//   }

//   // NAVIGATION
//   continueShopping(): void {
//     this.router.navigate(['/menu']);
//   }
// }