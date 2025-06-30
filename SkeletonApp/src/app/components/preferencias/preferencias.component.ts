import { Component, OnInit } from '@angular/core';
import { Category, ApiService } from 'src/app/services/api.service';
import { DBTaskService } from 'src/app/services/dbtask.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-preferencias',
  templateUrl: './preferencias.component.html',
  styleUrls: ['./preferencias.component.scss'],
  standalone: false,
})
export class PreferenciasComponent implements OnInit {
  platos: Category[] = [];
  platoFav: string[] = [];
  loading = true;

  constructor(
    private api: ApiService,
    private db: DBTaskService,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    this.api.getCategories().subscribe({
      next: data => {
        this.platos = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
    this.platoFav = await this.db.getPlatosFav();
  }

  toggle(plato: string) {
    const i = this.platoFav.indexOf(plato);
    i > -1 ? this.platoFav.splice(i,1) : this.platoFav.push(plato);
  }

  isSelected(plato: string) {
    return this.platoFav.includes(plato);
  }

  async savePlatoFav() {
    if (this.platoFav.length === 0) {
      const alert = await this.alertCtrl.create({
        header: 'Atención',
        message: 'Selecciona al menos un plato.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    await this.db.savePlatoFav(this.platoFav);
    const alert = await this.alertCtrl.create({
      header: '¡Listo!',
      message: 'Tu(s) plato(s) se guardó correctamente.',
      buttons: ['OK']
    });
    await alert.present();
  }
}
