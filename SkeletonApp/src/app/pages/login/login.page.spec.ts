import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { LoginPage } from './login.page';
import { DBTaskService } from 'src/app/services/dbtask.service';

@Component({
  template: `<p>Home stub</p>`,
  standalone: false
})
class DummyHomePage {}

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture:   ComponentFixture<LoginPage>;
  let dbSpy:     jasmine.SpyObj<DBTaskService>;
  let router:    Router;

  beforeEach(waitForAsync(() => {
    dbSpy = jasmine.createSpyObj('DBTaskService', [
      'initDB',
      'validateUser',
      'registerSession',
      'hasActiveSession'
    ]);
    dbSpy.initDB.and.resolveTo();
    dbSpy.validateUser.and.resolveTo(true);

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        RouterModule.forRoot([
          { path: 'home', component: DummyHomePage }
        ]),
      ],
      declarations: [
        LoginPage,
        DummyHomePage
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        { provide: DBTaskService, useValue: dbSpy },
        AlertController,
        ToastController
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('al hacer login válido navega al home con el state correcto', async () => {
    component.usuario = 'user';
    component.clave   = '1234';

    await component.iniciosesion();

    expect(dbSpy.validateUser).toHaveBeenCalledWith('user', '1234');
    expect(router.navigate).toHaveBeenCalledWith(
      ['/home'],
      jasmine.objectContaining({ state: { usuarioEnviado: 'user' } })
    );
  });
});
