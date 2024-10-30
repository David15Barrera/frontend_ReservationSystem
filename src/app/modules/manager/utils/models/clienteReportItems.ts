export interface clienteReportItem {
    Nombre: string;
    email: string;
    cui: string;
    Cantidad: number;
}

export interface clietnReportSend {
    items: clienteReportItem[];
    rangeDate: String,
    filtro: string
}