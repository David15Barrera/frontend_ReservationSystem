import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PermissionDTO, RoleDTO } from '../utils/models/collaborators';
import { CallaboratorService } from '../utils/services/callaborator.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  permissions: PermissionDTO[] = [];
  role: string | null = null;
  roles: RoleDTO[] = [];

  constructor(private CallaboratorService: CallaboratorService) {}

  ngOnInit() {
    const userData = localStorage.getItem('session');
    if (userData) {
      const user = JSON.parse(userData);
      this.role = user.role;

      if (user.roleId) {
        // Si el roleId ya está disponible
        this.getRolePermissions(user.roleId);
      } else {
        // Si no está disponible, obtenemos los roles y buscamos el roleId
        this.loadRoleId(user.role);
      }
    }
  }

  loadRoleId(roleName: string) {
    this.getRoles().then((roles) => {
      const userRole = roles.find((r) => r.name === roleName);
      if (userRole) {
        const roleId = userRole.id;
        this.getRolePermissions(roleId);
      } else {
        console.error('No se encontró un rol con el nombre:', roleName);
      }
    });
  }

  async getRoles(): Promise<RoleDTO[]> {
    return new Promise((resolve, reject) => {
      this.CallaboratorService.getRoles().subscribe({
        next: (roles) => {
          this.roles = roles;
          resolve(roles);
        },
        error: (err) => {
          console.error('Error al obtener los roles:', err);
          reject(err);
        }
      });
    });
  }

  getRolePermissions(roleId: number) {
    this.CallaboratorService.getRolePermissions(roleId).subscribe({
      next: (permissions) => {
        this.permissions = permissions;
        console.log(`Permisos asignados al rol ${roleId}:`, permissions);
      },
      error: (error) => {
        console.error('Error al obtener permisos del rol', error);
      }
    });
  }
  canAccess(permission: string): boolean {
    return this.permissions.some((p) => p.name === permission);
  }
}
