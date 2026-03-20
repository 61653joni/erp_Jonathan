import { Component, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CardModule,
    AvatarModule,
    DividerModule,
    TagModule,
    FormsModule,
    InputTextModule,
    ButtonModule
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit {

  email = '';
  role = '';
  nombre = '';
  emailOriginal = '';

  ngOnInit() {

    this.email = localStorage.getItem('email') || '';
    this.role = localStorage.getItem('role') || '';
    this.nombre = localStorage.getItem('nombre') || '';

    this.emailOriginal = this.email;

  }

  guardarPerfil() {

    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const index = users.findIndex((u: any) => u.email === this.emailOriginal);

    if (index !== -1) {

      users[index].email = this.email;
      users[index].nombre = this.nombre;

      localStorage.setItem('users', JSON.stringify(users));

      localStorage.setItem('email', this.email);
      localStorage.setItem('nombre', this.nombre);

      this.emailOriginal = this.email;

    }

  }

}