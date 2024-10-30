import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PermissionDTO } from '../utils/models/collaborators';
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

  constructor(private CallaboratorService: CallaboratorService) {}

  ngOnInit() {
    const userData = localStorage.getItem('session');
    
    if (userData) {
      const user = JSON.parse(userData);
      this.role = user.role; // Obtener el rol del usuario

      // Llamar al método del servicio para obtener permisos
      this.getUserPermissions(user.id);
    }
  }

  getUserPermissions(userId: number) {
    this.CallaboratorService.getUserPermissions(userId).subscribe({
      next: (permissions) => {
        this.permissions = permissions; // Asigna los permisos obtenidos
      },
      error: (error) => {
        console.error('Error al obtener permisos', error);
      }
    });
  }

  canAccess(permission: string): boolean {
    return this.role !== 'EMPLEADO' || this.permissions.some(p => p.name === permission);
  }
}
