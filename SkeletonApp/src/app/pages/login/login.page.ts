import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  usuario: string = '';
  clave: string = '';

  constructor(private router: Router) {}

  iniciosesion() {
    if (
      this.usuario.length >= 3 &&
      this.usuario.length <= 8 &&
      this.clave.length == 4
    ) {
      let navigationExtras: NavigationExtras = {
        state: {
          usuarioEnviado: this.usuario
        }
      }
      // redirigir menu
      this.router.navigate(['/home'], navigationExtras);
    }
  }

  ngOnInit() {}
}
