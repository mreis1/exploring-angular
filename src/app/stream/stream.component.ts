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
import { User } from '../user';
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
  cols: number = this.socketService.trackersSignal().length || 0;

  userMap: Signal<Map<number,User>> = computed(() => {
    return new Map(this.users()?.map(user => [user.id, user]) || []);
  })

  ngOnInit(): void {
    this.socketService.getDevices();
    this.socketService.getEvents();
    this.socketService.getTrackers();
  }

  getUser(userId: number) {
    return this.userMap()?.get(userId);
  }

  openEventDialogue() : void {
    this.dialog.open(EventEmitterDialogueComponent, {
      width: '500px',
      height: '500px',
    });
  }

  openTrackerDialogue() : void {
    this.dialog.open(TrackerDialogueComponent, {
      width: '500px',
      height: '475px',
    });
  }
}
