import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthComponent } from './auth/auth.component';
import { StreamComponent } from './stream/stream.component';
import { authGuard } from './auth.guard';

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
        title: 'Auth',   
    },
    {
        path: '',
        redirectTo: '/auth',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: '/auth',
        pathMatch: 'full'
    }
];
