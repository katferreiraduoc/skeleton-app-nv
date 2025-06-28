import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import { DBTaskService } from '../services/dbtask.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private db: DBTaskService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean | UrlTree> {
    await this.db.initDB();

    const active = await this.db.hasActiveSession();

    if (!active) {
      return this.router.createUrlTree(['/login']);
    }

    return true;
  }
}
