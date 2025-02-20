import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../services/users.service';
import { User } from '../user';

@Component({
  selector: 'app-male-list',
  imports: [CommonModule, MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './male-list.component.html',
  styleUrl: './male-list.component.css'
})
export class MaleListComponent /*implements OnInit*/ {
  //maleUsers: Users[] = [];
  userService = inject(UserService);
  maleUsers = this.userService.maleUsers;

  //ngOnInit(): void {
  //    this.userService.filterMenUsers().subscribe((users) => {
  //      this.maleUsers = users;
  //    })
  //}

  //onRemoveUser(id: string): void {
  //  this.userService.removeUser(id).subscribe((removedUser) => {
  //    if (removedUser) {
  //      console.log(removedUser);
  //      this.userService.filterMenUsers().subscribe((users) => {
  //        this.maleUsers = users;
  //      })
  //    }
  //  })
  //}

  onRemoveUser(id: number): void {
    this.userService.removeUser(id);
  }
}
