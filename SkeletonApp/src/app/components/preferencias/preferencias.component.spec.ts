import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, AlertController } from '@ionic/angular';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { PreferenciasComponent } from './preferencias.component';
import { ApiService, Category } from 'src/app/services/api.service';
import { DBTaskService }          from 'src/app/services/dbtask.service';

describe('PreferenciasComponent', () => {
  let component: PreferenciasComponent;
  let fixture:   ComponentFixture<PreferenciasComponent>;
  let apiSpy:    jasmine.SpyObj<ApiService>;
  let dbSpy:     jasmine.SpyObj<DBTaskService>;

  beforeEach(waitForAsync(() => {
    apiSpy = jasmine.createSpyObj('ApiService', ['getCategories']);
    dbSpy  = jasmine.createSpyObj('DBTaskService', ['getPlatosFav', 'savePlatoFav']);

    apiSpy.getCategories.and.returnValue(of([] as Category[]));
    dbSpy.getPlatosFav.and.returnValue(Promise.resolve([]));

    TestBed.configureTestingModule({
      declarations: [ PreferenciasComponent ],
      imports:      [
        IonicModule.forRoot(),
      ],
      providers: [
        provideHttpClientTesting(),
        { provide: ApiService,     useValue: apiSpy },
        { provide: DBTaskService,   useValue: dbSpy },
        AlertController
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PreferenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit carga categorías y favoritos', async () => {
    expect(apiSpy.getCategories).toHaveBeenCalled();
    await fixture.whenStable();
    expect(dbSpy.getPlatosFav).toHaveBeenCalled();
    expect(component.platoFav).toEqual([]);
  });
});
