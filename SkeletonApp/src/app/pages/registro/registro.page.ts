import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { DBTaskService } from 'src/app/services/dbtask.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false,
})
export class RegistroPage implements OnInit {
  user = '';
  pass!: string;

  constructor(
    private dbTask: DBTaskService,
    private router: Router,
    private alertController: AlertController
  ) {}

  async onRegistro() {
    if (!this.user || !this.pass) {
      const alert = await this.alertController.create({
        header: 'Atención!',
        message: `Usuario y contraseña obligatorios.`,
        buttons: ['OK'],
      });
      await alert.present();
    } else {
      await this.dbTask.initDB();

      await this.dbTask.registerSession(this.user, this.pass);

      const alert = await this.alertController.create({
        header: '¡Bienvenido!',
        message: `Cuenta creada para ${this.user}`,
        buttons: ['OK'],
      });
      await alert.present();

      this.router.navigate(['/home'], {
        state: { usuarioEnviado: this.user },
      });
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  ngOnInit() {}
}
