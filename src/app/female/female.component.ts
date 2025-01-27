import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../users.service';

@Component({
  selector: 'app-female',
  imports: [],
  templateUrl: './female.component.html',
  styleUrl: './female.component.css'
})
export class FemaleComponent /*implements OnInit*/ {
  //totalFemaleUsers: number = 0;
  userService = inject(UserService);
  totalFemaleUsers = this.userService.femaleUsers;

  //ngOnInit(): void {
  //  this.userService.filterWomenUsers().subscribe((users) => {
  //    this.femaleUsers = users.length;
  //  })
  //}
}
