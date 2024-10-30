import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserDto } from '../utils/models/user.dto';
import { PermissionDTO, RoleDTO, userUpdateDTO } from '../utils/models/collaborators';
import { CallaboratorService } from '../utils/services/callaborator.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule] ,
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent {
  formulario: FormGroup;
  selectedPermisosEdit: string[] = [];

  @Input() user!: UserDto;
  @Input() roles: RoleDTO[] = [];
  @Input() permissions: PermissionDTO[] = [];
  @Output() saveUser = new EventEmitter<void>();

  constructor(private collaboratorService: CallaboratorService) {
    this.formulario = new FormGroup({
      nombre: new FormControl({ value: '', disabled: true }),
      correo: new FormControl({ value: '', disabled: true }),
    });
  }

  ngOnInit() {
    if (this.user) {
      this.formulario.patchValue({
        nombre: this.user.name,
        correo: this.user.email,
      });
      this.selectedPermisosEdit = this.user.permissions || [];
    }
  }

  enviarFormulario() {
    const userSend: userUpdateDTO = {
      idUser: this.user.id,
      role: this.getRoleSelect(),
      permissions: this.getPermissionSelected(),
    };

    this.collaboratorService.updateUser(userSend).subscribe({
      next: () => {
        this.saveUser.emit();
      },
      error: () => {
        Swal.fire({
          title: 'Error!',
          text: 'Ha ocurrido un error al actualizar, comuníquese con soporte',
          icon: 'error',
        });
      },
    });
  }

  onSelectionChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    if (target.checked) {
      this.selectedPermisosEdit.push(value);
    } else {
      this.selectedPermisosEdit = this.selectedPermisosEdit.filter(permission => permission !== value);
    }
  }

  isCallaborator(): boolean {
    return this.user.role.toLowerCase() === "EMPLEADO".toLowerCase();
  }

  onRoleChangeUser(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.user.role = target.value;
  }

  getRoleSelect(): RoleDTO {
    const role = this.roles.find(rol => rol.name === this.user.role);
    return role ? role : { name: 'Default Role', id: 1, description: 'Default Description' };
  }

  getPermissionSelected(): Array<number> {
    const premiss: Array<number> = [];
    this.selectedPermisosEdit.forEach(pe => {
      const tmp = this.permissions.find(p => p.name === pe);
      if (tmp) {
        premiss.push(tmp.id);
      }
    });
    return premiss;
  }
}
