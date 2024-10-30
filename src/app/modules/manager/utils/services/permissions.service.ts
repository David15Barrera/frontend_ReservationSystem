import { ApiConfigService } from './../../../../config/services/api-config.service';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PermissionsService {
    private http = inject(HttpClient)
    private apiConfig = inject(ApiConfigService)

    permissionsAdmin = [
        "PRODUCT_GET",
        "PRODUCT_POST",
        "PRODUCT_PUT",
        "PRODUCT_DELETE",
        "ORDER_GET",
        "ORDER_PATCH",
        "COMPANY_GET",
        "DASHBOARD_GET",
        "USER_GET",
        "USER_PATCH",
        "REPORT_GET",
        "PRINTER"
    ]

    public PERMISSIONS: string[] = []

    getPermissions() {
        return this.http.get(`${this.apiConfig.API_USER}/me`).subscribe((resp: any) => {
            if (resp.role == "ADMIN") {
                this.PERMISSIONS = this.permissionsAdmin
            } else {
                this.PERMISSIONS = resp.permissions
            }
        })
    }

}
