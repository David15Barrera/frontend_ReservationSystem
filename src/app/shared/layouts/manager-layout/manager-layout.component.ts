import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { signOut } from '../../../store/session/actions/session.actions';
import { PermissionDTO, RoleDTO } from '../../../modules/manager/utils/models/collaborators';
import { CallaboratorService } from '../../../modules/manager/utils/services/callaborator.service';
import { ManagmentService } from '../../../modules/manager/utils/services/managment.service';
import { BusinessConfigurationDto } from '../../../modules/manager/utils/models/business-congifuration.dto';
@Component({
  selector: 'app-manager-layout',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule],
  templateUrl: './manager-layout.component.html',
  styleUrl: './manager-layout.component.scss'
})
export class ManagerLayoutComponent implements OnInit{
  isSidebarOpen = false;
  roles: RoleDTO[] = [];
  role: string | null = null;
  permissions: PermissionDTO[] = []; // Cambié a tipo PermissionDTO
  companyName: string = '';
  isDataLoaded = false;
  constructor(private store: Store, private CallaboratorService: CallaboratorService, private managementService: ManagmentService) {}

  ngOnInit() {
    this.loadCompanyName();
    const userData = localStorage.getItem('session');
    if (userData) {
      const user = JSON.parse(userData);
      this.role = user.role;

      if (user.roleId) {
        // Si ya existe el roleId, usamos directamente el método de permisos
        this.getRolPermissions(user.roleId);
      } else {
        // Si no, obtenemos los roles disponibles y buscamos el roleId
        this.loadRoleId(user.role);
      }
    }
  }
  

  loadCompanyName() {
    this.managementService.getBussinesConfiguration().subscribe(
      (config: BusinessConfigurationDto) => {
        this.companyName = config.name;
      },
      (error) => {
        console.error('Error al cargar la configuración de la empresa:', error);
      }
    );
  }

  loadRoleId(roleName: string) {
    this.getRoles().then((roles) => {
      const userRole = roles.find((r) => r.name === roleName);
      if (userRole) {
        const roleId = userRole.id;
        this.getRolPermissions(roleId);
      } else {
        console.error('No se encontró un rol con el nombre:', roleName);
      }
    });
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


  getRolPermissions(rolId: number) {
    this.CallaboratorService.getRolePermissions(rolId).subscribe({
      next: (permissions) => {
        this.permissions = permissions;
        console.log(`Permisos asignados al rol ${rolId}:`, permissions);
        this.checkDataLoaded();
      },
      error: (error) => {
        console.error('Error al obtener permisos del rol', error);
      }
    });
  }

   // Nueva función para manejar la lógica de carga de datos
  checkDataLoaded() {
    if (this.roles.length > 0 && this.permissions.length > 0) {
      this.isDataLoaded = true;
      console.log('Datos de roles y permisos cargados.');
    }
  }

  canAccess(permission: string): boolean {
    const userPermissions = new Set(this.permissions.map(p => p.name));
    return userPermissions.has(permission);
  }
  

  logout() {
    this.store.dispatch(signOut());
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
