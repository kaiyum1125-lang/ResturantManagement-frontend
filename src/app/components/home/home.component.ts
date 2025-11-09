import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  
  // Carousel configuration
  carouselOptions = {
    interval: 5000,
    wrap: true,
    keyboard: true,
    pause: 'hover'
  };

  // Featured menu items
  featuredItems = [
    {
      name: 'Harvest Garden Salad',
      description: 'Fresh greens from our garden with heirloom tomatoes, local goat cheese, and house-made vinaigrette.',
      price: 16.99,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80',
      badge: 'Seasonal Favorite'
    },
    {
      name: 'Wood-Fired Margherita',
      description: 'Classic pizza with San Marzano tomatoes, fresh mozzarella, basil, and extra virgin olive oil.',
      price: 18.99,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80',
      badge: 'House Specialty'
    }
  ];

  // Testimonials
  testimonials = [
    {
      text: "The most authentic countryside dining experience I've ever had! The wood-fired bread and local cheeses are absolutely divine.",
      author: "Sarah Johnson",
      role: "Food Critic",
      rating: 5
    },
    {
      text: "Perfect for our anniversary dinner! The atmosphere, service, and food were all exceptional. The farm roasts melted in our mouths.",
      author: "Michael & Emily Chen",
      role: "Regular Guests",
      rating: 4.5
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // You can add any initialization logic here
    this.initializeCarousels();
  }

  private initializeCarousels(): void {
    // Carousel initialization logic if needed
    // Bootstrap carousels should work automatically with data-bs-ride
  }

  // Method to handle adding items to order
  addToOrder(item: any): void {
    // Implement order functionality
    console.log('Added to order:', item);
    // You can integrate with your order service here
  }

  // Method to get star rating display
  getStarRating(rating: number): any[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }

    if (hasHalfStar) {
      stars.push('half');
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push('empty');
    }

    return stars;
  }
}