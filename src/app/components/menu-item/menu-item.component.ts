import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MenuItemService, MenuItem } from 'src/app/services/menu-item.service';
import { MenuCategoryService, MenuCategory } from 'src/app/services/menu-category.service';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html'
})
export class MenuItemComponent implements OnInit {
  itemForm: FormGroup;
  items: MenuItem[] = [];
  categories: MenuCategory[] = [];

  @ViewChild('formRef') formRef!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private itemService: MenuItemService,
    private categoryService: MenuCategoryService
  ) {
    this.itemForm = this.fb.group({
      id: [],
      name: [''],
      description: [''],
      price: [0],
      available: [true],
      category: [null]
    });
  }

  ngOnInit(): void {
    this.loadItems();
    this.loadCategories();
  }

  loadItems() {
    this.itemService.getAll().subscribe(data => this.items = data);
  }

  loadCategories() {
    this.categoryService.getAll().subscribe(data => this.categories = data);
  }

  onSubmit() {
    const formValue = this.itemForm.value;

    if (formValue.id) {
      // Update
      this.itemService.update(formValue.id, formValue).subscribe(() => {
        this.loadItems();
        this.resetForm();
      });
    } else {
      // Create
      this.itemService.create(formValue).subscribe(() => {
        this.loadItems();
        this.resetForm();
      });
    }
  }

  edit(item: MenuItem) {
    this.itemForm.patchValue(item);

    // Optional: Scroll to the form
    setTimeout(() => {
      this.formRef?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  delete(id: number) {
    if (confirm('Are you sure you want to delete this item?')) {
      this.itemService.delete(id).subscribe(() => this.loadItems());
    }
  }

  resetForm() {
    this.itemForm.reset({
      id: null,
      name: '',
      description: '',
      price: 0,
      available: true,
      category: null
    });
  }
}
