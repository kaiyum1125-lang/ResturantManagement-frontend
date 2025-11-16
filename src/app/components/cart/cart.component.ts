// cart.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
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
  orderType: string = 'DINE_IN';
  tableNumber: string = '';
  paymentMethod: string = 'CASH';
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
  
  availableTables: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  private cartSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private cartService: CartService,
    private http: HttpClient
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
    this.deliveryFee = this.orderType === 'DELIVERY' ? 3.99 : 0;
  }

  increaseQuantity(item: CartItem): void {
    item.quantity++;
    this.cartService.updateCartItem(item.id, { 
      quantity: item.quantity,
      specialInstructions: item.specialInstructions
    }).subscribe({
      error: () => item.quantity--
    });
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
      this.cartService.updateCartItem(item.id, { 
        quantity: item.quantity,
        specialInstructions: item.specialInstructions
      }).subscribe({
        error: () => item.quantity++
      });
    }
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.id).subscribe();
  }

  printOrder(): void {
    window.print();
  }

  onOrderTypeChange(): void {
    this.calculateDeliveryFee();
  }

  proceedToCheckout(): void {
    if (!this.cart || this.cart.cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    if (this.orderType === 'DINE_IN' && !this.tableNumber) {
      alert('Please select a table number for dine-in orders.');
      return;
    }

    this.showModal('checkoutModal');
  }

  // ✅ PLACE ORDER WITH BACKEND
  placeOrder(): void {
    if (!this.cart || this.cart.cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    if (this.orderType === 'DELIVERY' && (!this.customerName || !this.customerPhone || !this.deliveryAddress)) {
      alert('Please fill in all delivery information.');
      return;
    }

    if (!this.paymentMethod) {
      alert('Please select a payment method.');
      return;
    }

    this.isPlacingOrder = true;

    const orderPayload = {
      userId: 1,
      items: this.cart.cartItems.map(i => ({
        menuItemId: i.menuItemId,
        quantity: i.quantity,
        specialInstructions: i.specialInstructions
      })),
      orderType: this.orderType,
      tableNumber: this.tableNumber,
      paymentMethod: this.paymentMethod,
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      deliveryAddress: this.deliveryAddress,
      orderNotes: this.orderNotes
    };

    this.http.post('http://localhost:8080/api/orders', orderPayload)
      .subscribe({
        next: (res) => {
          alert('Order placed successfully!');
          this.clearCart();
          this.isPlacingOrder = false;
          this.hideModal('checkoutModal');
          this.showModal('successModal');

          // ✅ Redirect user to Order list page
          this.router.navigate(['/orders']);
        },
        error: (err) => {
          console.error(err);
          alert('Failed to place order. Please try again.');
          this.isPlacingOrder = false;
        }
      });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe();
  }

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
    return this.cart?.taxAmount || 0;
  }

  getTotalAmount(): number {
    return (this.cart?.totalAmount || 0) + this.deliveryFee - this.discount;
  }

  get cartItems(): CartItem[] {
    return this.cart?.cartItems || [];
  }

  trackByItemId(index: number, item: CartItem): number {
    return item.id;
  }
}
