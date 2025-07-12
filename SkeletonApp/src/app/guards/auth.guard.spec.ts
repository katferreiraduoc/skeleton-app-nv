import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { DBTaskService } from '../services/dbtask.service';
import { Router }        from '@angular/router';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let dbSpy: jasmine.SpyObj<DBTaskService>;
  let routerSpy: jasmine.SpyObj<Router>;
  const fakeUrlTree = {} as any;

  beforeEach(() => {
    dbSpy     = jasmine.createSpyObj('DBTaskService', ['initDB','hasActiveSession']);
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);
    routerSpy.createUrlTree.and.returnValue(fakeUrlTree);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: DBTaskService, useValue: dbSpy },
        { provide: Router,      useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('returns true si hay sesión activa', async () => {
    dbSpy.hasActiveSession.and.resolveTo(true);
    const res = await guard.canActivate();
    expect(res).toBeTrue();
  });

  it('devuelve UrlTree si NO hay sesión activa', async () => {
    dbSpy.hasActiveSession.and.resolveTo(false);
    const res = await guard.canActivate();
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(res).toBe(fakeUrlTree);
  });
});
