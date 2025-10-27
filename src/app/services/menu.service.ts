
// menu.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MenuItem {
  isPopular: any;
  isSpicy: any;
  cookingTime: any;
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  imageUrl?: string;
  category?: MenuCategory;
}

export interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  items?: MenuItem[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = 'http://localhost:8080/api/menu';

  constructor(private http: HttpClient) { }

  getAllMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.apiUrl);
  }

  getAvailableMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.apiUrl}/available`);
  }

  getMenuItemsByCategory(categoryId: number): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.apiUrl}/category/${categoryId}`);
  }

  getCategories(): Observable<MenuCategory[]> {
    return this.http.get<MenuCategory[]>(`${this.apiUrl}/categories`);
  }
    deleteMenuItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

    createMenuItem(item: MenuItem): Observable<MenuItem> {
    return this.http.post<MenuItem>(`${this.apiUrl}`, item);
  }

  updateMenuItem(id: number, item: any): Observable<MenuItem> {

    console.log("---------------------",item);
    
    return this.http.put<MenuItem>(`${this.apiUrl}/${id}`, item);
  }
}




// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { MenuCategory } from './menu-category.service';
// import { MenuItem } from './menu-item.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class MenuService {
//   private apiUrl = 'http://localhost:8080/api';

//   constructor(private http: HttpClient) {}

//   getAvailableMenuItems(): Observable<MenuItem[]> {
//     return this.http.get<MenuItem[]>(`${this.apiUrl}/menu/available`);
//   }

//   getAllMenuItems(): Observable<MenuItem[]> {
//     return this.http.get<MenuItem[]>(`${this.apiUrl}/menu`);
//   }

//   getCategories(): Observable<MenuCategory[]> {
//     return this.http.get<MenuCategory[]>(`${this.apiUrl}/menu-categories`);
//   }

//   createMenuItem(item: MenuItem): Observable<MenuItem> {
//     return this.http.post<MenuItem>(`${this.apiUrl}/menu`, item);
//   }

//   updateMenuItem(id: number, item: any): Observable<MenuItem> {

//     console.log("---------------------",item);
    
//     return this.http.put<MenuItem>(`${this.apiUrl}/menu/${id}`, item);
//   }

//   deleteMenuItem(id: number): Observable<void> {
//     return this.http.delete<void>(`${this.apiUrl}/menu/${id}`);
//   }
// }