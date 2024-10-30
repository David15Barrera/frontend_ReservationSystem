import { Component, inject } from '@angular/core';
import { AuthSesionService } from '../../services/auth-sesion.service';
import { AppState } from '../../../store';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import Swal from 'sweetalert2';
import { setSession } from '../../../store/session/actions/session.actions';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signin-mfa',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './signin-mfa.component.html',
  styleUrl: './signin-mfa.component.scss'
})
export class SigninMfaComponent {

  authService = inject(AuthSesionService)
  store = inject(Store<AppState>)
  router = inject(Router)


  code: number = 0

  signinfMFA() {
    if (!this.code) {
      Swal.fire({
        icon: "info",
        title: "Oops...",
        text: "Ingrese el codigo, por favor",
        footer: '<a>El codigo lo encuentra en la aplicacion GoogleAutenticator, si activo la autenticacion 2F</a>'
      });
      return
    }
    const currentUser: string = localStorage.getItem("current_user") || ""
    this.authService.signinMFA({ email: currentUser, code: this.code }).subscribe({
      next: value =>{
        this.store.dispatch(setSession({ session: value }))
        //TODO: redireccionar a area de trabajo.
        switch (value.role) {
          case "ADMIN":
            this.router.navigate(['/manager/inicio'])
            break
          case "EMPLEADO":
            this.router.navigate(['/manager/inicio'])
            break
          case "CLIENTE":
            this.router.navigate(['/user/dashboard'])
            break
          default:
            this.router.navigate(['/session/login'])
        }
      },
      error: err =>{
        Swal.fire({
          icon: "question",
          title: "Oops...",
          text: "Codigo incorrecto",
          footer: '<a>Asegurese de ingresar el codigo correcto que la palicacion le proporciona</a>'
        });
      }
    })

  }
}
