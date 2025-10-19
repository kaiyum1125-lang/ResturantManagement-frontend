import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuCategory } from './menu-category.service';

// export interface MenuItem {
//   id?: number;
//   name: string;
//   description?: string;
//   price: number;
//   available?: boolean;
//   category: MenuCategory;
// }


export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  imageUrl: string;
  category: MenuCategory;
  createdAt:any;
  updatedAt:any;
}






@Injectable({
  providedIn: 'root'
})
export class MenuItemService {
  private baseUrl = 'http://localhost:8080/menuItem';

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
