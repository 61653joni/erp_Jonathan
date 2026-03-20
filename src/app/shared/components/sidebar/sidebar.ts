import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { UpperCasePipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, UpperCasePipe, NgIf],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {

  email = '';
  role = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.email = localStorage.getItem('email') || '';
    this.role = localStorage.getItem('role') || '';
  }

  logout() {

    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('nombre');

    this.router.navigate(['/landing']);

  }

}