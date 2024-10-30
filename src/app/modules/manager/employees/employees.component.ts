import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionsService } from '../utils/services/permissions.service';
import { PermissionDTO, RoleDTO, UserDto, userUpdateDTO } from '../utils/models/collaborators';
import { CallaboratorService } from '../utils/services/callaborator.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent implements OnInit {
  constructor(private CallaboratorService: CallaboratorService) {}
  
  roles: RoleDTO[] = [];
  users: UserDto[] = [];
  permissions: PermissionDTO[] = [];
  idRol = 1;

  permissionsService = inject(PermissionsService);

  displayedColumns: string[] = ['name', 'role', 'permissions'];
  displayedColumnsNoPATCH: string[] = ['name', 'role'];
  
  ngOnInit(): void {
    this.getRoles();
    this.getPermissions();
  }

  openDialog(user: UserDto): void {
    this.CallaboratorService.getUserPermissions(user.id).subscribe({
        next: (userPermissions: PermissionDTO[]) => { // Ahora userPermissions es un array de PermissionDTO
            // Extraer solo los nombres de los permisos
            const userPermissionNames = userPermissions.map(permission => permission.name); // Esto ahora debería funcionar

            const modal = document.createElement('div');
            modal.classList.add('fixed', 'inset-0', 'bg-gray-500', 'bg-opacity-75', 'flex', 'justify-center', 'items-center');

            modal.innerHTML = `
                <div class="bg-white p-5 rounded-lg shadow-lg w-1/2">
                    <h2 class="text-lg font-semibold mb-4">Editar Usuario</h2>
                    <form id="editUserForm" class="space-y-4">
                        <div>
                            <label for="correo" class="block text-sm font-medium text-gray-700">Correo</label>
                            <input id="correo" name="correo" type="email" value="${user.email}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label for="role" class="block text-sm font-medium text-gray-700">Rol</label>
                            <select id="role" name="role" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                ${this.roles.map(role => `
                                    <option value="${role.id}" ${role.name === user.role ? 'selected' : ''}>${role.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        ${user.role === 'EMPLEADO' ? `
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Permisos</label>
                            ${this.permissions.map(permission => `
                                <div class="flex items-center">
                                    <input type="checkbox" id="permission-${permission.id}" name="permissions" value="${permission.id}" ${userPermissions.some(up => up.id === permission.id) ? 'checked' : ''} class="mr-2">
                                    <label for="permission-${permission.id}" class="text-sm">${permission.name}</label>
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                    </form>
                    <button id="saveUser" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Guardar</button>
                    <button id="closeModal" class="mt-4 bg-red-500 text-white px-4 py-2 rounded">Cerrar</button>
                </div>
            `;

            document.body.appendChild(modal);

            document.getElementById('closeModal')?.addEventListener('click', () => {
                document.body.removeChild(modal);
            });

            document.getElementById('saveUser')?.addEventListener('click', () => {
                const form = document.getElementById('editUserForm') as HTMLFormElement;
                const formData = new FormData(form);

                const selectedRoleId = Number(formData.get('role'));
                const selectedPermissions = user.role === 'EMPLEADO'
                    ? Array.from(form.querySelectorAll('input[name="permissions"]:checked'))
                        .map(input => Number((input as HTMLInputElement).value))
                        .filter(id => !isNaN(id))
                    : [];

                const updatedUser: userUpdateDTO = {
                    idUser: user.id,
                    role: { id: selectedRoleId, name: this.roles.find(role => role.id === selectedRoleId)?.name || '', description: '' },
                    permissions: selectedPermissions
                };

                this.CallaboratorService.updateUser(updatedUser).subscribe({
                    next: result => {
                        document.body.removeChild(modal);
                        Swal.fire({
                            position: "top-end",
                            icon: "success",
                            title: "Usuario actualizado con éxito",
                            showConfirmButton: false,
                            timer: 1500
                        });
                    },
                    error: err => {
                        console.error('Error al actualizar usuario:', err);
                        Swal.fire({
                            title: "Error!",
                            text: "Ha ocurrido un error al actualizar, comuníquese con soporte",
                            icon: "error"
                        });
                    }
                });
            });
        },
        error: (err) => {
            console.error('Error al obtener permisos del usuario:', err);
        }
    });
}


  getRoles() {
    this.CallaboratorService.getRoles().subscribe({
      next: (value) => {
        this.roles = value;
      },
      error: (err) => {
        console.error('Error al obtener los roles:', err);
      }
    });
  }

  getPermissions() {
    this.CallaboratorService.getPermission().subscribe({
      next: (value) => {
        this.permissions = value;
      },
      error: (err) => {
        console.error('Error al obtener los permisos:', err);
      }
    });
  }

  onRoleChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.idRol = Number(selectElement.value);
    this.getUserRole(this.idRol);
  }

  getUserRole(idRol: number) {
    this.CallaboratorService.getUserByRole(idRol).subscribe({
      next: (value) => {
        this.users = value;
      },
      error: (err) => {
        console.error('Error al obtener usuarios por rol:', err);
      }
    });
  }
}