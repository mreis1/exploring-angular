import { Component, inject, OnInit} from '@angular/core';
import { UserService } from '../users.service';

@Component({
  selector: 'app-male',
  imports: [],
  templateUrl: './male.component.html',
  styleUrl: './male.component.css'
})
export class MaleComponent /*implements OnInit*/ {
  //totalMaleUsers: number = 0;
  userService = inject(UserService);
  totalMaleUsers = this.userService.maleUsers;

  //ngOnInit() {
  //  this.userService.filterMenUsers().subscribe((users) => {
  //    this.maleUsers = users.length;
  //  });
  //}
}

