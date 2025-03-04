import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/users.service';
import { UsersComponent } from "../users/users.component";

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, UsersComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent {
  userService = inject(UserService);
  femaleUsers = this.userService.femaleUsers;
  maleUsers = this.userService.maleUsers;
}
