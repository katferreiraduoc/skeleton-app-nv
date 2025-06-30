import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonInput, AnimationController } from '@ionic/angular';
import { DBTaskService, Perfil } from 'src/app/services/dbtask.service';
import { Geolocation } from '@capacitor/geolocation';

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
  lat: number | null = null;
  lng: number | null = null;
  direccion: string | null = null;

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
      this.lat = p.lat ?? null;
      this.lng = p.lng ?? null;
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
    this.lat = this.lng = null;

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

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const resp = await fetch(url);
    const data = await resp.json();
    return data.display_name;
  }

  async obtenerUbicacion() {
    try {
      const perm = await Geolocation.requestPermissions();
      if (perm.location === 'denied') {
        return this.presentAlert('Error', 'Permiso de ubicación denegado');
      }
      const pos = await Geolocation.getCurrentPosition();
      this.lat = pos.coords.latitude;
      this.lng = pos.coords.longitude;
      this.direccion = 'Obteniendo dirección…';
      this.direccion = await this.reverseGeocode(this.lat, this.lng);

      this.presentAlert(
        'Ubicación',
        `Lat: ${this.lat.toFixed(5)}, Lng: ${this.lng.toFixed(5)}`
      );
    } catch (err) {
      console.error(err);
      this.presentAlert('Error', 'No se pudo obtener la ubicación.');
    }
  }

  async guardarPerfil() {
    if (!this.nombre || !this.apellido) {
      return this.presentAlert(
        'Atención',
        'Rellena nombre y apellido antes de guardar.'
      );
    }
    const perfil: Perfil = {
      nombre: this.nombre,
      apellido: this.apellido,
      nivelEducacion: this.nivelEducacion,
      fechaNacimiento: this.fechaNacimiento.toISOString(),
      lat: this.lat ?? undefined,
      lng: this.lng ?? undefined,
      direccion: this.direccion ?? undefined
    };
    await this.db.savePerfil(perfil);
    this.presentAlert('OK', 'Perfil guardado correctamente.');
  }
}
