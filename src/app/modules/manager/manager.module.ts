import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManagerRoutingModule } from './manager-routing.module';
import { AppointmentsAdminComponent } from './appointments-admin/appointments-admin.component';
import { BillingComponent } from './billing/billing.component';
import { BusinessComponent } from './business/business.component';
import { ClientsComponent } from './clients/clients.component';
import { EmployeesComponent } from './employees/employees.component';
import { SettingsComponent } from './settings/settings.component';
import { GraphicsComponent } from './graphics/graphics.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ManagerRoutingModule,
    AppointmentsAdminComponent,
    BillingComponent,
    BusinessComponent,
    ClientsComponent,
    EmployeesComponent,
    SettingsComponent,
    GraphicsComponent
  ]
})
export class ManagerModule { }
