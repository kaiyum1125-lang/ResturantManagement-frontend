import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuCategoryService } from 'src/app/services/menu-category.service';
import { MenuItemService } from 'src/app/services/menu-item.service';
import { MenuItem, MenuCategory } from 'src/app/services/menu.service';


@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss']
})
export class MenuItemComponent implements OnInit {
  itemForm: FormGroup;
  items: MenuItem[] = [];
  categories: MenuCategory[] = [];
  isLoading: boolean = false;
  isEditMode: boolean = false;
  alertMessage: string = '';
  alertType: string = 'alert-success';

  constructor(
    private fb: FormBuilder,
    private menuItemService: MenuItemService,
    private menuCategoryService: MenuCategoryService
  ) {
    this.itemForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadItems();
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(1)]],
      available: [true],
      imageUrl: [''],
      category: [null, Validators.required] // Keep as null for object binding
    });
  }

  loadItems(): void {
    this.isLoading = true;
    this.menuItemService.getAll().subscribe({
      next: (data) => {
        this.items = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading items:', error);
        this.showAlert('আইটেম লোড করতে সমস্যা হয়েছে', 'alert-danger');
        this.isLoading = false;
      }
    });
  }

  loadCategories(): void {
    this.menuCategoryService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.showAlert('ক্যাটাগরি লোড করতে সমস্যা হয়েছে', 'alert-danger');
      }
    });
  }

  onSubmit(): void {
    // Force validation check
    this.markAllFieldsAsTouched();
    
    if (this.itemForm.invalid) {
      console.log('Form invalid. Category value:', this.itemForm.get('category')?.value);
      this.showAlert('দয়া করে সকল প্রয়োজনীয় তথ্য প্রদান করুন', 'alert-danger');
      return;
    }

    this.isLoading = true;
    const formData = this.itemForm.value;

    const menuItem: MenuItem = {
      id: formData.id,
      name: formData.name,
      description: formData.description,
      price: formData.price,
      available: formData.available,
      imageUrl: formData.imageUrl || 'assets/images/default-food.jpg',
      category: formData.categor,
      isPopular: undefined,
      isSpicy: undefined,
      cookingTime: undefined
    };

    if (this.isEditMode) {
      this.updateItem(menuItem);
    } else {
      this.createItem(menuItem);
    }
  }

  createItem(item: MenuItem): void {
    this.menuItemService.create(item).subscribe({
      next: (newItem) => {
        this.items.push(newItem);
        this.resetForm();
        this.showAlert('আইটেম সফলভাবে যোগ হয়েছে!', 'alert-success');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating item:', error);
        this.showAlert('আইটেম তৈরি করতে সমস্যা হয়েছে', 'alert-danger');
        this.isLoading = false;
      }
    });
  }

  updateItem(item: MenuItem): void {
    this.menuItemService.update(item.id!, item).subscribe({
      next: (updatedItem) => {
        const index = this.items.findIndex(i => i.id === updatedItem.id);
        if (index !== -1) {
          this.items[index] = updatedItem;
        }
        this.resetForm();
        this.showAlert('আইটেম সফলভাবে আপডেট হয়েছে!', 'alert-success');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating item:', error);
        this.showAlert('আইটেম আপডেট করতে সমস্যা হয়েছে', 'alert-danger');
        this.isLoading = false;
      }
    });
  }

  editItem(item: MenuItem): void {
    this.itemForm.patchValue({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      available: item.available,
      imageUrl: item.imageUrl,
      category: item.category
    });
    this.isEditMode = true;
  }

  deleteItem(id: number): void {
    if (confirm('আপনি কি নিশ্চিত যে আপনি এই আইটেমটি ডিলিট করতে চান?')) {
      this.isLoading = true;
      this.menuItemService.delete(id).subscribe({
        next: () => {
          this.items = this.items.filter(item => item.id !== id);
          this.showAlert('আইটেম সফলভাবে ডিলিট হয়েছে!', 'alert-success');
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting item:', error);
          this.showAlert('আইটেম ডিলিট করতে সমস্যা হয়েছে', 'alert-danger');
          this.isLoading = false;
        }
      });
    }
  }

  resetForm(): void {
    this.itemForm.reset({
      id: null,
      name: '',
      description: '',
      price: 0,
      available: true,
      imageUrl: '',
      category: null
    });
    this.isEditMode = false;
  }

  showFieldError(fieldName: string): boolean {
    const field = this.itemForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  markAllFieldsAsTouched(): void {
    Object.keys(this.itemForm.controls).forEach(key => {
      this.itemForm.get(key)?.markAsTouched();
    });
  }

  showAlert(message: string, type: string): void {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => this.clearAlert(), 5000);
  }

  clearAlert(): void {
    this.alertMessage = '';
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/default-food.jpg';
  }
}