import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { DBTaskService, Experiencia } from 'src/app/services/dbtask.service';

@Component({
  selector: 'app-experiencia-laboral',
  templateUrl: './experiencia-laboral.component.html',
  styleUrls: ['./experiencia-laboral.component.scss'],
  standalone: false,
})
export class ExperienciaLaboralComponent implements OnInit {
  experiencias$!: Observable<Experiencia[]>;

  nombreEmpresa: string = '';
  fechaInicio: Date | null = new Date();
  empleoActual: boolean = false;
  fechaFin: Date | null = null;
  cargo: string = '';

  isVisible: boolean = true;

  constructor(
    private alertController: AlertController,
    private db: DBTaskService
  ) {}

  async ngOnInit() {
    await this.db.initDB();
    this.experiencias$ = this.db.exp$;
    await this.db.loadExperiencias();
  }

  async presentAlert(header: string, msj: string) {
    const alert = await this.alertController.create({
      header: header,
      message: msj,
      buttons: ['OK'],
    });

    await alert.present();
  }

  showFechaFin() {
    this.isVisible = !this.isVisible;
  }

  async agregarExperiencia() {
    if (!this.nombreEmpresa || !this.fechaInicio || !this.cargo) {
      this.presentAlert(
        'Atención',
        'Debe completar los datos para poder agregarlos.'
      );
    } else {
      await this.db.addExperiencia({
      empresa: this.nombreEmpresa,
      fecha_inicio: this.fechaInicio,
      fecha_fin: this.empleoActual ? undefined : this.fechaFin!,
      empleo_actual: this.empleoActual,
      cargo: this.cargo
    });

    this.nombreEmpresa = '';
    this.fechaInicio = new Date();
    this.fechaFin = null;
    this.empleoActual = false;
    this.cargo = '';
    }
  }

  async eliminarExperiencia(idx: number) {
    await this.db.deleteExperiencia(idx);
  }
}
