import { Component, effect, inject } from '@angular/core';
import { UserService } from '../../services/users.service';
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
    image: FormControl<any>;
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
    image: new FormControl('', {
      nonNullable: true,
    })
  });

  onLogin(): void {
    this.http.get<{csrfToken: string}>('/api/csrf-token', { withCredentials: true })
      .subscribe(csrfResponse => {
        this.http.post<{message: string, user: Users}>(
          '/api/login',
          { user: this.loginForm.getRawValue() },
          { headers: {'X-CSRF-Token': csrfResponse.csrfToken}, withCredentials: true }
        ).subscribe(response => {
          console.log(response);
          this.userService.currentUserSignal.set(response.user);
          this.router.navigateByUrl('/home');
        })
      })
  }

  onRegister() : void {
    const formValue = this.registerForm.getRawValue();
    formValue.birthDate = new Date(formValue.birthDate).toISOString().slice(0,10);
    const file = formValue.image.event?.target.files[0];
    if (file) {
      this.userService.upload(file);
      const interval = setInterval(() => {
        console.log("Checking filename signal:", this.userService.filename());
        if (this.userService.filename()) { 
          clearInterval(interval); 
          formValue.image = this.userService.filename();
          this.userService.register(formValue);
          this.userService.filename.set(null);
        }
      }, 100);
    } else {
      this.userService.register(formValue);
    } 
  }
}


