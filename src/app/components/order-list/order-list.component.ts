// order-list.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TrackByFunction } from '@angular/core';


declare var bootstrap: any;

export interface Order {
  id: number | string;
  items: any[];
  subtotal?: number;
  taxAmount?: number;
  deliveryFee?: number;
  discount?: number;
  totalAmount?: number;
  orderType: string;
  tableNumber?: string;
  paymentMethod: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  orderNotes?: string;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {

  orders: Order[] = [];
  selectedOrder: Order | null = null;
  loading = false;
  selectedStatus = 'all';
  statuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  trackByItemId: TrackByFunction<Order> = (index: number, item: Order) => item.id;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadOrders();
  }
  loadOrders(): void {
    this.loading = true;

    let apiUrl = 'http://localhost:8080/api/orders';

    this.http.get<Order[]>(apiUrl).subscribe({
      next: (res) => {
        console.log('Loaded Orders:', res);  // Debug
        this.orders = res.reverse(); // Latest order shown first
        this.loading = false;
      },
      error: (err) => {
        console.error('Order Load Failed:', err);
        this.loading = false;
      }
    });
  }

  onStatusChange(): void {
    this.loadOrders();
  }

  getStatusBadgeClass(status: string): string {
    const statusLower = status.toLowerCase();

    switch (statusLower) {
      case 'pending': return 'bg-warning text-dark';
      case 'confirmed': return 'bg-info text-white';
      case 'preparing': return 'bg-primary text-white';
      case 'in_progress':
      case 'in progress': return 'bg-secondary text-white';
      case 'completed': return 'bg-success text-white';
      case 'cancelled': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  }

  getOrderTypeBadgeClass(orderType: string): string {
    const typeLower = orderType.toLowerCase();

    switch (typeLower) {
      case 'dine-in': return 'bg-info text-white';
      case 'delivery': return 'bg-warning text-dark';
      case 'takeaway': return 'bg-success text-white';
      default: return 'bg-secondary text-white';
    }
  }

  updateStatus(order: Order, newStatus: string): void {
    if (confirm(`Change status of Order #${order.id} to ${newStatus}?`)) {
      this.http.put<Order>(`http://localhost:8080/api/orders/${order.id}/status?status=${newStatus}`, {  })
        .subscribe({
          next: () => this.loadOrders(),
          error: (err) => console.error(err)
        });
    }
  }

  deleteOrder(id: string | number): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.http.delete(`http://localhost:8080/api/orders/${id}`)
        .subscribe({
          next: () => this.loadOrders(),
          error: (err) => console.error(err)
        });
    }
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
    const modalElement = document.getElementById('orderDetailsModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  printOrder(order: Order): void {
    window.print();
  }
}
