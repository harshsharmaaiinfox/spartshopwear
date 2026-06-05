import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { UrlTree, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { GetUserDetails } from './../../shared/action/account.action';
import { AuthService } from './../../shared/services/auth.service';
import { AccountState } from './../../shared/state/account.state';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {

  constructor(private store: Store,
    private router: Router,
    private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> {

    this.authService.redirectUrl = state.url;

    if (!this.store.selectSnapshot(s => s.auth && s.auth.access_token)) {
      return of(this.router.createUrlTree(['/auth/login']));
    }

    return this.store.dispatch(new GetUserDetails()).pipe(
      map(() => {
        const user = this.store.selectSnapshot(AccountState.user);
        if (!user?.email_verified_at) {
          return this.router.createUrlTree(['/auth/login'], {
            queryParams: { verified: 'false' }
          });
        }
        return true;
      }),
      catchError(() => of(this.router.createUrlTree(['/auth/login'])))
    );
  }

  canActivateChild(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean | UrlTree {
    if (!!this.store.selectSnapshot(state => state.auth && state.auth.access_token)) {
      if(this.router.url.startsWith('/account') || this.router.url == '/checkout' || this.router.url == '/compare')
        this.router.navigate(['/']);
      return false;
    }
    return true;
  }

}
