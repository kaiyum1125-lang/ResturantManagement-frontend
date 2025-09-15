import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { MenuManagementComponent } from './features/admin/menu-management/menu-management.component';
import { ReportsComponent } from './features/admin/reports/reports.component';
import { StaffManagementComponent } from './features/admin/staff-management/staff-management.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'admin', component: DashboardComponent },
  { path: 'admin/dashboard', component: DashboardComponent },
  { path: 'admin/menu-management', component: MenuManagementComponent },
  { path: 'admin/staff-management', component: StaffManagementComponent },
  { path: 'admin/reports', component: ReportsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
