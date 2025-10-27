import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuCategory } from './menu.service';

// export interface MenuCategory {
//   id?: number;
//   name: string;
// }

// export interface MenuCategory {
// createdAt: any;
//   id: number;
//   name: string;
//   description: string;
//   items: MenuItem[];
// }

@Injectable({
  providedIn: 'root'
})
export class MenuCategoryService {
  private baseUrl = 'http://localhost:8080/api/menu-categories';

  constructor(private http: HttpClient) {}

  getAll(): Observable<MenuCategory[]> {
    return this.http.get<MenuCategory[]>(this.baseUrl);
  }

  create(category: MenuCategory): Observable<MenuCategory> {
    return this.http.post<MenuCategory>(this.baseUrl, category);
  }

  update(id: number, category: MenuCategory): Observable<MenuCategory> {
    return this.http.put<MenuCategory>(`${this.baseUrl}/${id}`, category);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
