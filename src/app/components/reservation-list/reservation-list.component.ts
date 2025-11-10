import { Component, OnInit } from '@angular/core';
import { ReservationService } from 'src/app/services/reservation.service';
 // optional, for notifications

@Component({
  selector: 'app-reservation-list',
  templateUrl: './reservation-list.component.html',
  styleUrls: ['./reservation-list.component.scss']
})
export class ReservationListComponent implements OnInit {
  reservations: any[] = [];
  loading = false;

  constructor(
    private reservationService: ReservationService,
    // private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.fetchReservations();
  }

  fetchReservations(): void {
    this.loading = true;
    this.reservationService.getAll().subscribe({
      next: (data) => {
        this.reservations = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        // this.toastr.error('Failed to load reservations');
      }
    });
  }

  approveReservation(id: number): void {
    this.reservationService.approve(id).subscribe({
      next: () => {
        // this.toastr.success('Reservation approved');
        this.fetchReservations(); // refresh list
      },
      error: (err) => {
        console.error(err);
        // this.toastr.error('Failed to approve reservation');
      }
    });
  }

  rejectReservation(id: number): void {
    this.reservationService.reject(id).subscribe({
      next: () => {
        // this.toastr.warning('Reservation rejected');
        this.fetchReservations(); // refresh list
      },
      error: (err) => {
        console.error(err);
        // this.toastr.error('F/ailed to reject reservation');
      }
    });
  }
}
