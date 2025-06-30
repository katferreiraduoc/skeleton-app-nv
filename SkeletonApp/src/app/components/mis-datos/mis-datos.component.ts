import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonInput, AnimationController } from '@ionic/angular';
import { DBTaskService, Perfil } from 'src/app/services/dbtask.service';

@Component({
  selector: 'app-mis-datos',
  templateUrl: './mis-datos.component.html',
  styleUrls: ['./mis-datos.component.scss'],
  standalone: false,
})
export class MisDatosComponent implements OnInit {
  @ViewChild('nombreInput', { read: IonInput, static: false })
  nombreInput!: IonInput;
  @ViewChild('apellidoInput', { read: IonInput, static: false })
  apellidoInput!: IonInput;

  usuario: string = '';
  nombre: string = '';
  apellido: string = '';
  nivelEducacion = '';
  fechaNacimiento: Date = new Date();

  constructor(
    private db: DBTaskService,
    private alertController: AlertController,
    private router: Router,
    private activedRoute: ActivatedRoute,
    private animationCtrl: AnimationController
  ) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state ?? history.state;

    this.usuario = state?.usuarioEnviado;
  }

  async ngOnInit() {
    const p = await this.db.getPerfil();
    if (p) {
      this.nombre = p.nombre;
      this.apellido = p.apellido;
      this.nivelEducacion = p.nivelEducacion;
      this.fechaNacimiento = new Date(p.fechaNacimiento);
    }
  }

  segmentValue: 'mis-datos' | 'experiencia' | 'certificaciones' = 'mis-datos';

  async presentAlert(header: string, msj: string) {
    const alert = await this.alertController.create({
      header: header,
      message: msj,
      buttons: ['OK'],
    });

    await alert.present();
  }

  mostrardatos() {
    if (!this.nombre || !this.apellido) {
      this.presentAlert(
        'Atención',
        'Debe completar los datos para poder mostrarlos.'
      );
    } else {
      this.presentAlert(
        'Usuario',
        'Su nombre es ' + this.nombre + ' ' + this.apellido
      );
    }
  }

  limpiardatos() {
    this.nombre = '';
    this.apellido = '';
    this.nivelEducacion = '';
    this.fechaNacimiento = new Date();

    [this.nombreInput, this.apellidoInput].forEach((input) => {
      const el = input.getInputElement();
      el.then((nativeEl) => {
        this.animationCtrl
          .create()
          .addElement(nativeEl)
          .duration(1000) // 1 segundo
          .iterations(1) // solo una vez
          .fromTo('transform', 'translateX(0)', 'translateX(30px)')
          .play();
      });
    });
  }

  async guardarPerfil() {
    if (!this.nombre || !this.apellido) {
      return this.presentAlert('Atención','Rellena nombre y apellido antes de guardar.');
    }
    const perfil: Perfil = {
      nombre: this.nombre,
      apellido: this.apellido,
      nivelEducacion: this.nivelEducacion,
      fechaNacimiento: this.fechaNacimiento.toISOString()
    };
    await this.db.savePerfil(perfil);
    this.presentAlert('OK','Perfil guardado correctamente.');
  }
}
