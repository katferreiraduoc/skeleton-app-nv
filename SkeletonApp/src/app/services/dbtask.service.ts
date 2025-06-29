import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject } from 'rxjs';

export interface Experiencia {
  id: number;
  empresa: string;
  fecha_inicio: Date;
  fecha_fin: Date | null;
  empleo_actual: boolean;
  cargo: string;
}

@Injectable({
  providedIn: 'root',
})
export class DBTaskService {
  private dbObject!: SQLiteObject;

  private _exp$ = new BehaviorSubject<Experiencia[]>([]);
  public exp$ = this._exp$.asObservable();

  constructor(private sqlite: SQLite, private storage: Storage) {}

  public async initDB(): Promise<void> {
    await this.storage.create();
    this.dbObject = await this.sqlite.create({
      name: 'app.db',
      location: 'default',
    });
    await this.crearTablas();
  }

  private async crearTablas(): Promise<void> {
    await this.dbObject.executeSql(
      `
    CREATE TABLE IF NOT EXISTS sesion_data (
      user_name TEXT PRIMARY KEY NOT NULL,
      password   INTEGER           NOT NULL,
      active     INTEGER           NOT NULL
    );
  `,
      []
    );

    await this.dbObject.executeSql(
      `
      CREATE TABLE IF NOT EXISTS experiencia_laboral (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        empresa        TEXT    NOT NULL,
        fecha_inicio   TEXT    NOT NULL,
        fecha_fin      TEXT,
        empleo_actual  INTEGER NOT NULL,
        cargo          TEXT    NOT NULL
      );`,
      []
    );
  }

  public async hasActiveSession(): Promise<boolean> {
    const res = await this.dbObject.executeSql(
      'SELECT COUNT(*) as count FROM sesion_data WHERE active = 1;',
      []
    );
    const count = res.rows.length > 0 ? (res.rows.item(0).count as number) : 0;
    return count > 0;
  }

  public async validateUser(user: string, pass: string): Promise<boolean> {
    const res = await this.dbObject.executeSql(
      'SELECT COUNT(*) as count FROM sesion_data WHERE user_name = ? AND password = ?;',
      [user, pass]
    );
    const count = res.rows.item(0).count as number;
    return count > 0;
  }

  public async registerSession(user: string, pass: string): Promise<void> {
    await this.dbObject.executeSql(
      `INSERT OR REPLACE INTO sesion_data(user_name,password,active)
       VALUES(?,?, 1);`,
      [user, pass]
    );
    await this.storage.set('session', { user, pass, active: 1 });
  }

  public async updateSession(user: string, active: number): Promise<void> {
    await this.dbObject.executeSql(
      'UPDATE sesion_data SET active = ? WHERE user_name = ?;',
      [active, user]
    );
    await this.storage.set('session', { user, active });
  }

  public async loadExperiencias(): Promise<void> {
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

  public async addExperiencia(data: {
    empresa: string;
    fecha_inicio: Date;
    fecha_fin?: Date;
    empleo_actual: boolean;
    cargo: string;
  }): Promise<void> {
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

  public async deleteExperiencia(id: number): Promise<void> {
    await this.dbObject.executeSql(
      'DELETE FROM experiencia_laboral WHERE id = ?;',
      [id]
    );
    await this.loadExperiencias();
  }

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
    const entries = Object.entries(data).filter(([_, v]) => v !== undefined);

    const sets: string[] = [];
    const vals: any[] = [];

    for (const [k, v] of entries) {
      sets.push(`${k} = ?`);

      if (k === 'fecha_inicio') {
        vals.push((v as Date).toISOString());
      } else if (k === 'fecha_fin') {
        vals.push(v ? (v as Date).toISOString() : null);
      } else if (k === 'empleo_actual') {
        vals.push((v as boolean) ? 1 : 0);
      } else {
        vals.push(v);
      }
    }

    vals.push(id);

    await this.dbObject.executeSql(
      `UPDATE experiencia_laboral SET ${sets.join(',')} WHERE id = ?;`,
      vals
    );
    
    await this.loadExperiencias();
  }
}
