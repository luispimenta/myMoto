import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController, ActionSheetController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { Geolocation } from '@ionic-native/geolocation';
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';

// Páginas
import { LoginPage } from '../../pages/login/login';
declare var google;

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  // variáveis usadas no login/cadastro
  private PATH = 'usuarios/';
  uid: string;


  // variáveis utilizadas no mapa
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('divDirections') divDirections: ElementRef;
  @ViewChild('campoOrigem') campoOrigem: ElementRef;
  @ViewChild('campoDestino') campoDestino: ElementRef;
  map: any;
  directionsService: any;
  directionsDisplay: any;
  markerOrigem: any;

  directions: any;
  distanciaFixed: any;
  startPosition: any;
  pegarOrigem: any;
  pegarDestino: any;
  marker: any;
  item: any;

  // exibe informações sobre a resposta do motorista
  respMotorista: any;
  motoristaAceitou: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    private toast: ToastController,
    private db: AngularFireDatabase,
    private geolocation: Geolocation,
    public alertCtrl: AlertController,
    public actionSheetCtrl: ActionSheetController
  ) {}

  ionViewDidLoad() {
    this.exibeUser();
    this.initializeGoogleMaps();
    // this.initializeMapbox();
  }

  initializeGoogleMaps() {
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer();

    let latLng = new google.maps.LatLng(-23.9793, -48.8769);
    let mapOptions = {
      center: latLng,
      mapTypeControl: false,
      zoom: 17,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
    }
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.directionsDisplay.setMap(this.map);

    var _this = this;
    this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(this.divDirections.nativeElement);

    var autocompleteOrigem = new google.maps.places.Autocomplete(this.campoOrigem.nativeElement);
    autocompleteOrigem.bindTo('bounds', this.map);
    autocompleteOrigem.setFields(['address_components', 'geometry', 'icon', 'name']);
    autocompleteOrigem.addListener('place_changed', function() {
      var place = autocompleteOrigem.getPlace();
      if (!place.geometry) {
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        _this.map.fitBounds(place.geometry.viewport);
      } else {
        _this.map.setCenter(place.geometry.location);
        _this.map.setZoom(17);  // Why 17? Because it looks good.
      }
      
      _this.addDirections();
    });
    
    var autocompleteDestino = new google.maps.places.Autocomplete(this.campoDestino.nativeElement);
    autocompleteDestino.bindTo('bounds', this.map);
    autocompleteDestino.setFields(['address_components', 'geometry', 'icon', 'name']);
    autocompleteDestino.addListener('place_changed', function() {
      var place = autocompleteDestino.getPlace();
      if (!place.geometry) {
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        _this.map.fitBounds(place.geometry.viewport);
      } else {
        _this.map.setCenter(place.geometry.location);
        _this.map.setZoom(17);  // Why 17? Because it looks good.
      }

      _this.addDirections();
    });

    // Adicionando marcador de localização
    this.markerOrigem = new google.maps.Marker({
      map: this.map,
      anchorPoint: new google.maps.Point(0, -29)
    });

    this.pegaPosicao();
  }

  pegaPosicao() {
    var _this = this;
    this.geolocation.getCurrentPosition({timeout: 15000, enableHighAccuracy: true, maximumAge: 75000})
      .then((response) => {
        this.startPosition = response.coords;

        // Pego a lng e lat do usuário
        this.pegarOrigem = new Array(this.startPosition.longitude, this.startPosition.latitude);

        // Deixando o centro do mapa na localização do usuário
        this.map.setCenter(new google.maps.LatLng(this.startPosition.latitude,this.startPosition.longitude))

        var geocoder = new google.maps.Geocoder;
        geocoder.geocode({'location': { lat: this.startPosition.latitude, lng: this.startPosition.longitude } }, function(results, status) {
          if (status === 'OK') {
            if (results[0]) {
              _this.campoOrigem.nativeElement.value = results[0].formatted_address;
            }
          }
        });

        this.markerOrigem.setPosition(new google.maps.LatLng(this.startPosition.latitude,this.startPosition.longitude))
      })
      .catch((err) => {
        console.log(err.message);
        console.log("Caiu aqui ooou");
      });
  }

  // chamado para fazer o traçado entre os dois pontos
  addDirections(){
    var _this = this;
    var request = {
      origin: this.campoOrigem.nativeElement.value,
      destination: this.campoDestino.nativeElement.value,
      travelMode: 'DRIVING'
    };
    this.directionsService.route(request, function(result, status) {
      console.log(result, status);
      if (status == 'OK') {
        _this.directionsDisplay.setDirections(result);
        _this.markerOrigem.setVisible(false);

        // no resultado da consulta da rota ao google maps,
        // seta o lat e lng do destino
        _this.pegarDestino = result.routes[0].legs[0].end_location;
        _this.pegarOrigem = result.routes[0].legs[0].start_location;

        let distancia = result.routes[0].legs[0].distance.value / 1000;
        _this.distanciaFixed = distancia.toFixed(2);
        let preco = (_this.distanciaFixed * 3) + 4;

        _this.confirmCorrida(preco);
      }
    });
  }

  confirmCorrida(preco){
    var _this = this;
    let confirm = this.alertCtrl.create({
      title: 'Realizar Corrida?',
      cssClass: 'alertConfirm',
      enableBackdropDismiss: false,
      message: `Preço: R$${preco.toFixed(2)} <hr>Distância: ${this.distanciaFixed}km`,
      buttons: [{
          text: 'Confirmar',
          cssClass: 'btnConfirm',
          handler: () => {
            this.db.database.ref('/pedidos').child(this.uid)
              .set({
                destinoLng: `${this.pegarDestino.lng()}`,
                destinoLat: `${this.pegarDestino.lat()}`,
                origemLng: `${this.pegarOrigem.lng()}`,
                origemLat: `${this.pegarOrigem.lat()}`,
                motorista: '',
                usuario: this.item.name,
                preco: preco,
                status: ''
              });
          }
        },
        {
          text: 'Cancelar',
          cssClass: 'btnCancel',
          handler: () => {
            _this.campoDestino.nativeElement.value = '';
            // confirm.dismiss();
          }
        }
      ]
    });
    confirm.present();
  }

  esperarPorAlteracoesNaCorrida() {
    let pegarMotorista = this.db.database.ref('/pedidos').child(this.uid);
    var _this = this;
    pegarMotorista.on('value', (data) => {
      let value = data.val();
      if (value !== null) {
        // se tiver algum valor neste registro no banco de dados

        // e se nesse caso estiver sem motorista:
        if (value.motorista == "") {
          if(_this.motoristaAceitou && _this.motoristaAceitou.dismiss)
            _this.motoristaAceitou.dismiss();

          _this.respMotorista = this.actionSheetCtrl.create({
            title: 'Só um minuto, aguardando resposta do motorista...',
            enableBackdropDismiss: false,
            buttons: [{
              text: 'Cancelar pedido',
              role: 'destructive',
              icon: 'trash',
              handler: () => {
                let cancelar = _this.alertCtrl.create({
                  title: 'Corrida cancelada com sucesso',
                  cssClass: 'teste'
                });
                cancelar.present();
                _this.db.database.ref('/pedidos').child(_this.uid).remove();
                _this.campoDestino.nativeElement.value = '';
              }
            }]
          });
          _this.respMotorista.present();
        }

        // caso o motorista tenha aceitado ou esteja preenchido
        else {
          if(this.respMotorista && this.respMotorista.dismiss)
          this.respMotorista.dismiss();

          console.log(value.status);
          if (value.status == "finalizado") {
            let toast = this.toast.create({
              message: 'Corrida finalizada',
              duration: 3000
            });
            toast.present();
            if(_this.motoristaAceitou && _this.motoristaAceitou.dismiss)
              _this.motoristaAceitou.dismiss();
            // apaga a rota
            _this.directionsDisplay.set('directions', null);
            _this.campoDestino.nativeElement.value = '';


          } else {
            let dadosMotorista = this.db.database.ref('motoristas').child(value.motorista);
            dadosMotorista.once('value', (data) => {
              let motorista = data.val();

              _this.motoristaAceitou = _this.actionSheetCtrl.create({
                title: `O motorista ${motorista.nome} está a caminho, aguarde...Cor da Moto: ${motorista.cor}, Placa: ${motorista.placa}`,
                enableBackdropDismiss: false,
                buttons: [{
                  text: 'Cancelar corrida',
                  role: 'destructive',
                  icon: 'trash',
                  handler: () => {
                    //this.motoristaAceitou.dismiss();
                    let cancelar = _this.alertCtrl.create({
                      title: 'Corrida cancelada com sucesso',
                    });
                    cancelar.present();
                    _this.db.database.ref('/pedidos').child(this.uid).remove();
                  }
                }]
              });
              _this.motoristaAceitou.present();
            });
          }
        }
      }
    
    })
  }

  exibeUser() {
    this.afAuth.authState.subscribe(data => {
      if (data && data.email && data.uid) {
        this.uid = data.uid;

        this.esperarPorAlteracoesNaCorrida();

        let listDB = this.db.database.ref(this.PATH).child(this.uid);
        listDB.on('value', (snapshot) => {
          this.item = snapshot.val();
          this.toast.create({
            message: `Seja bem-vindo ` + this.item.name,
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
