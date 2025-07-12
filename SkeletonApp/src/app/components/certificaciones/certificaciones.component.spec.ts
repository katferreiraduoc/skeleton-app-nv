import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule }  from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';        
import { of }                  from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CertificacionesComponent } from './certificaciones.component';
import { DBTaskService }            from 'src/app/services/dbtask.service';

describe('CertificacionesComponent', () => {
  let component: CertificacionesComponent;
  let fixture: ComponentFixture<CertificacionesComponent>;
  let dbSpy: jasmine.SpyObj<DBTaskService>;

  beforeEach(waitForAsync(() => {
    dbSpy = jasmine.createSpyObj('DBTaskService', [
      'initDB',
      'loadCertificaciones',
      'certs$',
      'addCertificacion',
      'updateCertificacion',
      'deleteCertificacion'
    ]);
    (dbSpy as any).certs$ = of([]);

    TestBed.configureTestingModule({
      declarations: [CertificacionesComponent],
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

    fixture = TestBed.createComponent(CertificacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('debe crear y llamar initDB/loadCertificaciones', () => {
    expect(component).toBeTruthy();
    expect(dbSpy.initDB).toHaveBeenCalled();
    expect(dbSpy.loadCertificaciones).toHaveBeenCalled();
  });
});
