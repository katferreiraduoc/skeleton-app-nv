import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { DBTaskService } from '../../services/dbtask.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  usuario: string = '';
  clave: string = '';

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private db: DBTaskService,
    private router: Router
  ) {}

  async iniciosesion() {
    if (
      this.usuario.length >= 3 &&
      this.usuario.length <= 8 &&
      this.clave.length == 4
    ) {
      await this.db.initDB();

      const userOK = await this.db.validateUser(this.usuario, this.clave);

      if (userOK) {
        await this.db.registerSession(this.usuario, this.clave);
        this.presentToast('bottom', 'Login Exitoso');
        let navigationExtras: NavigationExtras = {
          state: {
            usuarioEnviado: this.usuario,
          },
        };
        this.router.navigate(['/home'], navigationExtras);
      } else {
        this.presentAlert('Usuario y/o Contraseña Incorrecta');
      }
    } else {
      this.presentAlert('Usuario y/o Contraseña Incorrecta');
    }
  }

  async presentToast(position: 'bottom', msj: string) {
    const toast = await this.toastController.create({
      message: msj,
      duration: 2000,
      position: position,
    });

    await toast.present();
  }

  async presentAlert(msj: string) {
    const alert = await this.alertController.create({
      header: 'Login Incorrecto',
      message: msj,
      buttons: ['OK'],
    });

    await alert.present();
  }

  ngOnInit() {}
}
