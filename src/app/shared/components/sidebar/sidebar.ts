import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { UpperCasePipe, NgIf, CommonModule } from '@angular/common';

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

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, UpperCasePipe, NgIf, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {

  email = '';
  role = '';
  permisos: Permisos | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.email = localStorage.getItem('email') || '';
    this.role = localStorage.getItem('role') || '';
    
    // Cargar permisos del usuario actual
    this.cargarPermisos();
  }

  cargarPermisos() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = users.find((u: any) => u.email === this.email);
    
    if (currentUser && currentUser.permisos) {
      this.permisos = currentUser.permisos;
    } else {
      // Si no hay permisos definidos, establecer valores por defecto según el rol
      if (this.role === 'super') {
        // Super admin tiene todos los permisos
        this.permisos = {
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
        };
      } else {
        // Usuarios normales tienen permisos limitados
        this.permisos = {
          tickets: {
            ver: true, crear: false, editar: false, eliminar: false,
            cambiarEstado: false, comentar: false, asignar: false
          },
          grupos: {
            ver: true, crear: false, editar: false, eliminar: false,
            agregarMiembros: false, quitarMiembros: false
          },
          usuarios: {
            ver: false, crear: false, editar: false, eliminar: false
          }
        };
      }
    }
  }

  // Función para verificar si tiene permiso para ver una sección
  tienePermiso(categoria: keyof Permisos, accion: string = 'ver'): boolean {
    // Super admin tiene todos los permisos
    if (this.role === 'super') {
      return true;
    }
    
    // Si no hay permisos definidos, retornar false
    if (!this.permisos) {
      return false;
    }
    
    // Verificar el permiso específico
    switch(categoria) {
      case 'tickets':
        return this.permisos.tickets[accion as keyof typeof this.permisos.tickets] || false;
      case 'grupos':
        return this.permisos.grupos[accion as keyof typeof this.permisos.grupos] || false;
      case 'usuarios':
        return this.permisos.usuarios[accion as keyof typeof this.permisos.usuarios] || false;
      default:
        return false;
    }
  }

  logout() {
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('nombre');
    
    this.router.navigate(['/landing']);
  }
}