import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

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
  permisos?: Permisos;
  estado: 'activo' | 'inactivo';
}

@Component({
  selector: 'app-usuarioss',
  standalone: true,
  imports: [CommonModule, TableModule, CardModule, FormsModule, ToggleSwitchModule ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {

  users: User[] = [];
  ngOnInit() {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');

    this.users = users
      .filter(u => u.role !== 'super')
      .map(u => ({
        ...u,
        estado: u.estado || 'activo',
        permisos: u.permisos || {
          grupos: { crear: false, editar: false, eliminar: false, ver: true }
        }
      }));

  }
  toggleEstado(user: User) {
    user.estado = user.estado === 'activo' ? 'inactivo' : 'activo';
  }

  eliminar(user: User) {
    this.users = this.users.filter(u => u.email !== user.email);
    this.guardar();
  }

  guardar() {
  const allUsers = JSON.parse(localStorage.getItem('users') || '[]');

  const updated = allUsers.map((u: any) => {
    const edited = this.users.find(e => e.email === u.email);
    return edited ? edited : u;
  });

  localStorage.setItem('users', JSON.stringify(updated));
}
}