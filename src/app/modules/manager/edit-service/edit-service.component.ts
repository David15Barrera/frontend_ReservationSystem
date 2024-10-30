import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessConfigurationDto } from '../utils/models/business-congifuration.dto';
import { ManagmentService } from '../utils/services/managment.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { UploadImgService } from '../../../config/services/upload-img.service';
import { ServiceService } from '../utils/services/service.service';
import { ServiceDto } from '../utils/models/service.dto';
import { PermissionDTO } from '../utils/models/collaborators';
import { Store } from '@ngrx/store';
import { CallaboratorService } from '../utils/services/callaborator.service';
@Component({
  selector: 'app-edit-service',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-service.component.html',
  styleUrl: './edit-service.component.scss'
})
export class EditServiceComponent implements OnInit {

  @Input('idservicio') servicioId!: string;

  file!: File
  formData!: FormData

  registerForm!: FormGroup;

  businessConfiguration!: BusinessConfigurationDto

  role: string | null = null;
  permissions: PermissionDTO[] = []; // Cambié a tipo PermissionDTO


  private readonly managmetService = inject(ManagmentService)
  private readonly uploadService = inject(UploadImgService)
  private readonly serviceService = inject(ServiceService)
  private readonly router = inject(Router)

  action: string = '';
  serviceDto!: ServiceDto

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private store: Store, private CallaboratorService: CallaboratorService) { }

  ngOnInit(): void {
    const userData = localStorage.getItem('session');
    console.log(userData);

    if (userData) {
      const user = JSON.parse(userData);
      this.role = user.role; // Obtener el rol del usuario

      // Llamar al método del servicio para obtener permisos
      this.getUserPermissions(user.id);
    }

    this.route.params.subscribe(params => {
      this.action = params['action'];

      if (this.action === 'edit') {
        this.loadService(params['id']);
      }
    });
    this.initRegisterFrom()
    this.getBusinessConfiguration()
  }

  getUserPermissions(userId: number) {
    this.CallaboratorService.getUserPermissions(userId).subscribe({
      next: (permissions) => {
        this.permissions = permissions; // Asigna los permisos obtenidos
      },
      error: (error) => {
        console.error('Error al obtener permisos', error);
      }
    });
  }

  canAccess(permission: string): boolean {
    return this.role !== 'EMPLEADO' || this.permissions.some(p => p.name === permission);
  }

  validForm(): boolean {
    if (!this.registerForm.valid) {
      Swal.fire({
        title: "Formulario incompleto",
        text: "Todos los campos son obligatorios",
        icon: "info"
      });
      return false
    }
    return true
  }

  private async uplogadImag(): Promise<void> {
    if (this.formData) {
      try {
        const value = await this.uploadService.saveImg(this.formData).toPromise(); // Convertimos a Promesa
        this.registerForm.value.imageUrl = value.url;
      } catch (err) {
        console.error('Error al subir la imagen: ', err);
        await Swal.fire({
          icon: 'error',
          title: 'Error al subir la imagen',
          text: 'Intente de nuevo más tarde o verifique su conexión.',
          confirmButtonText: 'Aceptar',
        });
      }
    }
  }

  loadService(id: string) {
    // Cargar el servicio :v
  }

  async updateService() {
    if (!this.validForm()) return

    await this.uplogadImag()

    this.serviceService.updateService(Number(this.servicioId), this.registerForm.value).subscribe({
      next: value => {
        this.serviceDto = value
        this.msgOK()
        this.router.navigate(['manager/servicios'])
      },
      error: err => {
        //TODO: manejo de errores, error al crear axdxd
        console.log(err);
        
      }
    })

  }


  async register() {
    if (!this.validForm()) return

    await this.uplogadImag()

    this.serviceService.createService(this.registerForm.value).subscribe({
      next: value => {
        this.serviceDto = value
        this.msgOK()
        this.router.navigate(['manager/servicios'])
      },
      error: err => {
        //TODO: manejo de errores, error al crear axdxd
        console.log(err);
      }
    })

  }


  deleteService() {
    Swal.fire({
      title: "Esta seguro de Eliminar el Servicio?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Si, continuar",
      denyButtonText: `No, cancelar!`
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.serviceService.deleted(Number(this.servicioId)).subscribe({
          next: value => {
            this.router.navigate(['manager/servicios'])
            Swal.fire("Eliiminado con exito!", "", "success");
          },
          error: err => {
            this.msgErr()
          }
        })

      } else if (result.isDenied) {
        Swal.fire("No se realizo ninguan accions", "", "info");
      }
    });
  }

  private editService(): boolean {
    if (this.servicioId && this.servicioId !== ':idservicio') {
      this.serviceService.getServiceById(Number(this.servicioId)).subscribe({
        next: value => {
          this.registerForm = this.formBuilder.group({
            name: [value.name, Validators.required],
            price: [value.price, Validators.required],
            description: [value.description, Validators.required],
            duration: [value.duration, Validators.required],
            status: [value.status, Validators.required],
            location: [value.location, Validators.required],
            peopleReaches: [value.peopleReaches, Validators.required],
            imageUrl: [value.imageUrl],
          })
          return true
        }
      })
    }
    return false
  }

  private initRegisterFrom() {
    if (this.editService()) return
    this.registerForm = this.formBuilder.group({
      name: [null, Validators.required],
      price: [null, Validators.required],
      description: [null, Validators.required],
      duration: [null, Validators.required],
      status: [null, Validators.required],
      location: [null],
      peopleReaches: [null],
      imageUrl: [null],
    })
  }

  getBusinessConfiguration() {
    this.managmetService.getBussinesConfiguration().subscribe({
      next: value => {
        this.businessConfiguration = value;
      }, error: err => {
      }
    })
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

  msgOK() {
    Swal.fire({
      title: "Proceso terminado con Exito",
      text: "Servicio creado con Exito!",
      icon: "success"
    });
  }

  msgErr() {
    Swal.fire({
      title: "Proceso no terminado",
      text: "Ha ocurrido un error al intentar eliminar el servicio",
      icon: "error"
    });
  }


}
