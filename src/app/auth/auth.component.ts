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
import { User } from '../user';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';

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
    image2: FormControl<any>;
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
    }),
    image2: new FormControl('', {
      nonNullable: true,
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
        // setTimeout(() => {
          this.router.navigateByUrl('/home');
        // }, 100)
      })
    } catch (error) {
      this.userService.showMessage();
      console.error(error);
    }
  }

  onRegister() : void {
    const formValue = this.registerForm.getRawValue();
    formValue.birthDate = new Date(formValue.birthDate).toISOString().slice(0,10);
    const file: File | null = formValue.image ?? null;
    const file2: File | null = formValue.image2 ?? null;
    let multerUpload$ = file ? this.userService.upload(file) : of(null);
    let blobUpload$ = file2 ? this.userService.uploadToDatabase(file2) : of(null);
    /**
     * 1. tabela para os UPLOAD
     *  id(guid) <-- ids não enumeráveis por questões de segurança
     *  path     <-- para o file no filesystem
     *
     */
    forkJoin([multerUpload$, blobUpload$]).subscribe(([filename, base64Image]) => {
      formValue.image = filename || null; // enviar o guid do upload respectivo
      formValue.image2 = base64Image || null; // enviar o guid do upload respectivo
      this.userService.register(formValue);
      this.userService.filename.set(null);
      this.router.navigateByUrl('/home');
    })
  }

  onFileSelected(event: Event, type: 'file' | 'blob'): void {
    const input = event.target as HTMLInputElement;
    console.log(input!.files?.[0]); // files from html input
    if (input.files?.length) {
      if (type === 'file') {
       this.registerForm.get('image')?.setValue(input.files[0]);
      } else {
        this.registerForm.get('image2')?.setValue(input.files[0]);
      }
    } else {
      this.registerForm.get('image')?.setValue(null);
      this.registerForm.get('image2')?.setValue(null);
    }
  }
}


