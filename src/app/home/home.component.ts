import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FormComponent } from '../form/form.component';
import { CountComponent } from '../count/count.component';
import { UserListComponent } from '../user-list/user-list.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [FormComponent, CommonModule,
    CountComponent, UserListComponent,
    MatGridListModule, MatButtonModule,
    HeaderComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent implements OnInit {
  userService = inject(UserService);
  router = inject(Router);

  ngOnInit(): void {
    this.userService.getCurrentUser();
    //this.userService.getUsers();
  }

}
