import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MenuCategory } from './menu-category.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:8080/api/menu-categories';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<MenuCategory[]> {
    return this.http.get<MenuCategory[]>(this.apiUrl);
  }

  getCategoryById(id: number): Observable<MenuCategory> {
    return this.http.get<MenuCategory>(`${this.apiUrl}/${id}`);
  }

  createCategory(category: any): Observable<MenuCategory> {
    return this.http.post<MenuCategory>(this.apiUrl, category);
  }

  updateCategory(id: number, category: any): Observable<MenuCategory> {
    return this.http.put<MenuCategory>(`${this.apiUrl}/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}