import { QRCodeModule } from 'angularx-qrcode';
import { UserService } from './../../manager/utils/services/user.service';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UploadImgService } from '../../../config/services/upload-img.service';
import { UserDto } from '../../manager/utils/models/user.dto';
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
      title: "Actualización exitosa",
      text: "Los cambios se realizadon con exito",
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
      html:`
    <div class="flex flex-col md:flex-row md:space-x-6 items-center">
      <!-- Columna 1: Código QR y Clave Secreta -->
      <div class="flex flex-col items-center space-y-4 md:w-1/2">
        <!-- QR y clave secreta -->
        <div class="bg-gray-100 p-4 rounded-lg shadow-md">
          <h4 class="text-center text-base font-semibold mb-2">Escanea el Código QR</h4>
          <img src="${qrCodeDataUrl}" alt="Código QR" class="w-64 h-64 mx-auto rounded-lg shadow" />
        </div>
        <p class="text-sm font-mono bg-blue-100 px-2 py-1 rounded-lg text-blue-700 text-center mt-2">${this.secretKey}</p>
      </div>

      <!-- Columna 2: Instrucciones y Entrada del Código -->
      <div class="flex flex-col items-center md:w-1/2">
        <!-- Instrucciones -->
        <div class="text-center mb-4">
          <h4 class="text-lg font-semibold mb-2">Paso 1: Descarga Google Authenticator</h4>
          <p class="text-sm text-gray-600">Instala la aplicación en tu dispositivo móvil para comenzar con la configuración.</p>
        </div>

        <!-- Ingreso del código -->
        <div class="w-full">
          <label for="code-input" class="block text-sm font-medium text-gray-700">Paso 2: Ingresa el Código</label>
          <input id="code-input" type="number" class="w-full p-2 border border-gray-300 rounded-md mt-1 focus:ring focus:ring-blue-300 focus:outline-none" placeholder="Código de 6 dígitos">
        </div>
      </div>
    </div>
  `,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const inputValue = (document.getElementById('code-input') as HTMLInputElement).value;
        if (!inputValue) {
          Swal.showValidationMessage('Necesitas ingresar el codigo');
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
        title: "Autenticacion Completado",
        text: "Proceso realizado con exito, en el siguiente inicio de sessión podras usar esta autentificación",
        icon: "success"
      });
    },
    error: err =>{
      Swal.fire({
        icon: "warning",
        title: "Codigo NO valido",
        text: "El codigo que ha introducido no es el correcto"
      });
    }
  })
}

redirectionUser() {
  Swal.fire({
    title: "Autentificacion 2F",
    text: "El procedimiento fue cancelado por lo cual no se activará",
    icon: "error"
  });
}

desactivar(){
  Swal.fire({
    title: "Descativar la Autenticacion de 2 Factores",
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
            text: "No se ha posido desactivar la Autenticacion de 2F, intente mas tarde",
            icon: "error"
          });
        }
      })

    } else if (result.isDenied) {
      Swal.fire("No se realizo ninguan Accion", "", "warning");
    }
  });
}


}
