import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonInput, AnimationController } from '@ionic/angular';
import { DBTaskService, Perfil } from 'src/app/services/dbtask.service';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-mis-datos',
  templateUrl: './mis-datos.component.html',
  styleUrls: ['./mis-datos.component.scss'],
  standalone: false
})
export class MisDatosComponent implements OnInit {
  @ViewChild('nombreInput', { read: IonInput, static: false })
  nombreInput!: IonInput;
  @ViewChild('apellidoInput', { read: IonInput, static: false })
  apellidoInput!: IonInput;

  usuario = '';
  nombre = '';
  apellido = '';
  nivelEducacion = '';
  fechaNacimiento: Date | null = null;
  lat: number | null = null;
  lng: number | null = null;
  direccion: string | null = null;

  segmentValue: 'mis-datos' | 'experiencia' | 'certificaciones' = 'mis-datos';

  constructor(
    private db: DBTaskService,
    private alertController: AlertController,
    private router: Router,
    private activedRoute: ActivatedRoute,
    private animationCtrl: AnimationController
  ) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state ?? history.state;
    this.usuario = state?.usuarioEnviado ?? '';
  }

  async ngOnInit() {
    await this.db.initDB();
    const p = await this.db.getPerfil();
    if (p) {
      this.nombre = p.nombre;
      this.apellido = p.apellido;
      this.nivelEducacion = p.nivelEducacion;
      this.fechaNacimiento = new Date(p.fechaNacimiento);
      this.lat = (p as any).lat ?? null;
      this.lng = (p as any).lng ?? null;
      this.direccion = (p as any).direccion ?? null;
    }
  }

  private async presentAlert(header: string, msj: string) {
    const alert = await this.alertController.create({
      header,
      message: msj,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async mostrardatos(): Promise<void> {
    if (!this.nombre || !this.apellido) {
      await this.presentAlert(
        'Atención',
        'Debe completar los datos para poder mostrarlos.'
      );
    } else {
      await this.presentAlert(
        'Usuario',
        `Su nombre es ${this.nombre} ${this.apellido}`
      );
    }
  }

  limpiardatos() {
    this.nombre = '';
    this.apellido = '';
    this.nivelEducacion = '';
    this.fechaNacimiento = null;
    this.lat = this.lng = null;
    this.direccion = null;

    [this.nombreInput, this.apellidoInput].forEach((input) => {
      input.getInputElement().then((el) => {
        this.animationCtrl
          .create()
          .addElement(el)
          .duration(1000)
          .iterations(1)
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
        await this.presentAlert('Error', 'Permiso de ubicación denegado');
        return;
      }
      const pos = await Geolocation.getCurrentPosition();
      this.lat = pos.coords.latitude;
      this.lng = pos.coords.longitude;
      this.direccion = await this.reverseGeocode(this.lat, this.lng);
      await this.presentAlert('Ubicación', this.direccion);
    } catch {
      await this.presentAlert('Error', 'No se pudo obtener la ubicación.');
    }
  }

  async guardarPerfil() {
    if (!this.nombre || !this.apellido) {
      await this.presentAlert(
        'Atención',
        'Rellena nombre y apellido antes de guardar.'
      );
      return;
    }
    const perfil: Perfil = {
      nombre: this.nombre,
      apellido: this.apellido,
      nivelEducacion: this.nivelEducacion,
      fechaNacimiento: this.fechaNacimiento!.toISOString(),
      lat: this.lat ?? undefined,
      lng: this.lng ?? undefined,
      direccion: this.direccion ?? undefined,
    };
    await this.db.savePerfil(perfil);
    await this.presentAlert('OK', 'Perfil guardado correctamente.');
  }
}
