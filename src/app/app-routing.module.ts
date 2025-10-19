import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { MenuManagementComponent } from './features/admin/menu-management/menu-management.component';
import { ReportsComponent } from './features/admin/reports/reports.component';
import { StaffManagementComponent } from './features/admin/staff-management/staff-management.component';
import { HomeComponent } from './components/home/home.component';
import { MenuCategoryComponent } from './components/menu-category/menu-category.component';
import { MenuItemComponent } from './components/menu-item/menu-item.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { MenuComponent } from './components/menu/menu.component';
import { AdminCategoriesComponent } from './features/admin/admin-categories/admin-categories.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { AdminMenuComponent } from './features/admin/admin-menu/admin-menu.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  // { path: 'admin', component: DashboardComponent },
  // { path: 'admin/dashboard', component: DashboardComponent },
  { path: 'admin/menu-management', component: MenuManagementComponent },
  { path: 'admin/staff-management', component: StaffManagementComponent },
  { path: 'admin/reports', component: ReportsComponent },
  // { path: 'admin/categories', component: MenuCategoryComponent },
  { path: 'admin/items', component: MenuItemComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },

  // Admin routes
  {
    path: 'admin',
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'menu', component: AdminMenuComponent },
      { path: 'categories', component: AdminCategoriesComponent },
      // { path: 'orders', loadChildren: () => import('./admin/admin-orders/admin-orders.module').then(m => m.AdminOrdersModule) }
    ]
  },



  { path: '**', redirectTo: '' },


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
