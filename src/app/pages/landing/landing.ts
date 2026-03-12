import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Navbar } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-landing',
  imports: [
    RouterModule,
    CardModule,
    ButtonModule,
    Navbar
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing { }