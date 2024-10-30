import { HttpClient } from "@angular/common/http"
import { Injectable, inject } from "@angular/core"
import { ApiConfigService } from "../../../../config/services/api-config.service"
import { Observable } from "rxjs"
import { AppointmentDto } from "../models/appointment.dto"
import { appointmentReportSendDto } from "../../../manager/utils/models/appointmentReportSendDto"

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private readonly _http = inject(HttpClient)
  private readonly apiConfig = inject(ApiConfigService)

  constructor() { }

  createAppoinment(appointment: AppointmentDto): Observable<AppointmentDto> {
    return this._http.post<AppointmentDto>(`${this.apiConfig.API_APPOINTMENT}`, appointment)
  }

  getAllAppointment(): Observable<AppointmentDto[]> {
    return this._http.get<AppointmentDto[]>(`${this.apiConfig.API_APPOINTMENT}`)
  }

  completed(id: number): Observable<AppointmentDto> {
    return this._http.patch<AppointmentDto>(`${this.apiConfig.API_APPOINTMENT}/${id}`, "appointment")
  }

  canceled(id: number): Observable<AppointmentDto> {
    return this._http.patch<AppointmentDto>(`${this.apiConfig.API_APPOINTMENT}/canceled/${id}`, "appointment")
  }

  cancelAppointment(id: number): Observable<AppointmentDto> {
    return this._http.patch<AppointmentDto>(`${this.apiConfig.API_APPOINTMENT}/cancel/${id}`, null)
  }

  downloadReport(userSalesReportPdf: appointmentReportSendDto) {
    // Realiza la petición POST enviando el objeto en el body
    this._http.post(`${this.apiConfig.API_APPOINTMENT}/downloadPDF`, userSalesReportPdf, {
      responseType: 'blob' // Importante para manejar el PDF como Blob
    }).subscribe({
      next: (response) => {
        // Descargar el archivo PDF
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte_Citas.pdf'; // Nombre del archivo descargado
        a.click();
        window.URL.revokeObjectURL(url); // Limpia la URL temporal
      },
      error: (err) => {
        console.error('Error al descargar el PDF:', err);
      }
    });
  }

  downloadReportSalesExcel(salesReportDtoPdf: appointmentReportSendDto) {
    // Realiza la petición POST enviando el objeto en el body
    this._http.post(`${this.apiConfig.API_APPOINTMENT}/download-excel`, salesReportDtoPdf, {
      responseType: 'blob' // Importante para manejar el Excel como Blob
    }).subscribe({
      next: (response) => {
        // Descargar el archivo Excel
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte_citas.xlsx'; // Nombre del archivo descargado
        a.click();
        window.URL.revokeObjectURL(url); // Limpia la URL temporal
      },
      error: (err) => {
        console.error('Error al descargar el Excel:', err);
      }
    });
  }

}