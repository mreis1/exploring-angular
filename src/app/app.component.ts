import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatGridListModule } from '@angular/material/grid-list'
import { CommonModule } from '@angular/common';
import { TotalUsersComponent } from './total-users/total-users.component';
import { FemaleComponent } from './female/female.component';
import { MaleComponent } from './male/male.component';
import { FormComponent } from './form/form.component';
import { MaleListComponent } from './male-list/male-list.component';
import { FemaleListComponent } from './female-list/female-list.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule, RouterOutlet, MatGridListModule,
    TotalUsersComponent, FemaleComponent, MaleComponent, 
    FormComponent, MaleListComponent, FemaleListComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'rxjs';
}
