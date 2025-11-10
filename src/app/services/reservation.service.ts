import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private baseUrl = 'http://localhost:8080/api/reservations';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getApproved(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/approved`);
  }

  getRejected(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/rejected`);
  }

  approve(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/approve`, {});
  }

  reject(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/reject`, {});
  }
}
