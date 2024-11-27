import { Component, inject } from '@angular/core';
import { AppointmentDto } from '../../common-user/utils/models/appointment.dto';
import { ServiceService } from '../utils/services/service.service';
import { EmployeeService } from '../../common-user/utils/services/employe.service';
import { AppointmentService } from '../../common-user/utils/services/appointment.service';
import { UserService } from '../utils/services/user.service';
import { ServiceDto } from '../utils/models/service.dto';
import { employeDto } from '../../common-user/utils/models/employes.dto';
import { appointmentReportDto } from '../utils/models/appointment.dto';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-appointments-admin',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './appointments-admin.component.html',
  styleUrl: './appointments-admin.component.scss'
})
export class AppointmentsAdminComponent {

  appointments: AppointmentDto[] = []
  services: ServiceDto[] = [];
  employee: employeDto[] = []
  customers: employeDto[] = []
  appointmenReports: appointmentReportDto[] = []
  role = ''
  id = 1
  dropdownStates: boolean[] = [];

  // Nueva propiedad para el filtro
  searchTerm: string = '';
  selectedFilter = ''; // Filtro seleccionado
  filteredReports: appointmentReportDto[] = [];
  selectedState: string = ''; // Estado seleccionado


  filteredAppointments(): appointmentReportDto[] {
    return this.appointmenReports.filter((item) => {
      // Filtro por término de búsqueda
      const matchesSearchTerm = [item.fecha, item.estado, item.servicio]
        .some((field) => field.toLowerCase().includes(this.searchTerm.toLowerCase()));
  
      // Filtro por acciones
      const matchesActionFilter =
        this.selectedFilter === 'sinAcciones'
          ? item.estado !== 'RESERVADO'
          : this.selectedFilter === 'conFiltro'
          ? item.estado === 'RESERVADO'
          : true; // Si no hay filtro seleccionado, muestra todo
  
      // Filtro por estado
      const matchesStateFilter = this.selectedState
        ? item.estado === this.selectedState
        : true; // Si no hay estado seleccionado, muestra todo
  
      // Combinar todos los filtros
      return matchesSearchTerm && matchesActionFilter && matchesStateFilter;
    });
  }
  


  private readonly serviceService = inject(ServiceService)
  private readonly employeService = inject(EmployeeService)
  private readonly appointmentService = inject(AppointmentService)
  private readonly userService = inject(UserService)

  async ngOnInit() {
    this.id = JSON.parse(localStorage.getItem("session") || "{'id': ''}").id
    this.role = JSON.parse(localStorage.getItem("session") || "{'role': ''}").role
    await this.getEmployees();
    await this.getServices();
    await this.getAllAppointment();
    await this.getCustomers()
    this.prepararAppointmesReport();
  }

  filterReports() {
    let reports = [...this.appointmenReports];
  
    // Filtro por estado
    if (this.selectedState) {
      reports = reports.filter((item) => item.estado === this.selectedState);
    }
  
    // Filtro por acciones
    if (this.selectedFilter === 'sinAcciones') {
      reports = reports.filter((item) => item.estado !== 'RESERVADO');
    } else if (this.selectedFilter === 'conFiltro') {
      reports = reports.filter((item) => item.estado === 'RESERVADO');
    }
  
    // Filtro por término de búsqueda
    if (this.searchTerm) {
      reports = reports.filter((item) =>
        [item.fecha, item.estado, item.servicio].some((field) =>
          field.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      );
    }
  
    this.filteredReports = reports;
  }
  

  getAllAppointment(): Promise<void> {
    return new Promise((resolve) => {
      this.appointmentService.getAllAppointment().subscribe({
        next: value => {
          this.appointments = value;
          console.log(value);

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

  async completed(id: number) {
    Swal.fire({
      title: "Esta seguro de Marcar como Completada la cita?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Si, continuar",
      denyButtonText: `No, cancelar!`
    }).then(async (result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        try {
          await firstValueFrom(this.appointmentService.completed(id));
          this.msgOK()
          this.appointmenReports = [];
          await this.getAllAppointment();
          this.prepararAppointmesReport();
        } catch (error) {
          this.msgOKSinFactura()
          console.log(error);
          this.appointmenReports = [];
          await this.getAllAppointment();
          this.prepararAppointmesReport();
          console.error('Error al completar la cita:', error);
        }
      } else if (result.isDenied) {
        Swal.fire("No se realizo ninguna accion", "", "info");
      }
    });
  }


  async canceled(id: number) {
    Swal.fire({
      title: "Esta seguro de Marcar como Cancelada la cita?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Si, continuar",
      denyButtonText: `No, cancelar!`
    }).then(async (result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        try {
          await firstValueFrom(this.appointmentService.canceled(id));
          this.msgOKCanceled()
          this.appointmenReports = [];
          await this.getAllAppointment();
          this.prepararAppointmesReport();
        } catch (error) {
          this.msgOKSinNotifi()
          console.log(error);
          this.appointmenReports = [];
          await this.getAllAppointment();
          this.prepararAppointmesReport();
          console.error('Error al completar la cita:', error);
        }
      } else if (result.isDenied) {
        Swal.fire("No se realizo ninguna accion", "", "info");
      }
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

  findService(id: number): string {
    return this.services.find(cus => cus.id === id)?.name || ''
  }

  traducirEstad(estad: string): string {
    switch (estad) {
      case 'RESERVED':
        return 'RESERVADO'
      case 'COMPLETED':
        return 'COMPLETADO'
      case 'CANCELED':
        return 'CANCELADO'
      default:
        return 'RESERVADO'

    }
  }


  toggleDropdown(index: number) {
    // Solo abre el dropdown correspondiente y cierra los demás
    this.dropdownStates = this.dropdownStates.map((state, i) => (i === index ? !state : false));
  }

  prepararAppointmesReport() {
    if (this.role === 'ADMIN') {
      this.appointments.forEach(app => {
        this.appointmenReports.push({
          fecha: this.getDateOnly(app.startDate),
          horaInicio: this.getTimeOnly(app.startDate),
          cliente: this.findCustormer(app.customer),
          estado: this.traducirEstad(app.status),
          servicio: this.findService(app.service),
          empleado: this.findEmployee(app.employeeId),
          appointment: app
        })
      })
    } else {
      this.appointments.forEach(app => {
        if (app.employeeId === this.id) {
          this.appointmenReports.push({
            fecha: this.getDateOnly(app.startDate),
            horaInicio: this.getTimeOnly(app.startDate),
            cliente: this.findCustormer(app.customer),
            estado: this.traducirEstad(app.status),
            servicio: this.findService(app.service),
            empleado: this.findEmployee(app.employeeId),
            appointment: app
          })
        }
      })
    }
    this.dropdownStates = Array(this.appointmenReports.length).fill(false);
  }

  msgOK() {
    Swal.fire({
      title: "Proceso completado",
      text: "La cita se a marcado como completado y se le envio la factura con exito!",
      icon: "success"
    });
  }

  msgOKCanceled() {
    Swal.fire({
      title: "Proceso completado",
      text: "La cita se a marcado como Cancelada y se le envio la notificacion al correo del usuario!",
      icon: "info"
    });
  }

  msgOKSinNotifi() {
    Swal.fire({
      title: "Proceso completado",
      text: "La cita se a marcado como Cancelada y No se le envio la notificacion al correo del usuario!",
      icon: "info"
    });
  }

  msgOKSinFactura() {
    Swal.fire({
      title: "Proceso completado",
      text: "La cita se a marcado como completado, pero no se pudo enviar la factura, la podra ver desde la pagina!",
      icon: "info"
    });
  }



}
