import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component, inject, OnInit } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AppointmentDto } from '../../common-user/utils/models/appointment.dto';
import { ServiceDto, ServiceItemDto } from '../utils/models/service.dto';
import { ServiceService } from '../utils/services/service.service';
import { AppointmentService } from '../../common-user/utils/services/appointment.service';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { FormsModule } from '@angular/forms';
import { NgModel } from '@angular/forms';
import { appointmentReportDto } from '../utils/models/appointment.dto';
import { employeDto } from '../../common-user/utils/models/employes.dto';
import { EmployeeService } from '../../common-user/utils/services/employe.service';
import { UserService } from '../utils/services/user.service';
import { appointmentReportSendDto } from '../utils/models/appointmentReportSendDto';
import { clienteReportItem } from '../utils/models/clienteReportItems';
import { CancellationSurchargeDto } from '../utils/models/cancellationDto';
import { CancellarionService } from '../utils/services/cancellarion.service';

@Component({
  selector: 'app-graphics',
  standalone: true,
  imports: [NgxChartsModule, CommonModule, FormsModule],
  templateUrl: './graphics.component.html',
  styleUrl: './graphics.component.scss'
})
export class GraphicsComponent   implements OnInit {
  appointments: any[] = [];
  appointmenReports: any[] = [];

  appointmentsEmp: AppointmentDto[] = []
  employeesEmp: employeDto[] = []
  clientReportEmp: clienteReportItem[] = []
  selectedFilterEmp = 'Todos'
  totolEmp = 0
  cancellarionsEmp: CancellationSurchargeDto[] = []

  serviceReport: any[] = [];
  clientReport: any[] = [];
  services: any[] = [];
  employees: any[] = [];
  cancellarions: any[] = [];

  chartWidth = Math.min(window.innerWidth * 0.9, 600);
  chartHeight = 300;  
  
  selectedFilter = 'all'; // Filtro de citas
  selectedEmployeeFilter = 'Todos'; // Filtro de empleados
  selectedServiceFilter = 'Todos'; // Filtro de servicios
  total = 0;
  chartData: any[] = [];
  startDate = '2000-01-01';
  endDate = '2099-12-31';

  // Nuevas variables
  clientDistributionChartData: any[] = [];
  cancellationChartData: any[] = [];
  cancellationRate: number = 0;

