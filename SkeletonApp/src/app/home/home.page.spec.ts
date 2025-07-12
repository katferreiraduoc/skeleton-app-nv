import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { HomePage } from './home.page';
import { DBTaskService } from '../services/dbtask.service';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  const dbSpy = jasmine.createSpyObj('DBTaskService', ['hasActiveSession']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        { provide: DBTaskService, useValue: dbSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
