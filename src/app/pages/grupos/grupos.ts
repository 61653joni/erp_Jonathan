import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import {  FormsModule} from '@angular/forms';

interface Grupo {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  miembros: string[];
}

const GRUPOS: Grupo[] = [
  {
    id: 1,
    nombre: 'Equipo Dev',
    descripcion: 'Desarrollo del sistema',
    icono: 'pi pi-users',
    miembros: []
  },
  {
    id: 2,
    nombre: 'Soporte',
    descripcion: 'Atención de tickets',
    icono: 'pi pi-briefcase',
    miembros: []
  }
];

@Component({
  selector: 'app-grupos',
  templateUrl: './grupos.html',
  imports: [RouterModule, CommonModule, DialogModule,FormsModule],
  styleUrl: './grupos.css',

})
export class Grupos implements OnInit {
  currentUserEmail = '';
  currentRole = '';
  grupos: Grupo[] = [];
  displayModal = false;
  grupoSeleccionado: Grupo | null = null;
  displayCrearGrupo = false;

  nuevoGrupo: Grupo = {
    id: 0,
    nombre: '',
    descripcion: '',
    icono: 'pi pi-users',
    miembros: []
  };

  ngOnInit() {
    const data = JSON.parse(localStorage.getItem('grupos') || '[]');
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

    this.currentUserEmail = user.email;
    this.currentRole = user.role;

    // 🔴 SI ES SUPER → VE TODO
    if (this.currentRole === 'super') {
      this.grupos = data;
    } else {
      // 🔴 SOLO LOS GRUPOS DONDE ESTÁ
      this.grupos = data.filter((g: Grupo) =>
        g.miembros.includes(this.currentUserEmail)
      );
    }
  }

  agregarMiembro(grupo: Grupo) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const email = prompt('Email del usuario');

    if (!email) return; // 🔴 corta si es null o vacío

    const existe = users.find((u: any) => u.email === email);

    if (!existe) {
      alert('Usuario no existe');
      return;
    }

    if (!grupo.miembros.includes(email)) {
      grupo.miembros.push(email);
    }

    localStorage.setItem('grupos', JSON.stringify(this.grupos));
  }

  editarGrupo(grupo: Grupo) {
    const nombre = prompt('Nuevo nombre', grupo.nombre);
    const desc = prompt('Descripción', grupo.descripcion);

    if (nombre) grupo.nombre = nombre;
    if (desc) grupo.descripcion = desc;

    localStorage.setItem('grupos', JSON.stringify(this.grupos));
  }
  verGrupo(grupo: Grupo) {
    this.grupoSeleccionado = grupo;
    this.displayModal = true;
  }
  abrirCrearGrupo() {
    this.nuevoGrupo = {
      id: Date.now(),
      nombre: '',
      descripcion: '',
      icono: 'pi pi-users',
      miembros: []
    };
    this.displayCrearGrupo = true;
  }

  guardarGrupo() {
    if (!this.nuevoGrupo.nombre) return;

    this.grupos.push({ ...this.nuevoGrupo });

    localStorage.setItem('grupos', JSON.stringify(this.grupos));

    this.displayCrearGrupo = false;
  }
}