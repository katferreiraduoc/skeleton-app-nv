import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { DBTaskService, Certificacion } from 'src/app/services/dbtask.service';

@Component({
  selector: 'app-certificaciones',
  templateUrl: './certificaciones.component.html',
  styleUrls: ['./certificaciones.component.scss'],
  standalone: false,
})
export class CertificacionesComponent implements OnInit {
  certs$!: Observable<Certificacion[]>;

  nombreCertificado: string = '';
  fechaObtencion: Date = new Date();
  certificadoVence: boolean = false;
  fechaVencimiento: Date | null = null;

  editing = false;
  editId: number | null = null;

  isVisible: boolean = false;

  constructor(
    private alertController: AlertController,
    private db: DBTaskService
  ) {}

  async ngOnInit() {
    await this.db.initDB();
    this.certs$ = this.db.certs$;
    await this.db.loadCertificaciones();
  }

  async presentAlert(header: string, msj: string) {
    const alert = await this.alertController.create({
      header: header,
      message: msj,
      buttons: ['OK'],
    });

    await alert.present();
  }

  showFechaVencimiento() {
    this.isVisible = this.certificadoVence;
  }

  async guardarCertificacion() {
    if (!this.nombreCertificado || !this.fechaObtencion) {
      this.presentAlert(
        'Atención',
        'Debe completar los datos para poder agregarlos.'
      );
    } else {
      const data = {
        nombre_certificado: this.nombreCertificado,
        fecha_obtencion: this.fechaObtencion,
        tiene_vencimiento: this.certificadoVence,
        fecha_vencimiento: this.certificadoVence
          ? this.fechaVencimiento!
          : null,
      };

      if (this.editing && this.editId != null) {
        await this.db.updateCertificacion(this.editId, data);
      } else {
        await this.db.addCertificacion(data);
      }
      this.cancel();
    }
  }

  editarCertificacion(cert: Certificacion) {
    this.editing = true;
    this.editId = cert.id;
    this.nombreCertificado = cert.nombre_certificado;
    this.fechaObtencion = cert.fecha_obtencion;
    this.certificadoVence = cert.tiene_vencimiento;
    this.fechaVencimiento = cert.fecha_vencimiento;

    this.isVisible = this.certificadoVence;
  }

  async eliminarCertificacion(idx: number) {
    await this.db.deleteCertificacion(idx);
    if (this.editing && this.editId === idx) this.cancel();
  }

  cancel() {
    this.nombreCertificado = '';
    this.fechaObtencion = new Date();
    this.certificadoVence = false;
    this.fechaVencimiento = null;
    this.editing = false;
    this.editId = null;
    this.isVisible = false;
  }

  resetForm() {
    this.nombreCertificado = '';
    this.fechaObtencion = new Date();
    this.certificadoVence = false;
    this.isVisible = false;
    this.fechaVencimiento = null;
    this.editing = false;
    this.editId = null;
  }
}
