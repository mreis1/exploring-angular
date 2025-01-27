import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../users.service';

@Component({
  selector: 'app-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
})
export class FormComponent {
  userService = inject(UserService);

  form: FormGroup<{
    gender: FormControl<string>;
    name: FormControl<string>;
    birthDate: FormControl<string>;
  }> = new FormGroup({
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

  onSubmit() : void {
    try {
      if (this.form.valid) {
        this.userService.addUser(this.form.getRawValue());
        this.form.reset();
      }
    } catch (error) {
      console.error(error);
    }
  }
}
