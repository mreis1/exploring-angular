import { CanActivateFn, Router, UrlTree } from "@angular/router";
import { inject } from "@angular/core";
import { UserService } from "../services/users.service";
import { firstValueFrom } from "rxjs";

export const authGuard: CanActivateFn = async (route, state) => {
    const user: UserService = inject(UserService);
    const router = inject(Router);
    await firstValueFrom(user.getCurrentUser())
    return user.currentUserSignal() ? true : router.createUrlTree(['/auth']);
}