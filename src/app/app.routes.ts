import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { Dashboard } from './patient/dashboard/dashboard';

export const routes: Routes = [

     { path: '', redirectTo: '/login', pathMatch: 'full' },
     { path: 'login', component: Login },
     { path: 'signup', component: Signup},
     { path: 'patient-dashboard', component: Dashboard}

];


