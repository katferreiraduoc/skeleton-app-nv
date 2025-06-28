import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-certificaciones',
  templateUrl: './certificaciones.component.html',
  styleUrls: ['./certificaciones.component.scss'],
  standalone: false,
})
export class CertificacionesComponent implements OnInit {
  nombreCertificado: string = '';
  fechaObtencion: Date | null = new Date();
  certificadoVence: boolean = true;
  fechaVencimiento: Date | null = null;

  certificados: Array<{
    nomCert: string;
    fecObtencion: string;
    fecVencimiento?: string;
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

  showFechaVencimiento() {
    this.isVisible = !this.isVisible;
  }

  agregarCertificacion() {
    if (!this.nombreCertificado || !this.fechaObtencion) {
      this.presentAlert(
        'Atención',
        'Debe completar los datos para poder agregarlos.'
      );
    } else {
      const nueva = {
        nomCert: this.nombreCertificado,
        fecObtencion: this.fechaObtencion?.toLocaleDateString() ?? '',
        fecVencimiento: this.certificadoVence
          ? 'Sin Vencimiento'
          : this.fechaVencimiento?.toLocaleDateString() ?? '',
      };

      this.certificados.push(nueva);

      this.nombreCertificado = '';
      this.fechaObtencion = null;
      this.certificadoVence = false;
      this.fechaVencimiento = null;
    }
  }

  eliminarCertificacion(idx: number) {
    this.certificados.splice(idx, 1);
  }

  ngOnInit() {}
}
