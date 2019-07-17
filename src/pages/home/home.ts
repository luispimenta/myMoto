import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController, ActionSheetController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { Geolocation } from '@ionic-native/geolocation';

// Páginas
import { LoginPage } from '../../pages/login/login';
import { PerfilPage } from './../perfil/perfil';

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
  distanciaFixed: any;
  startPosition: any;
  pegarOrigem: any;
  pegarDestino: any;
  item: any;
  preco: any;
  valorAvaliacaoInput;

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
    this.escondeFazerPedido();
    this.escondeAguardando();
    this.escondeMotoristaAceitou();
    this.escondeCorridaFinalizada();
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

  initializeGoogleMaps() {
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer();

    let latLng = new google.maps.LatLng(-23.9793, -48.8769);
    let mapOptions = {
      center: latLng,
      mapTypeControl: false,
      zoom: 17,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      styles: [
        {
          // todo esse Json é de estilização do mapa
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#ebe3cd"
            }
          ]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#523735"
            }
          ]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#f5f1e6"
            }
          ]
        },
        {
          "featureType": "administrative",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#c9b2a6"
            }
          ]
        },
        {
          "featureType": "administrative.land_parcel",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#dcd2be"
            }
          ]
        },
        {
          "featureType": "administrative.land_parcel",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#ae9e90"
            }
          ]
        },
        {
          "featureType": "landscape.natural",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#dfd2ae"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#dfd2ae"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#93817c"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#a5b076"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#447530"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#f5f1e6"
            }
          ]
        },
        {
          "featureType": "road.arterial",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#fdfcf8"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#f8c967"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#e9bc62"
            }
          ]
        },
        {
          "featureType": "road.highway.controlled_access",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#e98d58"
            }
          ]
        },
        {
          "featureType": "road.highway.controlled_access",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#db8555"
            }
          ]
        },
        {
          "featureType": "road.local",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#806b63"
            }
          ]
        },
        {
          "featureType": "transit.line",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#dfd2ae"
            }
          ]
        },
        {
          "featureType": "transit.line",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#8f7d77"
            }
          ]
        },
        {
          "featureType": "transit.line",
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#ebe3cd"
            }
          ]
        },
        {
          "featureType": "transit.station",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#dfd2ae"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#b9d3c2"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#92998d"
            }
          ]
        }
      ],
    }
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.directionsDisplay.setMap(this.map);

    var self = this;
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
        self.map.fitBounds(place.geometry.viewport);
      } else {
        self.map.setCenter(place.geometry.location);
        self.map.setZoom(17);
      }
      
      self.addDirections();
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
        self.map.fitBounds(place.geometry.viewport);
      } else {
        self.map.setCenter(place.geometry.location);
        self.map.setZoom(17);
      }

      self.addDirections();
    });

    // Adicionando marcador de localização
    this.markerOrigem = new google.maps.Marker({
      map: this.map,
      anchorPoint: new google.maps.Point(0, -29)
    });

    this.pegaPosicao();
  }

  pegaPosicao() {
    var self = this;
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
              self.campoOrigem.nativeElement.value = results[0].formatted_address;
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
    var self = this;
    var request = {
      origin: this.campoOrigem.nativeElement.value,
      destination: this.campoDestino.nativeElement.value,
      travelMode: 'DRIVING'
    };
    this.directionsService.route(request, function(result, status) {
      if (status == 'OK') {
        self.directionsDisplay.setDirections(result);
        self.markerOrigem.setVisible(false);

        // no resultado da consulta da rota ao google maps,
        // seta o lat e lng do destino
        self.pegarDestino = result.routes[0].legs[0].end_location;
        self.pegarOrigem = result.routes[0].legs[0].start_location;

        let distancia = result.routes[0].legs[0].distance.value / 1000;
        self.distanciaFixed = distancia.toFixed(2);
        self.preco = (self.distanciaFixed * 3) + 4;
        let tempo = result.routes[0].legs[0].duration.value/60;

        self.exibeFazerPedido();
        self.divConfirmaCorrida(distancia, tempo, self.preco);
      }
    });
  }

  esperarPorAlteracoesNaCorrida() {
    let pegarMotorista = this.db.database.ref('/pedidos').child(this.uid);
    pegarMotorista.on('value', (data) => {
      let value = data.val();
      if (value !== null) {
        // se tiver algum valor neste registro no banco de dados

        // e se nesse caso estiver sem motorista:
        if (value.motorista == "") {
            this.escondeFazerPedido();
            this.escondeMotoristaAceitou();
            this.exibeAguardando();
        }

        // caso o motorista tenha aceitado ou esteja preenchido
        else {
          if (value.status == "finalizado") {
            this.escondeMotoristaAceitou();
            this.exibeCorridaFinalizada();
          } 
          else {
            let dadosMotorista = this.db.database.ref('motoristas').child(value.motorista);
            dadosMotorista.once('value', (data) => {
              let motorista = data.val();

              this.divMotoristaAceitou(motorista);
              this.escondeAguardando();
              this.exibeMotoristaAceitou();
            });
          }
        }
      }
    });
  }

  // Funções que escondem exibição de divs
  escondeFazerPedido(){
    document.getElementById('fazerPedido').style.display = "none";
  }
  escondeAguardando(){
    document.getElementById('aguardando').style.display = "none";
  }
  escondeMotoristaAceitou(){
    document.getElementById('motoristaAceitou').style.display = "none";
  }
  escondeCorridaFinalizada(){
    document.getElementById('corridaFinalizada').style.display = "none";
  }


  // Funções que exibem as divs
  exibeFazerPedido(){
    document.getElementById('fazerPedido').style.display = "block";
  }
  exibeAguardando(){
    document.getElementById('aguardando').style.display = "block";
  }
  exibeMotoristaAceitou(){
    document.getElementById('motoristaAceitou').style.display = "block";
  }
  exibeCorridaFinalizada(){
    document.getElementById('corridaFinalizada').style.display = "block";
  }

  // Alterando valor de elementos dentro de divs
  divConfirmaCorrida(distancia, tempo, preco){
    document.getElementById('distancia').innerText = `Distância: ${distancia.toFixed(2)} Km`;
    document.getElementById('tempo').innerText = `Tempo: ${tempo.toFixed(0)} minutos`;
    document.getElementById('preco').innerText = `Valor: R$${preco.toFixed(2)}`;
  }

  divMotoristaAceitou(motorista){ 
    document.getElementById('nomeMotorista').innerText = `Nome: ${motorista.nome}`;
    document.getElementById('corMoto').innerText = `Cor da Moto: ${motorista.cor}`;
    document.getElementById('placaMoto').innerText = `Placa da Moto: ${motorista.placa}`;
  }

  // Botões
  // envia() é um botão do confirmaCorrida. Chamada quando o usuário deseja realizar a corrida e manda os seus dados para o firebase
  envia(){
    let self = this;
    this.db.database.ref('/pedidos').child(this.uid)
      .set({
        destinoLng: `${this.pegarDestino.lng()}`,
        destinoLat: `${this.pegarDestino.lat()}`,
        origemLng: `${this.pegarOrigem.lng()}`,
        origemLat: `${this.pegarOrigem.lat()}`,
        motorista: '',
        usuario: this.item.name,
        preco: self.preco,
        status: ''
      });
  }

  // cancela() é um botão do confirmaCorrida. Chamada quando o usuário não deseja realizar a corrida e quer apagar a rota do mapa para fazer outro pedido
  cancela(){
    this.directionsDisplay.set('directions', null);
    this.campoDestino.nativeElement.value = '';
    this.escondeFazerPedido();
  }

  // cancelarAguardo() é um botão do aguardando. Chamada quando o usuário decide cancelar o pedido durante a espera por um motorista
  cancelarAguardando(){
    this.escondeAguardando();
    let cancelar = this.alertCtrl.create({
      title: 'Corrida cancelada com sucesso',
      cssClass: 'teste'
    });
    cancelar.present();
    
    this.db.database.ref('/pedidos').child(this.uid).remove();
    this.directionsDisplay.set('directions', null);
    this.campoDestino.nativeElement.value = '';
  }

  // cancelarCorrida() é um botão do motoristaAceitou. Chamada quando o usuário decide cancelar a corrida quando o motorista já aceitou e está a caminho
  cancelarCorrida(){
    this.escondeMotoristaAceitou();

    let cancelar = this.alertCtrl.create({
      title: 'Corrida cancelada com sucesso',
    });
    cancelar.present();

    this.db.database.ref('/pedidos').child(this.uid).remove();
    this.directionsDisplay.set('directions', null);
    this.campoDestino.nativeElement.value = '';
  }

  // confirmar() é um botão do corridaFinalizada. Chamada quando a corrida acaba e o usuário dá uma nota para o motorista
  confirmar(){
    let corrida;
    let motorista;
    let avaliacao;

    let userDB = this.db.database.ref('pedidos').child(this.uid);
    userDB.once('value', (data) => {
      let dados = data.val();
      motorista = dados.motorista;
    });

    let listDB = this.db.database.ref('motoristas').child(motorista);
    listDB.once('value', (data) => {
      let dados = data.val();
      corrida = dados.corridas+1;
      dados.avaliacao = this.valorAvaliacaoInput;
      avaliacao = dados.avaliacao;
      listDB.update({
        corridas: corrida,
        avaliacao: avaliacao
      });
    });

    this.escondeCorridaFinalizada();
    this.directionsDisplay.set('directions', null);
    this.campoDestino.nativeElement.value = '';
    this.db.database.ref('/pedidos').child(this.uid).remove();
  }

  // Função que redireciona para a página de perfil
  perfil(){
    this.navCtrl.push(PerfilPage);
  }
  // Função para que o usuário saia da sua conta
  logout() {
    return this.afAuth.auth.signOut().then(() => {
      this.navCtrl.setRoot(LoginPage);
    }).catch((error) => console.log(error));
  }
}
