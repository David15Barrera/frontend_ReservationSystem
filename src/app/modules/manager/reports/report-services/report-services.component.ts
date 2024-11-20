import { Component, inject } from '@angular/core';
import { AppointmentDto } from '../../../common-user/utils/models/appointment.dto';
import { ServiceDto, ServiceItemDto, ServiceSendDto } from '../../utils/models/service.dto';
import { ServiceService } from '../../utils/services/service.service';
import { AppointmentService } from '../../../common-user/utils/services/appointment.service';
import { FormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
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
  
          context.fillText('Reporte de Servicios', marginLeft, yPosition);
          yPosition += 30;
          context.font = 'bold 18px Arial'; // Subtítulos
          context.fillText('Estetica ALMA 2', marginLeft, yPosition);
          yPosition += 30;
          context.font = '16px Arial'; // Texto normal
          context.fillText('Detalles del Reporte', marginLeft, yPosition);
          yPosition += 20;
          context.fillText(`Fecha del reporte: 2024-11-19`, marginLeft, yPosition);
          yPosition += 20;
          context.fillText('Tipo Reporte: Reporte de Servicios', marginLeft, yPosition);
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
          link.download = 'reporte-Servicios.png';
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
