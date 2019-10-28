import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController} from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { Geolocation } from '@ionic-native/geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';

// Páginas
import { LoginPage } from '../../pages/login/login';
import { MotoristaPage } from './../motorista/motorista';

declare var google: any;

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  private PATH = 'usuarios';
  uid: string;

  // Fazem referência a elementos do HTML
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('blockDirections') divDirections: ElementRef;
  @ViewChild('inputOrigin') inputOrigin: ElementRef;
  @ViewChild('inputDestination') inputDestino: ElementRef;

  map: any;
  directionsService: any;
  directionsDisplay: any;
  markerOrigin: any;
  distanciaFixed: any;
  startPosition: any;
  getOriginUser: any;
  getDestinationUser: any;
  item: any;
  price: any;
  valorAvaliacaoInput: number;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private geolocation: Geolocation,
    public alertCtrl: AlertController,
    private locationAccuracy: LocationAccuracy
  ) {}

  ionViewDidLoad() {
      // this.gpsState();
      this.getUser();
      this.initializeGoogleMaps();
      this.escondeFazerPedido();
      this.escondeAguardando();
      this.escondeMotoristaAceitou();
      this.escondeCorridaFinalizada();
  }

  gpsState(){
    this.locationAccuracy.canRequest()
      .then((canRequest: boolean) => {
        if(canRequest) {
        // the accuracy option will be ignored by iOS
        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
          .then(() => alert('GPS ativado'),
            error => alert('Erro na ativação do GPS')
          );
        }
      });
  }


  getUser() {
    this.afAuth.authState.subscribe(data => {
      if (data && data.email && data.uid) {
        this.uid = data.uid;

        this.esperarPorAlteracoesNaCorrida();

        let listDB = this.db.database.ref(this.PATH).child(this.uid);
        listDB.on('value', (snapshot) => {
          this.item = snapshot.val();
        });

      }
      else {
        this.navCtrl.setRoot(LoginPage);
      }
    });
  }


  initializeGoogleMaps() {
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer({
      polylineOptions: {
        strokeColor: "#543267",
        strokeWeight: 5
      }
    });

    // Define Itapeva como o centro do mapa
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

    var self = this;
    this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(this.divDirections.nativeElement);

    var autocompleteOrigin = new google.maps.places.Autocomplete(this.inputOrigin.nativeElement);
    autocompleteOrigin.bindTo('bounds', this.map);
    autocompleteOrigin.setFields(['address_components', 'geometry', 'icon', 'name']);
    autocompleteOrigin.addListener('place_changed', function() {
      var place = autocompleteOrigin.getPlace();
      if (!place.geometry) {
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        self.map.fitBounds(place.geometry.viewport);
      }
      else {
        self.map.setCenter(place.geometry.location);
        self.map.setZoom(17);
      }

      self.addDirections();
    });

    var autocompleteDestination = new google.maps.places.Autocomplete(this.inputDestino.nativeElement);
    autocompleteDestination.bindTo('bounds', this.map);
    autocompleteDestination.setFields(['address_components', 'geometry', 'icon', 'name']);
    autocompleteDestination.addListener('place_changed', function() {
      var place = autocompleteDestination.getPlace();
      if (!place.geometry) {
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        self.map.fitBounds(place.geometry.viewport);
      }
      else {
        self.map.setCenter(place.geometry.location);
        self.map.setZoom(17);
      }

      self.addDirections();
    });

    // Adicionando marcador de localização
    this.markerOrigin = new google.maps.Marker({
      map: this.map,
      anchorPoint: new google.maps.Point(0, -29),
      // icon: '../../assets/imgs/default.png'
    });

    this.pegaPosicao();
  }

  pegaPosicao() {
    var self = this;
    this.geolocation.getCurrentPosition({
      timeout: 15000,
      enableHighAccuracy: true,
      maximumAge: 75000
    })
      .then((response) => {
        this.startPosition = response.coords;

        // Pego a lng e lat do usuário
        this.getOriginUser = new Array(this.startPosition.longitude, this.startPosition.latitude);

        // Deixando o centro do mapa na localização do usuário
        this.map.setCenter(new google.maps.LatLng(this.startPosition.latitude,this.startPosition.longitude))

        var geocoder = new google.maps.Geocoder;
        geocoder.geocode({
          'location': {
            lat: this.startPosition.latitude,
            lng: this.startPosition.longitude
          }
        }, function(results, status) {
          if (status === 'OK') {
            if (results[0]) {
              self.inputOrigin.nativeElement.value = results[0].formatted_address;
            }
          }
        });

        this.markerOrigin.setPosition(new google.maps.LatLng(this.startPosition.latitude,this.startPosition.longitude));
      })
      .catch((err) => {
        console.log(err.message);
        console.log("Caiu aqui ooou");
      });
  }

  // É chamada para fazer o traçado entre a Origem e o Destino
  addDirections(){
    var self = this;
    var request = {
      origin: this.inputOrigin.nativeElement.value,
      destination: this.inputDestino.nativeElement.value,
      travelMode: 'DRIVING'
    };

    this.directionsService.route(request, function(result, status) {
      if (status == 'OK') {
        self.directionsDisplay.setDirections(result);
        self.markerOrigin.setVisible(false);

        // No resultado da consulta da rota ao google maps, seta o lat e lng do destino
        self.getDestinationUser = result.routes[0].legs[0].end_location;
        self.getOriginUser = result.routes[0].legs[0].start_location;

        let distancia = result.routes[0].legs[0].distance.value / 1000;
        self.distanciaFixed = distancia.toFixed(2);
        self.price = (self.distanciaFixed * 3) + 4;
        let tempo = result.routes[0].legs[0].duration.value/60;

        self.exibeFazerPedido();
        self.divConfirmaCorrida(distancia, tempo, self.price);
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
        destinoLng: `${this.getDestinationUser.lng()}`,
        destinoLat: `${this.getDestinationUser.lat()}`,
        origemLng: `${this.getOriginUser.lng()}`,
        origemLat: `${this.getOriginUser.lat()}`,
        motorista: '',
        usuario: this.item.name,
        preco: self.price,
        status: ''
      });
  }

  // cancela() é um botão do confirmaCorrida. Chamada quando o usuário não deseja realizar a corrida e quer apagar a rota do mapa para fazer outro pedido
  cancela(){
    this.directionsDisplay.set('directions', null);
    this.inputDestino.nativeElement.value = '';
    this.escondeFazerPedido();
  }

  // cancelarAguardo() é um botão do aguardando. Chamada quando o usuário decide cancelar o pedido durante a espera por um motorista
  cancelarAguardando(){
    this.escondeAguardando();
    let cancelar = this.alertCtrl.create({
      title: 'Corrida cancelada com sucesso',
    });
    cancelar.present();

    this.db.database.ref('/pedidos').child(this.uid).remove();
    this.directionsDisplay.set('directions', null);
    this.inputDestino.nativeElement.value = '';
  }

  // cancelarCorrida() é um botão do motoristaAceitou. Chamada quando o usuário decide cancelar a corrida quando o motorista já aceitou e está a caminho
  cancelarCorrida(){
    const alert = this.alertCtrl.create({
      title: 'Tem certeza que deseja cancelar a corrida?',
      buttons: [
        {
          text: 'Sim',
          role: 'cancel',
          handler: () => {
            this.escondeMotoristaAceitou();

            let cancelar = this.alertCtrl.create({
              title: 'Corrida cancelada com sucesso',
            });
            cancelar.present();

            this.db.database.ref('/pedidos').child(this.uid).remove();
            this.directionsDisplay.set('directions', null);
            this.inputDestino.nativeElement.value = '';
          }
        }, {
          text: 'Não',
          handler: () => {

          }
        }
      ]
    });

    alert.present();

  }

  // confirmar() é um botão do corridaFinalizada. Chamada quando a corrida acaba e o usuário dá uma nota para o motorista
  confirmar(){
    let corrida: any;
    let motorista: any;
    let avaliacao: number;

    let userDB = this.db.database.ref('pedidos').child(this.uid);
    userDB.once('value', (data) => {
      let dados = data.val();
      motorista = dados.motorista;
    });

    let listDB = this.db.database.ref('motoristas').child(motorista);
    listDB.once('value', (data) => {
      let dados = data.val();
      corrida = dados.corridas+1;
      avaliacao = dados.avaliacao + this.valorAvaliacaoInput;
      listDB.update({
        corridas: corrida,
        avaliacao: avaliacao
      });
    });

    this.escondeCorridaFinalizada();
    this.directionsDisplay.set('directions', null);
    this.inputDestino.nativeElement.value = '';
    this.db.database.ref('/pedidos').child(this.uid).remove();

    // A intenção dessa linha é que quando o usuário chegue ao seu destino final, o mapa pegue a sua localização atual
    // Verificar se isso não faz um mapa ser exibido na frente do outro
    this.initializeGoogleMaps();
  }

  // Função que redireciona para a página com mais informações sobre o motorista
  verMais(event, exibeUser){
    this.navCtrl.push(MotoristaPage,{
      item: this.uid
    });
  }

  // Função para que o usuário saia da sua conta
  logout() {
    return this.afAuth.auth.signOut().then(() => {
      this.db.database.ref('/pedidos').child(this.uid).remove();
      this.navCtrl.setRoot(LoginPage);
    }).catch((error) => console.log(error));
  }
}
