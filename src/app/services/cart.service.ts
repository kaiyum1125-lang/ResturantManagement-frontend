import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsCountSubject = new BehaviorSubject<number>(0);
  public cartItemsCount$ = this.cartItemsCountSubject.asObservable();

  constructor() {
    // Initialize from localStorage
    const storedCount = localStorage.getItem('cartItemsCount');
    if (storedCount) {
      this.cartItemsCountSubject.next(parseInt(storedCount));
    }
  }

  getCartItemsCount(): number {
    return this.cartItemsCountSubject.value;
  }

  updateCartCount(count: number): void {
    this.cartItemsCountSubject.next(count);
    localStorage.setItem('cartItemsCount', count.toString());
  }

  addToCart(): void {
    const current = this.getCartItemsCount();
    this.updateCartCount(current + 1);
  }

  removeFromCart(): void {
    const current = this.getCartItemsCount();
    if (current > 0) {
      this.updateCartCount(current - 1);
    }
  }

  clearCart(): void {
    this.updateCartCount(0);
  }
}