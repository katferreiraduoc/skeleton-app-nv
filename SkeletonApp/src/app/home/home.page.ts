import { Component, NgModule, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController, IonInput, AnimationController } from '@ionic/angular';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  @ViewChild('nombreInput', { read: IonInput, static: false }) nombreInput!: IonInput;
  @ViewChild('apellidoInput', { read: IonInput, static: false }) apellidoInput!: IonInput;

  usuario: string = '';
  nombre: string = '';
  apellido: string = '';
  nivelEducacion  = '';
  fechaNacimiento: Date | null = null;

  constructor(private alertController: AlertController,private router: Router, private activedRoute: ActivatedRoute, private animationCtrl: AnimationController) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state ?? history.state;

    this.usuario = state?.usuarioEnviado;
  }

  async presentAlert(msj: string) {
    const alert = await this.alertController.create({
      header: 'Usuario',
      message: msj,
      buttons: ['OK'],
    });

    await alert.present();
  }

  mostrardatos(){
    this.presentAlert("Su nombre es "+this.nombre+" "+this.apellido)
  }

  limpiardatos() {
    this.nombre = '';
    this.apellido = '';
    this.nivelEducacion = '';
    this.fechaNacimiento = null;

    [ this.nombreInput, this.apellidoInput ].forEach(input => {
      const el = input.getInputElement(); 
      el.then(nativeEl => {
        this.animationCtrl
          .create()
          .addElement(nativeEl)
          .duration(1000)       // 1 segundo
          .iterations(1)        // solo una vez
          .fromTo('transform', 'translateX(0)', 'translateX(30px)')
          .play();
      });
    });
  }
}
