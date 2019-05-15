import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { Geolocation } from '@ionic-native/geolocation';

import { LoginPage } from './../login/login';

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
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  startPosition: any;
  originPosition: string;
  destinationPosition: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    private toast: ToastController,
    private db: AngularFireDatabase,
    private geolocation: Geolocation,
    ){}

    ionViewDidLoad(){
      this.exibeUser();
      this.initializeMap();
    }

    initializeMap(){
      this.geolocation.getCurrentPosition()
      .then((res) => {
        this.startPosition = new google.maps.LatLng(res.coords.latitude, res.coords.longitude);

        const mapOptions = {
          zoom: 18,
          center: this.startPosition,
          disableDefaultUI: true
        }

        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
        this.directionsDisplay.setMap(this.map);

      }).catch((err) => {
        console.log('Vish mano, deu ruim', err);
      });
    }

    calculateRoute(){
      if(this.destinationPosition && this.startPosition){
        const request = {
          origin: this.startPosition,
          destination: this.destinationPosition,
          travelMode: 'DRIVING'
        };
        this.traceRoute(this.directionsService, this.directionsDisplay, request);
      }
    }

    traceRoute(service: any, display: any, request: any){
      service.route(request, function(result, status){
        if(status == 'OK'){
          display.setDirections(result);
        }
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
