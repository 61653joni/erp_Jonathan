import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ButtonModule, CardModule, InputTextModule, FormsModule, RouterLink],
  templateUrl: './register.html'
})
export class Register {
  nombre = '';
  email = '';
  password = '';
  confirmar = '';
}