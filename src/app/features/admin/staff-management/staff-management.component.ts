import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Staff, StaffService } from 'src/app/services/staff.service';

@Component({
  selector: 'app-staff-management',
  templateUrl: './staff-management.component.html',
  styleUrls: ['./staff-management.component.scss']
})
export class StaffManagementComponent implements OnInit {
  staffForm!: FormGroup;
  staffList: Staff[] = [];
  editMode = false;
  editId: number | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private staffService: StaffService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadStaff();
  }

  initializeForm(): void {
    this.staffForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      role: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  loadStaff(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.staffService.getAllStaff().subscribe({
      next: (data) => {
        this.staffList = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading staff:', error);
        this.errorMessage = 'Failed to load staff data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  submitForm(): void {
    if (this.staffForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const staffData: Staff = this.staffForm.value;
    this.isLoading = true;
    this.errorMessage = '';

    if (this.editMode && this.editId !== null) {
      // Update existing staff
      this.staffService.updateStaff(this.editId, staffData).subscribe({
        next: (updatedStaff) => {
          const index = this.staffList.findIndex(s => s.id === updatedStaff.id);
          if (index !== -1) {
            this.staffList[index] = updatedStaff;
          }
          this.showSuccess('Staff member updated successfully!');
          this.resetForm();
        },
        error: (error) => {
          console.error('Error updating staff:', error);
          this.errorMessage = 'Failed to update staff member. Please try again.';
          this.isLoading = false;
        }
      });
    } else {
      // Create new staff
      this.staffService.createStaff(staffData).subscribe({
        next: (newStaff) => {
          this.staffList.push(newStaff);
          this.showSuccess('Staff member added successfully!');
          this.resetForm();
        },
        error: (error) => {
          console.error('Error creating staff:', error);
          this.errorMessage = 'Failed to add staff member. Please try again.';
          this.isLoading = false;
        }
      });
    }
  }

  editStaff(staff: Staff): void {
    this.editMode = true;
    this.editId = staff.id!;
    this.staffForm.patchValue({
      name: staff.name,
      role: staff.role,
      email: staff.email
    });
    
    // Scroll to form
    const formElement = document.querySelector('form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  deleteStaff(staff: Staff): void {
    if (confirm(`Are you sure you want to delete ${staff.name}? This action cannot be undone.`)) {
      this.isLoading = true;
      this.staffService.deleteStaff(staff.id!).subscribe({
        next: () => {
          this.staffList = this.staffList.filter(s => s.id !== staff.id);
          this.showSuccess('Staff member deleted successfully!');
          if (this.editMode && this.editId === staff.id) {
            this.resetForm();
          }
        },
        error: (error) => {
          console.error('Error deleting staff:', error);
          this.errorMessage = 'Failed to delete staff member. Please try again.';
          this.isLoading = false;
        }
      });
    }
  }

  resetForm(): void {
    this.editMode = false;
    this.editId = null;
    this.staffForm.reset();
    this.errorMessage = '';
    this.isLoading = false;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.staffForm.controls).forEach(key => {
      this.staffForm.get(key)?.markAsTouched();
    });
  }

  private showSuccess(message: string): void {
    alert(message); // You can replace this with a toast notification
    this.isLoading = false;
  }

  // Form field getters for easy access in template
  get name() { return this.staffForm.get('name'); }
  get role() { return this.staffForm.get('role'); }
  get email() { return this.staffForm.get('email'); }
}