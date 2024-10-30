import { appointmentReportDto } from "./appointment.dto";

export interface appointmentReportSendDto {
    items: appointmentReportDto [];
    total: number,
    rangeDate: String,
    filtro: string
}