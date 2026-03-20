import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Footer } from '../../shared/components/footer/footer';

type Role = 'miembro' | 'admin' | 'super';

interface Permisos {
  grupos: {
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
    ver: boolean;
  };
}

interface User {
  email: string;
  password: string;
  nombre: string;
  role: Role;
  permisos: Permisos;
  estado: 'activo' | 'inactivo';
}
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    RouterLink,
    Navbar,
    Footer,
    NgIf
  ],
  templateUrl: './register.html'
})
export class Register {

  usuario = '';
  nombre = '';
  email = '';
  direccion = '';
  telefono = '';
  fechaNacimiento = '';
  password = '';
  confirmar = '';

  constructor(private router: Router) { }

  // Validaciones
  esMayorDeEdad(): boolean {
    if (!this.fechaNacimiento) return false;

    const hoy = new Date();
    const nacimiento = new Date(this.fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad >= 18;
  }

  passwordValida(): boolean {
    const regex = /^(?=.*[!@#$%^&*]).{10,}$/;
    return regex.test(this.password);
  }

  telefonoValido(): boolean {
    const regex = /^[0-9]+$/;
    return regex.test(this.telefono);
  }

  camposLlenos(): boolean {
    return this.usuario.trim() !== '' &&
      this.nombre.trim() !== '' &&
      this.email.trim() !== '' &&
      this.direccion.trim() !== '' &&
      this.telefono.trim() !== '' &&
      this.fechaNacimiento !== '' &&
      this.password.trim() !== '' &&
      this.confirmar.trim() !== '';
  }

  formularioValido(): boolean {
    return this.camposLlenos() &&
      this.telefonoValido() &&
      this.esMayorDeEdad() &&
      this.passwordValida() &&
      this.password === this.confirmar;
  }

  // Mensajes de error por campo
  getErrorTelefono(): string {
    if (!this.telefono) return '';
    return this.telefonoValido() ? '' : 'Teléfono inválido (solo números)';
  }

  getErrorEdad(): string {
    if (!this.fechaNacimiento) return '';
    return this.esMayorDeEdad() ? '' : 'Debes ser mayor de 18 años';
  }

  getErrorPassword(): string {
    if (!this.password && !this.confirmar) return '';
    if (!this.passwordValida()) return 'Contraseña mínimo 10 caracteres con símbolo (!@#$%^&*)';
    if (this.password !== this.confirmar) return 'Las contraseñas no coinciden';
    return '';
  }

  registrar() {
  if (!this.formularioValido()) return;

  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');

  // ❌ evitar correos duplicados
  const existe = users.some(u => u.email === this.email);
  if (existe) {
    alert('El correo ya está registrado');
    return;
  }

  // ✔ crear usuario nuevo
  const nuevo: User = {
    email: this.email,
    password: this.password,
    nombre: this.nombre,
    role: 'miembro',
    estado: 'activo',
    permisos: {
      grupos: { crear: false, editar: false, eliminar: false, ver: true }
    }
  };

  // ✔ guardar
  users.push(nuevo);
  localStorage.setItem('users', JSON.stringify(users));

  // ✔ redirigir
  this.router.navigate(['/login']);
}
}