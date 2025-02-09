import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../services/users.service';

@Component({
  selector: 'app-total-users',
  imports: [],
  templateUrl: './total-users.component.html',
  styleUrl: './total-users.component.css'
})
export class TotalUsersComponent /*implements OnInit*/ {
  //totalUsers: number = 0;
  userService = inject(UserService);
  totalUsers = this.userService.usersSignal;

  //ngOnInit(): void {
  //  this.userService.getAllUsers().subscribe((users) => {
  //    this.totalUsers = users.length;
  //  });
  //}
}
