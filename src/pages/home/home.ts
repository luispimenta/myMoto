import { Component, ElementRef,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController, ActionSheetController } from 'ionic-angular';
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
  distanciaFixed: any;
  // variáveis utilizadas no mapa
  @ViewChild('map') mapElement: ElementRef; 
  map: any;
  directions: any;
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
    this.initializeMapbox();
  }

  initializeMapbox() {
    let aux = 0;

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
      interactive: false,
      controls: {
        inputs: true,
        instructions: false,
        profileSwitcher: false
      },
      placeholderOrigin: 'Onde você está?',
      placeholderDestination: 'Para onde você deseja ir?'
    });
    this.map.addControl(this.directions, 'top-left');
    
    this.directions.on('route', (data) => {
      if(aux == 0){
        let distancia = data.route[0].distance/1000;
        this.distanciaFixed = distancia.toFixed(2);
        let preco = (this.distanciaFixed*3)+4;
        this.pegarDestino = this.directions.getDestination().geometry.coordinates;

        aux ++;

        let confirm = this.alertCtrl.create({
          title: 'Realizar Corrida?',
          cssClass: 'alertConfirm',
          enableBackdropDismiss: false,
          message: `Preço: R$${preco.toFixed(2)} <hr>Distância: ${this.distanciaFixed}km`,
          buttons: [
            {
              text: 'Confirmar',
              cssClass: 'btnConfirm',
              handler: () => {
                this.db.database.ref('/pedidos').child(this.uid)
                  .set({ 
                    destinoLng: `${this.pegarDestino[0]}`,
                    destinoLat: `${this.pegarDestino[1]}`,
                    origemLng: `${this.pegarOrigem[0]}`,
                    origemLat: `${this.pegarOrigem[1]}`,
                    motorista: '',
                    usuario: this.item.name,
                    preco: preco,
                    status: ''

                  }).then((error) => {
                      console.log(error); 
                    });

                this.aguardando();
              }
            },
            {
              text: 'Cancelar',
              cssClass: 'btnCancel',
              handler: () => {
                
              }
            }
          ]
        });
        confirm.present();
      } else if(aux >= 1){
        aux = 0;
      }
    });
    
    let options = {
      timeout: 3500,
      enableHighAccuracy: true
    }
    this.geolocation.getCurrentPosition(options)
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

  aguardando(){
    let pegarMotorista = this.db.database.ref('/pedidos').child(this.uid);
    pegarMotorista.on('value', (data) =>{
      let value = data.val(); 
      if(value !== null){
        if(value.motorista == ""){
          this.respMotorista = this.actionSheetCtrl.create({
            title: 'Só um minuto, aguardando resposta do motorista...',
            enableBackdropDismiss: false,
            buttons: [
              {
                text: 'Cancelar pedido',
                role: 'destructive',
                icon: 'trash',
                handler: () => {
                  let cancelar = this.alertCtrl.create({
                    title: 'Corrida cancelada com sucesso',
                    cssClass: 'teste'
                  });
                  cancelar.present();
                  this.db.database.ref('/pedidos').child(this.uid).remove();
                }
              }
            ]
          });
          this.respMotorista.present();
        }else{
          this.respMotorista.dismiss();
          console.log(value.status);
          if(value.status == "finalizado"){
            let toast = this.toast.create({
              message: 'Corrida finalizada',
              duration: 3000
            });
            toast.present();
            this.motoristaAceitou.dismiss();
          } else{
              let dadosMotorista = this.db.database.ref('motoristas').child(value.motorista);
              dadosMotorista.once('value', (data) =>{
                let motorista = data.val();

                this.motoristaAceitou = this.actionSheetCtrl.create({
                  title: `O motorista ${motorista.nome} está a caminho, aguarde...Cor da Moto: ${motorista.cor}, Placa: ${motorista.placa}`,
                  enableBackdropDismiss: false,
                  buttons: [
                    {
                      text: 'Cancelar corrida',
                      role: 'destructive',
                      icon: 'trash',
                      handler: () => {
                        //this.motoristaAceitou.dismiss();
                        let cancelar = this.alertCtrl.create({
                          title: 'Corrida cancelada com sucesso',
                        });
                        cancelar.present();
                        this.db.database.ref('/pedidos').child(this.uid).remove();
                      }
                    }
                  ]  
                });
                this.motoristaAceitou.present();
              });
            }
        }
      }
    })
  }

  presentActionSheet() {
      let pegarMotorista = this.db.database.ref('/pedidos').child(this.uid)
      pegarMotorista.on('value', (snapshot) => {
        let value = snapshot.val();
        if(value.motorista != ""){
          this.respMotorista.dismiss();

          this.motoristaAceitou = this.actionSheetCtrl.create({
            title: 'A corrida foi aceita. Um motorista está a caminho, aguarde',
            buttons: [
              {
                text: 'Cancelar corrida',
                role: 'destructive',
                icon: 'trash',
                handler: () => {
                  let cancelar = this.alertCtrl.create({
                    title: 'Corrida cancelada com sucesso',
                  });
                  cancelar.present();
                  this.db.database.ref('/pedidos').child(this.uid).remove();
                }
              }
            ]
          });
          pegarMotorista.on('value', (snapshot) => {
            let value = snapshot.val();
            if(value.motorista == ""){
              let motoristaCancelou = this.alertCtrl.create({
                  title: 'O motorista cancelou a corrida, tente novamente',
                });
                motoristaCancelou.present();
                this.motoristaAceitou.dismiss();
            }
          });
        }
      })
  }


  exibeUser() {
    this.afAuth.authState.subscribe(data => {
      if (data && data.email && data.uid) {
        this.uid = data.uid;

        let listDB = this.db.database.ref(this.PATH).child(this.uid);
        listDB.on('value', (snapshot) => {
          this.item = snapshot.val();
          this.toast.create({
            message: `Boas vindas ` + this.item.name,
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