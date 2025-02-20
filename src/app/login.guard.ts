import { CanActivateFn, Router, UrlTree } from "@angular/router";
import { inject } from "@angular/core";
import { UserService } from "../services/users.service";
import { firstValueFrom } from "rxjs";

/**
 * Experimental guard.
 * The idea is to prevent a logged user from accessing the auth page
 * @param route
 * @param state
 */
export const loginGuard: CanActivateFn = async (route, state) => {
    const user: UserService = inject(UserService);
    const router = inject(Router);
    await firstValueFrom(user.getCurrentUser());
    return !user.currentUserSignal() ? true : (router.createUrlTree(['/home']));
}
