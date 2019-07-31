import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

// Páginas
import { RegisterPage } from './../register/register';
import { LoginPage } from './../login/login';

@IonicPage()
@Component({
  selector: 'page-initialize',
  templateUrl: 'initialize.html',
})
export class InitializePage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams
    ) {}

  login(){
    this.navCtrl.setRoot(LoginPage);
  }

  register() {
    this.navCtrl.setRoot(RegisterPage);
  }

}
