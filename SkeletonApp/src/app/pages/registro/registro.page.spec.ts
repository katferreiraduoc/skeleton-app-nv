import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, AlertController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';   // ← importa FormsModule

import { RegistroPage } from './registro.page';
import { DBTaskService } from 'src/app/services/dbtask.service';

describe('RegistroPage', () => {
  let component: RegistroPage;
  let fixture: ComponentFixture<RegistroPage>;
  let dbSpy: jasmine.SpyObj<DBTaskService>;

  beforeEach(waitForAsync(() => {
    dbSpy = jasmine.createSpyObj('DBTaskService', ['initDB', 'registerSession']);

    TestBed.configureTestingModule({
      declarations: [RegistroPage],
      imports: [
        IonicModule.forRoot(),
        RouterModule.forRoot([]),
        FormsModule            // ← añade aquí
      ],
      providers: [
        { provide: DBTaskService, useValue: dbSpy },
        AlertController,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });
});
