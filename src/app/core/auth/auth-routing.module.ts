import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ConfirmationComponent } from './confirmation/confirmation.component';
import { FindComponent } from './find/find.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MfaComponent } from './mfa/mfa.component';
import { RecoverComponent } from './recover/recover.component';
import { SigninMfaComponent} from './signin-mfa/signin-mfa.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
const routes: Routes = [
  {
    path:'', component: LoginComponent  
  },
  {
    path:'confirmacion', component: ConfirmationComponent  
  },
  {
    path:'find', component: FindComponent
  },
  {
    path:'login', component: LoginComponent
  },
  {
    path:'Registro', component: RegisterComponent
  },
  {
    path:'autenticacion', component: MfaComponent
  },
  {
    path:'recuperacion', component: RecoverComponent
  },
  {
    path:'signin-mfa', component: SigninMfaComponent
  },
  {
    path:'change-pass', component: ChangePasswordComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
