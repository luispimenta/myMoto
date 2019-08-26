import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { HomePage } from './../home/home';

@IonicPage()
@Component({
  selector: 'page-motorista',
  templateUrl: 'motorista.html',
})
export class MotoristaPage {

  // variáveis
  uid: string;
  element: HTMLImageElement;

  constructor(
    public navCtrl:       NavController,
    public navParams:     NavParams,
    private db:           AngularFireDatabase,
    ) {
      this.uid = navParams.get('item');
    }

    ionViewDidLoad() {
      this.infoMotorista();
    }

    infoMotorista() {
      let pegarMotorista = this.db.database.ref('pedidos').child(this.uid);
      pegarMotorista.once('value', (data) => {
        let value = data.val();

        let dadosMotorista = this.db.database.ref('motoristas').child(value.motorista);
        dadosMotorista.once('value', (data) => {
          let motorista = data.val();

          this.imgMotorista(motorista);
          this.nomeMotorista(motorista);
          this.avaliacaoMotorista(motorista);
          this.corridasMotorista(motorista);
          this.corMoto(motorista);
          this.placaMoto(motorista);
        });
      });
    }

    imgMotorista(motorista){
      // Verifica se o motorista já tem uma foto de perfil ou não
      if(motorista.perfil == ""){
        this.element = document.createElement("img");
        this.element.className = 'imgTeste';
        this.element.src = "../../assets/imgs/defautProfile.png";
        document.getElementById('imagem').appendChild(this.element);
      }
      else{
        this.element = document.createElement("img");
        this.element.className = 'imgTeste';
        this.element.src = motorista.perfil;
        document.getElementById('imagem').appendChild(this.element);
      }
    }

    nomeMotorista(motorista){
      document.getElementById('nome').innerText = motorista.nome;
    }

    avaliacaoMotorista(motorista){
      if(motorista.avaliacao == ""){
        document.getElementById('avaliacao').innerText = 'Ainda sem avaliações';
      }
      else{
        document.getElementById('avaliacao').innerText = motorista.avaliacao;
      }
    }

    corridasMotorista(motorista){
      document.getElementById('numeroCorridas').innerText = motorista.corridas;
    }

    corMoto(motorista){
      document.getElementById('cor').innerText = `  ${motorista.cor}`;
    }

    placaMoto(motorista){
      document.getElementById('placa').innerText = `  ${motorista.placa}`;
    }

    voltar(){
      this.navCtrl.setRoot(HomePage);
    }
}
