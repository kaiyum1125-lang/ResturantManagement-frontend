import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface MenuItem {
  id?: number;
  name: string;
  price: number;
  description: string;
}

@Component({
  selector: 'app-menu-management',
  templateUrl: './menu-management.component.html',
  styleUrls: ['./menu-management.component.scss']
})
export class MenuManagementComponent implements OnInit {
  menuItems: MenuItem[] = [
    { id: 1, name: 'Cheese Pizza', price: 12, description: 'Delicious cheese pizza' },
    { id: 2, name: 'Veggie Burger', price: 8, description: 'Fresh veggie burger' },
    { id: 3, name: 'Grilled Sandwich', price: 7, description: 'Toasted sandwich' },
    { id: 4, name: 'Pasta Alfredo', price: 10, description: 'Creamy pasta alfredo' },
    { id: 5, name: 'Caesar Salad', price: 6, description: 'Fresh lettuce & dressing' },
    { id: 6, name: 'French Fries', price: 4, description: 'Crispy fries' },
    { id: 7, name: 'Chicken Wings', price: 11, description: 'Spicy grilled wings' },
    { id: 8, name: 'Chocolate Cake', price: 5, description: 'Rich chocolate cake' },
    { id: 9, name: 'Ice Cream Sundae', price: 4.5, description: 'Vanilla sundae with toppings' },
    { id: 10, name: 'Lemonade', price: 3, description: 'Freshly squeezed lemonade' },
  ];

  menuForm: FormGroup;
  editMode: boolean = false;
  editingItemId: number | null = null;

  constructor(private fb: FormBuilder) {
    this.menuForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  submitForm() {
    if (this.menuForm.invalid) return;

    const formValue = this.menuForm.value as MenuItem;

    if (this.editMode && this.editingItemId !== null) {
      const updatedItem: MenuItem = { ...formValue, id: this.editingItemId };
      this.menuItems = this.menuItems.map(i => i.id === this.editingItemId ? updatedItem : i);
      this.resetForm();
    } else {
      const newItem: MenuItem = { ...formValue, id: this.menuItems.length + 1 };
      this.menuItems.push(newItem);
      this.resetForm();
    }
  }

  editItem(item: MenuItem) {
    this.editMode = true;
    this.editingItemId = item.id!;
    this.menuForm.patchValue({
      name: item.name,
      price: item.price,
      description: item.description
    });
  }

  deleteItem(item: MenuItem) {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      this.menuItems = this.menuItems.filter(i => i.id !== item.id);
    }
  }

  resetForm() {
    this.menuForm.reset();
    this.editMode = false;
    this.editingItemId = null;
  }
}
