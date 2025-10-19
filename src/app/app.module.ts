import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { MenuManagementComponent } from './features/admin/menu-management/menu-management.component';
import { StaffManagementComponent } from './features/admin/staff-management/staff-management.component';
import { ReportsComponent } from './features/admin/reports/reports.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { MenuCategoryComponent } from './components/menu-category/menu-category.component';
import { MenuItemComponent } from './components/menu-item/menu-item.component';
import { MenuComponent } from './components/menu/menu.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { AdminMenuComponent } from './features/admin/admin-menu/admin-menu.component';
import { AdminCategoriesComponent } from './features/admin/admin-categories/admin-categories.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    DashboardComponent,
    MenuManagementComponent,
    StaffManagementComponent,
    ReportsComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    MenuCategoryComponent,
    MenuItemComponent,
    MenuComponent,
    AboutComponent,
    ContactComponent,
    AdminMenuComponent,
    AdminCategoriesComponent,
    AdminDashboardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule, 
    FormsModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
