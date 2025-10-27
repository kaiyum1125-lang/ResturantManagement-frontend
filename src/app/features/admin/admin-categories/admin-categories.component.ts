import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from 'src/app/services/category.service';
import { MenuCategory } from 'src/app/services/menu.service';


@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.scss']
})
export class AdminCategoriesComponent implements OnInit {
  categories: MenuCategory[] = [];
  filteredCategories: MenuCategory[] = [];
  searchTerm: string = '';
  
  categoryForm: FormGroup;
  isEditing: boolean = false;
  isSaving: boolean = false;
  selectedCategory: MenuCategory | null = null;
  
  showModal: boolean = false;
  showItemsModal: boolean = false;

  constructor(
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        console.log('Categories loaded:', categories);
        this.categories = categories;
        this.filteredCategories = [...categories];
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.showError('Failed to load categories');
      }
    });
  }

  filterCategories(): void {
    if (!this.searchTerm) {
      this.filteredCategories = [...this.categories];
    } else {
      this.filteredCategories = this.categories.filter(category =>
        category.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }
  }

  openCategoryModal(category?: MenuCategory): void {
    this.isEditing = !!category;
    this.selectedCategory = category || null;
    
    if (category) {
      this.categoryForm.patchValue({
        name: category.name,
        description: category.description || ''
      });
    } else {
      this.categoryForm.reset({
        name: '',
        description: ''
      });
    }
    
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.selectedCategory = null;
    this.categoryForm.reset();
    this.isSaving = false;
  }

  saveCategory(): void {
    console.log('Save category called');
    
    // Mark all fields as touched to trigger validation display
    Object.keys(this.categoryForm.controls).forEach(key => {
      this.categoryForm.get(key)?.markAsTouched();
    });

    if (this.categoryForm.invalid) {
      console.log('Form is invalid', this.categoryForm.errors);
      return;
    }

    this.isSaving = true;
    const formValue = this.categoryForm.value;
    
    // Prepare the category data for API
    const categoryData = {
      name: formValue.name.trim(),
      description: formValue.description?.trim() || ''
    };

    console.log('Saving category data:', categoryData);

    let request;
    if (this.isEditing && this.selectedCategory) {
      request = this.categoryService.updateCategory(this.selectedCategory.id, categoryData);
    } else {
      request = this.categoryService.createCategory(categoryData);
    }

    request.subscribe({
      next: (savedCategory) => {
        console.log('Category saved successfully:', savedCategory);
        
        if (this.isEditing && this.selectedCategory) {
          // Update existing category
          const index = this.categories.findIndex(cat => cat.id === savedCategory.id);
          if (index !== -1) {
            this.categories[index] = savedCategory;
          }
          this.showSuccess('Category updated successfully!');
        } else {
          // Add new category
          this.categories.push(savedCategory);
          this.showSuccess('Category created successfully!');
        }
        
        this.filterCategories();
        this.closeModal();
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Error saving category:', error);
        let errorMessage = 'Failed to save category';
        
        if (error.status === 400) {
          errorMessage = 'Invalid data. Please check your inputs.';
        } else if (error.status === 409) {
          errorMessage = 'A category with this name already exists.';
        }
        
        this.showError(errorMessage);
        this.isSaving = false;
      }
    });
  }

  editCategory(category: MenuCategory): void {
    this.openCategoryModal(category);
  }

  viewCategoryItems(category: MenuCategory): void {
    this.selectedCategory = category;
    this.showItemsModal = true;
  }

  closeItemsModal(): void {
    this.showItemsModal = false;
    this.selectedCategory = null;
  }

  deleteCategory(category: MenuCategory): void {
    if (this.hasItems(category)) {
      this.showError('Cannot delete category that contains menu items. Please remove or move the items first.');
      return;
    }

    if (confirm(`Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`)) {
      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => {
          this.categories = this.categories.filter(cat => cat.id !== category.id);
          this.filterCategories();
          this.showSuccess('Category deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          this.showError('Failed to delete category');
        }
      });
    }
  }

  getAvailableItemsCount(category: MenuCategory): number {
    return category.items?.filter(item => item.available).length || 0;
  }

  getUnavailableItemsCount(category: MenuCategory): number {
    return (category.items?.length || 0) - this.getAvailableItemsCount(category);
  }

  hasItems(category: MenuCategory): boolean {
    return !!(category.items && category.items.length > 0);
  }

  private showSuccess(message: string): void {
    // In a real app, use a toast service
    alert(message);
  }

  private showError(message: string): void {
    // In a real app, use a toast service
    alert('Error: ' + message);
  }
}