import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DBTaskService } from '../services/dbtask.service';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  usuario: string = '';

  constructor(private dbTask: DBTaskService, private router: Router, private activedRoute: ActivatedRoute) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state ?? history.state;

    this.usuario = state?.usuarioEnviado;
  }

  async logout(){
    await this.dbTask.updateSession(this.usuario, 0);
    this.router.navigate(['/login']);
  }

  segmentValue: 'mis-datos' | 'experiencia' | 'certificaciones' | 'preferencias' = 'mis-datos';

  
}
