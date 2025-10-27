

// cart.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';

// cart.service.ts - FIXED INTERFACE
export interface CartResponse {
  id: number;
  sessionId: string;
  cartItems: CartItem[];  // Changed from 'items' to 'cartItems'
  subtotal: number;
  taxAmount: number;      // Changed from 'tax'
  totalAmount: number;    // Changed from 'total'
  totalItems: number;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  category?: {
    id: number;
    name: string;
  };
  specialInstructions?: string;
  menuItemId: number;     // Added this field
}

export interface AddToCartRequest {
  menuItemId: number;
  quantity: number;
  specialInstructions?: string;
}

export interface UpdateCartItemRequest {
  quantity: number;
  specialInstructions?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private baseUrl = 'http://localhost:8080/api/cart';
  public sessionId: string | null = null;

  private cartSubject = new BehaviorSubject<CartResponse | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeSession();
    console.log('--------------service---------', this.cart$);

  }



  private initializeSession(): void {
    let sessionId = localStorage.getItem('sessionId');

    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem('sessionId', sessionId);
    }

    this.sessionId = sessionId;
    console.log('Initialized session:', this.sessionId);
    this.getCart().subscribe();
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  public getCart(): Observable<CartResponse> {
    if (!this.sessionId) {
      console.error('No session ID available');
      return of();
    }

    const params = new HttpParams().set('sessionId', this.sessionId);
    return this.http.get<CartResponse>(this.baseUrl, { params }).pipe(
      tap(cart => {
        console.log('Cart loaded:', cart);
        this.cartSubject.next(cart);
      }),
      catchError(error => {
        console.error('Error loading cart:', error);
        return of();
      })
    );
  }

  getCartItemsCount(): number {
    return 10;
  }

  // private initializeSession(): void {
  //   const savedSessionId = localStorage.getItem('sessionId');
  //   if (savedSessionId) {
  //     this.sessionId = savedSessionId;
  //     this.getCart().subscribe();
  //   } else {
  //     this.createSession();
  //   }
  // }
  createSession() {
    this.sessionId = "sessionId";
    localStorage.setItem('cartSessionId', this.sessionId);
  }

  // private createSession(): Observable<string> {
  //   return this.http.post<string>(`${this.baseUrl}/session`, {}).pipe(
  //     tap(sessionId => {
  //       this.sessionId = sessionId;
  //       localStorage.setItem('cartSessionId', sessionId);
  //     })
  //   );
  // }

  // public getCart(): Observable<CartResponse> {
  //   const params = new HttpParams().set('sessionId', this.sessionId!);
  //   return this.http.get<CartResponse>(this.baseUrl, { params }).pipe(
  //     tap(cart => this.cartSubject.next(cart))

  //   );
  // }

  public getCart2(): Observable<CartResponse> {
    const params = new HttpParams().set('sessionId', this.sessionId!);
    return this.http.get<CartResponse>(this.baseUrl, { params });
  }
  addToCart(request: AddToCartRequest): Observable<CartResponse> {
    const params = new HttpParams().set('sessionId', this.sessionId!);
    return this.http.post<CartResponse>(`${this.baseUrl}/items`, request, { params }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  updateCartItem(cartItemId: number, request: UpdateCartItemRequest): Observable<CartResponse> {
    const params = new HttpParams().set('sessionId', this.sessionId!);
    return this.http.put<CartResponse>(`${this.baseUrl}/items/${cartItemId}`, request, { params }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }
// updateCartItem(cartItemId: number, request: UpdateCartItemRequest): Observable<CartItem> {
//   const params = new HttpParams().set('sessionId', this.sessionId!);
//   return this.http.put<CartItem>(`${this.baseUrl}/items/${cartItemId}`, request, { params }).pipe(
//     tap(updatedItem => {
//       const currentCart = this.cartSubject.value;
//       const updatedItems = currentCart?.cartItems.map(i =>
//         i.id === updatedItem.id ? updatedItem : i
//       );
//       this.cartSubject.next({ ...currentCart, cartItems: updatedItems });
//     })
//   );
// }

  removeFromCart(cartItemId: number): Observable<CartResponse> {
    const params = new HttpParams().set('sessionId', this.sessionId!);
    return this.http.delete<CartResponse>(`${this.baseUrl}/items/${cartItemId}`, { params }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  clearCart(): Observable<void> {
    const params = new HttpParams().set('sessionId', this.sessionId!);
    return this.http.delete<void>(`${this.baseUrl}/clear`, { params }).pipe(
      tap(() => this.cartSubject.next(null))
    );
  }

  getCurrentCart(): CartResponse | null {
    return this.cartSubject.value;
  }
}


// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class CartService {
//   private cartItemsCountSubject = new BehaviorSubject<number>(0);
//   public cartItemsCount$ = this.cartItemsCountSubject.asObservable();

//   constructor() {
//     // Initialize from localStorage
//     const storedCount = localStorage.getItem('cartItemsCount');
//     if (storedCount) {
//       this.cartItemsCountSubject.next(parseInt(storedCount));
//     }
//   }

//   getCartItemsCount(): number {
//     return this.cartItemsCountSubject.value;
//   }

//   updateCartCount(count: number): void {
//     this.cartItemsCountSubject.next(count);
//     localStorage.setItem('cartItemsCount', count.toString());
//   }

//   addToCart(): void {
//     const current = this.getCartItemsCount();
//     this.updateCartCount(current + 1);
//   }

//   removeFromCart(): void {
//     const current = this.getCartItemsCount();
//     if (current > 0) {
//       this.updateCartCount(current - 1);
//     }
//   }

//   clearCart(): void {
//     this.updateCartCount(0);
//   }
// }