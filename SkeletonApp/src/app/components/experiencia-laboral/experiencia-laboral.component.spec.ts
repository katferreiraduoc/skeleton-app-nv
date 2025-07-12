import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { FormsModule }               from '@angular/forms';
import { MatFormFieldModule }        from '@angular/material/form-field';
import { MatInputModule }            from '@angular/material/input';
import { MatDatepickerModule }       from '@angular/material/datepicker';
import { MatNativeDateModule }       from '@angular/material/core';
import { of }                        from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA }    from '@angular/core';

import { ExperienciaLaboralComponent } from './experiencia-laboral.component';
import { DBTaskService }               from 'src/app/services/dbtask.service';

describe('ExperienciaLaboralComponent', () => {
  let component: ExperienciaLaboralComponent;
  let fixture: ComponentFixture<ExperienciaLaboralComponent>;
  let dbSpy: jasmine.SpyObj<DBTaskService>;

  beforeEach(waitForAsync(() => {
    dbSpy = jasmine.createSpyObj('DBTaskService', [
      'initDB',
      'loadExperiencias',
      'exp$',
      'addExperiencia',
      'updateExperiencia',
      'deleteExperiencia'
    ]);
    (dbSpy as any).exp$ = of([]);

    TestBed.configureTestingModule({
      declarations: [ExperienciaLaboralComponent],
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule
      ],
      providers: [
        { provide: DBTaskService, useValue: dbSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ExperienciaLaboralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('debe crear y llamar initDB/loadExperiencias', () => {
    expect(component).toBeTruthy();
    expect(dbSpy.initDB).toHaveBeenCalled();
    expect(dbSpy.loadExperiencias).toHaveBeenCalled();
  });
});
