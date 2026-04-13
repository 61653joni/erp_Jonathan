import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Footer } from '../../shared/components/footer/footer';

interface Permisos {
  tickets: {
    ver: boolean;
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
    cambiarEstado: boolean;
    comentar: boolean;
    asignar: boolean;
  };
  grupos: {
    ver: boolean;
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
    agregarMiembros: boolean;
    quitarMiembros: boolean;
  };
  usuarios: {
    ver: boolean;
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
  };
}

interface User {
  email: string;
  password: string;
  nombre: string;
  estado: 'activo' | 'inactivo';
  permisos: Permisos;
}

const USERS: User[] = [
  {
    email: 'usuario1@example.com',
    password: '123456',
    nombre: 'Miembro',
    estado: 'activo',
    permisos: {
      tickets: {
        ver: true, crear: true, editar: true, eliminar: true,
        cambiarEstado: true, comentar: true, asignar: true
      },
      grupos: {
        ver: true, crear: true, editar: true, eliminar: true,
        agregarMiembros: true, quitarMiembros: true
      },
      usuarios: {
        ver: true, crear: true, editar: true, eliminar: true
      }
    }
  },
  {
    email: 'usuario2@example.com',
    password: '123456',
    nombre: 'Jonathan',
    estado: 'activo',
    permisos: {
      tickets: {
        ver: true, crear: true, editar: true, eliminar: false,
        cambiarEstado: true, comentar: true, asignar: true
      },
      grupos: {
        ver: true, crear: true, editar: true, eliminar: false,
        agregarMiembros: true, quitarMiembros: false
      },
      usuarios: {
        ver: true, crear: false, editar: false, eliminar: false
      }
    }
  },
  {
    email: 'usuario3@example.com',
    password: '123456',
    nombre: 'Juan',
    estado: 'activo',
    permisos: {
      tickets: {
        ver: true, crear: true, editar: true, eliminar: true,
        cambiarEstado: true, comentar: true, asignar: true
      },
      grupos: {
        ver: true, crear: true, editar: true, eliminar: true,
        agregarMiembros: true, quitarMiembros: true
      },
      usuarios: {
        ver: true, crear: true, editar: true, eliminar: true
      }
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
    localStorage.setItem('permisos', JSON.stringify(user.permisos));
    localStorage.setItem('email', user.email);
    localStorage.setItem('nombre', user.nombre);
    localStorage.removeItem('role');

    this.router.navigate(['/dashboard']);
  }
}