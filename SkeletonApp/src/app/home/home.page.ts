import { Component, NgModule } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  usuario: string = '';
  nombre: string = '';
  apellido: string = '';
  fechaNacimiento!: Date;

  constructor(private alertController: AlertController,private router: Router, private activedRoute: ActivatedRoute) {
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
}
