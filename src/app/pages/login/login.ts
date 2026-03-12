import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Footer } from '../../shared/components/footer/footer';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ButtonModule, CardModule, InputTextModule, FormsModule, RouterLink, NgIf,Navbar, Footer],
  templateUrl: './login.html'
}) 
export class Login {

  email = '';
  password = '';
  error = '';

  private readonly HARDCODE_EMAIL = 'joni@gmail.com';
  private readonly HARDCODE_PASSWORD = '123456';

  constructor(private router: Router) {}

  login() {
    console.log('Intentando login:', this.email, this.password); // debug

    if (this.email === this.HARDCODE_EMAIL &&
        this.password === this.HARDCODE_PASSWORD) {
      console.log('Login OK, navegando a /dashboard');
      this.router.navigate(['/dashboard']);
    } else {
      this.error = 'Credenciales incorrectas';
      console.log('Login fallido');
    }
  }
}