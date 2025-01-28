import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatGridListModule } from '@angular/material/grid-list'
import { CommonModule } from '@angular/common';
import { TotalUsersComponent } from './total-users/total-users.component';
import { FemaleComponent } from './female/female.component';
import { MaleComponent } from './male/male.component';
import { FormComponent } from './form/form.component';
import { MaleListComponent } from './male-list/male-list.component';
import { FemaleListComponent } from './female-list/female-list.component';
import { CountComponent } from "./count/count.component";
import { UserListComponent } from './user-list/user-list.component';
import { UserService } from './users.service';
import { AuthComponent } from './auth/auth.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule, RouterOutlet, MatGridListModule,
    FormComponent, AuthComponent,
    CountComponent, UserListComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'rxjs';
  userService = inject(UserService);
}
