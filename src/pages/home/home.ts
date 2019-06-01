import { Component, ElementRef,ViewChild } from '@angular/core';
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
  private PATH = 'usuarios/';
  uid: string;

  // variáveis utilizadas no mapa
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  directions: any;
  startPosition: any;
  pegarOrigem: any;
  marker: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    private toast: ToastController,
    private db: AngularFireDatabase,
    private geolocation: Geolocation,
    public alertCtrl: AlertController
  ) {}

  ionViewDidLoad() {
    this.exibeUser();
    this.initializeMapbox();
  }


  initializeMapbox() {
    mapboxgl.accessToken = 'pk.eyJ1IjoibmV0dG9icnVubyIsImEiOiJjanZwdHR0NjgwNWt2NDltcTJldTg4em1jIn0.ZvUn5iXCN1SV3GAhl-Qsng';
    this.map = new mapboxgl.Map({
      container: this.mapElement.nativeElement,
      style: 'mapbox://styles/mapbox/dark-v10',
      zoom: 17,
      center: [-48.8769, -23.9793]
    });

    this.directions = new MapboxDirections({
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
    this.map.addControl(this.directions, 'top-left');
    
    this.directions.on('destination', function (val1) {
      let pegarDestino = new Array(val1.feature.geometry.coordinates[0], val1.feature.geometry.coordinates[1]);
      console.log(pegarDestino);
    });


    this.geolocation.getCurrentPosition()
      .then((response) => {
        this.startPosition = response.coords;

        // Pego a lng e lat do usuário
        this.pegarOrigem = new Array(this.startPosition.longitude, this.startPosition.latitude);

        // Deixando o centro do mapa na localização do usuário
        this.map.setCenter = ([this.startPosition.longitude, this.startPosition.latitude]);

        // Dizendo ao directions que é aqui o ponto inicial
        this.directions.setOrigin([this.startPosition.longitude, this.startPosition.latitude]);

        // Adicionando marcador de localização
        this.marker = new mapboxgl.Marker()
          .setLngLat([this.startPosition.longitude, this.startPosition.latitude])
          .addTo(this.map);
      });
  }


  exibeUser() {
    this.afAuth.authState.subscribe(data => {
      if (data && data.email && data.uid) {
        this.uid = data.uid;

        let listDB = this.db.database.ref(this.PATH).child(this.uid);
        listDB.on('value', (snapshot) => {
          const items = snapshot.val();
          this.toast.create({
            message: `Boas vindas ` + items.name,
            duration: 3000
          }).present();
        })

      } else {
        this.navCtrl.setRoot(LoginPage);
      }
    });
  }

  logout() {
    return this.afAuth.auth.signOut().then(() => {
      this.navCtrl.setRoot(LoginPage);
    }).catch((error) => console.log(error));
  }

}
