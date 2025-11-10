import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss']
})
export class ReservationsComponent {
  reservation = {
    customerName: '',
    contactNumber: '',
    date: '',
    timeSlot: '',
    numberOfGuests: 1
  };

  constructor(
    private http: HttpClient,
    private location: Location
  ) {}

  bookTable() {
    this.http.post('http://localhost:8080/api/reservations', this.reservation)
      .subscribe({
        next: (res: any) => {
          // Show success message with more details
          alert(`Booking successful! Your reservation for ${this.reservation.numberOfGuests} guests on ${this.reservation.date} at ${this.reservation.timeSlot} has been confirmed.`);
          console.log(res);
          
          // Reset form after successful booking
          this.reservation = {
            customerName: '',
            contactNumber: '',
            date: '',
            timeSlot: '',
            numberOfGuests: 1
          };
        },
        error: (err) => {
          // Show error message
          alert('Failed to book table. Please try again or contact us directly.');
          console.error(err);
        }
      });
  }

  goBack() {
    this.location.back();
  }
}