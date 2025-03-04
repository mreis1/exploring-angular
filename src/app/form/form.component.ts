//import { Component, inject } from '@angular/core';
//import {
//  ReactiveFormsModule,
//  FormControl,
//  FormGroup,
//  Validators,
//} from '@angular/forms';
//import { CommonModule } from '@angular/common';
//import { MatRadioModule } from '@angular/material/radio';
//import { MatFormFieldModule } from '@angular/material/form-field';
//import { MatInputModule } from '@angular/material/input';
//import { MatDatepickerModule } from '@angular/material/datepicker';
//import { MatNativeDateModule } from '@angular/material/core';
//import { MatButtonModule } from '@angular/material/button';
//import { UserService } from '../../services/users.service';
//import { Router } from '@angular/router';
//
//@Component({
//  selector: 'app-form',
//  imports: [
//    CommonModule,
//    ReactiveFormsModule,
//    MatRadioModule,
//    MatFormFieldModule,
//    MatInputModule,
//    MatDatepickerModule,
//    MatNativeDateModule,
//    MatButtonModule,
//  ],
//  templateUrl: './form.component.html',
//  styleUrl: './form.component.css',
//})
//export class FormComponent {
//  userService = inject(UserService);
//  router = inject(Router);

 // form: FormGroup<{
 //   email: FormControl<string>;
 //   password: FormControl<string>;
 //   gender: FormControl<string>;
 //   name: FormControl<string>;
 //   birthDate: FormControl<string>;
 //   image: FormControl<any>
 // }> = new FormGroup({
 //   email: new FormControl('', {
 //     nonNullable: true,
 //     validators: [Validators.required, Validators.email],
 //   }),
 //   password: new FormControl('', {
 //     nonNullable: true,
 //     validators: [Validators.required],
 //   }),
 //   gender: new FormControl('', {
 //     nonNullable: true,
 //     validators: [Validators.required],
 //   }),
 //   name: new FormControl('', {
 //     nonNullable: true,
 //     validators: [Validators.required],
 //   }),
 //   birthDate: new FormControl('', {
 //     nonNullable: true,
 //     validators: [Validators.required],
 //   }),
 //   image: new FormControl('', {
 //     nonNullable: true,
 //   }),
//
 // });

  //onSubmit(): void {
  //  try {
  //    if (this.form.valid) {
  //      this.userService
  //        .addUser(this.form.getRawValue())
  //        .subscribe((newUser) => console.log(newUser));
  //      this.form.reset();
  //    }
  //  } catch (error) {
  //    console.error(error);
  //  }
  //}

 // onSubmit() : void {
 //   const formValue = this.form.getRawValue();
 //   formValue.birthDate = new Date(formValue.birthDate).toISOString().slice(0,10);
 //   const file: File | null = formValue.image ?? null;
 //   if (file instanceof File) {
 //     this.userService.upload(file).subscribe((filename) => {
 //       console.log("Upload completed, received filename:", filename);
 //       // this.registerForm.get('image')?.setValue(filename);
 //       formValue.image = filename;
 //       this.userService.register(formValue);
 //       this.userService.filename.set(null);
 //       this.form.reset();
 //     })
 //   } else {
 //     this.userService.register(formValue);
 //     this.form.reset();
 //     window.location.reload();
 //   }
 // }
//
 // onFileSelected(event: Event): void {
 //   const input = event.target as HTMLInputElement;
 //   console.log(input!.files?.[0]); // files from html input
 //   if (input.files?.length) {
 //     this.form.get('image')?.setValue(input.files[0]);
 //   } else {
 //     this.form.get('image')?.setValue(null);
 //   }
 // }
//}
