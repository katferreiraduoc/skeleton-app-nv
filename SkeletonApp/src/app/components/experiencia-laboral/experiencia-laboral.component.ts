import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-experiencia-laboral',
  templateUrl: './experiencia-laboral.component.html',
  styleUrls: ['./experiencia-laboral.component.scss'],
  standalone: false,
})
export class ExperienciaLaboralComponent implements OnInit {
  nombreEmpresa: string = '';
  fechaInicio: Date | null = new Date();
  empleoActual: boolean = false;
  fechaFin: Date | null = null;
  cargo: string = '';
  experiencia: any = [];

  experiencias: Array<{
    nomEmpresa: string;
    fecInicio: string;
    fecFin?: string;
    empleoActual: boolean;
    cargo: string;
  }> = [];

  isVisible: boolean = true;

  constructor(private alertController: AlertController) {}

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

  agregarExperiencia() {
    if (!this.nombreEmpresa || !this.fechaInicio || !this.cargo) {
      this.presentAlert(
        'Atención',
        'Debe completar los datos para poder agregarlos.'
      );
    } else {
      const nueva = {
        nomEmpresa: this.nombreEmpresa,
        fecInicio: this.fechaInicio?.toLocaleDateString() ?? '',
        fecFin: this.empleoActual
          ? 'Presente'
          : this.fechaFin?.toLocaleDateString() ?? '',
        empleoActual: this.empleoActual,
        cargo: this.cargo,
      };

      this.experiencias.push(nueva);

      this.nombreEmpresa = '';
      this.fechaInicio = null;
      this.empleoActual = false;
      this.fechaFin = null;
      this.cargo = '';
      this.isVisible = false;
    }
  }

  eliminarExperiencia(idx: number) {
    this.experiencias.splice(idx, 1);
  }

  ngOnInit() {}
}
