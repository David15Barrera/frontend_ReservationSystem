export interface ServiceDto {
    id: number;
    name: string;
    price: number;
    duration: string;
    description: string;
    peopleReaches: number;
    location: string;
    imageUrl: string;
    status: string
}

export interface ServiceItemDto {
    name: string;
    price: number;
    duration: string;
    description: string;
    status: string
    citas:number
}

export interface ServiceSendDto {
    items: ServiceItemDto []
    total: number,
    rangeDate: String,
    filtro: string
}

