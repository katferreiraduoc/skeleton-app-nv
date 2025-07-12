import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, AnimationController, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule     } from '@angular/material/input';
import { MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule} from '@angular/material/core';

import { MisDatosComponent } from './mis-datos.component';
import { DBTaskService, Perfil } from 'src/app/services/dbtask.service';

describe('MisDatosComponent', () => {
  let component: MisDatosComponent;
  let fixture:   ComponentFixture<MisDatosComponent>;
  let dbSpy:     jasmine.SpyObj<DBTaskService>;

  beforeEach(waitForAsync(() => {
    dbSpy = jasmine.createSpyObj<DBTaskService>(['initDB', 'getPerfil']);
    const fakePerfil: Perfil = {
      nombre: 'Juan',
      apellido: 'Pérez',
      nivelEducacion: 'Superior',
      fechaNacimiento: '1990-05-15'
    };
    dbSpy.initDB.and.resolveTo();
    dbSpy.getPerfil.and.resolveTo(fakePerfil);

    TestBed.configureTestingModule({
      declarations: [ MisDatosComponent ],
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
      ],
      providers: [
        { provide: DBTaskService, useValue: dbSpy },
        AnimationController,
        AlertController,
        provideRouter([]),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MisDatosComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('debe cargar perfil al iniciar', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dbSpy.initDB).toHaveBeenCalled();
    expect(dbSpy.getPerfil).toHaveBeenCalled();

    expect(component.nombre).toBe('Juan');
    expect(component.apellido).toBe('Pérez');
    expect(component.nivelEducacion).toBe('Superior');

    const iso = component.fechaNacimiento!.toISOString().split('T')[0];
    expect(iso).toBe('1990-05-15');
  });
});
