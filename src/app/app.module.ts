import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule} from 'angularfire2/auth';
import { FIREBASE_CONFIG } from './app.firebase.config';
import { LocationAccuracy } from '@ionic-native/location-accuracy';

// Google maps
import { Geolocation } from '@ionic-native/geolocation';
import { Network } from '@ionic-native/network';
import { ConnectivityService } from '../providers/connectivity-service';


// Páginas
import { LoginPage } from '../pages/login/login';
import { RegisterPage } from './../pages/register/register';
import { HomePage } from './../pages/home/home';
import { MotoristaPage } from './../pages/motorista/motorista';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    RegisterPage,
    HomePage,
    MotoristaPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(FIREBASE_CONFIG),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    RegisterPage,
    HomePage,
    MotoristaPage
  ],
  providers: [
    LocationAccuracy,
    StatusBar,
    Network,
    ConnectivityService,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Geolocation
  ]
})
export class AppModule {}
