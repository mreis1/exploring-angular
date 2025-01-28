import { Component, inject } from '@angular/core';
import { UserService } from '../users.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list'
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { Users } from '../users';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [MatGridListModule, MatRadioModule, MatFormFieldModule,
    MatInputModule, MatDatepickerModule, MatNativeDateModule, 
    MatButtonModule, CommonModule, ReactiveFormsModule
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})

export class AuthComponent {
  userService = inject(UserService);
  http = inject(HttpClient);
  router = inject(Router);

  loginForm: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
  }> = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    })
  });

  registerForm: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
    gender: FormControl<string>;
    name: FormControl<string>;
    birthDate: FormControl<string>;
  }> = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    gender: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    birthDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  onLogin(): void {
    this.http.post<{message: string ,user: Users}>(
      'http://localhost:3000/api/login',
      {
        user: this.loginForm.getRawValue(),
      }
    ).subscribe((response) => {
      console.log(response);
      this.userService.currentUserSignal.set(response.user);
      this.router.navigateByUrl('/');
    })
  }

  onRegister() : void {
    this.http.post<{message: string, user: Users}>(
      'http://localhost:3000/api/register',
      {
        user: this.loginForm.getRawValue(),
      }
    ).subscribe((response) => {
      console.log(response);
      this.userService.currentUserSignal.set(response.user);
      this.router.navigateByUrl('/');
    })
  }
}


