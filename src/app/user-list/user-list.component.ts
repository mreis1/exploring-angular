import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../users.service';
import { Mode } from '../mode';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, MatListModule, MatIconModule,
    MatButtonModule, DatePipe,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent {
  @Input() mode!: Mode;
  
  userService = inject(UserService);
  femaleUsers = this.userService.femaleUsers;
  maleUsers = this.userService.maleUsers;

  onRemoveUser(id: string): void {
    this.userService.removeUser(id);
  }
}
