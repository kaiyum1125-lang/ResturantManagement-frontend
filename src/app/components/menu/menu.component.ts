import { Component, OnInit } from '@angular/core';
import { MenuCategory } from 'src/app/services/menu-category.service';
import { MenuItem } from 'src/app/services/menu-item.service';
import { MenuService } from 'src/app/services/menu.service';



@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  menuItems: MenuItem[] = [];
  filteredItems: MenuItem[] = [];
  categories: MenuCategory[] = [];
  selectedCategory: MenuCategory | null = null;

  constructor(private menuService: MenuService) {}

  ngOnInit(): void {
    this.loadMenuItems();
    this.loadCategories();
  }

  loadMenuItems(): void {
    this.menuService.getAvailableMenuItems().subscribe(items => {
      this.menuItems = items;
      this.filteredItems = items;
    });
  }

  loadCategories(): void {
    this.menuService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  filterByCategory(category: MenuCategory | null): void {
    this.selectedCategory = category;
    if (category) {
      this.filteredItems = this.menuItems.filter(item => 
        item.category?.id === category.id
      );
    } else {
      this.filteredItems = this.menuItems;
    }
  }
}