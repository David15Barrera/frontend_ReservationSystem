import { Component, inject } from '@angular/core';
import { AppointmentDto } from '../../../common-user/utils/models/appointment.dto';
import { employeDto } from '../../../common-user/utils/models/employes.dto';
import { clienteReportItem, clietnReportSend } from '../../utils/models/clienteReportItems';
import { CancellationSurchargeDto } from '../../utils/models/cancellationDto';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../common-user/utils/services/appointment.service';
import { CancellarionService } from '../../utils/services/cancellarion.service';
import { UserService } from '../../utils/services/user.service';
import { EmployeeService } from '../../../common-user/utils/services/employe.service';
import html2canvas from 'html2canvas';
@Component({
  selector: 'app-report-empleados',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './report-empleados.component.html',
  styleUrl: './report-empleados.component.scss'
})
export class ReportEmpleadosComponent {

  appointments: AppointmentDto[] = []
  employees: employeDto[] = []
  clientReport: clienteReportItem[] = []
  selectedFilter = 'Todos'
  totol = 0
  cancellarions: CancellationSurchargeDto[] = []

  startDate = '2000-01-01';
  endDate = '2099-12-31';


  private readonly appointmentService = inject(AppointmentService)
  private readonly cancellationService = inject(CancellarionService)
  private readonly employeService = inject(EmployeeService)
  private readonly userService = inject(UserService)


  async ngOnInit() {
    await this.getAllAppointment();
    await this.getEmployees()
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


  getEmployees(): Promise<void> {
    return new Promise((resolve) => {
      this.employeService.getEmployees().subscribe({
        next: value => {
          this.employees = value;
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
    return this.employees.find(cus => cus.id === id)?.name || ''
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
    this.employees.forEach(cus => {
      let cantidad = 0
      this.appointments.forEach(app => {
        if (cus.id === app.employeeId) {
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


  prepararAppointmesReporfilter() {
    this.employees.forEach(cus => {
      let cantidad = 0
      this.cancellarions.forEach(app => {
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

  exportExcel() {
    const send: clietnReportSend = {
      items: this.clientReport,
      rangeDate: this.startDate + ' - ' + this.endDate,
      filtro: this.selectedFilter
    }
    this.cancellationService.downloadReportSalesExcel(send)
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
  
          context.fillText('Reporte de Empleados', marginLeft, yPosition);
          yPosition += 30;
          context.font = 'bold 18px Arial'; // Subtítulos
          context.fillText('Estetica ALMA 2', marginLeft, yPosition);
          yPosition += 30;
          context.font = '16px Arial'; // Texto normal
          context.fillText('Detalles del Reporte', marginLeft, yPosition);
          yPosition += 20;
          context.fillText(`Fecha del reporte: 2024-11-19`, marginLeft, yPosition);
          yPosition += 20;
          context.fillText('Tipo Reporte: Reporte de Empleado', marginLeft, yPosition);
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
          link.download = 'reporte-Empleado.png';
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
