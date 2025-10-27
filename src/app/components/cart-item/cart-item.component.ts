import { Component, Input } from '@angular/core';
import { CartService, AddToCartRequest } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart-item',
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.scss']
})
export class CartItemComponent {
@Input() menuItem: any;
  specialInstructions: string = '';

  constructor(private cartService: CartService) {}

  addToCart(): void {
    const request: AddToCartRequest = {
      menuItemId: this.menuItem.id,
      quantity: 1,
      specialInstructions: this.specialInstructions || undefined
    };

    this.cartService.addToCart(request).subscribe({
      next: (cart) => {
        console.log('Item added to cart:', cart);
        this.specialInstructions = ''; // Reset after adding
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart. Please try again.');
      }
    });
  }
}
