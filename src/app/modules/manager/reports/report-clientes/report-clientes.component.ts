import { Component, inject } from '@angular/core';
import { AppointmentDto } from '../../../common-user/utils/models/appointment.dto';
import { ServiceDto } from '../../utils/models/service.dto';
import { employeDto } from '../../../common-user/utils/models/employes.dto';
import { appointmentReportDto } from '../../utils/models/appointment.dto';
import { ServiceService } from '../../utils/services/service.service';
import { EmployeeService } from '../../../common-user/utils/services/employe.service';
import { AppointmentService } from '../../../common-user/utils/services/appointment.service';
import { UserService } from '../../utils/services/user.service';
import { appointmentReportSendDto } from '../../utils/models/appointmentReportSendDto';
import { FormsModule } from '@angular/forms';
import { clienteReportItem, clietnReportSend } from '../../utils/models/clienteReportItems';
import { CancellationSurchargeDto } from '../../utils/models/cancellationDto';
import { CancellarionService } from '../../utils/services/cancellarion.service';

@Component({
  selector: 'app-report-clientes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './report-clientes.component.html',
  styleUrl: './report-clientes.component.scss'
})
export class ReportClientesComponent {

  appointments: AppointmentDto[] = []
  customers: employeDto[] = []
  clientReport: clienteReportItem[] = []
  selectedFilter = 'Todos'
  totol = 0
  cancellarions: CancellationSurchargeDto[] = []

  startDate = '2000-01-01';
  endDate = '2099-12-31';


  private readonly appointmentService = inject(AppointmentService)
  private readonly cancellationService = inject(CancellarionService)
  private readonly userService = inject(UserService)


  async ngOnInit() {
    await this.getAllAppointment();
    await this.getCustomers()
    await this.getAllCancellarion()
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

  getAllCancellarion(): Promise<void> {
    return new Promise((resolve) => {
      this.cancellationService.getAllCancellation().subscribe({
        next: value => {
          this.cancellarions = value;
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
    this.customers.forEach(cus => {
      let cantidad = 0
      this.appointments.forEach(app => {
        if (cus.id === app.customer) {
          cantidad++;
        }
      })
      this.clientReport.push({
        Cantidad: cantidad,
        cui: cus.cui,
        email: cus.email,
        Nombre: cus.name
      })
    })
  }

  getCustomerIdCancellation(id: number): number {
    return this.cancellarions.find(cna => cna.customer === id)?.customer || 0
  }

  prepararAppointmesReporfilter() {
    this.customers.forEach(cus => {
      if (this.getCustomerIdCancellation(cus.id)) {
        let cantidad = 0
        this.appointments.forEach(app => {
          if (cus.id === app.customer) {
            cantidad++;
          }
        })
        this.clientReport.push({
          Cantidad: cantidad,
          cui: cus.cui,
          email: cus.email,
          Nombre: cus.name
        })
      }
    })
  }


  realizarReport() {
    this.clientReport = []
    switch (this.selectedFilter) {
      case 'Todos':
        this.prepararAppointmesReportTodos()
        break;
      case 'Mal-Uso':
        this.prepararAppointmesReporfilter()
        break;
    }
  }

  exportPDf() {
    const send: clietnReportSend = {
      items: this.clientReport,
      rangeDate: this.startDate + ' - ' + this.endDate,
      filtro: this.selectedFilter
    }
    this.cancellationService.downloadReport(send)

  }

  exportExcel(){
    const send: clietnReportSend = {
      items: this.clientReport,
      rangeDate: this.startDate + ' - ' + this.endDate,
      filtro: this.selectedFilter
    }
    this.cancellationService.downloadReportSalesExcel(send)
  }

}
