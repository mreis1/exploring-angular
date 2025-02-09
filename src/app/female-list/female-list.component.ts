import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../services/users.service';
import { Users } from '../users';


@Component({
  selector: 'app-female-list',
  imports: [CommonModule, MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './female-list.component.html',
  styleUrl: './female-list.component.css'
})
export class FemaleListComponent /*implements OnInit*/ {
  //femaleUsers: Users[] = [];
  userService = inject(UserService);
  femaleUsers = this.userService.femaleUsers;

  //ngOnInit(): void {
  //    this.userService.filterWomenUsers().subscribe((users) => {
  //      this.femaleUsers = users;
  //    })
  //}

  //onRemoveUser(id: string): void {
  //  this.userService.removeUser(id).subscribe((removedUser) => {
  //    if (removedUser) {
  //      console.log(removedUser);
  //      this.userService.filterWomenUsers().subscribe((users) => {
  //        this.femaleUsers = users;
  //      })
  //    }
  //  })
  //}

  onRemoveUser(id: string): void {
    this.userService.removeUser(id);
  }
}
