import { EmployeeService } from './../../common-user/utils/services/employe.service';
import { Component, OnInit } from '@angular/core';
import { AppointmentDto } from '../../common-user/utils/models/appointment.dto';
import { employeDto } from '../../common-user/utils/models/employes.dto';
import { AppointmentService } from '../../common-user/utils/services/appointment.service';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';


@Component({
  selector: 'app-graficos', 
  standalone: true,
  imports: [NgxChartsModule],
  templateUrl: './graficos.component.html',
  styleUrls: ['./graficos.component.scss']
})
export class GraficosComponent implements OnInit {
  appointmentsDataBar: any[] = [];
  appointmentsDataLine: any[] = [];
  appointmentsDataArea: any[] = [];
  employeesDataPie: any[] = [];
  
  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  constructor(
    private appointmentService: AppointmentService,
    private employeeService: EmployeeService
  ) { }

  ngOnInit(): void {
    this.loadAppointments();
    this.loadEmployees();  // Cargar los datos de empleados
  }

  loadAppointments(): void {
    this.appointmentService.getAllAppointment().subscribe({
      next: (appointments) => {
        const groupedByMonth: { [key: string]: number } = {};

        appointments.forEach((appointment) => {
          const appointmentDate = new Date(appointment.startDate);
          const month = appointmentDate.getMonth() + 1; // Mes (1-12)
          const year = appointmentDate.getFullYear();
          const monthYear = `${month}-${year}`;

          if (groupedByMonth[monthYear]) {
            groupedByMonth[monthYear]++;
          } else {
            groupedByMonth[monthYear] = 1;
          }
        });

        this.appointmentsDataBar = Object.keys(groupedByMonth).map(monthYear => ({
          name: monthYear,
          value: groupedByMonth[monthYear]
        }));

        this.appointmentsDataLine = Object.keys(groupedByMonth).map(monthYear => ({
          name: monthYear,
          series: [{ name: 'Citas', value: groupedByMonth[monthYear] }]
        }));

        this.appointmentsDataArea = Object.keys(groupedByMonth).map(monthYear => ({
          name: monthYear,
          value: groupedByMonth[monthYear]
        }));
      },
      error: (err) => console.error('Error loading appointments:', err)
    });
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        const statusCounts = { activo: 0, inactivo: 0 };
        // Preparamos los datos para el gráfico circular
        this.employeesDataPie = [
          { name: 'Activo', value: statusCounts.activo },
          { name: 'Inactivo', value: statusCounts.inactivo }
        ];
      },
      error: (err) => console.error('Error loading employees:', err)
    });
  }
    
}