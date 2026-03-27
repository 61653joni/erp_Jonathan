// grupos.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

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

interface Grupo {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  miembros: string[];
  tickets?: any[];
}

interface Usuario {
  email: string;
  nombre?: string;
  role?: string;
  permisos?: Permisos;
}

@Component({
  selector: 'app-grupos',
  templateUrl: './grupos.html',
  styleUrls: ['./grupos.css'],
  imports: [RouterModule, CommonModule, FormsModule, InputTextModule, ButtonModule, DialogModule],
})
export class Grupos implements OnInit {

  // MODALES
  displayCrearGrupo: boolean = false;
  displayEditarGrupo: boolean = false;
  displayAgregarMiembro: boolean = false;

  // GRUPOS
  grupos: Grupo[] = [];
  grupoEditando: Grupo | null = null;
  nuevoGrupo: Grupo = { id: 0, nombre: '', descripcion: '', icono: 'pi pi-building', miembros: [] };
  
  // Formulario para agregar miembro
  miembroSeleccionadoEmail: string = '';
  grupoParaAgregarMiembro: Grupo | null = null;
  usuariosDisponibles: Usuario[] = [];

  // Iconos disponibles
  iconosDisponibles = [
    { nombre: 'Sistema', valor: 'pi pi-building', descripcion: 'Icono para grupos de sistema' },
    { nombre: 'Usuarios', valor: 'pi pi-users', descripcion: 'Icono para grupos de usuarios' },
    { nombre: 'Proyecto', valor: 'pi pi-folder', descripcion: 'Icono para proyectos' },
    { nombre: 'Equipo', valor: 'pi pi-users', descripcion: 'Icono para equipos' },
    { nombre: 'Tarea', valor: 'pi pi-check-square', descripcion: 'Icono para tareas' },
    { nombre: 'Calendario', valor: 'pi pi-calendar', descripcion: 'Icono para calendarios' },
    { nombre: 'Documento', valor: 'pi pi-file', descripcion: 'Icono para documentos' },
    { nombre: 'Chat', valor: 'pi pi-comments', descripcion: 'Icono para chats' },
    { nombre: 'Configuración', valor: 'pi pi-cog', descripcion: 'Icono para configuración' },
    { nombre: 'Seguridad', valor: 'pi pi-shield', descripcion: 'Icono para seguridad' },
    { nombre: 'Notificación', valor: 'pi pi-bell', descripcion: 'Icono para notificaciones' },
    { nombre: 'Dashboard', valor: 'pi pi-chart-line', descripcion: 'Icono para dashboards' },
    { nombre: 'Correo', valor: 'pi pi-envelope', descripcion: 'Icono para correos' },
    { nombre: 'Descarga', valor: 'pi pi-download', descripcion: 'Icono para descargas' },
    { nombre: 'Subida', valor: 'pi pi-upload', descripcion: 'Icono para subidas' },
    { nombre: 'Eliminar', valor: 'pi pi-trash', descripcion: 'Icono para eliminar' },
    { nombre: 'Editar', valor: 'pi pi-pencil', descripcion: 'Icono para editar' },
    { nombre: 'Buscar', valor: 'pi pi-search', descripcion: 'Icono para búsqueda' },
    { nombre: 'Inicio', valor: 'pi pi-home', descripcion: 'Icono para inicio' },
    { nombre: 'Ayuda', valor: 'pi pi-question-circle', descripcion: 'Icono para ayuda' }
  ];

  // USUARIO Y ESTADÍSTICAS
  currentUserEmail: string = '';
  currentRole: string = '';
  currentUserPermisos: Permisos | null = null;
  totalGrupos: number = 0;
  totalMiembros: number = 0;

  constructor(private router: Router) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    const data = JSON.parse(localStorage.getItem('grupos') || '[]');
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    this.currentUserEmail = user.email || '';
    this.currentRole = user.role || '';

    const currentUserData = users.find((u: Usuario) => u.email === this.currentUserEmail);
    this.currentUserPermisos = currentUserData?.permisos || null;

    if (this.currentRole === 'super') {
      this.usuariosDisponibles = users;
    } else {
      this.usuariosDisponibles = users.filter((u: Usuario) => u.email !== this.currentUserEmail);
    }

    if (this.currentRole === 'super') {
      this.grupos = data;
    } else {
      if (this.tienePermiso('grupos', 'ver')) {
        this.grupos = data.filter((g: Grupo) =>
          g.miembros.includes(this.currentUserEmail)
        );
      } else {
        this.grupos = [];
      }
    }

