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


  
  // Nueva propiedad para manejar el estado de carga
  isDataLoaded = false;

  displayedColumns: string[] = ['name', 'role', 'permissions'];
  displayedColumnsNoPATCH: string[] = ['name', 'role'];

  ngOnInit(): void {
    this.getRoles();
    this.getPermissions();
  }

  openRoleDialog(): void {
    Swal.fire({
      title: 'Crear Rol',
      html: `
        <input id="roleName" class="swal2-input" placeholder="Nombre del rol">
        <br>
        <br>
        <br>
        <textarea id="roleDescription" class="swal2-input" placeholder="Descripción del rol"></textarea>
      `,
      preConfirm: () => {
        const name = (document.getElementById('roleName') as HTMLInputElement).value.trim();
        const description = (document.getElementById('roleDescription') as HTMLTextAreaElement).value.trim();
  
        // Validar que ambos campos no estén vacíos
        if (!name) {
          Swal.showValidationMessage('El nombre del rol es obligatorio');
          return null; // Evita cerrar el modal
        }
  
        if (!description) {
          Swal.showValidationMessage('La descripción del rol es obligatoria');
          return null; // Evita cerrar el modal
        }
  
        return { name, description };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const role: RoleDTO = { id: 0, name: result.value.name, description: result.value.description };
  
        this.CallaboratorService.addRole(role).subscribe({
          next: (newRole) => {
            this.roles.push(newRole);
            Swal.fire('¡Éxito!', 'Rol creado correctamente', 'success')
            .then(()=> {
              location.reload();
            });
          },
          error: () => Swal.fire('Error', 'No se pudo crear el rol', 'error')
        });
      }
    });
  }
  

openPermissionsDialog(role: RoleDTO): void {
  this.CallaboratorService.getRolePermissions(role.id).subscribe({
    next: (permissions: PermissionDTO[]) => {
      console.log('Permisos del rol:', permissions);

      Swal.fire({
        title: `Editar Permisos para ${role.name}`,
        html: this.permissions
          .map((perm) => {
            const isChecked = permissions.some((permission) => permission.id === perm.id);
            return `
              <div>
                <input type="checkbox" id="perm-${perm.id}" value="${perm.id}" ${isChecked ? 'checked' : ''}>
                <label for="perm-${perm.id}">${perm.name}</label>
              </div>
            `;
          })
          .join(''),
        preConfirm: () => {
          const selectedPermIds = Array.from(
            document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked')
          ).map((input) => Number(input.value));

          // Validar que al menos un permiso esté seleccionado
          if (selectedPermIds.length === 0) {
            Swal.showValidationMessage('Debes seleccionar al menos un permiso');
            return null; // Evita cerrar el modal
          }

          return selectedPermIds; // Devuelve los permisos seleccionados
        }
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          this.CallaboratorService.updateRolePermissions(role.id, result.value).subscribe({
            next: () => Swal.fire('¡Éxito!', 'Permisos actualizados correctamente', 'success'),
            error: (err) => Swal.fire('Error', 'No se pudieron actualizar los permisos', 'error')
          });
        }
      });
    },
    error: (err) => {
      console.error('Error al obtener permisos del rol:', err);
      Swal.fire('Error', 'No se pudieron obtener los permisos del rol', 'error');
    }
  });
}




deleteRole(roleId: number): void {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará el rol permanentemente',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.CallaboratorService.deleteRole(roleId).subscribe({
        next: (response) => {
          if (response === "Role deleted successfully") { // Verifica que la respuesta sea la esperada
            this.roles = this.roles.filter((role) => role.id !== roleId);
            Swal.fire('Eliminado', 'El rol ha sido eliminado', 'success');
          } else {
            Swal.fire('Error', 'No se pudo eliminar el rol', 'error');
          }
        },
        error: (err) => {
          console.error('Error al eliminar el rol:', err);
          Swal.fire('Error', 'No se pudo eliminar el rol', 'error');
        }
      });
    }
  });
}


  getRoles() {
    this.CallaboratorService.getRoles().subscribe({
      next: (value) => {
        this.roles = value;
        this.checkDataLoaded(); // Verificar datos después de cargar roles
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
        this.checkDataLoaded(); // Verificar datos después de cargar permisos
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

  // Nueva función para manejar la lógica de carga de datos
  checkDataLoaded() {
    if (this.roles.length > 0 && this.permissions.length > 0) {
      this.isDataLoaded = true;
      console.log('Datos de roles y permisos cargados.');
    }
  }

  openEditRoleDialog(role: RoleDTO): void {
    Swal.fire({
      title: 'Editar Rol',
      html: `
        <input id="roleName" class="swal2-input" value="${role.name}" placeholder="Nombre del rol">
        <br><br>
        <textarea id="roleDescription" class="swal2-input" placeholder="Descripción del rol">${role.description}</textarea>
      `,
      preConfirm: () => {
        const name = (document.getElementById('roleName') as HTMLInputElement).value.trim();
        const description = (document.getElementById('roleDescription') as HTMLTextAreaElement).value.trim();
  
        if (!name) {
          Swal.showValidationMessage('El nombre del rol es obligatorio');
          return null;
        }
  
        if (!description) {
          Swal.showValidationMessage('La descripción del rol es obligatoria');
          return null;
        }
  
        return { name, description };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedRole: Partial<RoleDTO> = { name: result.value.name, description: result.value.description };
  
        this.CallaboratorService.updateRole(role.id, updatedRole).subscribe({
          next: (updatedRoleData) => {
            // Reemplaza todo el arreglo de roles con el rol actualizado
            this.roles = this.roles.map(r => r.id === role.id ? updatedRoleData : r);
            
            Swal.fire('¡Éxito!', 'Rol actualizado correctamente', 'success');
            location.reload();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo actualizar el rol', 'error');
          }
        });
      }
    });
  }
 
  openDialog(user: UserDto): void {
    this.CallaboratorService.getUserPermissions(user.id).subscribe({
      next: (userPermissions: PermissionDTO[]) => {
        const userPermissionNames = userPermissions.map(permission => permission.name);

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

}