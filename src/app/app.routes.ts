import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Landing } from './pages/landing/landing';
import { Dashboard } from './pages/dashboard/dashboard';
import { Usuarios } from './pages/usuarios/usuarios';
import { Grupos } from './pages/grupos/grupos';
import { Perfil } from './pages/perfil/perfil';
import { GrupoComponent } from './pages/grupo/grupo';


export const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { path: 'landing', component: Landing },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: 'dashboard',
    component: Dashboard,
    children: [
      { path: 'usuarios', component: Usuarios },
      { path: 'grupos', component: Grupos },
      { path: 'perfil', component: Perfil },
      { path: 'grupo/:id', component: GrupoComponent },

    ]
  },
];