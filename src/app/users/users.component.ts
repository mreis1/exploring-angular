import { Component, inject, Input } from '@angular/core';
import { User } from '../user';
import { UserService } from '../../services/users.service';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-users',
  imports: [CommonModule, MatListModule, MatButtonModule,
    MatIconModule, DatePipe],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  @Input() users: User[] = [];
  @Input() title: string = '';
  @Input() listGender: string = '';
  userService = inject(UserService);

  onRemoveUser(id: number): void {
    this.userService.removeUser(id);
  }
}
