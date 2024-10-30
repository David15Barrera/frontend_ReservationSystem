import { Component, inject } from '@angular/core';
import { AppointmentDto } from '../../../common-user/utils/models/appointment.dto';
import { ServiceDto, ServiceItemDto, ServiceSendDto } from '../../utils/models/service.dto';
import { ServiceService } from '../../utils/services/service.service';
import { AppointmentService } from '../../../common-user/utils/services/appointment.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report-services',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './report-services.component.html',
  styleUrl: './report-services.component.scss'
})
export class ReportServicesComponent {

  appointments: AppointmentDto[] = []
  services: ServiceDto[] = [];
  serviceReport: ServiceItemDto[] = []
  selectedFilter = 'Todos'
  totol = 0

  startDate = '2000-01-01';
  endDate = '2099-12-31';

  private readonly serviceService = inject(ServiceService)
  private readonly appointmentService = inject(AppointmentService)


  async ngOnInit() {
    await this.getServices();
    await this.getAllAppointment();
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



  getDateOnly(dateTime: string): string {
    return dateTime.split("T")[0];
  }

  getTimeOnly(dateTime: string): string {
    return dateTime.split("T")[1];
  }


  findService(id: number): ServiceDto | undefined {
    return this.services.find(cus => cus.id === id) || undefined
  }

  traducirEstad(estad: string): string {
    switch (estad) {
      case 'AVAILABLE':
        return 'DISPONIBLE'
      case 'UNAVAILABLE':
        return 'NO-DISPONIBLE'
      default:
        return 'ELIMINADO'

    }
  }

  clacTotoal(){
    this.serviceReport.forEach(ser =>{
      this.totol += ser.citas
    })
  }

  prepararAppointmesReportTodos() {
    this.services.forEach(ser => {
      let citas = 0
      this.appointments.forEach(app => {
        if (app.service === ser.id) {
          citas++
        }
      })
      this.serviceReport.push({
        citas: citas,
        description: ser.description,
        duration: ser.duration,
        name: ser.name,
        price: ser.price,
        status: this.traducirEstad(ser.status)
      })
    })
    this.clacTotoal()
  }

  prepararAppointmesReporfilter(filstro: string) {
    this.services.forEach(ser => {
      if (filstro === ser.status) {
        let citas = 0
        this.appointments.forEach(app => {
          if (app.service === ser.id) {
            citas++
          }
        })
        this.serviceReport.push({
          citas: citas,
          description: ser.description,
          duration: ser.duration,
          name: ser.name,
          price: ser.price,
          status: this.traducirEstad(ser.status)
        })
      }
    })
    this.clacTotoal()
  }




  realizarReport() {
    this.serviceReport = []
    switch (this.selectedFilter) {
      case 'Todos':
        this.prepararAppointmesReportTodos()
        break;
      case 'Disponible':
        this.prepararAppointmesReporfilter('AVAILABLE')
        break;
      case 'No-Disponibles':
        this.prepararAppointmesReporfilter('UNAVAILABLE')
        break;
    }
  }

  exportPDf() {
    const send: ServiceSendDto = {
      items: this.serviceReport,
      total: this.totol,
      rangeDate: this.startDate + ' - ' + this.endDate,
      filtro: this.selectedFilter
    }
    this.serviceService.downloadReport(send)
  }

  exportExcel(){
    const send: ServiceSendDto = {
      items: this.serviceReport,
      total: this.totol,
      rangeDate: this.startDate + ' - ' + this.endDate,
      filtro: this.selectedFilter
    }
    this.serviceService.downloadReportSalesExcel(send)
  }


}
