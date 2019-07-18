import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';

@IonicPage()
@Component({
  selector: 'page-motorista',
  templateUrl: 'motorista.html',
})
export class MotoristaPage {

  // variáveis
  uid: String;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    ) {}

    ionViewDidLoad() {}

    infoMotorista(motorista){}
}
