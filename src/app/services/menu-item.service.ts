import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuItem } from './menu.service';

// export interface MenuItem {
//   id?: number;
//   name: string;
//   description?: string;
//   price: number;
//   available?: boolean;
//   category: MenuCategory;
// }


// export interface MenuItem {
//   id: number;
//   name: string;
//   description: string;
//   price: number;
//   available: boolean;
//   imageUrl: string;
//   category: MenuCategory;
//   createdAt:any;
//   updatedAt:any;
// }






@Injectable({
  providedIn: 'root'
})
export class MenuItemService {
  private baseUrl = 'http://localhost:8080/api/menu';

  constructor(private http: HttpClient) {}

  getAll(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.baseUrl);
  }

  create(item: MenuItem): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.baseUrl, item);
  }

  update(id: number, item: MenuItem): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.baseUrl}/${id}`, item);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}



// import { Injectable } from '@angular/core';
// import { HttpClient, HttpErrorResponse } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { MenuCategory } from './menu-category.service';

// export interface MenuItem {
//   id?: number;
//   name: string;
//   description?: string;
//   price: number;
//   available: boolean;
//   imageUrl: string;
//   category: MenuCategory;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class MenuItemService {
//   // ✅ Backend API base URL
//   private baseUrl = 'http://localhost:8080/api/menuItems';

//   constructor(private http: HttpClient) {}

//   // ✅ Get all menu items
//   getAll(): Observable<MenuItem[]> {
//     return this.http.get<MenuItem[]>(this.baseUrl).pipe(
//       catchError(this.handleError)
//     );
//   }

//   // ✅ Get menu item by ID
//   getById(id: number): Observable<MenuItem> {
//     return this.http.get<MenuItem>(`${this.baseUrl}/${id}`).pipe(
//       catchError(this.handleError)
//     );
//   }

//   // ✅ Create new menu item
//   create(item: MenuItem): Observable<MenuItem> {
//     return this.http.post<MenuItem>(this.baseUrl, item).pipe(
//       catchError(this.handleError)
//     );
//   }

//   // ✅ Update existing menu item
//   update(id: number, item: MenuItem): Observable<MenuItem> {
//     return this.http.put<MenuItem>(`${this.baseUrl}/${id}`, item).pipe(
//       catchError(this.handleError)
//     );
//   }

//   // ✅ Delete menu item
//   delete(id: number): Observable<void> {
//     return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
//       catchError(this.handleError)
//     );
//   }

//   // ✅ Handle any HTTP error globally
//   private handleError(error: HttpErrorResponse) {
//     let errorMessage = 'Unknown error occurred!';

//     if (error.error instanceof ErrorEvent) {
//       // Client-side error
//       errorMessage = `Client Error: ${error.error.message}`;
//     } else {
//       // Server-side error
//       errorMessage = `Server Error: ${error.status} - ${error.message}`;
//     }

//     console.error('MenuItemService Error:', errorMessage);
//     return throwError(() => new Error(errorMessage));
//   }
// }

