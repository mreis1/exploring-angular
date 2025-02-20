import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthComponent } from './auth/auth.component';
import { StreamComponent } from './stream/stream.component';
import { authGuard } from './auth.guard';
import {loginGuard} from './login.guard';

export const routes: Routes = [
    {
        path: 'home',
        component: HomeComponent,
        title: 'Home',
        canActivate: [authGuard]
    },
    {
        path: 'stream',
        component: StreamComponent,
        title: 'Stream',
        canActivate: [authGuard]
    },
    {
        path: 'auth',
        component: AuthComponent,
        canActivate: [loginGuard],
        title: 'Auth',
    },
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: '/home',
        pathMatch: 'full'
    }
];
