import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppointmentsAdminComponent } from './appointments-admin/appointments-admin.component';
import { BillingComponent } from './billing/billing.component';
import { BusinessComponent } from './business/business.component';
import { ClientsComponent } from './clients/clients.component';
import { EmployeesComponent } from './employees/employees.component';
import { SettingsComponent } from './settings/settings.component';
import { ServiceComponent } from './service/service.component';
import { EditServiceComponent } from './edit-service/edit-service.component';
import { BussingHourComponent } from './bussing-hour/bussing-hour.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReportCitasComponent } from './reports/report-citas/report-citas.component';
import { ReportClientesComponent } from './reports/report-clientes/report-clientes.component';
import { ReportEmpleadosComponent } from './reports/report-empleados/report-empleados.component';
import { ReportServicesComponent } from './reports/report-services/report-services.component';

const routes: Routes = [
  {
    path:'inicio', component: DashboardComponent
  },
  {
    path:'citas-admin', component: AppointmentsAdminComponent
  },
  { 
    path:'reportes', component: BillingComponent
  },
  {
    path:'config-negocio', component: BusinessComponent
  },
  {
    path:'edit-usuario', component: ClientsComponent
  },
  {
    path:'empleados', component: EmployeesComponent
  },
  {
    path:'configuracion', component: SettingsComponent
  },
  {
    path:'servicios', component: ServiceComponent
  },
  { path:'Hora/:idEmpresa', component: BussingHourComponent}
  ,
  {
    path: 'nuevo-servicio/:idservicio/:action', component: EditServiceComponent
  },
  { 
    path:'reportes/citas', component: ReportCitasComponent
  },
  { 
    path:'reportes/clientes', component: ReportClientesComponent
  },
  { 
    path:'reportes/empleados', component: ReportEmpleadosComponent
  },
  { 
    path:'reportes/servicios', component: ReportServicesComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagerRoutingModule { }
