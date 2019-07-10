import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { User } from '../../Models/user';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { HomePage } from './../home/home';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  user = {} as User;
  PATH = '/usuarios';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    public AlertCtrl: AlertController,
    private db: AngularFireDatabase
    ) {}

  async login(user: User) {
    try {
      if(user.email !== undefined || user.password !== undefined){
        this.afAuth.auth.signInWithEmailAndPassword(user.email.toLowerCase(), user.password).then((res: any) => {
          let uid = res.user.uid;
          
          let listDB = this.db.database.ref(this.PATH).child(uid);
          listDB.on('value', (snapshot) => {
            const items = snapshot.val();
                if(items == null){
                  let alert = this.AlertCtrl.create({
                    title: "Atenção",
                    message: "Esse E-mail nao esta cadastrado como usuario",
                    buttons: ['OK']
                  });
                  alert.present();
                }else{
                  this.navCtrl.setRoot(HomePage);
                }
              });
                }).catch((error: any) =>
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
