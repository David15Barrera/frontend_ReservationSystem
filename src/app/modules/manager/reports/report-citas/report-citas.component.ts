import { Component, inject } from '@angular/core';
import { ServiceService } from '../../utils/services/service.service';
import { EmployeeService } from '../../../common-user/utils/services/employe.service';
import { AppointmentService } from '../../../common-user/utils/services/appointment.service';
import { UserService } from '../../utils/services/user.service';
import { AppointmentDto } from '../../../common-user/utils/models/appointment.dto';
import { ServiceDto } from '../../utils/models/service.dto';
import { employeDto } from '../../../common-user/utils/models/employes.dto';
import { appointmentReportDto } from '../../utils/models/appointment.dto';
import { FormsModule } from '@angular/forms';
import { appointmentReportSendDto } from '../../utils/models/appointmentReportSendDto';

@Component({
  selector: 'app-report-citas',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './report-citas.component.html',
  styleUrl: './report-citas.component.scss'
})
export class ReportCitasComponent {

  appointments: AppointmentDto[] = []
  services: ServiceDto[] = [];
  employee: employeDto[] = []
  customers: employeDto[] = []
  appointmenReports: appointmentReportDto[] = []
  selectedFilter = 'all'
  totol = 0

  startDate = '2000-01-01';
  endDate = '2099-12-31';

  private readonly serviceService = inject(ServiceService)
  private readonly employeService = inject(EmployeeService)
  private readonly appointmentService = inject(AppointmentService)
  private readonly userService = inject(UserService)


  async ngOnInit() {
    await this.getEmployees();
    await this.getServices();
    await this.getAllAppointment();
    await this.getCustomers()
  }

  getAllAppointment(): Promise<void> {
    return new Promise((resolve) => {
      this.appointmentService.getAllAppointment().subscribe({
        next: value => {
          this.appointments = value;
          resolve();
        }
      });
    });
  }

  getServices(): Promise<void> {
    return new Promise((resolve) => {
      this.serviceService.getServicesAvailable().subscribe({
        next: value => {
          this.services = value;
          resolve();
        }
      });
    });
  }

  getEmployees(): Promise<void> {
    return new Promise((resolve) => {
      this.employeService.getEmployees().subscribe({
        next: value => {
          this.employee = value;
          resolve();
        }
      });
    });
  }

  getCustomers(): Promise<void> {
    return new Promise((resolve) => {
      this.userService.getAllCustomers().subscribe({
        next: value => {
          this.customers = value;
          resolve();
        }
      });
    });
  }

  getDateOnly(dateTime: string): string {
    return dateTime.split("T")[0];
  }

  getTimeOnly(dateTime: string): string {
    return dateTime.split("T")[1];
  }

  findCustormer(id: number): string {
    return this.customers.find(cus => cus.id === id)?.name || ''
  }

  findEmployee(id: number): string {
    return this.employee.find(cus => cus.id === id)?.name || ''
  }

  findService(id: number): ServiceDto | undefined {
    return this.services.find(cus => cus.id === id) || undefined
  }

  traducirEstad(estad: string): string {
    switch (estad) {
      case 'RESERVED':
        return 'RESERVADO'
      case 'COMPLETED':
        return 'COMPLETADO'
      case 'CANCELED':
        return 'CANCELED'
      default:
        return 'RESERVADO'

    }
  }

  prepararAppointmesReportTodos() {
    this.appointments.forEach(app => {
      const servi = this.findService(app.service)
      this.appointmenReports.push({
        fecha: this.getDateOnly(app.startDate),
        horaInicio: this.getTimeOnly(app.startDate),
        cliente: this.findCustormer(app.customer),
        estado: this.traducirEstad(app.status),
        servicio: servi?.name || '',
        empleado: this.findEmployee(app.employeeId),
        price: servi?.price || 0,
        appointment: app
      })
    })
  }

  prepararAppointmesReporfilter(filstro: string) {
    this.appointments.forEach(app => {
      if (filstro === app.status) {
        const servi = this.findService(app.service)
        this.appointmenReports.push({
          fecha: this.getDateOnly(app.startDate),
          horaInicio: this.getTimeOnly(app.startDate),
          cliente: this.findCustormer(app.customer),
          estado: this.traducirEstad(app.status),
          servicio: servi?.name || '',
          empleado: this.findEmployee(app.employeeId),
          price: servi?.price || 0,
          appointment: app
        })
      }
    })
  }

  calcluoTotal(){
    this.totol = 0
    this.appointmenReports.forEach(app =>{
      this.totol += app.price || 0
    })
  }


  realizarReport() {
    this.appointmenReports = []
    switch (this.selectedFilter) {
      case 'all':
        this.prepararAppointmesReportTodos()
        break;
      case 'completed':
        this.prepararAppointmesReporfilter('COMPLETED')
        break;
      case 'recerved':
        this.prepararAppointmesReporfilter('RESERVED')
        break;
      case 'canceled':
        this.prepararAppointmesReporfilter('CANCELED')
        break;
    }
    this.calcluoTotal()
  }

  exportPDf(){
    const send: appointmentReportSendDto = {
      items: this.appointmenReports,
      total: this.totol,
      rangeDate: this.startDate + ' - '+ this.endDate,
      filtro: this.appointmenReports[0].estado
    }
    this.appointmentService.downloadReport(send)
  }

  exportExcel(){
    const send: appointmentReportSendDto = {
      items: this.appointmenReports,
      total: this.totol,
      rangeDate: this.startDate + ' - '+ this.endDate,
      filtro: this.appointmenReports[0].estado
    }
    this.appointmentService.downloadReportSalesExcel(send)
  }


}
