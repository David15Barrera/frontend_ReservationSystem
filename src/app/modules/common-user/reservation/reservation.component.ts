import { Component, OnInit, inject } from '@angular/core';
import { AppointmentService } from '../utils/services/appointment.service';
import { AppointmentDto } from '../utils/models/appointment.dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ServiceDto } from '../../manager/utils/models/service.dto';
import { employeDto } from '../utils/models/employes.dto';
import { ServiceService } from '../../manager/utils/services/service.service';
import { EmployeeService } from '../utils/services/employe.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss'
})
export class ReservationComponent implements OnInit {
  appointments: AppointmentDto[] = [];
  userId: number = JSON.parse(localStorage.getItem("session") || '{"id": ""}').id;
  services: ServiceDto[] = [];
  employees: employeDto[] = [];

  private readonly appointmentService = inject(AppointmentService);
  private readonly serviceService = inject(ServiceService);
  private readonly employeService = inject(EmployeeService);

  ngOnInit() {
    this.loadServices();
    this.loadEmployees();
    this.loadUserAppointments();
  }

  loadServices() {
    this.serviceService.getServicesAvailable().subscribe({
      next: (services) => {
        this.services = services;
      },
      error: (error) => console.error('Error al cargar los servicios:', error)
    });
  }

  loadEmployees() {
    this.employeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (error) => console.error('Error al cargar los empleados:', error)
    });
  }

  loadUserAppointments() {
    this.appointmentService.getAllAppointment().subscribe({
      next: (appointments) => {
        this.appointments = appointments.filter(
          (appointment) => appointment.customer === this.userId
        );
      },
      error: (error) => console.error('Error al cargar las citas:', error)
    });
  }

  getServiceName(serviceId: number): string {
    const service = this.services.find((s) => s.id === serviceId);
    return service ? service.name : 'Servicio no encontrado';
  }

  getEmployeeName(employeeId: number): string {
    const employee = this.employees.find((e) => e.id === employeeId);
    return employee ? employee.name : 'Empleado no encontrado';
  }

  isCancellationAllowed(appointment: AppointmentDto): boolean {
    const now = new Date();
    const endDate = new Date(appointment.endDate);
    const timeRemaining = endDate.getTime() - now.getTime();
    return timeRemaining > 0 && timeRemaining >= 3600000; // Permitir si falta más de una hora
  }

  showPdfMessage(appointmentId: number) {
    Swal.fire({
      title: 'Detalles de la Venta',
      text: `ID de la venta: ${appointmentId}\nID del usuario: ${this.userId}`,
      icon: 'info',
      confirmButtonText: 'Aceptar'
    });
  }
  

  cancelAppointment(appointment: AppointmentDto) {
    const now = new Date();
    const endDate = new Date(appointment.endDate);
    const timeRemaining = endDate.getTime() - now.getTime();

    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Declaramos `canceled` si queda menos de una hora o `cancelAppointment` en otro caso
        const cancelObservable = timeRemaining <= 3600000
          ? this.appointmentService.canceled(appointment.id)
          : this.appointmentService.cancelAppointment(appointment.id);

        cancelObservable.subscribe({
          next: () => {
            Swal.fire('Cancelado!', 'La cita ha sido cancelada.', 'success');
            this.loadUserAppointments();
          },
          error: (error) => {
            Swal.fire('Error!', 'No se pudo cancelar la cita.', 'error');
            console.error('Error al cancelar la cita:', error);
          }
        });
      }
    });
  }
}