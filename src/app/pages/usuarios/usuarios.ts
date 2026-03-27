import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';

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
  role: string;
  permisos: Permisos;
  estado: 'activo' | 'inactivo';
}

// Estructura base de permisos
const permisosBase: Permisos = {
  tickets: {
    ver: true,
    crear: false,
    editar: false,
    eliminar: false,
    cambiarEstado: false,
    comentar: false,
    asignar: false
  },
  grupos: {
    ver: true,
    crear: false,
    editar: false,
    eliminar: false,
    agregarMiembros: false,
    quitarMiembros: false
  },
  usuarios: {
    ver: false,
    crear: false,
    editar: false,
    eliminar: false
  }
};

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule, 
    TableModule, 
    FormsModule, 
    ToggleSwitchModule, 
    DialogModule, 
    ButtonModule, 
    CheckboxModule
  ],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class Usuarios implements OnInit {

  users: User[] = [];
  displayPermisosModal: boolean = false;
  usuarioSeleccionado: User | null = null;
  
  permisosEdit: Permisos = JSON.parse(JSON.stringify(permisosBase));
  
  // Usuario actual
  currentUserEmail: string = '';
  currentRole: string = '';
  currentUserPermisos: Permisos | null = null;

  ngOnInit() {
    this.cargarUsuarioActual();
    this.cargarUsuarios();
  }

  cargarUsuarioActual() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    this.currentUserEmail = user.email || '';
    this.currentRole = user.role || '';
    
    const currentUserData = users.find((u: User) => u.email === this.currentUserEmail);
    this.currentUserPermisos = currentUserData?.permisos || null;
    
    console.log('Usuario actual:', this.currentUserEmail, 'Rol:', this.currentRole);
    console.log('Permisos del usuario actual:', this.currentUserPermisos);
  }

  cargarUsuarios() {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    // Filtrar usuarios según permisos
    if (this.currentRole === 'super') {
      // Super admin ve todos los usuarios excepto a sí mismo
      this.users = users.filter(u => u.email !== this.currentUserEmail).map(u => ({
        ...u,
        estado: u.estado || 'activo',
        permisos: this.asegurarPermisosCompletos(u.permisos)
      }));
    } else {
      // Usuarios normales solo ven usuarios si tienen permiso
      if (this.tienePermiso('usuarios', 'ver')) {
        this.users = users.filter(u => u.role !== 'super' && u.email !== this.currentUserEmail).map(u => ({
          ...u,
          estado: u.estado || 'activo',
          permisos: this.asegurarPermisosCompletos(u.permisos)
        }));
      } else {
        this.users = [];
      }
    }
    console.log('Usuarios cargados:', this.users);
  }

  // Función para verificar permisos del usuario actual
  tienePermiso(categoria: keyof Permisos, accion: string): boolean {
    // Super admin tiene todos los permisos
    if (this.currentRole === 'super') {
      return true;
    }
    
    // Si no hay permisos definidos, retornar false
    if (!this.currentUserPermisos) {
      return false;
    }
    
    // Verificar el permiso específico
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

  // Función para asegurar que los permisos tengan todas las propiedades
  asegurarPermisosCompletos(permisos: any): Permisos {
    return {
      tickets: {
        ver: permisos?.tickets?.ver ?? permisosBase.tickets.ver,
        crear: permisos?.tickets?.crear ?? permisosBase.tickets.crear,
        editar: permisos?.tickets?.editar ?? permisosBase.tickets.editar,
        eliminar: permisos?.tickets?.eliminar ?? permisosBase.tickets.eliminar,
        cambiarEstado: permisos?.tickets?.cambiarEstado ?? permisosBase.tickets.cambiarEstado,
        comentar: permisos?.tickets?.comentar ?? permisosBase.tickets.comentar,
        asignar: permisos?.tickets?.asignar ?? permisosBase.tickets.asignar
      },
      grupos: {
        ver: permisos?.grupos?.ver ?? permisosBase.grupos.ver,
        crear: permisos?.grupos?.crear ?? permisosBase.grupos.crear,
        editar: permisos?.grupos?.editar ?? permisosBase.grupos.editar,
        eliminar: permisos?.grupos?.eliminar ?? permisosBase.grupos.eliminar,
        agregarMiembros: permisos?.grupos?.agregarMiembros ?? permisosBase.grupos.agregarMiembros,
        quitarMiembros: permisos?.grupos?.quitarMiembros ?? permisosBase.grupos.quitarMiembros
      },
      usuarios: {
        ver: permisos?.usuarios?.ver ?? permisosBase.usuarios.ver,
        crear: permisos?.usuarios?.crear ?? permisosBase.usuarios.crear,
        editar: permisos?.usuarios?.editar ?? permisosBase.usuarios.editar,
        eliminar: permisos?.usuarios?.eliminar ?? permisosBase.usuarios.eliminar
      }
    };
  }

  abrirPermisos(user: User) {
    // Verificar si tiene permiso para editar usuarios
    if (!this.tienePermiso('usuarios', 'editar')) {
      alert('No tienes permiso para editar permisos de usuarios');
      return;
    }
    
    console.log('Abriendo permisos para:', user.nombre);
    this.usuarioSeleccionado = user;
    this.permisosEdit = JSON.parse(JSON.stringify(user.permisos));
    console.log('Permisos cargados en modal:', this.permisosEdit);
    this.displayPermisosModal = true;
  }

  editarPermisos(user: User) {
    this.abrirPermisos(user);
  }

  guardarPermisos() {
    if (this.usuarioSeleccionado) {
      console.log('=== GUARDANDO PERMISOS ===');
      console.log('Usuario:', this.usuarioSeleccionado.nombre);
      console.log('Permisos a guardar:', JSON.stringify(this.permisosEdit, null, 2));
      
      // Actualizar el usuario seleccionado
      this.usuarioSeleccionado.permisos = JSON.parse(JSON.stringify(this.permisosEdit));
      
      // Actualizar en el array users
      const index = this.users.findIndex(u => u.email === this.usuarioSeleccionado!.email);
      if (index !== -1) {
        this.users[index] = this.usuarioSeleccionado;
        console.log('Usuario actualizado en array local');
      }
      
      // Actualizar en localStorage
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const localIndex = allUsers.findIndex((u: any) => u.email === this.usuarioSeleccionado!.email);
      
      if (localIndex !== -1) {
        allUsers[localIndex] = {
          ...allUsers[localIndex],
          permisos: this.usuarioSeleccionado.permisos
        };
        localStorage.setItem('users', JSON.stringify(allUsers));
        console.log('Usuario actualizado en localStorage');
      }
      
      this.displayPermisosModal = false;
      console.log('Permisos guardados correctamente');
      
      // Recargar usuarios para actualizar la vista
      this.cargarUsuarios();
    }
  }

  cerrarPermisos() {
    this.displayPermisosModal = false;
    this.usuarioSeleccionado = null;
  }

  toggleEstado(user: User) {
    // Verificar si tiene permiso para editar usuarios
    if (!this.tienePermiso('usuarios', 'editar')) {
      alert('No tienes permiso para cambiar el estado de usuarios');
      return;
    }
    
    user.estado = user.estado === 'activo' ? 'inactivo' : 'activo';
    this.guardarUsuario(user);
  }

  editarUsuario(user: User) {
    this.abrirPermisos(user);
  }

  eliminar(user: User) {
    // Verificar si tiene permiso para eliminar usuarios
    if (!this.tienePermiso('usuarios', 'eliminar')) {
      alert('No tienes permiso para eliminar usuarios');
      return;
    }
    
    if (confirm(`¿Estás seguro de eliminar al usuario "${user.nombre}"?`)) {
      this.users = this.users.filter(u => u.email !== user.email);
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = allUsers.filter((u: any) => u.email !== user.email);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      console.log('Usuario eliminado:', user.nombre);
      this.cargarUsuarios();
    }
  }

  guardarUsuario(user: User) {
    const index = this.users.findIndex(u => u.email === user.email);
    if (index !== -1) {
      this.users[index] = user;
    }
    
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const localIndex = allUsers.findIndex((u: any) => u.email === user.email);
    if (localIndex !== -1) {
      allUsers[localIndex] = user;
      localStorage.setItem('users', JSON.stringify(allUsers));
    }
  }
}