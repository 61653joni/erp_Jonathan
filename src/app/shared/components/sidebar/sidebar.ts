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
  nombre = '';
  permisos: Permisos | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.email = localStorage.getItem('email') || '';
    this.nombre = localStorage.getItem('nombre') || '';
    this.cargarPermisos();
  }

  cargarPermisos() {
    const permisosStr = localStorage.getItem('permisos');
    
    if (permisosStr) {
      this.permisos = JSON.parse(permisosStr);
    } else {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const currentUser = users.find((u: any) => u.email === this.email);
      
      if (currentUser && currentUser.permisos) {
        this.permisos = currentUser.permisos;
        localStorage.setItem('permisos', JSON.stringify(this.permisos));
      } else {
        this.permisos = {
          tickets: { ver: true, crear: false, editar: false, eliminar: false, cambiarEstado: false, comentar: false, asignar: false },
          grupos: { ver: true, crear: false, editar: false, eliminar: false, agregarMiembros: false, quitarMiembros: false },
          usuarios: { ver: false, crear: false, editar: false, eliminar: false }
        };
      }
    }
  }

  tienePermiso(categoria: keyof Permisos, accion: string = 'ver'): boolean {
    if (!this.permisos) {
      return false;
    }
    
    switch(categoria) {
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
    localStorage.removeItem('permisos');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('nombre');
    
    this.router.navigate(['/landing']);
  }
}