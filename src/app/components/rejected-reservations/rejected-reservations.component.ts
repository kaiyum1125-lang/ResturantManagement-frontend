import { Component, OnInit } from '@angular/core';
import { ReservationService } from 'src/app/services/reservation.service';

@Component({
  selector: 'app-rejected-reservations',
  templateUrl: './rejected-reservations.component.html',
  styleUrls: ['./rejected-reservations.component.scss']
})
export class RejectedReservationsComponent implements OnInit {

  rejectedList: any[] = [];
  totalRejected: number = 0;

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.loadRejectedReservations();
  }

  loadRejectedReservations() {
    this.reservationService.getRejected().subscribe({
      next: (data) => {
        this.rejectedList = data;
        this.totalRejected = data.length;
      },
      error: (err) => console.error(err)
    });
  }
}
