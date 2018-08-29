import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { HttpClient, HttpParams } from '@angular/common/http';



/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  protected key: string
  protected base_url: string
  public user_id: string
  public role_id: string
  public organization_id: string
  public username: string
  public password: string
  public email: string
  public first_name: string
  public last_name: string
  public birthdate: string
  public gender: string
  public contact_number: string
  public phone_work: string
  public mobile_number: string
  public picture: string
  public country: string
  public state: string
  public city: string
  public street: string
  public zip: string
  public isDeleted: string
  public isActive: string
  public ack_tos: string
  public is_lead: string
  public isHold: string
  public effective_hold_date: string
  public tmauEnrolled: string

  constructor(public navCtrl: NavController, public navParams: NavParams,public alertCtrl: AlertController, public http: HttpClient) {
    this.key="";//set key here
    this.base_url="";//set api url here
  }

  ionViewDidLoad(){
    console.log('ionViewDidLoad LoginPage');
  }
  toggleLogin(){
    const prompt = this.alertCtrl.create({
      title: 'Login',
      // message: "Enter a name for this new album you're so keen on adding",
      inputs: [
        {
          name: 'username',
          placeholder: 'Username',
          type: 'text'
        },
        {
          name: 'password',
          placeholder: 'Password',
          type: 'password'
        },
      ],
      buttons: [
        {
          text: 'Login',

          handler: data => {
            alert("Login "+navigator.onLine)
            let str = this.base_url+'authuser/'+this.key
            const params = new HttpParams()
            .set('username', data.username)
            .set('password', data.password);
            this.username = data.username
            this.password = data.password
            
            this.http.get(str,{params})
            .subscribe(data => {
              alert("success "+str)

              let str2 = this.base_url+'getuserdetails/'+this.key
              const params = new HttpParams()
              .set('username', this.username);
              alert(str2)
              this.http.get(str2,{params})
              .subscribe(data => {
                alert("success2 "+str2)
                alert(JSON.stringify(data))
              },
              err => {
                alert("err2 "+str2)
                    alert(JSON.stringify(err));
              });

           },
           err => {
             alert("err "+str)
                alert(JSON.stringify(err));
            });
            // if (navigator.onLine){
            //   var str = localStorage.getItem('base_url')+"api/get_latest_mobileapp/"+$scope.getKey()+"/?os="+localStorage.getItem("osType");
            //   $http.get(str)
            //   .success(function(data,responseType){
            //     if (responseType>=400) {
            //       // $scope.openMaintenancePage();
            //     }
                  
            //       // $scope.checkForUpdate(localStorage.getItem(localStorage.getItem("osType")),data.version);
            //   }).error(function(data,responseType){
            //     if (responseType>=400) {
            //       // $scope.openMaintenancePage();
            //     }
            //   });
            // }
          }
        },
        {
          text: 'Cancel',
        }
      ]
    });
    prompt.present();
  }
  toggleNTWBM(){
    alert("toggleNTWBM")
  }
  toggleForgotPass(){
    alert("toggleForgotPass")
  }
}
