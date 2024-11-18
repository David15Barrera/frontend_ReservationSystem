import { ApiConfigService } from './../../../../config/services/api-config.service';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { PermissionDTO, RoleDTO, UserDto,userUpdateDTO } from '../models/collaborators';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CallaboratorService {
  http = inject(HttpClient)

  constructor(private apiConfig: ApiConfigService) { }

  updateUser(userUpdateDTO: userUpdateDTO): Observable<userUpdateDTO>{
    return this.http.put<{ data: userUpdateDTO }>(`${this.apiConfig.API_COLLABORATOR}`,userUpdateDTO)
    .pipe(
      map(response => response.data) 
    );
  }

  getRoles(): Observable<RoleDTO[]> {
    return this.http.get<{ data: RoleDTO[] }>(`${this.apiConfig.API_COLLABORATOR}/roles`)
      .pipe(
        map(response => response.data) 
      );
  }

  getPermission(): Observable<PermissionDTO[]> {
    return this.http.get<{ data: PermissionDTO[] }>(`${this.apiConfig.API_COLLABORATOR}/permissions`)
      .pipe(
        map(response => response.data) 
      );
  }

  getUserByRole(idRole:number): Observable<UserDto[]> {
    return this.http.get<{ data: UserDto[] }>(`${this.apiConfig.API_COLLABORATOR}/users/${idRole}`)
      .pipe(
        map(response => response.data) 
      );
  }

  getUserPermissions(userId: number): Observable<PermissionDTO[]> {
    return this.http.get<{ data: PermissionDTO[] }>(`${this.apiConfig.API_COLLABORATOR}/permissions/${userId}`)
      .pipe(
        map(response => response.data)
      );
}
getRolePermissions(roleId: number): Observable<PermissionDTO[]> {
  return this.http.get<PermissionDTO[]>(`${this.apiConfig.API_COLLABORATOR}/roles/${roleId}/permissions`);
}


addRole(role: RoleDTO): Observable<RoleDTO> {
  return this.http.post<{ data: RoleDTO }>(
    `${this.apiConfig.API_COLLABORATOR}/create/roles`,
    role
  ).pipe(map(response => response.data));
}

updateRole(roleId: number, role: Partial<RoleDTO>): Observable<RoleDTO> {
  return this.http.put<{ data: RoleDTO }>(
    `${this.apiConfig.API_COLLABORATOR}/roles/${roleId}`,
    role
  ).pipe(map(response => response.data));
}

updateRolePermissions(roleId: number, permissionIds: number[]): Observable<string> {
  return this.http.put(`${this.apiConfig.API_COLLABORATOR}/roles/${roleId}/permissions`, permissionIds, { responseType: 'text' });
}


deleteRole(roleId: number): Observable<string> {
  return this.http.delete<string>(
    `${this.apiConfig.API_COLLABORATOR}/roles/${roleId}`, 
    { responseType: 'text' as 'json' }  // Asegúrate de tratar la respuesta como texto plano
  );
}



}
