import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthSesionService } from '../../services/auth-sesion.service';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store';
import { setSession } from '../../../store/session/actions/session.actions';
@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {
  private readonly authService = inject(AuthSesionService)
  private readonly router = inject(Router);

  store = inject(Store<AppState>)


  NewPassword: string = ''
  repeatPassword: string = ''

  changePassword() {
    if (this.NewPassword === '' || this.repeatPassword === '') {
      this.msgInvalid()
      return
    }

    if (this.NewPassword !== this.repeatPassword) {
      this.msgInvalidRepeat()
      return
    }


    try {
      const id = JSON.parse(localStorage.getItem("session") || "{'id': ''}").id
      if (!id) {
        this.acctionInvlid()
        console.log('Porque ')
        return
      }

      this.authService.recoverPasswordChange(this.NewPassword, Number(id)).subscribe({
        next: value => {
          let roleUpper = value.role.toUpperCase()
          this.acctionAccept();
          this.store.dispatch(setSession({ session: value }))
          switch (roleUpper) {
            case "ADMIN":
              this.router.navigate(['manager/inicio'])
              break
            case "EMPLEADO":
              this.router.navigate(['manager/inicio'])
              break
            case "CLIENTE":
              this.router.navigate(['user/dashboard'])
              break
          }

        },
        error: err => {
          console.log(err);
          this.acctionInvlid()
        }
      })
    } catch (error) {
      this.acctionInvlid()
    }

  }

  private msgInvalid() {
    Swal.fire({
      icon: "warning",
      title: "Campos Vacios",
      text: "Tienes que completar todos los campos",
    });
  }

  private msgInvalidRepeat() {
    Swal.fire({
      icon: "warning",
      title: "Contraseñas",
      text: "Las contraseñas no coindicen, verificar",
    });
  }

  private acctionInvlid() {
    Swal.fire({
      icon: "error",
      title: "Accion No permitida",
      text: "No se puede recuperar contraseña, ya que no esta siguiendo los pasos adecuadamente",
    });
  }

  private acctionAccept(){
    Swal.fire({
      icon: "success",
      title:"Contraseña Cambiada",
      text: "Felicidades hemos cambiado la contraseña con exito"
    })
  }
}
