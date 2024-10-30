import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiConfigService } from '../../../../config/services/api-config.service';
import { PasswordChangeDto, UserDto } from '../models/user.dto';
import { Observable } from 'rxjs';
import { employeDto } from '../../../common-user/utils/models/employes.dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {


  private readonly _http = inject(HttpClient)
  private readonly apiConfig = inject(ApiConfigService)

  constructor() { }


  getById(id: number): Observable<UserDto> {
    return this._http.get<UserDto>(`${this.apiConfig.API_USER}/${id}`)
  }

  updatePrfile(id: number, user: UserDto): Observable<UserDto> {
    return this._http.put<UserDto>(`${this.apiConfig.API_USER}/${id}`, user)
  }

  changePassword(id: number, pass: PasswordChangeDto): Observable<PasswordChangeDto> {
    return this._http.patch<PasswordChangeDto>(`${this.apiConfig.API_USER}/${id}`, pass)
  }

  getAllCustomers(): Observable<employeDto[]> {
    return this._http.get<employeDto[]>(`${this.apiConfig.API_USER}/role/2`)
  }

}
