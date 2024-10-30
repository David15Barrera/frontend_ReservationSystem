import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiConfigService } from '../../../../config/services/api-config.service';
import { ServiceDto, ServiceSendDto } from '../models/service.dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  private readonly _http = inject(HttpClient)
  private readonly apiConfig = inject(ApiConfigService)

  constructor() { }

  createService(service: ServiceDto): Observable<ServiceDto> {
    return this._http.post<ServiceDto>(`${this.apiConfig.API_SERVICES}`, service)
  }

  getServicesAvailable(): Observable<ServiceDto[]> {
    return this._http.get<ServiceDto[]>(`${this.apiConfig.API_SERVICES}/available`)
  }

  getServicesUnAvailable(): Observable<ServiceDto[]> {
    return this._http.get<ServiceDto[]>(`${this.apiConfig.API_SERVICES}/unavailable`)
  }

  getServiceById(id: number): Observable<ServiceDto> {
    return this._http.get<ServiceDto>(`${this.apiConfig.API_SERVICES}/${id}`)
  }

  updateService(id: number, serviceDto: ServiceDto): Observable<ServiceDto> {
    return this._http.put<ServiceDto>(`${this.apiConfig.API_SERVICES}/${id}`, serviceDto)
  }

  deleted(id: number): Observable<any> {
    return this._http.delete<any>(`${this.apiConfig.API_SERVICES}/${id}`)
  }

  downloadReport(userSalesReportPdf: ServiceSendDto) {
    // Realiza la petición POST enviando el objeto en el body
    this._http.post(`${this.apiConfig.API_SERVICES}/downloadPDF`, userSalesReportPdf, {
      responseType: 'blob' // Importante para manejar el PDF como Blob
    }).subscribe({
      next: (response) => {
        // Descargar el archivo PDF
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte_Servicios.pdf'; // Nombre del archivo descargado
        a.click();
        window.URL.revokeObjectURL(url); // Limpia la URL temporal
      },
      error: (err) => {
        console.error('Error al descargar el PDF:', err);
      }
    });
  }

  downloadReportSalesExcel(salesReportDtoPdf: ServiceSendDto) {
    // Realiza la petición POST enviando el objeto en el body
    this._http.post(`${this.apiConfig.API_SERVICES}/download-excel`, salesReportDtoPdf, {
      responseType: 'blob' // Importante para manejar el Excel como Blob
    }).subscribe({
      next: (response) => {
        // Descargar el archivo Excel
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte_servicios.xlsx'; // Nombre del archivo descargado
        a.click();
        window.URL.revokeObjectURL(url); // Limpia la URL temporal
      },
      error: (err) => {
        console.error('Error al descargar el Excel:', err);
      }
    });
  }

}
