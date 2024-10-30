import { Component, inject } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { AuthSesionService } from '../../services/auth-sesion.service';
import { Router } from '@angular/router';
import { AppState } from '../../../store';
import { Store } from '@ngrx/store'
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mfa',
  standalone: true,
  imports: [QRCodeModule, FormsModule],
  templateUrl: './mfa.component.html',
  styleUrl: './mfa.component.scss'
})
export class MfaComponent {

  private readonly authService = inject(AuthSesionService)
  private readonly router = inject(Router);
  store = inject(Store<AppState>)

  qrCodeUrl: string = ""
  secretKey: string = ""
  code: number = 0

  ngOnInit(): void {
    this.authService.getMFA().subscribe((resp) => {
      this.qrCodeUrl = resp.qrCodeUrl
      this.secretKey = resp.secret
    })
  }

  enableMFA() {
    this.authService.enableMFA(this.code, this.secretKey).subscribe({
      next: value =>{
        this.redirectionUser()
      },
      error: err =>{
        Swal.fire({
          icon: "info",
          title: "Oops...",
          text: "El codigo que ha introducido es invalido",
          footer: '<a>scaneo el codigo desde la aplicacion?, intente con saltar</a>'
        });
      }
    })
  }

  redirectionUser() {
    let session = JSON.parse(localStorage.getItem("session") || "{'accessToken': ''}")
    //TODO: enrutar a las areas de trabajo.
    const roleUpper = session.role.toUpperCase()
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
  }
}
