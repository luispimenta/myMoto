import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MotoristaPage } from './motorista';

@NgModule({
  declarations: [
    MotoristaPage,
  ],
  imports: [
    IonicPageModule.forChild(MotoristaPage),
  ],
})
export class MotoristaPageModule {}
