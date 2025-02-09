import { Component, computed, inject, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { EventEmitterDialogueComponent } from '../event-emitter-dialogue/event-emitter-dialogue.component';
import { TrackerDialogueComponent } from '../tracker-dialogue/tracker-dialogue.component';
import { SocketService } from '../../services/socket.service';
import { UserService } from '../../services/users.service';
import { Users } from '../users';
import { Devices } from '../devices';
import { Events } from '../events';

@Component({
  selector: 'app-stream',
  imports: [HeaderComponent, MatButtonModule, MatGridListModule,
    MatCardModule, MatIconModule, CommonModule,
  ],
  templateUrl: './stream.component.html',
  styleUrl: './stream.component.css'
})
export class StreamComponent implements OnInit {
  dialog = inject(MatDialog);
  socketService = inject(SocketService);
   userService = inject(UserService);
  
  users = this.userService.usersSignal;
  devices: Devices[] = [];
  events: Events[] = [];
  trackers: any[] = [];
  cols: number = 0;

  userMap: Signal<Map<number,Users>> = computed(() => {
    return new Map(this.users()?.map(user => [user.id, user]) || []);
  })
  
  ngOnInit(): void {
    this.socketService.getDevices((data) => {
      if (data.success) {
        this.devices = data.devices;
      }
    })
    this.socketService.getEvents((data) => {
      if (data.success) {
        this.events = data.events;
      }
    })
    this.socketService.getTrackers((data) => {
      if (data.success) {
        this.trackers = data.trackers;
        this.cols = this.trackers.length;
      }
    })
  }

  getUser(userId: number) {
    return this.userMap()?.get(userId);
  }
 
  openEventDialogue() : void {
    this.dialog.open(EventEmitterDialogueComponent, {
      width: '500px',
      height: '500px',
      data: {trackers: this.trackers}
    });
  }

  openTrackerDialogue() : void {
    this.dialog.open(TrackerDialogueComponent, {
      width: '500px',
      height: '475px',
      data: {devices: this.devices}
    });
  }
}
