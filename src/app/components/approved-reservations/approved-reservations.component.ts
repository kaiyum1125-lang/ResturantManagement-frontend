import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../services/reservation.service';
@Component({
  selector: 'app-approved-reservations',
  templateUrl: './approved-reservations.component.html',
  styleUrls: ['./approved-reservations.component.scss']
})
export class ApprovedReservationsComponent implements OnInit {

  approvedList: any[] = [];
  totalApproved: number = 0;

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.loadApprovedReservations();
  }

  loadApprovedReservations() {
    this.reservationService.getApproved().subscribe({
      next: (data) => {
        this.approvedList = data;
        this.totalApproved = data.length;
      },
      error: (err) => console.error(err)
    });
  }
}
