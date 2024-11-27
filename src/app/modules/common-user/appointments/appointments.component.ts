import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { createCalendar, viewDay, viewMonthAgenda, viewMonthGrid, viewWeek, createViewWeek, CalendarEvent } from '@schedule-x/calendar'
import { CalendarComponent } from "@schedule-x/angular";
import { createEventModalPlugin } from '@schedule-x/event-modal'
import '@schedule-x/theme-default/dist/index.css'
import { BusinessHour } from '../../manager/utils/models/business-hours.dto';
import { BusinessHoursService } from '../../manager/utils/services/business-hours.service';
import { firstValueFrom } from 'rxjs';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { ServiceService } from '../../manager/utils/services/service.service';
import { ServiceDto } from '../../manager/utils/models/service.dto';
import { ManagmentService } from '../../manager/utils/services/managment.service';
import { BusinessConfigurationDto } from '../../manager/utils/models/business-congifuration.dto';
import { employeDto } from '../utils/models/employes.dto';
import { EmployeeService } from '../utils/services/employe.service';
import { UserService } from '../../manager/utils/services/user.service';
import { UserDto } from '../../manager/utils/models/user.dto';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls'
import Swal from 'sweetalert2';
import { AppointmentService } from '../utils/services/appointment.service';
import { AppointmentDto } from '../utils/models/appointment.dto';


@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [RouterOutlet, CalendarComponent, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.scss'
})
export class AppointmentsComponent {


  appointments: AppointmentDto[] = []
  businessHours: BusinessHour[] = []
  specialDays: BusinessHour[] = []
  services: ServiceDto[] = [];
  employee: employeDto[] = []
  businessConfiguration!: BusinessConfigurationDto
  serviceTmp!: ServiceDto | undefined;

  title = 'angular-example';
  isModalOpen = false;
  isModalOpen2 = false;
  id: number = 1

  userDto!: UserDto;
  calendar: any;
  events: CalendarEvent[] = [];

  registerForm!: FormGroup;
  calendarControls: any;

  horasAtencion = '00:00 - 00:00'
  montoPreliminar = ''



  private readonly businessHoursService = inject(BusinessHoursService)
  private readonly serviceService = inject(ServiceService)
  private readonly managmetService = inject(ManagmentService)
  private readonly employeService = inject(EmployeeService)
  private readonly userService = inject(UserService)
  private readonly appointmentService = inject(AppointmentService)


  constructor(private formBuilder: FormBuilder) {
    this.getBusinessConfiguration()
    this.calendarControls = createCalendarControlsPlugin()
  }

  ngOnInit() {
    this.id = JSON.parse(localStorage.getItem("session") || "{'id': ''}").id
    this.getMe()
    this.getEmployees()
    this.getServices()
    this.getAllAppointment();
    this.initializeCalendar()
    this.initializeBusinessHoursAndSpecialDays()
  }

  async initializeBusinessHoursAndSpecialDays() {
    await this.getBussinesGeneral();
    await this.getAllSpecificDate();
    await this.addClosedEventsForWeekends();
    this.initForm()
  }

  getRandomEmployee(): employeDto | undefined {
    if (this.employee.length === 0) return undefined;
    const randomIndex = Math.floor(Math.random() * this.employee.length);
    return this.employee[randomIndex];
  }

  obtenerDiaDeLaSemana(fecha: string): string {
    const diasSemana = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    // Convertir la cadena en un objeto Date
    const dateObj = new Date(fecha);

    // Obtener el índice del día de la semana
    const diaSemanaIndex = dateObj.getDay();

    // Devolver el nombre del día en mayúsculas
    return diasSemana[diaSemanaIndex];
  }

  calcularEndDate(startDate: string, duration: string): string {

    // Dividir startDate en horas y minutos
    const [startHours, startMinutes] = startDate.split(':').map(Number);

    // Dividir duration en horas, minutos y segundos
    const [durationHours, durationMinutes] = duration.split(':').map(Number);

    // Crear un objeto Date para la hora de inicio
    const fechaInicio = new Date();
    fechaInicio.setHours(startHours);
    fechaInicio.setMinutes(startMinutes);

    // Añadir la duración a la fecha de inicio
    fechaInicio.setHours(fechaInicio.getHours() + durationHours);
    fechaInicio.setMinutes(fechaInicio.getMinutes() + durationMinutes);

    // Obtener el nuevo tiempo (hora y minutos)
    const horasFinales = fechaInicio.getHours().toString().padStart(2, '0');
    const minutosFinales = fechaInicio.getMinutes().toString().padStart(2, '0');

    // Devolver el resultado en formato HH:MM
    return `${horasFinales}:${minutosFinales}`;
  }

  formatearFechaParaBackend(fecha: string, hora: string): string {
    // Simplemente concatenamos la fecha con la hora en el formato esperado
    const formattedDateTime = `${fecha}T${hora}:00`;

    return formattedDateTime;  // Retorna 'YYYY-MM-DDTHH:MM:SS'
  }

