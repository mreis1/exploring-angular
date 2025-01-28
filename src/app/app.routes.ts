import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';

export const routes: Routes = [
    {
        path: '',
        component: AppComponent,
        title: 'App'
    },
    {
        path: 'auth',
        component: AuthComponent,
        title: 'Auth'
    }
];
