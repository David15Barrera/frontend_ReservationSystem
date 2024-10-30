import { AppointmentDto } from "../../../common-user/utils/models/appointment.dto";

export interface appointmentReportDto{
    fecha:string;
    horaInicio:string;
    cliente:string;
    estado:string;
    servicio:string;
    empleado:string;
    price?:number;
    appointment:AppointmentDto;
}