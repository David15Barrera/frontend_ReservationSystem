export interface PermissionDTO {
    id: number;
    name: string;
    description: string;
}

export interface RoleDTO {
    id: number;
    name: string;
    description: string
}

export interface UserDto {
    id: number;
    name: string;
    cui: string;
    email: string;
    phone: string;
    address?: string;
    nit: string;
    createdAt: string;
    hasMultiFactorAuth: boolean;
    role: string;
    permissions: Array<string>;
  }
  
export interface userUpdateDTO{
    idUser:number;
    role:RoleDTO;
    permissions: Array<number>;
}