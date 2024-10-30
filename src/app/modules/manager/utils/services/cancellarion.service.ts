import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { ApiConfigService } from "../../../../config/services/api-config.service";
import { Observable } from "rxjs";
import { CancellationSurchargeDto } from "../models/cancellationDto";
import { clietnReportSend } from "../models/clienteReportItems";

@Injectable({
  providedIn: 'root'
})
export class CancellarionService {
  private readonly _http = inject(HttpClient)
  private readonly apiConfig = inject(ApiConfigService)

  constructor() { }

  getAllCancellation(): Observable<CancellationSurchargeDto[]> {
    return this._http.get<CancellationSurchargeDto[]>(`${this.apiConfig.API_CANCELLATION}`)
  }

  downloadReport(userSalesReportPdf: clietnReportSend) {
    // Realiza la petición POST enviando el objeto en el body
    this._http.post(`${this.apiConfig.API_CANCELLATION}/downloadPDF`, userSalesReportPdf, {
      responseType: 'blob' // Importante para manejar el PDF como Blob
    }).subscribe({
      next: (response) => {
        // Descargar el archivo PDF
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte_clientes.pdf'; // Nombre del archivo descargado
        a.click();
        window.URL.revokeObjectURL(url); // Limpia la URL temporal
      },
      error: (err) => {
        console.error('Error al descargar el PDF:', err);
      }
    });
  }

  downloadReportSalesExcel(salesReportDtoPdf: clietnReportSend) {
    // Realiza la petición POST enviando el objeto en el body
    this._http.post(`${this.apiConfig.API_CANCELLATION}/download-excel`, salesReportDtoPdf, {
      responseType: 'blob' // Importante para manejar el Excel como Blob
    }).subscribe({
      next: (response) => {
        // Descargar el archivo Excel
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte_clientes.xlsx'; // Nombre del archivo descargado
        a.click();
        window.URL.revokeObjectURL(url); // Limpia la URL temporal
      },
      error: (err) => {
        console.error('Error al descargar el Excel:', err);
      }
    });
  }


}