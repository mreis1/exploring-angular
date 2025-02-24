import { Component, computed, inject, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EventEmitterDialogueComponent } from '../event-emitter-dialogue/event-emitter-dialogue.component';
import { TrackerDialogueComponent } from '../tracker-dialogue/tracker-dialogue.component';
import { SocketService } from '../../services/socket.service';
import { UserService } from '../../services/users.service';
import { User } from '../user';
import { DatePipe } from '@angular/common';
import { TimeAgoPipe } from '../time-ago.pipe';
import { Trackers } from '../trackers';

@Component({
  selector: 'app-stream',
  imports: [HeaderComponent, MatButtonModule, MatGridListModule,
    MatCardModule, MatIconModule, CommonModule, MatTooltipModule,
    DatePipe, TimeAgoPipe
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

  imageUrl = (userId: number): string => {
    const user = this.getUser(userId);
    return user?.image ? `/upload/${user.image}` : "https://material.angular.io/assets/img/examples/shiba2.jpg";
  }

  ngOnInit(): void {
    this.socketService.getDevices();
    this.socketService.getEvents();
    this.socketService.getTrackers();
  }

  getUser(userId: number) {
    return this.userMap()?.get(userId);
  }

  openEventDialogue(track: Trackers): void {
    this.dialog.open(EventEmitterDialogueComponent, {
      width: '500px',
      height: '500px',
      data: {
          device_id: track?.id_device
      }
    });
  }

  openTrackerDialogue(): void {
    this.dialog.open(TrackerDialogueComponent, {
      width: '500px',
      height: '475px',
    });
  }

  removeTracker(id: number): void {
    this.socketService.deleteTracker(id);
  }
}
