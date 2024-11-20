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
    return timeRemaining > 0; // Permitir la cancelación si aún está en el rangos
}

  showPdfMessage(appointmentId: number) {
    this.appointmentService.downloadBill(appointmentId)
  }
  

  cancelAppointment(appointment: AppointmentDto) {
    const now = new Date();
    const startDate = new Date(appointment.startDate); // Cambiado de endDate a startDate
    const timeRemaining = startDate.getTime() - now.getTime(); // Calcular tiempo antes de la cita

    Swal.fire({
        title: '¿Estás seguro?',
        text: timeRemaining <= 3600000
            ? 'Cancelar dentro de 1 hora antes de su cita implica una multa según nuestras políticas.'
            : '¡No podrás revertir esto!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Determinar el observable según el tiempo restante
            const cancelObservable = timeRemaining <= 3600000
                ? this.appointmentService.canceled(appointment.id) // Lógica especial para menos de 1 hora
                : this.appointmentService.cancelAppointment(appointment.id); // Lógica estándar para cancelación

            cancelObservable.subscribe({
                next: () => {
                    Swal.fire(
                        'Cancelado!',
                        timeRemaining <= 3600000
                            ? 'La cita ha sido cancelada. Se aplicará una multa según nuestras políticas.'
                            : 'La cita ha sido cancelada.',
                        'success'
                    );
                    this.loadUserAppointments(); // Recargar citas del usuario
                },
                error: (error) => {
                    Swal.fire('Error!', 'No se pudo cancelar la cita.', 'error');
                    console.error('Error al cancelar la cita:', error);
                }
            });
        }
    });
}



translateStatus(status: string): string {
  switch (status) {
    case 'RESERVED':
      return 'RESERVADO';
    case 'CANCELED':
      return 'CANCELADO';
    case 'COMPLETED':
      return 'COMPLETADO'; 
    default:
      return 'Estado desconocido';
  }
}

translatePaymentMethod(paymentMethod: string): string {
  switch (paymentMethod) {
    case 'CASH':
      return 'EFECTIVO';
    case 'CARD':
      return 'TARJETA';
    default:
      return 'Método de pago desconocido';
  }
}
}