  register() {
    const date = this.calendarControls.getDate();
  
    // Validar que todos los campos están completos
    if (!this.registerForm.valid) {
      Swal.fire({
        icon: 'error',
        title: 'Campos vacíos',
        text: 'Por favor, complete todos los campos antes de continuar.',
      });
      return; // No continuar si el formulario no es válido
    }

    // Calcular las fechas de inicio y fin de la nueva cita
    let endDate = this.calcularEndDate(this.registerForm.value.startDate, this.serviceTmp?.duration || '');
    const startDate = this.formatearFechaParaBackend(date,   this.registerForm.value.startDate);
    endDate = this.formatearFechaParaBackend(date, endDate);
  
    // Validar conflicto de horarios
    const hasConflict = this.appointments.some(appointment => {
      const existingStart = new Date(appointment.startDate).getTime();
      const existingEnd = new Date(appointment.endDate).getTime();
      const newStart = new Date(startDate).getTime();
      const newEnd = new Date(endDate).getTime();
  
      // Verificar si los horarios se solapan o hay uno antes o durante
      return (
        (newStart >= existingStart && newStart < existingEnd) || // El inicio de la nueva cita cae dentro de una cita existente
        (newEnd > existingStart && newEnd <= existingEnd) ||    // El fin de la nueva cita cae dentro de una cita existente
        (newStart <= existingStart && newEnd >= existingEnd)    // La nueva cita abarca completamente una cita existente
      );
    });
  
    if (hasConflict) {
      Swal.fire({
        icon: 'error',
        title: 'Conflicto de horario',
        text: 'Ya tienes una cita en este horario. Por favor, selecciona otro.',
      });
      return;
    }
  
    // Asignar valores adicionales al formulario
    this.registerForm.value.endDate = endDate;
    this.registerForm.value.startDate = startDate;
    this.registerForm.value.service = Number(this.registerForm.value.service);
  
    // Seleccionar empleado aleatorio si no se permite elegir uno
    if (!this.businessConfiguration.employeeElection) {
      this.registerForm.value.employeeId = Number(this.getRandomEmployee()?.id || 1);
    } else {
      this.registerForm.value.employeeId = Number(this.registerForm.value.employeeId);
    }
  
    // Enviar la cita al backend
    this.appointmentService.createAppoinment(this.registerForm.value).subscribe({
      next: value => {
        this.msgOK();
        this.getAllAppointment(); // Actualizar la lista de citas
        this.closeModal();
      },
      error: err => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear la cita. Inténtalo nuevamente.',
        });
        this.closeModal();
      },
    });
  }
  

  async getBussinesGeneral(): Promise<void> {
    return firstValueFrom(this.businessHoursService.getBussinesConfiguration())
      .then(value => {
        this.businessHours = value;
      });
  }

  async getAllSpecificDate(): Promise<void> {
    return firstValueFrom(this.businessHoursService.getHoursBusinessSpecificDate())
      .then(value => {
        this.specialDays = value;
      });
  }

  getServices() {
    // Obtener los servicios disponibles
    this.serviceService.getServicesAvailable().subscribe({
      next: value => {
        this.services = value;
      }
    });
  }

  getBusinessConfiguration() {
    this.managmetService.getBussinesConfiguration().subscribe({
      next: value => {
        this.businessConfiguration = value;
      }, error: err => {
      }
    })
  }

  getEmployees() {
    this.employeService.getEmployees().subscribe({
      next: value => {
        this.employee = value
      }
    })
  }

  getCorrelativoNumber(dayOfWeek: string): number {
    switch (dayOfWeek) {
      case 'MONDAY':
        return 1;
      case 'TUESDAY':
        return 2;
      case 'WEDNESDAY':
        return 3;
      case 'THURSDAY':
        return 4;
      case 'FRIDAY':
        return 5;
      case 'SATURDAY':
        return 6;
      case 'SUNDAY':
        return 0;
      default:
        return 0;
    }
  }

  isClosed(dayOfWeek: number): boolean {
    for (let index = 0; index < this.businessHours.length; index++) {
      if (this.businessHours[index].status === 'UNAVAILABLE' && this.getCorrelativoNumber(this.businessHours[index].dayOfWeek) === dayOfWeek) {
        return true
      }
    }
    return false;
  }

  getMe() {
    this.userService.getById(Number(this.id)).subscribe({
      next: value => {
        this.userDto = value;
      }
    })
  }

  initForm() {
    this.registerForm = this.formBuilder.group({
      customer: [this.userDto.id],
      service: [null, Validators.required],
      employeeId: [null, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null],
      status: ['RESERVED'],
      paymentMethod: [null, Validators.required]
    })
  }

  // Método para generar eventos "Cerrado" los fines de semana
  async addClosedEventsForWeekends(): Promise<void> {
    let id: number = 0
    const startYear = 2024;
    const endYear = 2024;  // Puedes ajustar este rango según lo necesites

    for (let year = startYear; year <= endYear; year++) {
      for (let month = 0; month < 12; month++) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
          const currentDate = new Date(year, month, day);
          const dayOfWeek = currentDate.getDay();  // 0 = Domingo, 6 = Sábado

          if (this.isClosed(dayOfWeek)) {
            const formattedDate = currentDate.toISOString().split('T')[0];  // yyyy-mm-dd

            this.calendar.eventsService.add({
              id: `${id++}`,
              title: 'Cerrado',
              start: `${formattedDate} 00:00`,
              end: `${formattedDate} 23:59`,
              allDay: true,
              calendarId: 'leisure'
            })

          }
        }
      }
    }
  }

  // Inicializar el calendario
  initializeCalendar() {
    const eventsServicePlugin = createEventsServicePlugin();
    this.calendar = createCalendar({
      events: [
      ],
      calendars: {
        leisure: {
          colorName: 'leisure',
          lightColors: {
            main: '#fd2f02',
            container: '#ec7a61',
            onContainer: '#002859',
          },
          darkColors: {
            main: '#c0dfff',
            onContainer: '#dee6ff',
            container: '#426aa2',
          },
        },
        oter: {
          colorName: 'oter',
          lightColors: {
            main: '#2ecc71',        // Verde principal
            container: '#a3e4d7',   // Color de fondo más suave
            onContainer: '#145a32', // Color de texto en el fondo suave
          },
          darkColors: {
            main: '#27ae60',        // Verde oscuro
            onContainer: '#d1f2eb', // Color de texto en el fondo oscuro
            container: '#196f3d',   // Color de fondo oscuro
          },
        },
      },
      views: [createViewWeek(), viewDay, viewMonthGrid, viewMonthAgenda],
      plugins: [eventsServicePlugin, createEventModalPlugin(), this.calendarControls],
    });
  }

  dayAvaible(dayOfWeek: string): BusinessHour | null {
    const day = this.businessHours.find(bus => bus.dayOfWeek === dayOfWeek)
    if (day?.status === 'AVAILABLE') {
      return day
    }
    return null;
  }

  claclMontoPreliminar() {
    const id = this.registerForm.value.service
    this.serviceTmp = this.services.find(ser => ser.id === Number(id));
    this.montoPreliminar = this.serviceTmp?.price.toString() || ''
  }

  openModal() {
    const day = this.obtenerDiaDeLaSemana(this.calendarControls.getDate())
    const dayVerif = this.dayAvaible(day)
    if (dayVerif) {
      this.horasAtencion = `${dayVerif.openingTime} - ${dayVerif.closingTime}`
      this.isModalOpen = true;
    } else {
      this.msgNotAvailabe();
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }

  openModal2(){
    this.isModalOpen2 = true;
  }
  closeModal2() {
    this.isModalOpen2 = false;
  }

  formatDateTime(dateTime: string): string {
    // Primero, dividimos la fecha y la hora en dos partes: fecha y hora
    const [date, time] = dateTime.split('T');

    // Dividimos la parte de la hora por los segundos y tomamos solo los primeros 5 caracteres (HH:mm)
    const formattedTime = time.substring(0, 5);

    // Devolvemos la fecha y la hora en el formato deseado
    return `${date} ${formattedTime}`;
  }

  getEmpleado(id: number): string {
    const restult = this.employee.find(emp => emp.id === id)?.name || ''
    return restult;
  }

  addEventesReservationsCalendar() {
    this.appointments.forEach(appoin => {
      if (appoin.customer === this.userDto.id) {
        this.calendar.eventsService.add({
          id: `${appoin.id}`,
          title: 'MI RESERVACION',
          description: `Este horario esta reservado. Empleado que atendera: ${this.getEmpleado(appoin.employeeId)}`,
          start: `${this.formatDateTime(appoin.startDate)}`,
          end: `${this.formatDateTime(appoin.endDate)}`,
          allDay: true,
        })
      } else {
        this.calendar.eventsService.add({
          id: `${appoin.id}`,
          title: 'RESERVADO',
          description: `Este horario esta reservado. Empleado que atendera: ${this.getEmpleado(appoin.employeeId)}`,
          start: `${this.formatDateTime(appoin.startDate)}`,
          end: `${this.formatDateTime(appoin.endDate)}`,
          allDay: true,
          calendarId: 'oter'
        })
      }
    })
  }

  getAllAppointment() {
    this.appointmentService.getAllAppointment().subscribe({
      next: value => {
        this.appointments = value;
        this.addEventesReservationsCalendar()
      }
    })
  }

  msgNotAvailabe() {
    Swal.fire({
      title: "Upss",
      text: "No es posible apartar esta fecha",
      icon: "info"
    });
  }

  msgOK() {
    Swal.fire({
      title: "Excelente",
      text: "Su reservacion fue realizada con exito!!",
      icon: "success"
    });
  }

  msgError() {
    Swal.fire({
      title: "Upss!",
      text: "En esta fecha no se puede reservar, intente mas tarde",
      icon: "question"
    });
  }


}
