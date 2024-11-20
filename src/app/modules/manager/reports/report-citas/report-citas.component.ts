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
import html2canvas from 'html2canvas'
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
  currentDate: any;


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

  exportPNG() {
    const tableElement = document.querySelector('.table-container table') as HTMLElement;
    if (tableElement) {
      html2canvas(tableElement).then((canvas) => {
        // Crear un nuevo canvas con dimensiones de hoja carta
        const reportCanvas = document.createElement('canvas');
        const context = reportCanvas.getContext('2d');
  
        // Dimensiones para hoja carta en píxeles (96 DPI)
        const letterWidth = 816; // 8.5 pulgadas * 96 DPI
        const letterHeight = 1056; // 11 pulgadas * 96 DPI
        const headerHeight = 200; // Altura fija del encabezado
  
        // Configurar dimensiones del canvas combinado
        reportCanvas.width = letterWidth;
        reportCanvas.height = letterHeight;
  
        if (context) {
          // Fondo blanco
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, reportCanvas.width, reportCanvas.height);
  
          // Estilo del texto
          context.fillStyle = '#000000';
          context.font = 'bold 24px Arial'; // Título principal
          context.textAlign = 'left';
  
          // Dibujar encabezado
          let yPosition = 30;
          const marginLeft = 20; // Margen izquierdo estándar
  
          context.fillText('Reporte de Citas', marginLeft, yPosition);
          yPosition += 30;
          context.font = 'bold 18px Arial'; // Subtítulos
          context.fillText('Estetica ALMA 2', marginLeft, yPosition);
          yPosition += 30;
          context.font = '16px Arial'; // Texto normal
          context.fillText('Detalles del Reporte', marginLeft, yPosition);
          yPosition += 20;
          context.fillText(`Fecha del reporte: 2024-11-19`, marginLeft, yPosition);
          yPosition += 20;
          context.fillText('Tipo Reporte: Reporte de Citas', marginLeft, yPosition);
          yPosition += 20;
          context.fillText('Periodo: 2000-01-01 - 2099-12-31', marginLeft, yPosition);
          yPosition += 30; // Espaciado
  
          // Filtros aplicados
          context.font = 'bold 18px Arial'; // Subtítulos
          context.fillText('Filtros Aplicados', marginLeft, yPosition);
          yPosition += 20;
          context.font = '16px Arial'; // Texto normal
          context.fillText('Cantidad: 3', marginLeft, yPosition);
          yPosition += 20;
          context.fillText('Tipo Criterio: COMPLETADO', marginLeft, yPosition);
          yPosition += 40; // Espaciado antes de la tabla
  
          // Ajustar el ancho de la tabla al ancho de la hoja carta
          const scale = letterWidth / canvas.width; // Escalar ancho de tabla al ancho de la hoja
          const scaledHeight = canvas.height * scale;
  
          if (yPosition + scaledHeight > letterHeight) {
            console.warn('El contenido excede el alto de la hoja carta.');
          }
  
          // Dibujar la tabla capturada debajo del encabezado
          context.drawImage(canvas, 0, yPosition, letterWidth, scaledHeight);
  
          // Crear un enlace para descargar la imagen
          const link = document.createElement('a');
          link.download = 'reporte-citas.png';
          link.href = reportCanvas.toDataURL('image/png');
          link.click();
        }
      }).catch((error) => {
        console.error('Error al exportar PNG:', error);
      });
    } else {
      console.error('No se encontró el elemento de la tabla.');
    }
  }
  


}
