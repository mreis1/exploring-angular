import { Component, inject, Signal, computed } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { SocketService } from '../../services/socket.service';
import { UserService } from '../../services/users.service';
import { Users } from '../users';

@Component({
  selector: 'app-event-emitter-dialogue',
  imports: [ReactiveFormsModule, MatSelectModule, MatRadioModule, MatAutocompleteModule, MatInputModule, MatButtonModule],
  templateUrl: './event-emitter-dialogue.component.html',
  styleUrl: './event-emitter-dialogue.component.css'
})
export class EventEmitterDialogueComponent {
  dialogueRef = inject(MatDialogRef<EventEmitterDialogueComponent>)
  socketService = inject(SocketService);
  data = inject(MAT_DIALOG_DATA);
  userService = inject(UserService);

  users = this.userService.usersSignal;
  message = '';

  eventForm: FormGroup<{
    id_device: FormControl<number>;
    state: FormControl<string>;
    errorCode: FormControl<string | null>;
    id_user: FormControl<number>;
  }> = new FormGroup({
    id_device: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required]
    }),
    state: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    errorCode: new FormControl('', {
      nonNullable: false,
    }),
    id_user: new FormControl(0, {
      nonNullable: true,
    })
  })

  addEvent(): void {
    if (this.eventForm.valid) {
      const event = this.eventForm.getRawValue();
      this.socketService.createEvent(event, (response) => {
        if (response.success) {
          this.message = 'Event added';
          this.eventForm.reset();
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

}
