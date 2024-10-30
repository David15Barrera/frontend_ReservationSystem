import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';


@Injectable({
    providedIn: 'root'
})
export class ApiConfigService {

    API_BASE = environment.apiUrl

    //Session module
    API_AUTH = `${this.API_BASE}/auth`
    API_USER = `${this.API_BASE}/users`

    //magment module
    API_BUSINESS_CONFIG = `${this.API_BASE}/business/config`
    API_BUSINESS_HOURS = `${this.API_BASE}/business/hours`

    //services
    API_SERVICES = `${this.API_BASE}/services`

    //services
    API_APPOINTMENT = `${this.API_BASE}/appointment`
    API_CANCELLATION = `${this.API_BASE}/cancellation`

    //upload image
    API_UPLOAD = `${this.API_BASE}/images`

    //callaborator
    API_COLLABORATOR = `${this.API_BASE}/api/callaborator`
}