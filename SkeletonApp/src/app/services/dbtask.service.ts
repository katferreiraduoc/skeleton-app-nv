import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class DBTaskService {
  private dbObject!: SQLiteObject;

  constructor(private sqlite: SQLite, private storage: Storage) {}

  public async initDB(): Promise<void> {
    await this.storage.create();
    this.dbObject = await this.sqlite.create({
      name: 'app.db',
      location: 'default'
    });
    await this.crearTablas();
  }

  private async crearTablas(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS sesion_data(
        user_name TEXT PRIMARY KEY NOT NULL,
        password TEXT NOT NULL,
        active INTEGER NOT NULL
      );
    `;
    await this.dbObject.executeSql(sql, []);
  }

  public async hasActiveSession(): Promise<boolean> {
    const res = await this.dbObject.executeSql(
      'SELECT COUNT(*) as count FROM sesion_data WHERE active = 1;', []);
    const count = (res.rows.length > 0)
      ? (res.rows.item(0).count as number)
      : 0;
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
}
