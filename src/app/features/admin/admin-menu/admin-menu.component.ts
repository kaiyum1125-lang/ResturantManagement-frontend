import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from 'src/app/services/category.service';
import { MenuCategory } from 'src/app/services/menu-category.service';
import { MenuItem } from 'src/app/services/menu-item.service';
import { MenuService } from 'src/app/services/menu.service';


@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.scss']
})
export class AdminMenuComponent implements OnInit {
  menuItems: MenuItem[] = [];
  filteredItems: MenuItem[] = [];
  categories: MenuCategory[] = [];
  
  searchTerm: string = '';
  selectedCategory: string = '';
  availabilityFilter: string = '';
  
  menuItemForm: FormGroup;
  isEditing: boolean = false;
  isSaving: boolean = false;
  isDeleting: boolean = false;
  selectedMenuItem: MenuItem | null = null;
  
  showModal: boolean = false;
  showDeleteModal: boolean = false;

  constructor(
    private menuService: MenuService,
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {
    this.menuItemForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      categoryId: ['', Validators.required],
      imageUrl: [''],
      available: [true]
    });
  }

  ngOnInit(): void {
    this.loadMenuItems();
    this.loadCategories();
  }

  loadMenuItems(): void {
    this.menuService.getAllMenuItems().subscribe({
      next: (items) => {
        this.menuItems = items;
        console.log("-----------------",         this.menuItems[0].available);
        
        this.filteredItems = [...items];
      },
      error: (error) => {
        console.error('Error loading menu items:', error);
        this.showError('Failed to load menu items');
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  filterMenuItems(): void {
    this.filteredItems = this.menuItems.filter(item => {
      const matchesSearch = !this.searchTerm || 
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesCategory = !this.selectedCategory || 
        item.category?.id.toString() === this.selectedCategory;
      
      const matchesAvailability = !this.availabilityFilter || 
        (this.availabilityFilter === 'available' && item.available) ||
        (this.availabilityFilter === 'unavailable' && !item.available);
      
      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.availabilityFilter = '';
    this.filterMenuItems();
  }

  openMenuItemModal(item?: MenuItem): void {
    this.isEditing = !!item;
    this.selectedMenuItem = item || null;
    
    if (item) {
      this.menuItemForm.patchValue({
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId: item.category?.id,
        imageUrl: item.imageUrl,
        available: item.available
      });
    } else {
      this.menuItemForm.reset({
        name: '',
        description: '',
        price: 0,
        categoryId: '',
        imageUrl: '',
        available: true
      });
    }
    
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.selectedMenuItem = null;
    this.menuItemForm.reset();
  }

  saveMenuItem(): void {
    if (this.menuItemForm.invalid) return;

    this.isSaving = true;
    const formValue = this.menuItemForm.value;
    const menuItemData: any = {
      name: formValue.name,
      description: formValue.description,
      price: formValue.price,
      imageUrl: formValue.imageUrl,
      available: formValue.available,
      category: { id: formValue.categoryId }
    };

    const request = this.isEditing && this.selectedMenuItem
      ? this.menuService.updateMenuItem(this.selectedMenuItem.id, menuItemData)
      : this.menuService.createMenuItem(menuItemData);

    request.subscribe({
      next: (savedItem) => {
        if (this.isEditing && this.selectedMenuItem) {
          const index = this.menuItems.findIndex(item => item.id === savedItem.id);
          if (index !== -1) {
            this.menuItems[index] = savedItem;
          }
          this.showSuccess('Menu item updated successfully!');
        } else {
          this.menuItems.push(savedItem);
          this.showSuccess('Menu item created successfully!');
        }
        
        this.filterMenuItems();
        this.closeModal();
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Error saving menu item:', error);
        this.showError('Failed to save menu item');
        this.isSaving = false;
      }
    });
  }

  editMenuItem(item: MenuItem): void {
    this.openMenuItemModal(item);
  }

  toggleAvailability(item: MenuItem): void {
    // const updatedItem = { ...item, available: !item.available, category: { id: item.category.id } };

  // const updateData = {
  //   name: item.name,
  //   description: item.description,
  //   price: item.price,
  //   available: !item.available, // Toggle the availability
  //   imageUrl: item.imageUrl,
  //   category: item.category ? { id: item.category.id } : null
  // };
  const updatedItem = {
    ...item,
    available: !item.available, // Use 'available' instead of 'available'
    category: item.category ? { id: item.category.id } : null // Handle case where category might be null
  };

  console.log('Toggling availability for item:', item.id, 'New status:', !item.available);
  console.log('Sending update data:', updatedItem);

    this.menuService.updateMenuItem(item.id, updatedItem).subscribe({
      next: (result) => {
        const index = this.menuItems.findIndex(i => i.id === item.id);
        if (index !== -1) {
          this.menuItems[index] = result;
        }
        this.filterMenuItems();
        this.showSuccess(`Item ${result.available ? 'enabled' : 'disabled'} successfully`);
      },
      error: (error) => {
        console.error('Error updating availability:', error);
        this.showError('Failed to update availability');
      }
    });
  }

  deleteMenuItem(item: MenuItem): void {
    this.selectedMenuItem = item;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedMenuItem = null;
    this.isDeleting = false;
  }

  confirmDelete(): void {
    if (!this.selectedMenuItem) return;

    this.isDeleting = true;
    this.menuService.deleteMenuItem(this.selectedMenuItem.id).subscribe({
      next: () => {
        this.menuItems = this.menuItems.filter(item => item.id !== this.selectedMenuItem?.id);
        this.filterMenuItems();
        this.closeDeleteModal();
        this.showSuccess('Menu item deleted successfully!');
      },
      error: (error) => {
        console.error('Error deleting menu item:', error);
        this.showError('Failed to delete menu item');
        this.isDeleting = false;
      }
    });
  }

  handleImageError(event: any): void {
    event.target.src = 'assets/default-food.jpg';
  }

  handlePreviewImageError(event: any): void {
    event.target.style.display = 'none';
  }

  private showSuccess(message: string): void {
    // You can implement a toast notification service here
    alert(message);
  }

  private showError(message: string): void {
    // You can implement a toast notification service here
    alert(message);
  }
}