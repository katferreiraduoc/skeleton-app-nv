import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule     } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { HomePageRoutingModule } from './home-routing.module';

import { MisDatosComponent }            from '../components/mis-datos/mis-datos.component';
import { ExperienciaLaboralComponent }  from '../components/experiencia-laboral/experiencia-laboral.component';
import { CertificacionesComponent }     from '../components/certificaciones/certificaciones.component';
import { PreferenciasComponent } from '../components/preferencias/preferencias.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  declarations: [HomePage, MisDatosComponent, ExperienciaLaboralComponent, CertificacionesComponent, PreferenciasComponent]
})
export class HomePageModule {}
