import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UploadImgService } from '../../../config/services/upload-img.service';
import { UserDto } from '../utils/models/user.dto';
import { UserService } from '../utils/services/user.service';
import Swal from 'sweetalert2';
import { AuthSesionService } from '../../../core/services/auth-sesion.service';
import * as QRCode from 'qrcode';
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {

  registerForm!: FormGroup;

  file!: File
  formData!: FormData

  userDto!: UserDto;
  id: number = 1

  password: string = ''
  passwordConfirm: string = ''

  qrCodeUrl: string = ""
  secretKey: string = ""
  code: number = 0
  
  private readonly uploadService = inject(UploadImgService)
  private readonly userService = inject(UserService)
  private readonly authService = inject(AuthSesionService)

  constructor(private formBuilder: FormBuilder) {
    this.id = JSON.parse(localStorage.getItem("session") || "{'id': ''}").id
    this.getMe()
  }

  changePassword() {
    if (this.password === '' || this.passwordConfirm === '') {
      Swal.fire({
        title: "Ups!",
        text: "Los campos no pueden estar vacios",
        icon: "question"
      });
      return
    }
    
    this.userService.changePassword(Number(this.id), { password: this.password, repeatedPassword: this.passwordConfirm }).subscribe({
      next: value =>{
        this.msgOk()
        this.password = ''
        this.passwordConfirm = ''
      }, 
      error: err =>{
        Swal.fire({
          title: "Ups!",
          text: "Ah ocurrido un erro al intentar cambiar tu contraseña, intenta mas tarde",
          icon: "error"
        });
        console.log(err);
      }
    })

  }

  getMe() {
    this.userService.getById(Number(this.id)).subscribe({
      next: value => {
        this.userDto = value;
        this.initForm()
      }
    })
  }

  async update() {
    if (!this.validForm()) return

    await this.uplogadImag()

    this.userService.updatePrfile(Number(this.id), this.registerForm.value).subscribe({
      next: value => {
        this.userDto = value
        this.msgOk()
      },
      error: err => {
        Swal.fire({
          title: "Ups!",
          text: "Error revice la informacion subida",
          icon: "error"
        });
        console.log(err);
      }
    })

  }

  initForm() {
    if (this.userDto) {
      this.registerForm = this.formBuilder.group({
        name: [this.userDto.name, Validators.required],
        email: [this.userDto.email, Validators.required],
        nit: [this.userDto.nit, Validators.required],
        cui: [this.userDto.cui, Validators.required],
        phone: [this.userDto.phone, Validators.required],
        imageUrl: [this.userDto.imageUrl],
      })
    }
  }

  private async uplogadImag(): Promise<void> {
    if (this.formData) {
      try {
        const value = await this.uploadService.saveImg(this.formData).toPromise(); // Convertimos a Promesa
        this.registerForm.value.imageUrl = value.url;
      } catch (err) {
        console.error('Error al subir la imagen: ', err);
        Swal.fire({
          title: "Ups!",
          text: "Error al subir imagen",
          icon: "error"
        });
      }
    }
  }


  validForm(): boolean {
    if (!this.registerForm.valid) {
      Swal.fire({
        title: "Formulario incompleto",
        text: "Todos los campos son obligatorios",
        icon: "error"
      });
      return false
    }
    return true
  }

  onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement != null && inputElement.files != null && inputElement.files.length > 0) {
      this.file = inputElement.files[0];
      this.formData = new FormData();
      this.formData.append('file', this.file, this.file.name);
      this.registerForm.value.imageUrl = 'adfafasdf'
    }
  }

  msgOk() {
    Swal.fire({
      title: "Actulizacion exitosa",
      text: "Los Cambios de su perfil se realizaron con exito",
      icon: "success"
    });
  }

 /**apartado para activar/descativar A2F */

  activarA2F() {
    this.authService.getMFA().subscribe(async (resp) => {
      this.qrCodeUrl = resp.qrCodeUrl;
      this.secretKey = resp.secret;

      // Genera el código QR en base64
      const qrCodeDataUrl = await QRCode.toDataURL(this.qrCodeUrl);

      Swal.fire({
        title: 'Autenticación de 2 factores',
        html: `
        <div class="container" style="text-align: center; margin: 0 auto;">
          <p class="subtitle">Protege tu Cuenta</p>
          <p class="moresub">Descarga la app Google Authenticator en tu móvil. Escanea el código QR o ingresa el código.</p>
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <img src="${qrCodeDataUrl}" alt="Código QR" style="width: 256px; height: 256px; margin-bottom: 16px;" />
            <div class="subtitle" style="text-align: center;">${this.secretKey}</div>
          </div>
          <p class="moresub">Ingresa el código que te aparece en la aplicación</p>
          <div style="margin-top: 16px;">
            <label for="code-input" class="input-label">Código</label>
            <input id="code-input" type="number" class="custom-input" 
              style="width: 100%; padding: 8px; margin-top: 8px; border: 1px solid #ccc; border-radius: 4px; outline: none;" />
          </div>
        </div>
      `,      
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const inputValue = (document.getElementById('code-input') as HTMLInputElement).value;
          if (!inputValue) {
            Swal.showValidationMessage('Por favor ingresa el código');
          }
          return inputValue;
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const code = result.value;
          this.code = code
          this.enableMFA(); // Llama a tu método para confirmar MFA
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.redirectionUser(); // Llama a tu método para saltar
        }
      });
    });
  }

  enableMFA() {
    this.authService.enableMFA(this.code, this.secretKey).subscribe({
      next: value =>{
        this.getMe()
        Swal.fire({
          title: "Autenticacion 2F, Completado",
          text: "La Autenticacion de 2F se ha completado con exito, en el siguiente inicio de sesion, se agregara la capa extra de seguridad",
          icon: "success"
        });
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
    Swal.fire({
      title: "No Completado",
      text: "La Autenticacion de 2F, no se completo, por lo que seguira desactivada",
      icon: "info"
    });
  }

  desactivar(){
    Swal.fire({
      title: "Esta seguro de Descativar la Autenticacion de 2 Factores?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Si, continuar",
      denyButtonText: `No, cancelar!`
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        //desctivar
        this.authService.disableMFA().subscribe({
          next: value =>{
            this.getMe()
            Swal.fire("Desactivado con exito!", "", "success");
          },
          error: err =>{
            Swal.fire({
              title: "No Completado",
              text: "No se ha posido desactivar la Autenticacion de 2F, no se completo, por lo que seguira Activado, intente mas tarde",
              icon: "error"
            });
          }
        })

      } else if (result.isDenied) {
        Swal.fire("No se realizo ninguan Accion", "", "info");
      }
    });
  }

}