    this.totalGrupos = this.grupos.length;
    this.totalMiembros = this.grupos.reduce((acc, g) => acc + g.miembros.length, 0);
  }

  tienePermiso(categoria: keyof Permisos, accion: string): boolean {
    if (this.currentRole === 'super') {
      return true;
    }

    if (!this.currentUserPermisos) {
      return false;
    }

    switch(categoria) {
      case 'tickets':
        return this.currentUserPermisos.tickets[accion as keyof typeof this.currentUserPermisos.tickets] || false;
      case 'grupos':
        return this.currentUserPermisos.grupos[accion as keyof typeof this.currentUserPermisos.grupos] || false;
      case 'usuarios':
        return this.currentUserPermisos.usuarios[accion as keyof typeof this.currentUserPermisos.usuarios] || false;
      default:
        return false;
    }
  }

  // Navegar a la vista detallada del grupo
  irAlGrupo(grupoId: number) {
    if (!this.tienePermiso('tickets', 'ver')) {
      alert('No tienes permiso para ver tickets');
      return;
    }
    this.router.navigate(['/dashboard/grupo', grupoId]);
  }

  // --- GRUPOS ---
  abrirCrearGrupo() {
    if (!this.tienePermiso('grupos', 'crear')) {
      alert('No tienes permiso para crear grupos');
      return;
    }
    this.nuevoGrupo = { id: Date.now(), nombre: '', descripcion: '', icono: 'pi pi-building', miembros: [] };
    this.displayCrearGrupo = true;
  }

  guardarGrupo() {
    if (!this.nuevoGrupo.nombre) return;
    this.grupos.push({ ...this.nuevoGrupo });
    localStorage.setItem('grupos', JSON.stringify(this.grupos));
    this.displayCrearGrupo = false;
    this.actualizarEstadisticas();
  }

  abrirEditarGrupo(grupo: Grupo) {
    if (!this.tienePermiso('grupos', 'editar')) {
      alert('No tienes permiso para editar grupos');
      return;
    }
    this.grupoEditando = { ...grupo };
    this.displayEditarGrupo = true;
  }

  guardarEditarGrupo() {
    if (!this.grupoEditando) return;
    if (!this.grupoEditando.nombre) return;
    
    const index = this.grupos.findIndex(g => g.id === this.grupoEditando!.id);
    if (index !== -1) {
      this.grupos[index] = { ...this.grupoEditando };
      localStorage.setItem('grupos', JSON.stringify(this.grupos));
      this.actualizarEstadisticas();
    }
    this.displayEditarGrupo = false;
    this.grupoEditando = null;
  }

  cerrarEditarGrupo() {
    this.displayEditarGrupo = false;
    this.grupoEditando = null;
  }

  abrirAgregarMiembro(grupo: Grupo) {
    if (!this.tienePermiso('grupos', 'agregarMiembros')) {
      alert('No tienes permiso para agregar miembros');
      return;
    }
    this.grupoParaAgregarMiembro = grupo;
    this.miembroSeleccionadoEmail = '';
    this.displayAgregarMiembro = true;
  }

  guardarAgregarMiembro() {
    if (!this.grupoParaAgregarMiembro) return;
    if (!this.miembroSeleccionadoEmail) {
      alert('Seleccione un usuario');
      return;
    }

    const email = this.miembroSeleccionadoEmail;

    if (!this.grupoParaAgregarMiembro.miembros.includes(email)) {
      this.grupoParaAgregarMiembro.miembros.push(email);
      localStorage.setItem('grupos', JSON.stringify(this.grupos));
      this.actualizarEstadisticas();
      this.displayAgregarMiembro = false;
      this.miembroSeleccionadoEmail = '';
      this.grupoParaAgregarMiembro = null;
    } else {
      alert('El usuario ya es miembro del grupo');
    }
  }

  cerrarAgregarMiembro() {
    this.displayAgregarMiembro = false;
    this.miembroSeleccionadoEmail = '';
    this.grupoParaAgregarMiembro = null;
  }

  actualizarEstadisticas() {
    this.totalGrupos = this.grupos.length;
    this.totalMiembros = this.grupos.reduce((acc, g) => acc + g.miembros.length, 0);
  }

  getIconoNombre(iconoValor: string): string {
    const icono = this.iconosDisponibles.find(i => i.valor === iconoValor);
    return icono ? icono.nombre : 'Sistema';
  }

  eliminarGrupo(grupo: Grupo) {
    if (!this.tienePermiso('grupos', 'eliminar')) {
      alert('No tienes permiso para eliminar grupos');
      return;
    }
    
    if (confirm(`¿Estás seguro de eliminar el grupo "${grupo.nombre}"?`)) {
      this.grupos = this.grupos.filter(g => g.id !== grupo.id);
      localStorage.setItem('grupos', JSON.stringify(this.grupos));
      this.actualizarEstadisticas();
    }
  }
}