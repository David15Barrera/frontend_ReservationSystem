import { Component, inject } from '@angular/core';
import { AuthSesionService } from '../../services/auth-sesion.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-find',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './find.component.html',
  styleUrl: './find.component.scss'
})
export class FindComponent {

  private readonly authService = inject(AuthSesionService)
  private readonly router = inject(Router);

  email: string = ''

  findAccount() {
    if (!this.email) {

      Swal.fire({
        icon: "question",
        title: "Oops...",
        text: "Ingrese el correo, por favor",
      });
      return
    }

  this.authService.recoverPassword({ email: this.email }).subscribe({
      next: value => {
        localStorage.setItem("current_user", this.email)
        this.router.navigate(['session/recuperacion'])
      },
      error: err => {
        Swal.fire({
          icon: "error",
          title: "Correo invalido.",
          text: "Correo no encontrado",
          footer: '<a>Verifica el correo relacionado con su cuenta!</a>'
        });
      }
    })
}
}
