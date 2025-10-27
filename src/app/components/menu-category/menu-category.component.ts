import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuCategoryService } from 'src/app/services/menu-category.service';
import { MenuCategory } from 'src/app/services/menu.service';

@Component({
  selector: 'app-menu-category',
  templateUrl: './menu-category.component.html',
})
export class MenuCategoryComponent implements OnInit {
  categoryForm!: FormGroup;
  categories: MenuCategory[] = [];

  constructor(
    private fb: FormBuilder,
    private categoryService: MenuCategoryService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  initForm(): void {
    this.categoryForm = this.fb.group({
      id: [],
      name: ['', Validators.required],
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe((data) => {
      this.categories = data;
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) return;

    const formValue = this.categoryForm.value;

    if (formValue.id) {
      this.categoryService.update(formValue.id, formValue).subscribe(() => {
        this.loadCategories();
        this.categoryForm.reset();
      });
    } else {
      this.categoryService.create(formValue).subscribe(() => {
        this.loadCategories();
        this.categoryForm.reset();
      });
    }
  }

  edit(category: MenuCategory): void {
    this.categoryForm.patchValue(category);
  }

  delete(id: number): void {
    if (confirm('Are you sure to delete this category?')) {
      this.categoryService.delete(id).subscribe(() => this.loadCategories());
    }
  }
}
