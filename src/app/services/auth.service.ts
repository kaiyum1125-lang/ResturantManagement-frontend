import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    // Check for stored user on service initialization
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    // Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === 'admin@thegrill.com' && password === 'password') {
          const user: User = {
            id: 1,
            name: 'Admin User',
            email: email,
            role: 'admin'
          };
          this.setUser(user);
          resolve(true);
        } else if (email && password) {
          const user: User = {
            id: Date.now(),
            name: email.split('@')[0],
            email: email,
            role: 'customer'
          };
          this.setUser(user);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000); // Simulate API delay
    });
  }

  async register(userData: any): Promise<boolean> {
    // Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = {
          id: Date.now(),
          name: userData.name,
          email: userData.email,
          role: 'customer'
        };
        this.setUser(user);
        resolve(true);
      }, 1000);
    });
  }

  private setUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}