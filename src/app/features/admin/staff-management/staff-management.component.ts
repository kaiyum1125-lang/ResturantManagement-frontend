import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Staff {
  id: number;
  name: string;
  role: string;
  email: string;
}

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

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.staffForm = this.fb.group({
      name: ['', Validators.required],
      role: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submitForm(): void {
    if (this.staffForm.invalid) return;

    const data = this.staffForm.value;

    if (this.editMode && this.editId !== null) {
      const index = this.staffList.findIndex(s => s.id === this.editId);
      if (index !== -1) {
        this.staffList[index] = { id: this.editId, ...data };
      }
    } else {
      const newStaff: Staff = {
        id: Date.now(),
        ...data
      };
      this.staffList.push(newStaff);
    }

    this.resetForm();
  }

  editStaff(staff: Staff): void {
    this.editMode = true;
    this.editId = staff.id;
    this.staffForm.patchValue(staff);
  }

  deleteStaff(staff: Staff): void {
    if (confirm(`Are you sure you want to delete ${staff.name}?`)) {
      this.staffList = this.staffList.filter(s => s.id !== staff.id);
    }
  }

  resetForm(): void {
    this.editMode = false;
    this.editId = null;
    this.staffForm.reset();
  }
}
