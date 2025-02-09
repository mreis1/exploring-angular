import { CanActivateFn, Router, UrlTree } from "@angular/router";
import { inject } from "@angular/core";
import { UserService } from "../services/users.service";

export const authGuard: CanActivateFn = (route, state) => {
    const user: UserService = inject(UserService);
    const router = inject(Router);
    const res = !!user.isLogged();
    return res || router.createUrlTree(['/auth']);
}