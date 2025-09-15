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
import { ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home.component';

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
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule, // <-- Add this

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
