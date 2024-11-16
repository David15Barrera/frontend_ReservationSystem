import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { FindComponent } from './find/find.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MfaComponent } from './mfa/mfa.component';
import { RecoverComponent } from './recover/recover.component';
import { SigninMfaComponent} from './signin-mfa/signin-mfa.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ConfirmationComponent,
    FindComponent,
    LoginComponent,
    RegisterComponent,
    MfaComponent,
    RecoverComponent,
    SigninMfaComponent,
    ChangePasswordComponent
  ]
})
export class AuthModule { }
