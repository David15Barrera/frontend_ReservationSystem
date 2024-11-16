import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UploadImgService } from '../../../config/services/upload-img.service';
import { UserDto } from '../utils/models/user.dto';
import { UserService } from '../utils/services/user.service';
import Swal from 'sweetalert2';

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


  private readonly uploadService = inject(UploadImgService)
  private readonly userService = inject(UserService)

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



}
