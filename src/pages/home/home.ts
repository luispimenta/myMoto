import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { Geolocation } from '@ionic-native/geolocation';
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';

// Gambiarra
import { LoginPage } from '../../pages/login/login';

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

// variáveis utilizadas no mapa
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  startPosition: any;
  

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    private toast: ToastController,
    private db: AngularFireDatabase,
    private geolocation: Geolocation,
    public alertCtrl: AlertController
    ){}

    ionViewDidLoad(){
      this.exibeUser();
      this.initializeMapbox();
    }

    initializeMapbox(){
      mapboxgl.accessToken = 'pk.eyJ1IjoibmV0dG9icnVubyIsImEiOiJjanZwdHR0NjgwNWt2NDltcTJldTg4em1jIn0.ZvUn5iXCN1SV3GAhl-Qsng';
      const map = new mapboxgl.Map({
        container: this.mapElement.nativeElement,
        style: 'mapbox://styles/mapbox/dark-v10',
        zoom: 17,
        center: [-48.8769, -23.9793]
      });

        var directions = new MapboxDirections({
          accessToken: mapboxgl.accessToken,
          unit: 'metric',
          profile: 'mapbox/driving-traffic',
          congestion: true,
          controls: {
            inputs: true,
            instructions: false,
            profileSwitcher: false
          },
          placeholderOrigin: 'Onde você está?',
          placeholderDestination: 'Para onde você deseja ir?'
        });
        map.addControl(directions, 'top-left');

        var _this = this;
        directions.on('destination', function(){
          _this.exibeAlert();
        });


      this.geolocation.getCurrentPosition()
        .then((response) => {
          this.startPosition = response.coords;
          map.setCenter = ([this.startPosition.longitude, this.startPosition.latitude]);
          directions.setOrigin([this.startPosition.longitude, this.startPosition.latitude]);

          var marker = new mapboxgl.Marker()
            .setLngLat([this.startPosition.longitude, this.startPosition.latitude])
            .addTo(map);            
        });
    }

    exibeAlert(){
      var teste = 'bunda';
      const alert = this.alertCtrl.create({
        title: 'Localização',
        subTitle: `Sua localização é${teste}`,
        buttons: ['Ok']
      });
      alert.present();
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
        this.navCtrl.setRoot(LoginPage);
      }
    });
  }

  logout(){
    return this.afAuth.auth.signOut().then(() => {
      this.navCtrl.setRoot(LoginPage);
    }).catch((error) => console.log(error));
  }

}
