export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  address?: string;
  phone?: string;
  isAdmin?: boolean;
  token?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  address?: string;
  phone?: string;
}
