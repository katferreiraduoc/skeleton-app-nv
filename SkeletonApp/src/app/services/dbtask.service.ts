import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Storage } from '@ionic/storage-angular';
import { Platform } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

export interface Experiencia {
  id: number;
  empresa: string;
  fecha_inicio: Date;
  fecha_fin: Date | null;
  empleo_actual: boolean;
  cargo: string;
}

export interface Certificacion {
  id: number;
  nombre_certificado: string;
  fecha_obtencion: Date;
  tiene_vencimiento: boolean;
  fecha_vencimiento: Date | null;
}

export interface Perfil {
  nombre: string;
  apellido: string;
  nivelEducacion: string;
  fechaNacimiento: string;
  platoFav?: string;
  lat?: number;
  lng?: number;
  direccion?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DBTaskService {
  private dbObject: SQLiteObject | null = null;
  private isHybrid: boolean;

  private _exp$ = new BehaviorSubject<Experiencia[]>([]);
  public exp$ = this._exp$.asObservable();

  private _certs$ = new BehaviorSubject<Certificacion[]>([]);
  public certs$ = this._certs$.asObservable();

  constructor(
    private sqlite: SQLite,
    private storage: Storage,
    private platform: Platform
  ) {
    this.isHybrid = this.platform.is('hybrid');
  }

  /** Inicializa la base de datos o Storage según la plataforma */
  public async initDB(): Promise<void> {
    await this.storage.create();

    if (this.isHybrid) {
      try {
        this.dbObject = await this.sqlite.create({
          name: 'app.db',
          location: 'default',
        });
        await this.crearTablas();
      } catch (e) {
        console.warn('No se pudo abrir SQLite, se usará Storage', e);
        this.dbObject = null;
      }
    } else {
      this.dbObject = null;
    }
  }

  /** Crea las tablas sólo si SQLite está activo */
  private async crearTablas(): Promise<void> {
    if (!this.dbObject) return;

    await this.dbObject.executeSql(`
      CREATE TABLE IF NOT EXISTS sesion_data (
        user_name TEXT PRIMARY KEY NOT NULL,
        password   INTEGER           NOT NULL,
        active     INTEGER           NOT NULL
      );
    `, []);

    await this.dbObject.executeSql(`
      CREATE TABLE IF NOT EXISTS experiencia_laboral (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        empresa        TEXT    NOT NULL,
        fecha_inicio   TEXT    NOT NULL,
        fecha_fin      TEXT,
        empleo_actual  INTEGER NOT NULL,
        cargo          TEXT    NOT NULL
      );
    `, []);

    await this.dbObject.executeSql(`
      CREATE TABLE IF NOT EXISTS certificaciones (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_certificado  TEXT    NOT NULL,
        fecha_obtencion     TEXT    NOT NULL,
        tiene_vencimiento   INTEGER NOT NULL,
        fecha_vencimiento   TEXT
      );
    `, []);
  }

  /** Comprueba sesión activa */
  public async hasActiveSession(): Promise<boolean> {
    if (this.dbObject) {
      const res = await this.dbObject.executeSql(
        'SELECT COUNT(*) as count FROM sesion_data WHERE active = 1;',
        []
      );
      return (res.rows.item(0).count as number) > 0;
    } else {
      const sess = await this.storage.get('session');
      return sess?.active === 1;
    }
  }

  /** Valida usuario y contraseña */
  public async validateUser(user: string, pass: string): Promise<boolean> {
    if (this.dbObject) {
      const res = await this.dbObject.executeSql(
        'SELECT COUNT(*) as count FROM sesion_data WHERE user_name = ? AND password = ?;',
        [user, pass]
      );
      return (res.rows.item(0).count as number) > 0;
    } else {
      const sess = await this.storage.get('session');
      return sess?.user === user && sess?.pass === pass;
    }
  }

  /** Registra la sesión en SQLite y Storage */
  public async registerSession(user: string, pass: string): Promise<void> {
    if (this.dbObject) {
      await this.dbObject.executeSql(
        `INSERT OR REPLACE INTO sesion_data(user_name,password,active)
         VALUES(?,?,1);`,
        [user, pass]
      );
    }
    await this.storage.set('session', { user, pass, active: 1 });
  }

  /** Actualiza el estado de la sesión */
  public async updateSession(user: string, active: number): Promise<void> {
    if (this.dbObject) {
      await this.dbObject.executeSql(
        'UPDATE sesion_data SET active = ? WHERE user_name = ?;',
        [active, user]
      );
    }
    await this.storage.set('session', { user, active });
  }

  /** Carga experiencias desde SQLite si está disponible */
  public async loadExperiencias(): Promise<void> {
    if (!this.dbObject) {
      // No hay fallback para experiencias, simplemente dejamos el stream vacío
      this._exp$.next([]);
      return;
    }
    const rs = await this.dbObject.executeSql(
      'SELECT * FROM experiencia_laboral;',
      []
    );
    const arr: Experiencia[] = [];
    for (let i = 0; i < rs.rows.length; i++) {
      const r = rs.rows.item(i);
      arr.push({
        id: r.id,
        empresa: r.empresa,
        fecha_inicio: new Date(r.fecha_inicio),
        fecha_fin: r.fecha_fin ? new Date(r.fecha_fin) : null,
        empleo_actual: r.empleo_actual === 1,
        cargo: r.cargo,
      });
    }
    this._exp$.next(arr);
  }

  /** Añade una experiencia */
  public async addExperiencia(data: {
    empresa: string;
    fecha_inicio: Date;
    fecha_fin?: Date;
    empleo_actual: boolean;
    cargo: string;
  }): Promise<void> {
    if (!this.dbObject) return;
    await this.dbObject.executeSql(
      `INSERT INTO experiencia_laboral
         (empresa, fecha_inicio, fecha_fin, empleo_actual, cargo)
       VALUES (?,?,?,?,?);`,
      [
        data.empresa,
        data.fecha_inicio.toISOString(),
        data.fecha_fin?.toISOString() || null,
        data.empleo_actual ? 1 : 0,
        data.cargo,
      ]
    );
    await this.loadExperiencias();
  }

  /** Elimina una experiencia */
  public async deleteExperiencia(id: number): Promise<void> {
    if (!this.dbObject) return;
    await this.dbObject.executeSql(
      'DELETE FROM experiencia_laboral WHERE id = ?;',
      [id]
    );
    await this.loadExperiencias();
  }

  /** Actualiza una experiencia */
  public async updateExperiencia(
    id: number,
    data: Partial<{
      empresa: string;
      fecha_inicio: Date;
      fecha_fin: Date;
      empleo_actual: boolean;
      cargo: string;
    }>
  ): Promise<void> {
    if (!this.dbObject) return;
    const entries = Object.entries(data).filter(([_, v]) => v !== undefined);
    const sets: string[] = [];
    const vals: any[] = [];

    for (const [k, v] of entries) {
      sets.push(`${k} = ?`);
      if (k === 'fecha_inicio') vals.push((v as Date).toISOString());
      else if (k === 'fecha_fin') vals.push(v ? (v as Date).toISOString() : null);
      else if (k === 'empleo_actual') vals.push((v as boolean) ? 1 : 0);
      else vals.push(v);
    }
    vals.push(id);

    await this.dbObject.executeSql(
      `UPDATE experiencia_laboral SET ${sets.join(',')} WHERE id = ?;`,
      vals
    );
    await this.loadExperiencias();
  }

  /** Carga certificaciones */
  public async loadCertificaciones(): Promise<void> {
    if (!this.dbObject) {
      this._certs$.next([]);
      return;
    }
    const rs = await this.dbObject.executeSql(
      'SELECT * FROM certificaciones;',
      []
    );
    const arr: Certificacion[] = [];
    for (let i = 0; i < rs.rows.length; i++) {
      const r = rs.rows.item(i);
      arr.push({
        id: r.id,
        nombre_certificado: r.nombre_certificado,
        fecha_obtencion: new Date(r.fecha_obtencion),
        tiene_vencimiento: r.tiene_vencimiento === 1,
        fecha_vencimiento: r.fecha_vencimiento
          ? new Date(r.fecha_vencimiento)
          : null,
      });
    }
    this._certs$.next(arr);
  }

  /** Añade una certificación */
  public async addCertificacion(data: {
    nombre_certificado: string;
    fecha_obtencion: Date;
    tiene_vencimiento: boolean;
    fecha_vencimiento?: Date | null;
  }): Promise<void> {
    if (!this.dbObject) return;
    await this.dbObject.executeSql(
      `INSERT INTO certificaciones
         (nombre_certificado, fecha_obtencion, tiene_vencimiento, fecha_vencimiento)
       VALUES (?,?,?,?);`,
      [
        data.nombre_certificado,
        data.fecha_obtencion.toISOString(),
        data.tiene_vencimiento ? 1 : 0,
        data.fecha_vencimiento?.toISOString() || null,
      ]
    );
    await this.loadCertificaciones();
  }

  /** Elimina una certificación */
  public async deleteCertificacion(id: number): Promise<void> {
    if (!this.dbObject) return;
    await this.dbObject.executeSql(
      'DELETE FROM certificaciones WHERE id = ?;',
      [id]
    );
    await this.loadCertificaciones();
  }

  /** Actualiza una certificación */
  public async updateCertificacion(
    id: number,
    data: Partial<{
      nombre_certificado: string;
      fecha_obtencion: Date;
      tiene_vencimiento: boolean;
      fecha_vencimiento: Date | null;
    }>
  ): Promise<void> {
    if (!this.dbObject) return;
    const entries = Object.entries(data);
    const sets: string[] = [];
    const vals: any[] = [];

    for (const [k, v] of entries) {
      sets.push(`${k} = ?`);
      if (k === 'fecha_obtencion') vals.push((v as Date).toISOString());
      else if (k === 'fecha_vencimiento')
        vals.push(v instanceof Date ? v.toISOString() : null);
      else if (k === 'tiene_vencimiento') vals.push((v as boolean) ? 1 : 0);
      else vals.push(v);
    }
    vals.push(id);

    await this.dbObject.executeSql(
      `UPDATE certificaciones
       SET ${sets.join(', ')}
       WHERE id = ?;`,
      vals
    );
    await this.loadCertificaciones();
  }

  /** Guarda el perfil (siempre en Storage) */
  public async savePerfil(p: Perfil): Promise<void> {
    await this.storage.set('perfil', p);
  }

  /** Obtiene el perfil */
  public async getPerfil(): Promise<Perfil | null> {
    return (await this.storage.get('perfil')) as Perfil | null;
  }

  /** Elimina el perfil */
  public async clearPerfil(): Promise<void> {
    await this.storage.remove('perfil');
  }

  /** Guarda lista de platos favoritos */
  public async savePlatoFav(platos: string[]): Promise<void> {
    await this.storage.set('platosFav', platos);
  }

  /** Obtiene lista de platos favoritos */
  public async getPlatosFav(): Promise<string[]> {
    const arr = await this.storage.get('platosFav');
    return Array.isArray(arr) ? arr : [];
  }
}
