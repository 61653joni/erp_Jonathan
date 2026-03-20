import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
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
  estado: 'activo' | 'inactivo';
  permisos: Permisos;
}

const USERS: User[] = [
  {
    email: 'miembro@gmail.com',
    password: '123456',
    role: 'miembro',
    nombre: 'Miembro',
    estado: 'activo',
    permisos: {
      grupos: { crear: false, editar: false, eliminar: false, ver: true }
    }
  },
  {
    email: 'admin@gmail.com',
    password: '123456',
    role: 'admin',
    nombre: 'Administrador',
    estado: 'activo',
    permisos: {
      grupos: { crear: true, editar: true, eliminar: false, ver: true }
    }
  },
  {
    email: 'super@gmail.com',
    password: '123456',
    role: 'super',
    nombre: 'Super Usuario',
    estado: 'activo',
    permisos: {
      grupos: { crear: true, editar: true, eliminar: true, ver: true }
    }
  }
];

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    InputTextModule,
    FormsModule,
    RouterLink,
    NgIf,
    Navbar,
    Footer
  ],
  templateUrl: './login.html'
})
export class Login implements OnInit {

  email = '';
  password = '';
  error = '';

  constructor(private router: Router) { }

  ngOnInit() {
    const existing: User[] = JSON.parse(localStorage.getItem('users') || '[]');

    if (!existing.length) {
      localStorage.setItem('users', JSON.stringify(USERS));
    } else {
      const updated = existing.map(u => ({
        ...u,
        estado: u.estado || 'activo'
      }));
      localStorage.setItem('users', JSON.stringify(updated));
    }
  }

  login() {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');

    const user = users.find(
      u => u.email === this.email && u.password === this.password
    );

    if (!user) {
      this.error = 'Credenciales incorrectas';
      return;
    }

    if (user.estado === 'inactivo') {
      this.error = 'Usuario desactivado';
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('role', user.role);
    localStorage.setItem('permisos', JSON.stringify(user.permisos));
    localStorage.setItem('email', user.email);
    localStorage.setItem('nombre', user.nombre);

    this.router.navigate(['/dashboard']);
  }

}