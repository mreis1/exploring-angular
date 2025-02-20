import {Component, inject, Signal, computed, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { SocketService } from '../../services/socket.service';
import { UserService } from '../../services/users.service';
import { User } from '../user';

@Component({
  selector: 'app-event-emitter-dialogue',
  imports: [ReactiveFormsModule, MatSelectModule, MatRadioModule, MatAutocompleteModule, MatInputModule, MatButtonModule],
  templateUrl: './event-emitter-dialogue.component.html',
  styleUrl: './event-emitter-dialogue.component.css'
})
export class EventEmitterDialogueComponent implements OnInit {
  dialogueRef = inject(MatDialogRef<EventEmitterDialogueComponent>)
  dialogData = inject(MAT_DIALOG_DATA) as {device_id?: number};
  socketService = inject(SocketService);
  userService = inject(UserService);

  users = this.userService.usersSignal;
  message = '';

  form: FormGroup<{
    id_device: FormControl<number>;
    state: FormControl<string>;
    error_code: FormControl<string | null>;
    user: FormControl<User>;
  }> = new FormGroup({
    id_device: new FormControl(this.dialogData?.device_id! ?? null, {
      nonNullable: true,
      validators: [Validators.required]
    }),
    state: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    error_code: new FormControl('', {
      nonNullable: false,
    }),
    user: new FormControl(null as any, {
      nonNullable: true,
    })
  })

  addEvent(): void {
    if (this.form.valid) {
      console.log('addEvent...');
      const {user,...event} = this.form.getRawValue();
      this.socketService.createEvent({
        ...event,
        id_user: user?.id
      }, (response) => {
        if (response.success) {
          this.message = 'Event added';
          this.form.reset();
          this.closeDialogue();
        } else {
          this.message = 'Error adding event' + response.message;
        }
      })
    }
  }

  closeDialogue(): void {
    this.dialogueRef.close();
  }
  ngOnInit() {
    console.log('initial device_id', this.dialogData?.device_id)
    console.log(this.users());
    this.form.patchValue({user: this.users()[0] });
  }
  userDisplayFn(user: User) {
    console.log(user);
    return user?.name ?? ''
  }
}
