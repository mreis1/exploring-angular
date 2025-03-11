import { Component, inject } from '@angular/core';
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
import { User } from '../user';
import { Router } from '@angular/router';
import { UserRegisterComponent } from '../user-register/user-register.component';

@Component({
  selector: 'app-auth',
  imports: [MatGridListModule, MatRadioModule, MatFormFieldModule,
    MatInputModule, MatDatepickerModule, MatNativeDateModule,
    MatButtonModule, CommonModule, ReactiveFormsModule, UserRegisterComponent
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})

export class AuthComponent {
  userService = inject(UserService);
  http = inject(HttpClient);
  router = inject(Router);
  switcher: 'login' | 'register' = 'login';

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

  onLogin(): void {
    try {
       this.http.post<{message: string, user: User}>(
        '/api/login',
        { user: this.loginForm.getRawValue() },
        { withCredentials: true }
      ).subscribe(response => {
        console.log(response);
        this.userService.currentUserSignal.set(response.user);
          this.router.navigateByUrl('/home');
      })
    } catch (error) {
      this.userService.showMessage();
      console.error(error);
    }
  }

  set setSwitcher(switcher: 'login' | 'register') {
    this.switcher = switcher;
  }
}


