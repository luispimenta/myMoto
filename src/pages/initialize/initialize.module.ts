import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InitializePage } from './initialize';

@NgModule({
  declarations: [
    InitializePage,
  ],
  imports: [
    IonicPageModule.forChild(InitializePage),
  ],
})
export class InitializePageModule {}
