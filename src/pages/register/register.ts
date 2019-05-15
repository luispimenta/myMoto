import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController} from 'ionic-angular';
import { User } from '../../Models/user';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {

  private PATH = 'usuarios/';


  id: any;

  //variaveis do registro

  confirm_pass: string;
  nome: string;

  user = {} as User;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private toast: ToastController,
    private afAuth: AngularFireAuth,
    public alertCtrl: AlertController,
    private db: AngularFireDatabase) {
  }
  
  async register(user: User) {
    if(user.email == undefined || user.password == undefined || this.confirm_pass == undefined || this.nome == undefined){
      this.toast.create({
        message: 'Preencha todos os campos',
        duration: 3000
      }).present();
    }else{
      if(user.password == this.confirm_pass){
        try {
          this.afAuth.auth.createUserWithEmailAndPassword(user.email, user.password)
          .then((res: any) =>{

            this.setId(res.user.uid);

            this.db.database.ref(this.PATH).child(this.getId())
          .push({ 
			  	name: this.nome,
                }).then(
            (error) => {
              console.log(error)
            });

            this.toast.create({
              message: 'Cadastro finalizado!',
              duration: 4000
            }).present();

            this.Login();

          }).catch((error: any) =>{

            if(user.password.length < 6){
              this.toast.create({
                message: 'Senha precisa ter mais de 6 caracteres',
                duration: 3000
              }).present();
            }
            else{
              this.toast.create({
                message: 'E-mail ja cadastrado',
                duration: 3000
              }).present();
            }
          })
          
        } catch (e) {
          console.error(e);
        }
      }
      else{
        this.toast.create({
          message: 'Senha não confere com a confirmação',
          duration: 3000
        }).present();
      }
    }
  }


  setId(id: string):void{
    this.id = id;
  }
  getId():string{
    return this.id;
  }

  Login(){
    this.navCtrl.pop();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterPage');
  }

}