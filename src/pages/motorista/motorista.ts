import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';

@IonicPage()
@Component({
  selector: 'page-motorista',
  templateUrl: 'motorista.html',
})
export class MotoristaPage {

  // variáveis
  uid: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private db: AngularFireDatabase,
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
          document.getElementById('nome').innerText = `Nome: ${motorista.nome}`;
          document.getElementById('avaliacao').innerText = `Avaliação: ${motorista.avaliacao}`;
          document.getElementById('numeroCorridas').innerText = `Total de corridas: ${motorista.corridas}`;
        });
      });
    }
}
