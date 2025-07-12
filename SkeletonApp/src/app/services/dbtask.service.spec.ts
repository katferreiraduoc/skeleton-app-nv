import { TestBed } from '@angular/core/testing';
import { DBTaskService } from './dbtask.service';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Storage } from '@ionic/storage-angular';

interface AddExperienciaDTO {
  empresa: string;
  fecha_inicio: Date;
  fecha_fin?: Date;
  empleo_actual: boolean;
  cargo: string;
}

describe('DBTaskService', () => {
  let service: DBTaskService;
  let sqliteSpy: jasmine.SpyObj<SQLite>;
  let storageSpy: jasmine.SpyObj<Storage>;
  let dbObjectSpy: jasmine.SpyObj<SQLiteObject>;

  beforeEach(async () => {
    dbObjectSpy = jasmine.createSpyObj<SQLiteObject>('SQLiteObject', [
      'executeSql',
    ]);
    sqliteSpy = jasmine.createSpyObj<SQLite>('SQLite', ['create']);
    storageSpy = jasmine.createSpyObj<Storage>('Storage', [
      'create',
      'get',
      'set',
      'remove',
    ]);

    sqliteSpy.create.and.returnValue(Promise.resolve(dbObjectSpy));
    storageSpy.create.and.returnValue(Promise.resolve(storageSpy));

    await TestBed.configureTestingModule({
      providers: [
        DBTaskService,
        { provide: SQLite, useValue: sqliteSpy },
        { provide: Storage, useValue: storageSpy },
      ],
    }).compileComponents();

    dbObjectSpy.executeSql.and.callFake((sql: string, params: any[]) =>
      Promise.resolve(
        (sql.trim().toUpperCase().startsWith('SELECT')
          ? { rows: { length: 0, item: (_: number) => null } }
          : {}) as any
      )
    );

    service = TestBed.inject(DBTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('initDB debe llamar a storage.create, sqlite.create y crearTablas', async () => {
    const crearTablasSpy = spyOn<any>(service, 'crearTablas').and.returnValue(
      Promise.resolve()
    );
    await service.initDB();

    expect(storageSpy.create).toHaveBeenCalled();
    expect(sqliteSpy.create).toHaveBeenCalledWith({
      name: 'app.db',
      location: 'default',
    });
    expect(crearTablasSpy).toHaveBeenCalled();
  });

  it('addExperiencia debe llamar a executeSql con la consulta y parámetros correctos', async () => {
    const testData: AddExperienciaDTO = {
      empresa: 'Acme Corp',
      fecha_inicio: new Date('2025-01-01T00:00:00.000Z'),
      fecha_fin: new Date('2025-02-01T00:00:00.000Z'),
      empleo_actual: false,
      cargo: 'Developer',
    };

    await service.initDB();
    dbObjectSpy.executeSql.calls.reset();

    await service.addExperiencia(testData);

    expect(dbObjectSpy.executeSql).toHaveBeenCalledWith(
      jasmine.stringMatching(/INSERT INTO experiencia_laboral/),
      [
        testData.empresa,
        testData.fecha_inicio.toISOString(),
        testData.fecha_fin!.toISOString(),
        0,
        testData.cargo,
      ]
    );
  });

  it('loadExperiencias debe transformar resultados de SQL en emisiones exp$', async () => {
    const mockRows: any = {
      length: 2,
      item: (i: number) => ({
        id: i + 1,
        empresa: `Empresa${i + 1}`,
        fecha_inicio: new Date('2025-01-01').toISOString(),
        fecha_fin: null,
        empleo_actual: 1,
        cargo: `Cargo${i + 1}`,
      }),
    };
    const mockRes = { rows: mockRows } as any;

    await service.initDB();
    dbObjectSpy.executeSql.and.returnValue(Promise.resolve(mockRes));

    let result: any;
    service.exp$.subscribe((res) => (result = res));

    await service.loadExperiencias();
    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    expect(result[0].empresa).toBe('Empresa1');
  });
});
