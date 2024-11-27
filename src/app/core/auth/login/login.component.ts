import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthSesionService } from '../../services/auth-sesion.service';
import { Router, RouterLink } from '@angular/router';
import { AppState } from '../../../store';
import { Store } from '@ngrx/store';
import { SignInModel } from '../../interfaces/sesion';
import { setSession } from '../../../store/session/actions/session.actions';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  authService: AuthSesionService = inject(AuthSesionService)
  router: Router = inject(Router)
  store = inject(Store<AppState>)

  formBuilder: FormBuilder = inject(FormBuilder)


  hideConfirmPassword = true;

  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  })


  login() {
    if (this.loginForm.invalid) {
      // Verifica si el formulario es inválido
      Swal.fire({
        icon: 'error',
        title: 'Campos vacíos o inválidos',
        text: 'Por favor, complete todos los campos correctamente.',
      });
      return;
    }

    const email = this.loginForm.get('email')!.value!;
    let signInModel: SignInModel = {
      email: email,
      password: this.loginForm.get('password')!.value!,
    };

    this.authService.signin(signInModel).subscribe({
      next: (value) => {
        this.store.dispatch(setSession({ session: value }));
        localStorage.setItem('current_user', email);

        if (value) {
          // Si el rol es ADMIN, redirige a una ruta específica
          if (value.role === 'ADMIN') {
            this.router.navigate(['manager/inicio']);
          } 
          // Si el rol es CLIENTE, redirige a una ruta diferente
          else if (value.role === 'CLIENTE') {
            this.router.navigate(['user/dashboard']);
          } else {
            console.log('Redirigiendo a else como otro rol:', value.role);
            this.router.navigate(['manager/inicio']);
          }
        } else {
          this.router.navigate(['session/signin-mfa']);
        }
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Credenciales inválidas',
          footer: '<a>Asegúrese de ingresar correctamente sus credenciales</a>',
        });
      },
    });
  }


  passwordFieldType: string = 'password';

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }
  

}
