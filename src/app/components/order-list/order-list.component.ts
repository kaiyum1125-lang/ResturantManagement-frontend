import { Component, OnInit } from '@angular/core';
import { OrderResponse } from 'src/app/models/order.model';
import { OrderService } from 'src/app/services/order.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {

  orders: OrderResponse[] = [];
  loading = true;
  selectedStatus = 'PENDING';
  statuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getOrdersByStatus(this.selectedStatus).subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.loading = false;
      }
    });
  }

  onStatusChange(): void {
    this.loadOrders();
  }

  updateStatus(order: OrderResponse, newStatus: string): void {
    if (confirm(`Change status of Order #${order.id} to ${newStatus}?`)) {
      this.orderService.updateOrderStatus(order.id, newStatus).subscribe(() => {
        this.loadOrders();
      });
    }
  }

  deleteOrder(id: number): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.deleteOrder(id).subscribe(() => {
        this.loadOrders();
      });
    }
  }
}
