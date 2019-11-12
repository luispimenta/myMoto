import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import { Platform } from 'ionic-angular';

// declare var Connection;

@Injectable()
export class ConnectivityService {

  onDevice: boolean;
  boolIsOnline: boolean = false;

  constructor(public platform: Platform, private network: Network){
    this.onDevice = this.platform.is('cordova');
    this.boolIsOnline = false;

    let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      this.boolIsOnline = false;
    });

    // watch network for a connection
    let connectSubscription = this.network.onConnect().subscribe(() => {
      this.boolIsOnline = true;
    });
  }



  isOnline(): boolean {
    if(this.onDevice && this.boolIsOnline) {
      return this.boolIsOnline;
    } else {
      return navigator.onLine;
    }
  }

  isOffline(): boolean {
    if(this.onDevice && !this.boolIsOnline) {
      return this.boolIsOnline;
    } else {
      return !navigator.onLine;
    }
  }
}
