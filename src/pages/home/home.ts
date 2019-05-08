import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { Geolocation } from '@ionic-native/geolocation';

declare var google;


@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

// variáveis usadas no login/cadastro
  nome: string;
  private PATH = 'usuarios';
  uid: string;

// variável utilizada no mapa
  map: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    private toast: ToastController,
    private db: AngularFireDatabase,
    private geolocation: Geolocation
    ){}

  ionViewDidLoad() {
    this.exibeUser();
    this.geolocation.getCurrentPosition()
      .then((res) => {
        const position = new google.maps.LatLng(res.coords.latitude, res.coords.longitude);

        const mapOpcoes = {
          zoom: 16,
          center: position,
          disableDefaultUI: true
        }

        this.map = new google.maps.Map(document.getElementById('map'), mapOpcoes);

        const marker = new google.maps.Marker({
          position: position,
          map: this.map
        });

      }) .catch((err) => {
        console.log("Puts parça, não conseguimos pegar a sua localização", err);
      });

  }

  exibeUser(){
    this.afAuth.authState.subscribe(data => {
      if (data && data.email && data.uid) {
        this.uid = data.uid;

        let listDB = this.db.database.ref('/tasks').child(this.uid);
        listDB.on('value', (snapshot) => {
          const items = snapshot.val();
          console.log(items);
        })

        this.toast.create({
          message: `Boas vindas ${data.email}`,
          duration: 3000
        }).present();
      } else {
        this.toast.create({
          message: 'Não foi possível autenticar.',
          duration: 3000
        }).present();
      }
    });
  }

}
