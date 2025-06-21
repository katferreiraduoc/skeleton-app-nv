import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonInput, AnimationController } from '@ionic/angular';

@Component({
  selector: 'app-mis-datos',
  templateUrl: './mis-datos.component.html',
  styleUrls: ['./mis-datos.component.scss'],
  standalone: false
})
export class MisDatosComponent  implements OnInit {

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

  segmentValue: 'mis-datos' | 'experiencia' | 'certificaciones' = 'mis-datos';

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

  ngOnInit() {}

}
