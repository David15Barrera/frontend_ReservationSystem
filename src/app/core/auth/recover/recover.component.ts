import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { setSession } from '../../../store/session/actions/session.actions';
import { AuthSesionService } from '../../services/auth-sesion.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recover',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './recover.component.html',
  styleUrl: './recover.component.scss'
})
export class RecoverComponent {

  store = inject(Store<AppState>)
  router = inject(Router)
  private readonly authService = inject(AuthSesionService)


  user: string = ""

  ngOnInit(): void {
    this.user = localStorage.getItem('current_user') || ''
  }


  code: string = ""

  confirm() {
    if (!this.code) {
      Swal.fire({
        icon: "question",
        title: "Oops...",
        text: "Ingrese el codigo, por favor",
        footer: '<a>Asegurese de ingresar el codigo que se le fue enviado al correo</a>'
      });
      return
    }
    this.authService.recoverPasswordConfirmation(this.user, this.code).subscribe({
      next: value =>{
        console.log(value);
        let roleUpper = value.role.toUpperCase()
  
        this.store.dispatch(setSession({ session: value }))
        //TODO: redirigi area de trabajo
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
      error: err =>{
        Swal.fire({
          icon: "error",
          title: "Codigo incorrecto.",
          text: "Ingrese el codigo que se le envio al correo",
        });
      }
    })
  }

}
