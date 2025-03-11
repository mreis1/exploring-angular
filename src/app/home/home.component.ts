import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CountComponent } from '../count/count.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/users.service';
import { Router } from '@angular/router';
import { UserRegisterComponent } from '../user-register/user-register.component';
import { Mode } from '../mode';
import { UsersComponent } from "../users/users.component";

@Component({
  selector: 'app-home',
  imports: [UserRegisterComponent, CommonModule,
    CountComponent, UsersComponent,
    MatGridListModule, MatButtonModule,
    HeaderComponent, UsersComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent implements OnInit {
  userService = inject(UserService);
  router = inject(Router);
  modes = [Mode.All, Mode.Male, Mode.Female];
  gridCols: number = 3;

  ngOnInit(): void {
    this.userService.getCurrentUser();
    this.updateGridCols();
    window.addEventListener('resize', () => this.updateGridCols());
  }

  changeBgColor(mode: Mode): string {
    switch (mode) {
      case Mode.All:
        return 'bg-(--bg-quinary-color)';
      case Mode.Female:
        return 'bg-(--bg-senary-color)';
      case Mode.Male:
        return 'bg-(--bg-quaternary-color)';
    }
  }

  updateGridCols(): number {
    if (window.innerWidth < 640) {
      return this.gridCols = 1;
    } else if (window.innerWidth < 1024) {
      return this.gridCols = 2
    } else {
      return this.gridCols = 3;
    } 
  }
}
