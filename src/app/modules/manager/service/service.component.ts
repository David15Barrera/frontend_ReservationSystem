import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ServiceDto } from '../utils/models/service.dto';
import { ServiceService } from '../utils/services/service.service';
import { PermissionDTO } from '../utils/models/collaborators';
import { Store } from '@ngrx/store';
import { CallaboratorService } from '../utils/services/callaborator.service';
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  state: string;
  categoryId: number;
  imageUrls: string[];
}

interface Category {
  id: number;
  name: string;
}

@Component({
  selector: 'app-service',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './service.component.html',
  styleUrl: './service.component.scss'
})
export class ServiceComponent {

  products: ServiceDto[] = [];
  filteredProducts: ServiceDto[] = [];
  categories: Category[] = [];
  searchQuery: string = '';
  maxPrice: number = 1000;
  selectedPrice: number = 1000;

  role: string | null = null;
  permissions: PermissionDTO[] = []; // Cambié a tipo PermissionDTO
  
  private readonly serviceService = inject(ServiceService)
 
  constructor(private store: Store, private CallaboratorService: CallaboratorService) {}

  ngOnInit() {

    const userData = localStorage.getItem('session');
    console.log(userData);

    if (userData) {
      const user = JSON.parse(userData);
      this.role = user.role; // Obtener el rol del usuario

      // Llamar al método del servicio para obtener permisos
      this.getUserPermissions(user.id);
    }

    this.getServices()
  }
  onSearch(event: any) {
    this.searchQuery = event.target.value.toLowerCase();
    this.filterProducts();
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

  /**
  onFilterChange(filter: string) {
    if (filter === 'available') {
      this.filteredProducts = this.products.filter(product => product.status === 'Disponible');
    } else if (filter === 'popular') {
      this.filteredProducts = this.products.filter(product => product.price > 150);
    } else {
      this.filteredProducts = this.products;
    }
  }
   */

  onPriceFilter(event: any) {
    this.selectedPrice = event.target.value;
    this.filterProducts();
  }

  filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(this.searchQuery);
      const matchesPrice = product.price <= this.selectedPrice;
      return matchesSearch && matchesPrice;
    });
  }

  addToCart(product: Product) {

    console.log('Servicio agregado al carrito:', product);
  }

  trackByIndex(index: number, item: Product): number {
    return index;
  }

  getServices() {
    this.serviceService.getServicesAvailable().subscribe({
      next: value => {
        this.products = value;
        this.filteredProducts = [...this.products];
      }
    });

    this.serviceService.getServicesUnAvailable().subscribe({
      next: value => {
        this.products = [...this.products, ...value];
        this.filteredProducts = [...this.products];
      }
    });
  }

  getStatus(estate: string): string {
    switch (estate) {
      case 'AVAILABLE':
        return 'DISPONIBLE'
      case 'UNAVAILABLE':
        return 'NO DISPONIBLE'
      default:
        return 'NO DISPONIBLE'
    }
  }

}
