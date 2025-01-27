import { computed, effect, Injectable, signal } from '@angular/core';
import { Users } from './users';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar'

@Injectable({
  providedIn: 'root'
})
export class UserService {
  //users = new BehaviorSubject<Users[]>([]);
  //users$ = this.users.asObservable();
  usersSignal = signal<Users[]>([]);

  maleUsers = computed(() => this.usersSignal().filter(user => user.gender.toLowerCase() === 'male'));
  femaleUsers = computed(() => this.usersSignal().filter(user => user.gender.toLowerCase() === 'female'));

  constructor(private snackBar: MatSnackBar) {
    effect(() => {
      console.log(this.usersSignal());
    })
  }

  //addUser(data: {gender: string, name: string, birthDate: string}): Observable<Users> {
  //  const newUser: Users = {
  //    gender: data.gender,
  //    name: data.name,
  //    birthDate: data.birthDate,
  //    id: Math.random().toString(16)
  //  }
  //  const currentUsers = this.users.getValue();
  //  const updatedUsers = [...currentUsers, newUser]; 
  //  this.users.next(updatedUsers);
//
  //  return new Observable((observer) => {
  //    observer.next(newUser);
  //    observer.complete();
  //  })
  //}
//
  //removeUser(id: string): Observable<Users | null> {
  //  const currentUsers = this.users.getValue();
  //  if (currentUsers.length === 0) {
  //    this.snackBar.open('There are no users to remove', '', { duration: 2000 });
  //    return new Observable((observer) => {
  //      observer.next(null);
  //      observer.complete();
  //    });
  //  }
//
  //  const userToRemove = currentUsers.find((user) => user.id === id);
  //  if (!userToRemove) {
  //    this.snackBar.open('User not found', '', { duration: 2000 });
  //    return new Observable((observer) => {
  //      observer.next(null);
  //      observer.complete();
  //    });
  //  }
//
  //  const updatedUsers = currentUsers.filter((user) => user.id !== id);
  //  this.users.next(updatedUsers);
//
  //  return new Observable((observer) => {
  //    observer.next(userToRemove);
  //    observer.complete();
  //  });
  //}
//
  //filterMenUsers(): Observable<Users[]> {
  //  return this.users$.pipe(
  //    map((users) => users.filter((user) => user.gender.toLowerCase() === 'male'))
  //  );
  //}
//
  //filterWomenUsers(): Observable<Users[]> {
  //  return this.users$.pipe(
  //    map((users) => users.filter((user) => user.gender.toLowerCase() === 'female'))
  //  );
  //}
//
  //getAllUsers(): Observable<Users[]> {
  //  return this.users$;
  //}

  addUser(data: {gender: string, name: string, birthDate: string}): void {
    const newUser: Users = {
      gender: data.gender,
      name: data.name,
      birthDate: data.birthDate,
      id: Math.random().toString(16)
    }
    this.usersSignal.update(currentUsers => [...currentUsers, newUser]);
    this.snackBar.open(`User ${newUser.name} added successfully`, '', { duration: 2000 });
  }

  removeUser(id: string): void {
    let removedUser: Users | null = null;
    this.usersSignal.update(currentUsers => {
      const userToRemove = currentUsers.find(user => user.id === id);
      if (!userToRemove) {
        this.snackBar.open('User not found', '', { duration: 2000 });
        return currentUsers;
      }
      removedUser = userToRemove;
      return currentUsers.filter(user => user.id !== id);
    });
    if (removedUser) {
      this.snackBar.open(`User removed successfully`, '', { duration: 2000 });
    } else if (this.usersSignal().length === 0) {
      this.snackBar.open('There are no users to remove', '', { duration: 2000 });
    }
  }

  filterMenUsers(): Users[] {
    return this.maleUsers();
  }

  filterWomenUsers(): Users[] {
    return this.femaleUsers();
  }

}