import {Component, inject, Input, OnInit} from '@angular/core';
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
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-user-register',
  imports: [MatGridListModule, MatRadioModule, MatFormFieldModule,
    MatInputModule, MatDatepickerModule, MatNativeDateModule,
    MatButtonModule, CommonModule, ReactiveFormsModule
  ],
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.css'
})
export class UserRegisterComponent implements OnInit {
  userService = inject(UserService);
  http = inject(HttpClient);
  router = inject(Router);
  @Input() state: boolean = false;

  registerForm: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
    gender: FormControl<string>;
    name: FormControl<string>;
    birthDate: FormControl<string>;
    image: FormControl<File | null>;
    image2: FormControl<File | null>;
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
    image: new FormControl<File | null>(null),
    image2: new FormControl<File | null>(null)
  });

  ngOnInit() {
    if (!environment.production) {
      const b = 'test_' + new Date().getTime();
      this.registerForm.patchValue({
        email:b+ '@gmail.com',
        password: '123456',
        gender: 'Male',
        name: b,
        birthDate: '2010-01-01',
      })
    }
  }
  onRegister() : void {
    const formValue = this.registerForm.getRawValue();
    console.log(formValue);
    formValue.birthDate = new Date(formValue.birthDate).toISOString().slice(0,10);
    const file: File | null = formValue.image ?? null;
    const file2: File | null = formValue.image2 ?? null;
    console.log(formValue);
    if (!file && !file2) {
      this.userService.register(formValue, this.state);
      return;
    }
    const files = {
      image: file,
      image2: file2
    }
    this.userService.upload(files).subscribe(response => {
      this.userService.register({
        ...formValue,
        image: response.image ?? null,
        image2: response.image2 ?? null
      },
        this.state
      );
      this.userService.filename.set(null);
    })
    /**
     * 1. tabela para os UPLOAD
     *  id(guid) <-- ids não enumeráveis por questões de segurança
     *  path     <-- para o file no filesystem
     *
     */
    //forkJoin([multerUpload$, blobUpload$]).subscribe(([filename, base64Image]) => {
    //  formValue.image = filename || null; // enviar o guid do upload respectivo
    //  formValue.image2 = base64Image || null; // enviar o guid do upload respectivo
    //  this.userService.register(formValue, this.state);
    //  this.userService.filename.set(null);
    //  if (this.state === true) {
    //    this.router.navigateByUrl('/home');
    //  }
    //})
  }

  /*onFileSelected(event: Event, type: 'file' | 'blob'): void {
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
  }*/
  onFileSelected(event: Event, type: 'image' | 'image2'): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.registerForm.controls[type]?.setValue(input.files[0]);
    } else {
      this.registerForm.controls[type]?.setValue(null);
    }
  }
}
