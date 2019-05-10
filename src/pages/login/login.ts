import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { User } from '../../Models/user';
import { AngularFireAuth } from 'angularfire2/auth';


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  user = {} as User;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    public AlertCtrl: AlertController,
    ) {}

  async login(user: User) {
    try {
      if(user.email !== undefined || user.password !== undefined){
        this.afAuth.auth.signInWithEmailAndPassword(user.email, user.password).then(
          (res: any) => this.navCtrl.setRoot('HomePage')
          ).catch((error: any) =>
          {
            console.log(error);
            let alert = this.AlertCtrl.create({
              title: "Atenção",
              message: "Email ou senha incorreto!",
              buttons: ['OK']
            });
            alert.present();
          });
      }else{
        let alert = this.AlertCtrl.create({
          title: "Atenção",
          message: "Preencha todos os campos!",
          buttons: ['OK']
        });
        alert.present();
      }
    } catch (e) {
      console.error(e);
    }
  }

  register() {
    this.navCtrl.push('RegisterPage');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

}
