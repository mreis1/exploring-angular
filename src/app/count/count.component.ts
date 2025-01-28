import { Component, inject, Input } from '@angular/core';
import { UserService } from '../users.service';
import { CommonModule } from '@angular/common';
import { Mode } from '../mode';

@Component({
  selector: 'app-count',
  imports: [CommonModule],
  templateUrl: './count.component.html',
  styleUrl: './count.component.css'
})
export class CountComponent {
  @Input() mode!: Mode;
  protected readonly Mode = Mode;

  userService = inject(UserService);
  totalFemaleUsers = this.userService.femaleUsers;
  totalMaleUsers = this.userService.maleUsers;
  totalUsers = this.userService.usersSignal;

  readonly labelsByMode: {[key in Mode]: string} = {
    [Mode.All]: 'Total Users',
    [Mode.Female]: 'Total Female',
    [Mode.Male]: 'Total Male',
  }

  changeCount(): number {
    switch (this.mode) {
      case Mode.All:
        return this.totalUsers().length;
      case Mode.Female:
        return this.totalFemaleUsers().length;
      case Mode.Male:
        return this.totalMaleUsers().length;
    }
  }
}