  private readonly serviceService = inject(ServiceService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly cancellationService = inject(CancellarionService)
  private readonly employeService = inject(EmployeeService)
  activeTab = 0;
  tabs = [
    { label: 'Citas', data: 'appointmenReports' },
    { label: 'Servicios', data: 'serviceReport' },
    { label: 'Empleados', data: 'clientReport' },
  ];

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

// Configuración de colores para las gráficas
clientDistributionColorScheme: Color = {
  name: 'clientDistribution',
  selectable: true,
  group: ScaleType.Ordinal,
  domain: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b']
};

cancellationColorScheme: Color = {
  name: 'cancellationRate',
  selectable: true,
  group: ScaleType.Ordinal,
  domain: ['#e53935', '#43a047']
};

  async ngOnInit() {
    await this.getAllAppointmentCitas();
    await this.getServicesService();
    await this.getAllAppointmentService();
    await this.getAllAppointmentEmpleado();
    await this.getEmployeesEmpleado()
    await this.getAllCancellarionEmpleado();
    this.applyFiltersService(); // Aplicar filtros al cargar datos
    this.generateClientDistributionChart();
    this.generateCancellationRateChart();
  }


   // Gráfica 1: Distribución de clientes por servicio
   generateClientDistributionChart() {
    // Solo genera los datos una vez
    if (this.clientDistributionChartData.length === 0) {
      const serviceClientMap: { [key: string]: Set<string> } = {};

      this.appointments.forEach(app => {
        if (!serviceClientMap[app.service]) {
          serviceClientMap[app.service] = new Set();
        }
        serviceClientMap[app.service].add(app.customer);
      });

      this.clientDistributionChartData = Object.entries(serviceClientMap).map(([service, clients]) => ({
        name: this.services.find(s => s.id === service)?.name || service,
        value: clients.size
      }));
    }
  }

  // Gráfica 2: Porcentaje de cancelaciones frente a reservas

  generateCancellationRateChart() {
    // Solo genera los datos una vez
    if (this.cancellationChartData.length === 0) {
      const totalAppointments = this.appointments.length;
      const cancellations = this.appointments.filter(app => app.status.toUpperCase() === 'CANCELED').length;

      this.cancellationRate = totalAppointments > 0 ? (cancellations / totalAppointments) * 100 : 0;

      this.cancellationChartData = [
        { name: 'Canceladas', value: cancellations },
        { name: 'Completadas o Reservadas', value: totalAppointments - cancellations }
      ];
    }
  }
  

  //////////////////////////////////////////////////////////////////////////////////////////////////
  ///Citas
  //////////////////////////////////////////////////////////////////////////////////////////////////
  getAllAppointmentCitas(): Promise<void> {
    return new Promise((resolve) => {
      this.appointmentService.getAllAppointment().subscribe({
        next: value => {
          this.appointments = value;
          this.applyFiltersCitas(); // Aplicar filtros cuando se obtienen las citas
          resolve();
        }
      });
    });
  }
  
  applyFiltersCitas() {
    // Filtrar por estado
    let filteredAppointments = this.appointments;
  
    if (this.selectedFilter !== 'all') {
      filteredAppointments = filteredAppointments.filter(app => {
        // Compara el estado en minúsculas para que sea insensible a mayúsculas
        return app.status.toLowerCase() === this.selectedFilter.toLowerCase();
      });
    }
  
    // Filtrar por fecha de inicio
    if (this.startDate) {
      filteredAppointments = filteredAppointments.filter(app => app.startDate >= this.startDate);
    }
  
    // Filtrar por fecha final
    if (this.endDate) {
      filteredAppointments = filteredAppointments.filter(app => app.startDate <= this.endDate);
    }
  
    this.prepareReportCitas(filteredAppointments);
  }
  
  prepareReportCitas(appointments: AppointmentDto[] = this.appointments) {
    this.appointmenReports = [];
    this.chartData = []; // Resetear datos del gráfico
  
    const statusCounts = { RESERVED: 0, COMPLETED: 0, CANCELED: 0 };
  
    // Contar citas por estado
    appointments.forEach(app => {
      statusCounts[app.status.toUpperCase() as 'RESERVED' | 'COMPLETED' | 'CANCELED']++;
      this.appointmenReports.push({
        cliente: app.customer,
        servicio: app.service,
        fecha: app.startDate.split("T")[0],
        horaInicio: app.startDate.split("T")[1],
        empleado: app.employeeId,
        precio: app.paymentMethod,
        estado: app.status,

      });
    });
  
    // Preparar datos para el gráfico de pastel
    for (const status in statusCounts) {
      if (statusCounts[status as 'RESERVED' | 'COMPLETED' | 'CANCELED'] > 0) {
        this.chartData.push({
          name: status,
          value: statusCounts[status as 'RESERVED' | 'COMPLETED' | 'CANCELED']
        });
      }
    }
  
    // Calcular el total de los precios
    this.total = 445; // Calcular el total
  }
  
  realizarReportCitas() {
    this.applyFiltersCitas(); // Realizar reporte con los filtros aplicados
  }
 

  selectTab(index: number): void {
    this.activeTab = index;
  } 

  ////////////////////////////////////////////////////////////////////////////////////////////////////////
//Gestion de Servicio
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  getAllAppointmentService(): Promise<void> {
    return new Promise((resolve) => {
      this.appointmentService.getAllAppointment().subscribe({
        next: (value) => {
          this.appointments = value;
          resolve();
        },
      });
    });
  }
  
  getServicesService(): Promise<void> {
    return new Promise((resolve) => {
      this.serviceService.getServicesAvailable().subscribe({
        next: (value) => {
          this.services = value;
          resolve();
        },
      });
    });
  }
  
  applyFiltersService() {
    // Filtrar por estado
    let filteredServices = this.services;
    if (this.selectedFilter !== 'Todos') {
      filteredServices = this.services.filter((service) => {
        const isAvailable = service.status.toLowerCase() === 'disponible';
        return this.selectedFilter === 'Disponible' ? isAvailable : !isAvailable;
      });
    }
  
    // Filtrar citas por fecha
    const filteredAppointments = this.appointments.filter((appointment) => {
      const appointmentDate = appointment.startDate.split('T')[0]; // Obtener solo la fecha
      return appointmentDate >= this.startDate && appointmentDate <= this.endDate;
    });
  
    // Generar el reporte con datos filtrados
    this.prepareReportService(filteredServices, filteredAppointments);
  }
  
  prepareReportService(filteredServices: ServiceDto[] = this.services, filteredAppointments: AppointmentDto[] = this.appointments) {
    this.serviceReport = [];
    this.chartData = [];
  
    // Generar reporte de servicios con citas filtradas
    filteredServices.forEach((service) => {
      let citas = 0;
      filteredAppointments.forEach((app) => {
        if (app.service === service.id) {
          citas++;
        }
      });
      this.serviceReport.push({
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        status: service.status,
        citas: citas,
      });
  
      // Datos para el gráfico
      if (citas > 0) {
        this.chartData.push({
          name: service.name,
          value: citas,
        });
      }
    });
  
    // Calcular total de citas
    this.total = this.serviceReport.reduce((acc, service) => acc + service.citas, 0);
  }
  
  realizarReportService() {
    this.applyFiltersService(); // Aplicar filtros antes de generar el reporte
  }
  
  translateStatusService(status: string): string {
    const translations: { [key: string]: string } = {
      AVAILABLE: 'Disponible',
      UNAVAILABLE: 'No Disponible',
    };
    return translations[status.toUpperCase()] || status; // Devuelve la traducción o el estado original si no está en la lista
  }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
//Gestion de Empleados
  ///////////////////////////////////////////////////////////////////////////////////////////////////////

  getAllAppointmentEmpleado(): Promise<void> {
    return new Promise((resolve) => {
      this.appointmentService.getAllAppointment().subscribe({
        next: value => {
          this.appointmentsEmp = value;
          resolve();
        }
      });
    });
  }

  getAllCancellarionEmpleado(): Promise<void> {
    return new Promise((resolve) => {
      this.cancellationService.getAllCancellation().subscribe({
        next: value => {
          this.cancellarionsEmp = value;
          resolve();
        }
      });
    });
  }

  getEmployeesEmpleado(): Promise<void> {
    return new Promise((resolve) => {
      this.employeService.getEmployees().subscribe({
        next: value => {
          this.employeesEmp = value;
          resolve();
        }
      });
    });
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

  prepararAppointmesReportTodosEmpleado() {
    this.employeesEmp.forEach(emp => {
      let cantidad = 0;
      this.appointmentsEmp.forEach(app => {
        if (emp.id === app.employeeId) {
          cantidad++;  // Contar las citas por empleado
        }
      });
      this.clientReportEmp.push({
        Cantidad: cantidad,
        cui: emp.cui,
        email: emp.email,
        Nombre: emp.name
      });
    });
  }

  prepararAppointmesReporfilterEmpleado() {
    this.employeesEmp.forEach(emp => {
      let cantidad = 0;
      this.cancellarionsEmp.forEach(c => {
        if (emp.id === c.customer) {
          cantidad++;  // Contar las cancelaciones por empleado
        }
      });
      this.clientReportEmp.push({
        Cantidad: cantidad,
        cui: emp.cui,
        email: emp.email,
        Nombre: emp.name
      });
    });
  }

  realizarReportEmpleado() {
    this.clientReportEmp = [];
    this.chartData = []; // Limpiar los datos anteriores del gráfico
    switch (this.selectedFilterEmp) {
      case 'Todos':
        this.prepararAppointmesReportTodosEmpleado();
        break;
      case 'Mal-Uso':
        this.prepararAppointmesReporfilterEmpleado();
        break;
    }
  
    // Preparar los datos para el gráfico
    this.prepareChartDataEmpleado();
  }

prepareChartDataEmpleado() {
  this.employeesEmp.forEach(emp => {
    const cantidad = this.clientReportEmp.filter(c => c.Nombre === emp.name).map(c => c.Cantidad)[0];
    if (cantidad > 0) {
      this.chartData.push({
        name: emp.name,
        value: cantidad  // El valor será el número de citas/cancelaciones
      });
    }
  });
}   
}