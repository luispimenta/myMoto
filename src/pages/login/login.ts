import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController } from 'ionic-angular';
import { User } from '../../Models/user';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { HomePage } from './../home/home';
import { RegisterPage } from './../register/register';

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
    private db: AngularFireDatabase,
    private toast: ToastController,
    public loadingController: LoadingController
    ) {}

  async login(user: User) {
    try {
      if(user.email !== undefined || user.password !== undefined){
        const loading = await this.loadingController.create({
          cssClass: 'loading'
        });
        loading.present();
        this.afAuth.auth.signInWithEmailAndPassword(user.email.toLowerCase(), user.password)
          .then((res: any) => {
            let uid = res.user.uid;

            let listDB = this.db.database.ref(this.PATH).child(uid);
            listDB.on('value', (snapshot) => {
              const items = snapshot.val();
                  if(items == null){
                    let alert = this.AlertCtrl.create({
                      title: "Atenção",
                      message: "Esse E-mail não está cadastrado",
                      buttons: ['OK']
                    });
                    loading.dismiss();
                    alert.present();
                  }
                  else {
                    loading.dismiss();
                    this.navCtrl.setRoot(HomePage);
                  }
                });
          }).catch((error: any) => {
            console.log(error);
            let alert = this.AlertCtrl.create({
              title: "Atenção",
              message: "Email ou senha inválido!",
              buttons: ['OK']
            });
            loading.dismiss();
            alert.present();
          });
      }
      else {
        let alert = this.AlertCtrl.create({
          title: "Atenção",
          message: "Preencha todos os campos!",
          buttons: ['OK']
        });
        // loading.dismiss();
        alert.present();
      }
    } catch (e) {
      console.error(e);
    }
  }

  esqueceuSenha(){
    let alert  = this.AlertCtrl.create({
      title: 'Redefinir senha',
      inputs: [
        {
          name: 'email',
          placeholder: 'Digite o E-mail'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: "confirmar",
          handler: data => {
            if(data.email == ""){
              this.toast.create({
                message: 'Nenhum e-mail informado',
                duration: 3000
              }).present();
            }
            else {
              let email = data.email;
              this.afAuth.auth.sendPasswordResetEmail(email)
                .then((data) =>{
                  this.toast.create({
                    message: 'Enviamos um E-mail para '+email+', clique no link do E-mail para redefinir sua senha',
                    showCloseButton: true
                  }).present();
              })
            }
          }
        }
      ]
    });
    alert.present();
  }

  register() {
    this.navCtrl.setRoot(RegisterPage);
  }
}
