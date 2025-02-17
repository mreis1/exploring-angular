import {Component, inject, OnInit} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SocketService } from '../../services/socket.service';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import {response} from 'express';

@Component({
  selector: 'app-tracker-dialogue',
  imports: [ReactiveFormsModule, MatSelectModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './tracker-dialogue.component.html',
  styleUrl: './tracker-dialogue.component.css'
})
export class TrackerDialogueComponent implements OnInit {
  dialogueRef = inject(MatDialogRef<TrackerDialogueComponent>);
  socketService = inject(SocketService);

  message = '';
  visibleForm = true;

  trackerForm: FormGroup<{
    id_device: FormControl<number>;
  }> = new FormGroup({
    id_device: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required]
    })
  })

  deviceForm: FormGroup<{
    name: FormControl<string>;
    stationName: FormControl<string>;
  }> = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    stationName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  })

  addTracker(): void {
    if (this.trackerForm.valid) {
      const tracker = this.trackerForm.getRawValue();
      this.socketService.createTracker(tracker, (response) => {
        if (response.success) {
          this.message = 'Tracker added';
          this.trackerForm.reset();
          this.closeDialogue();
        } else {
          this.message = 'Error adding tracker' + response.message;
        }
      })
    }
  }

  addDevice(): void {
    if (this.deviceForm.valid) {
      const device = this.deviceForm.getRawValue();
      this.socketService.createDevice(device, (response) => {
        if (response.success) {
          this.message = 'Device added';
          this.deviceForm.reset();
          this.closeDialogue();
        } else {
          this.message = 'Error adding tracker' + response.message;
        }
      })
    }
  }

  toggleForm(): void {
    this.visibleForm = !this.visibleForm;
  }

  closeDialogue(): void {
    this.dialogueRef.close();
  }

  ngOnInit(): void {
    let devices = this.socketService.devicesSignal()
    this.trackerForm.patchValue({id_device: devices[0]?.id ?? null })
  }
}
