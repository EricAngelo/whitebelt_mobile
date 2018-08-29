 var app = angular.module('starter.controllers', ['ngCookies','ionic','ngCordova']) 

app.run(['$http', '$cookies', function($http, $cookies) {
  $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
}]);

app.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicPopup,$http, $ionicLoading, $location, $ionicNavBarDelegate, $state, $cookies,$ionicHistory,$ionicScrollDelegate) {
  // Form data for the login modal

  // Create the login modal that we will use later

  $scope.getKey=function() {
    return"a5b4d39abd4a95504af8dc822658d71d";// Set Api key here
  };

  $scope.idleIsFalse = function(){
    $scope.x=0;
  };

    localStorage.setItem("base_url", "https://mobile.yourmartialarts.school/");//set api base url here
    localStorage.setItem("android", "1.0.19 test https://mobile.yourmartialarts.school/");
    localStorage.setItem("ios", "1.2.19 test https://mobile.yourmartialarts.school/");

     $scope.getMobileOperatingSystem = function(){
      var userAgent = navigator.userAgent || navigator.vendor || window.opera;

        if (/windows phone/i.test(userAgent)) {
            return "Windows Phone";
        }

        if (/android/i.test(userAgent)) {
          $scope.appVersion= "Android "+localStorage.getItem("android");
            return "android";
        }

        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
          $scope.appVersion="ios "+localStorage.getItem("ios");
            return "ios";
        }

        return "unknown 0.0.0";
    }

    localStorage.setItem("osType", $scope.getMobileOperatingSystem());
// (localStorage.getItem("base_url"))


    $ionicModal.fromTemplateUrl('templates/maintenancePage.html', {
      scope: $scope,
      hardwareBackButtonClose: false
    }).then(function(modal) {
      $scope.maintenancePageModal = modal;
    });
    $scope.openMaintenancePage = function(){
      $scope.maintenancePageModal.show();
    };

    $scope.closeMaintenancePage = function(){
      $scope.maintenancePageModal.hide();
    };


    if (navigator.onLine){
      var str = localStorage.getItem('base_url')+"api/get_latest_mobileapp/"+$scope.getKey()+"/?os="+localStorage.getItem("osType");
      $http.get(str)
      .success(function(data,responseType){
        if (responseType>=400) {
          $scope.openMaintenancePage();
        }
          
          $scope.checkForUpdate(localStorage.getItem(localStorage.getItem("osType")),data.version);
      }).error(function(data,responseType){
        if (responseType>=400) {
          $scope.openMaintenancePage();
        }
      });
    }

$scope.checkForUpdate = function(thisVersion,storeVersion){
  // alert(thisVersion+"\n"+storeVersion)
  if (((thisVersion!="undefined") && (thisVersion!=null)) && ((storeVersion!="undefined") && (storeVersion!=null))){
    var this_Version = thisVersion.split(".");
    var store_Version = storeVersion.split(".");
    for (var i = 0; i < this_Version.length; i++) {

      if (parseInt(this_Version[i]) > parseInt(store_Version[i]))
        break;

      if(parseInt(this_Version[i]) < parseInt(store_Version[i])){

        var checkoffPopup = $ionicPopup.show({
        template: "<center>Please Update Your App to the Latest Version</center>",
        title: 'Update Now',

        scope: $scope,
        buttons: [
          {
            text: '<b>Ok</b>',
            type: 'button-assertive',
            onTap: function(e) {
              if (localStorage.getItem("userId")) {
                localStorage.clear();
              window.location.href = "index.html";
              }
            }
          },
        ]
        });
        break;
      }
    }
  }
}

$scope.checkUserValidation = function(){
  if (navigator.onLine){
    var str = localStorage.getItem('base_url')+"getuserdetails/"+$scope.getKey()+"/"+localStorage.getItem("username");
    $http.get(str)
    .success(function(data){
    if (data){
      if (data.isActive==0) {
        $scope.warning("Your Account has been decativated. Please speak to your Instructor.");
        localStorage.clear();
        window.location.href = "index.html";
      }
      if ($scope.isOnHold(data.effective_hold_date,data.isHold)) {
                var onHoldPopup = $ionicPopup.show({
                title: 'Sorry',
                template: "<center style='font-size:14px;'>Your account is currently <b>ON HOLD</b><br><br>Please speak to your Instructor.<br><b>You will now be logged out.</b></center>",
                hardwareBackButtonClose: false,
                buttons: [{
                  text: '<b>Ok</b>',
                  type: 'button-energized',
                  onTap: function(e) {

                    localStorage.clear();
                    window.location.href = "index.html";

                  }
                },]
              });
      }
    }
    }).error(function(data){
      // ("error in checkUserValidation")
    });
  }
}

  $scope.returnStatus = function(id,list){

    if(list=='class')
      return $scope.classs[id]['trueOrFalse'];
    else
      return $scope.searchClasss[id]['trueOrFalse'];
  }
$scope.checkInternet=function(){
  return navigator.onLine;
}

  $scope.checkIn = function(classId,id,l,schedule_id){
    if (navigator.onLine){
      var indexId = id;
      var list = l;
$scope.selected_student_name = $scope.first_name+" "+$scope.last_name;

      var str = localStorage.getItem('base_url')+"api/class_check_in/"+$scope.getKey()+"/?class_id="+classId+"&school_id="+$scope.selected_schoolId+"&user_id="+localStorage.getItem("userId")+"&source=3&dojoclass_schedule_id="+schedule_id;
      $http.get(str)
      .success(function(data){

      if(data == "Check in successful"){

        // $scope.gotoHome();
        if(list=='class')
          $scope.classs[indexId]['trueOrFalse']=true;
        else{
          $scope.searchClasss[indexId]['trueOrFalse']=true;
          for (var i = 0; $scope.classs.length > i; i++){
            if($scope.searchClasss[indexId]['scheduleId']==$scope.classs[i]['scheduleId']){
              $scope.classs[i]['trueOrFalse']=true;
              break;
            }
          }
        }

        $scope.classDetailDisable=true;
        $scope.success("Successfully Checked in");

        $scope.searchedClasses="";
        this.searchedClasses="";
        document.getElementById("searchedClasses").value="";
        $scope.searchForAClass();
      }

      else if (data == "Already checked in."){
        $scope.warning(data);
        $scope.hideLoader();
      }

      else if(data == "onhold"){
        $scope.warning("Unable to checkin: Your account is on Hold.")
        $scope.hideLoader();
      }

      else if(data == "need-risk-waiver"){
 $scope.selected_school_id = $scope.selected_schoolId;
  $scope.selected_student_id=$scope.userId;
  $scope.selected_class_id=classId;
  $scope.selected_class_schedule_id=schedule_id;

var str = localStorage.getItem('base_url')+"getuserdetails/"+$scope.getKey()+"/?userid="+$scope.userId;
            $http.get(str)
            .success(function(data){
              $scope.selected_student_address=""; 

              if(data.street!="" && data.street!=null){
                if (data.street.toUpperCase()!="N/A")
                  $scope.selected_student_address=data.street;
                else
                  $scope.selected_student_address="N/A";
              }
              else
                  $scope.selected_student_address="N/A";
                
              if(data.city!="" && data.city!=null){
                if(data.city.toUpperCase()!="N/A")
                  $scope.selected_student_address=$scope.selected_student_address+", "+data.city;
                else
                  $scope.selected_student_address="N/A";
              }
              else
                  $scope.selected_student_address="N/A";
                
              if(data.country!="" && data.country!=null){
                if(data.country.toUpperCase()!="N/A")
                  $scope.selected_student_address=$scope.selected_student_address+", "+data.country;
                else
                  $scope.selected_student_address="N/A";
              }
              else
                $scope.selected_student_address="N/A";

              if(data.zip!="" && data.zip!=null){
                if (data.zip.toUpperCase()!="N/A")
                  $scope.selected_student_address=$scope.selected_student_address+", "+data.zip;
                else
                  $scope.selected_student_address="N/A";
              }
              else
                $scope.selected_student_address="N/A";

              $scope.selected_student_birthdate=data.birthdate;

            if(data.birthdate==""||data.birthdate==null||data.birthdate=="0000-00-00"||data.birthdate=="1970-01-01")
                $scope.settingupBirthdate(data.username);
            else
                $scope.askForGuardiansName();

            }).error(function(data){
            });

             $scope.hideLoader();
      }

      else if(data == "exclusive"){
        var sorryPopup = $ionicPopup.alert({
          title: 'Sorry',
          template: "<center>This is an exclusive class.<br>Please speak to your Instructor</center>",
          okType: "button-assertive"
        });

       $scope.hideLoader();
      }

      else{

        $scope.warning(data);
        $scope.hideLoader();
      }
      }).error(function(data){
        $scope.error("Error");
        $scope.hideLoader();
      });

    }
    else
      $scope.warning("Please check internet connection");
  };

$scope.goToClassDetails = function(classId,ClassTpye){
  $state.go('app.classDetails');
    $scope.classDetailId= $scope.classs[classId]['id'];
    $scope.classDetailName= $scope.classs[classId]['name'];
    $scope.classDetailTime_in= $scope.classs[classId]['time_in'];
    $scope.classDetailTime_out= $scope.classs[classId]['time_out'];
    // $scope.classDetailStyleName= $scope.classs[classId]['styleName'];
    $scope.classDetailDisable= $scope.classs[classId]['trueOrFalse'];
    $scope.classDetailClassTpye = ClassTpye;
}

  $scope.toggleCheckin=function(indexId,list,classId, className, classTime,schedule_id){

  var myPopup = $ionicPopup.show({
    template: "<center>Check in to "+className+" at "+classTime+"?</center>",
    title: 'Check In',

    scope: $scope,
    buttons: [
      { text: 'Back',
      type: 'button-gray' },
      {
        text: '<b>Check In</b>',
        type: 'button-balanced',
        onTap: function(e) {

        if (navigator.onLine) {
          $scope.checkIn(classId,indexId,list,schedule_id);
        }
        else{
          $scope.warning("Please check internet connection");
        }
        
        }
      },
    ]
  });

  };



 $scope.changePic = function(){
  var myPopup = $ionicPopup.show({
    template: "<center><b>This picture should be a photo of you as it is to be used by staff.</b></center>",
    title: '<b>Change Picture</b>',

    scope: $scope,
    buttons: [
      { text: 'Back',
      type: 'button-gray' },
      {
        text: '<b>Ok</b>',
        type: 'button-balanced',
        onTap: function(e) {

        if (navigator.onLine) {
          $scope.myPopup2 = $ionicPopup.show({
          template: '<center><button class="button button-block button-positive ion-ios-camera" ng-click="cameraTakePicture();myPopup2.close()" > Take Picture</button><br><button class="button button-block button-positive ion-ios-grid-view" ng-click="openFilePicker();myPopup2.close()"> Select Image</button></cener>',
          title: 'Change Picture',

          scope: $scope,
          buttons: [
            { text: '<b>Back</b>',
              type: 'button-gray'
            },
          ]
        });
        }else{
          $scope.warning("Please check internet connection");
        }
        
        }
      },
    ]
  });
  };


  $scope.goBack = function() {
    navigator.app.backHistory();
  };

  $scope.showAddRelationship=function(){
    $scope.AddRelationshipPopup = $ionicPopup.show({
      template: '<button class="button button-block button-positive ion-person-add" ng-click="addRelation()"> Non Member</button><br><center><button class="button button-block button-positive ion-person" ng-click="addExistingRelation()"> Existing Member</button></cener>',
      title: 'Add Relationship',
      scope: $scope,
      buttons: [
        { text: 'Back',
          type: 'button-gray'
        },
      ]
    });
  };



  $scope.showLoader = function() {
    $ionicLoading.show({
      template: '<div height="100%" width="100%" style="background-color:white;padding-bottom:100%;"><center><img src="img/martialarts.gif" style="text-align:center;margin-top:55%;"/> <br> <b style="color:black;">Note: Internet Connection is Required for Updating any Information.</b></center></div>',
    });
  };

  $scope.hideLoader = function(){
    $ionicLoading.hide();
  };

  $ionicModal.fromTemplateUrl('templates/searchUser.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.searchUserModal = modal;
  });

$scope.closeAddExistingRelation=function(){
  $scope.searchUserModal.hide();
};

$scope.addExistingRelation = function() {
  if(navigator.onLine){
    // $state.go('app.searchUser');
    $scope.searchUserModal.show();
    $scope.AddRelationshipPopup.close();
  }
  else
    $scope.warning("Please Check Internet Connection");
};



$scope.addRelation = function(){
  $scope.data = {};
  $scope.AddRelationshipPopup.close();
  $scope.relationshipAddForm();
 };

  $scope.welcome = function() {
    var alertPopup = $ionicPopup.alert({
      title: 'Welcome',
      template: '<center>Hello '+localStorage.getItem("first_name")+" "+localStorage.getItem("last_name")+'</center>'
    });

    alertPopup.then(function(res) { 
      if (localStorage.getItem("isDetatchedUser")=="true"){
        window.location.href = "index2.html#/app/profile";
      }
      else{
        if(localStorage.getItem("role_id")<=5){
          window.location.href = "index2.html#/app/attendances";
        }
        else{
          window.location.href = "index2.html#/app/profile";
        }
      }
    });
  };

  $scope.warning = function(msg) {
    var alertPopup = $ionicPopup.alert({
      title: 'Warning',
      template: "<center> "+msg+"</center>",
      okType: 'button-energized'
    });
  };

    $scope.error = function(msg) {
    var alertPopup = $ionicPopup.alert({
      title: 'Error',
      template: "<center>"+msg+"</center>",
      okType: 'button-assertive'
    });
  };

  $scope.success = function(msg) {
    var alertPopup = $ionicPopup.alert({
      title: 'Success',
      template: "<center> "+msg+"</center>",
      okType: 'button-balanced'
    });
  };

  $scope.message= function(msg) {
    var alertPopup = $ionicPopup.alert({
      title: 'Whitebelt.co',
      template: "<center> "+msg+"</center>",
      okType: 'button-positive'
    });
  };

$scope.openTMAU = function(){
  if ($scope.hideTMAUEnrolled())
    $scope.message("To learn more about TMAU please speak to your dojo Instructor.");
  else{
    if(navigator.onLine)
      cordova.InAppBrowser.open('https://www.themartialarts.university/log_in/submit?userid='+localStorage.getItem("username")+'&password='+localStorage.getItem("password"), '_system', 'location=yes');
    else
      $scope.warning("Please check your internet connection.");
    }
};

$scope.openLink = function(link){
    if(navigator.onLine)
      cordova.InAppBrowser.open(link, '_system', 'location=yes');
    else
      $scope.warning("Please check your internet connection.");
}

$scope.sendImg= function(imageData){
        if(navigator.onLine){
        $scope.successfulyUploaded = false;
        $http({
          method: 'POST',
          url: localStorage.getItem("base_url")+"updateProfileImage/"+$scope.getKey()+"/",
          dataType:"json",
          ContentType:"application/json",
          data:{
                userid: localStorage.getItem("userId"),
                img:  "data:image/gif;base64,"+imageData
              }
        }).then(function successCallback(response) {
            $scope.successfulyUploaded = true;

            var image = document.getElementById('profileImage');
            image.src = "data:image/gif;base64,"+imageData;
            
            image = document.getElementById('menuProfileImage');
            image.src = "data:image/gif;base64,"+imageData;
            $scope.setUpUserDetailsNet();
          }, function errorCallback(response) {
            $scope.successfulyUploaded = false;
          });
  
        if($scope.successfulyUploaded){
          var image = document.getElementById('updateProfileImage');
          image.src = "data:image/gif;base64,"+imageData;
          $scope.tempSendImg=image.src;
        }

      }else
        $scope.warning("Please Check Internet Connection");
}

$scope.cameraTakePicture=function() {

  if(navigator.onLine){
     navigator.camera.getPicture(onSuccess, onFail, { 
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL
     });
  
     function onSuccess(imageData){
      $scope.savedImg=imageData;
      var image = document.getElementById('updateProfileImage');
          image.src = "data:image/gif;base64,"+imageData;
          $scope.tempSendImg="data:image/gif;base64,"+imageData;
     }
  
     function onFail(message){
        if(message!="Camera cancelled.")
          $scope.error(message);
     }
   }else
   $scope.warning("Please Check Internet Connection.");
};

$scope.openFilePicker = function () {
if(navigator.onLine){
   navigator.camera.getPicture(onSuccess, onFail, { 
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: Camera.DestinationType.DATA_URL
   });

   function onSuccess(imageData) {
      // $scope.sendImg(imageData);
      $scope.savedImg=imageData;
      var image = document.getElementById('updateProfileImage');
          image.src = "data:image/gif;base64,"+imageData;
          $scope.tempSendImg="data:image/gif;base64,"+imageData;
          // image = document.getElementById('profileImage');
          // image.src = "data:image/gif;base64,"+imageData;
          
          // image = document.getElementById('menuProfileImage');
          // image.src = "data:image/gif;base64,"+imageData;
   }

   function onFail(message) {
      if(message!="Selection cancelled.")
        $scope.error(message);
   }
  }
  else
    $scope.warning("Please Check Internet Connection.");
};

 $scope.someones_changePic = function(){
  var myPopup = $ionicPopup.show({
    template: "<center><b>This picture should be a photo of the student as it is to be used by staff.</b></center>",
    title: '<b>Change Picture</b>',

    scope: $scope,
    buttons: [
      { text: 'Back',
      type: 'button-gray' },
      {
        text: '<b>Ok</b>',
        type: 'button-balanced',
        onTap: function(e) {

        if (navigator.onLine) {
          $scope.myPopup2 = $ionicPopup.show({
          template: '<center><button class="button button-block button-positive ion-ios-camera" ng-click="someone_cameraTakePicture();myPopup2.close()"> Take Picture</button><br><button class="button button-block button-positive ion-ios-grid-view" ng-click="someone_openFilePicker();myPopup2.close()"> Select Image</button></cener>',
          title: 'Change Picture',

          scope: $scope,
          buttons: [
            { text: '<b>Back</b>',
              type: 'button-gray'
            },
          ]
        });
        }else{
          $scope.warning("Please check internet connection");
        }
        
        }
      },
    ]
  });
  };

// ------------------------------------------------------------------------------------------
$scope.someone_sendImg= function(imageData,userId){
        if(navigator.onLine){
        $scope.successfulyUploaded = false;
        $http({
          method: 'POST',
          url: localStorage.getItem("base_url")+"updateProfileImage/"+$scope.getKey()+"/",
          dataType:"json",
          ContentType:"application/json",
          data:{
            userid: userId,
            img:  "data:image/gif;base64,"+imageData
          }
        }).then(function successCallback(response) {
            $scope.successfulyUploaded = true;

            var image = document.getElementById('relationshipProfileImage');
            image.src = "data:image/gif;base64,"+imageData;

            image = document.getElementById('updateSomeonesProfileImage');
            image.src = "data:image/gif;base64,"+imageData;

          }, function errorCallback(response) {
            $scope.successfulyUploaded = false;
          });
      
      }else
        $scope.warning("Please Check Internet Connection");
}

$scope.someone_cameraTakePicture=function() {

  if(navigator.onLine){
     navigator.camera.getPicture(onSuccess, onFail, { 
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL
     });
  
     function onSuccess(imageData) {
      $scope.someone_savedImg=imageData;
      var image = document.getElementById('updateSomeonesProfileImage');
          image.src = "data:image/gif;base64,"+imageData;
          $scope.someones_tempSendImg="data:image/gif;base64,"+imageData;
     }
  
     function onFail(message) {
        if(message!="Camera cancelled.")
          $scope.error(message);
     }
   }else
   $scope.warning("Please Check Internet Connection.");
};


$scope.someone_openFilePicker = function () {
if(navigator.onLine){
   navigator.camera.getPicture(onSuccess, onFail, { 
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: Camera.DestinationType.DATA_URL
   });

   function onSuccess(imageData) {
      // $scope.sendImg(imageData);

      $scope.someone_savedImg=imageData;
      var image = document.getElementById('updateSomeonesProfileImage');
          image.src = "data:image/gif;base64,"+imageData;
          $scope.someone_tempSendImg="data:image/gif;base64,"+imageData;


   }

   function onFail(message) {
      if(message!="Selection cancelled.")
        $scope.error(message);
   }
  }
  else
    $scope.warning("Please Check Internet Connection.");
};
// ------------------------------------------------------------------------------------------

$scope.noClasses = function(classes){
return (classes > 0);
};

$scope.moreClasses = function(){
window.location.href='#/app/classes';
};

$scope.gotoProfile=function(){
  $state.go('app.profile');
  $scope.userSearchList = [];
};

$scope.gotoHome=function(){
  $state.go('app.attendances');
};

$scope.gotoRelationships=function(){
  $state.go('app.relationships');
};

  $ionicModal.fromTemplateUrl('templates/updatePersonalInfo.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.updatePersonalInfoModal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeUpdatePersonalInfo = function(){
    $scope.updatePersonalInfoModal.hide();
  };


  $scope.updatePersonalInfo = function(){

    if(navigator.onLine){
      $scope.updatePersonalInfoModal.show();
      $scope.tempSendImg=$scope.picture;

      $("#user_first_name").css('color','black');
      $("#user_last_name").css('color','black');
      $("#user_birthdate").css('color','black');
      $("#user_gender").css('color','black');
      $("#user_contact_number").css('color','black');
      $("#user_phone_work").css('color','black');
      $("#user_mobile_number").css('color','black');
      $("#user_country").css('color','black');
      $("#user_city").css('color','black');
      $("#user_state").css('color','black');
      $("#user_street").css('color','black');
      $("#user_zip").css('color','black');

      if (localStorage.getItem("birthdate"))
        $scope.birthdate=new Date(localStorage.getItem("birthdate"));

      $scope.countryNameOptions=localStorage.getItem("listedCountryNames").split(",");
      $scope.countryIdOptions=localStorage.getItem("listedCountryIds").split(",");

      var defaultCountry = 0;
        $scope.countryOptions = [];

      for (var i = $scope.countryNameOptions.length-1; i >= 0 ; i--) {
          $scope.countryOptions.push({
            name: $scope.countryNameOptions[i],
            id: $scope.countryIdOptions[i]
          })
          if ($scope.countryNameOptions[i]==localStorage.getItem("country")){
            defaultCountry=Math.abs($scope.countryNameOptions.length-1-i);
          }
      }

      $scope.country=$scope.countryOptions[defaultCountry];

      $scope.allStateNames=localStorage.getItem("listedStateNames").split(",");
      $scope.allStateIds=localStorage.getItem("listedStateIds").split(",");

      var defaultState = 0;
      var c=0;
      $scope.stateOptions = [];
      for (var i = $scope.allStateNames.length-1; i >= 0; i--) {
        if($scope.allStateIds[i]==$scope.country.id){
          c++;
          $scope.stateOptions.push({
            name: $scope.allStateNames[i],
            id: $scope.allStateIds[i]
          })
          }
          if($scope.allStateNames[i]==localStorage.getItem("state"))
            defaultState=c-1;
      }

      $scope.state = $scope.stateOptions[defaultState];
      $scope.changeCountry = function() {

        $scope.stateOptions = [];

        $scope.stateOptions.push({
          name: "Select State",
          id: ""
        })

        for (var i = $scope.allStateNames.length-1; i >= 0; i--){
          if($scope.allStateIds[i]==this.country.id)
            $scope.stateOptions.push({
              name: $scope.allStateNames[i],
              id: $scope.allStateIds[i]
            })
        }
        $scope.state=$scope.stateOptions[0];
      };


 var tempCountryId = this.country.id;
  $timeout(function(){
    for (var i = 0; i < document.getElementById("country").length; i++) {
     if(document.getElementById("country").options[i].text == localStorage.getItem("country")){
      document.getElementById("country").selectedIndex = i;
      break;
     }
    }
    for (var i = $scope.allStateNames.length-1; i >= 0; i--){
      if($scope.allStateIds[i]==tempCountryId)
        $scope.stateOptions.push({
          name: $scope.allStateNames[i],
          id: $scope.allStateIds[i]
        })
    }
    $timeout(function(){
      for (var i = 0; i < document.getElementById("state").length; i++) {
       if(document.getElementById("state").options[i].text == localStorage.getItem("state")){
        document.getElementById("state").selectedIndex = i;
        break;
       }
      }
    }, 1000);
  }, 1000);

    }
    else{
      $scope.warning("Internet Connection Required.");
    }
  };

  $scope.doUpdatePersonalInfo = function() {

    if(navigator.onLine){
      var birthdate = new Date(this.birthdate);
      var date = birthdate.getFullYear()+"-"+(birthdate.getMonth()+1)+"-"+birthdate.getDate();
      var countryValue = document.getElementById("country").options[document.getElementById("country").selectedIndex].text;
      var stateValue = document.getElementById("state").options[document.getElementById("state").selectedIndex].text;

      $("#user_first_name").css('color','black');
      $("#user_last_name").css('color','black');
      $("#user_birthdate").css('color','black');
      $("#user_gender").css('color','black');
      $("#user_contact_number").css('color','black');
      $("#user_phone_work").css('color','black');
      $("#user_mobile_number").css('color','black');
      $("#user_country").css('color','black');
      $("#user_city").css('color','black');
      $("#user_state").css('color','black');
      $("#user_street").css('color','black');
      $("#user_zip").css('color','black');

      if(this.first_name==""){
        $("#user_first_name").css('color','red');
      }
      if(this.last_name==""){
        $("#user_last_name").css('color','red');
      }
      if(this.birthdate=="" || this.birthdate==null){
        $("#user_birthdate").css('color','red');
      }

      if(this.gender==""){
        $("#user_gender").css('color','red');
      }

      if(this.mobile_number==""){
        $("#user_mobile_number").css('color','red');
      }

      if(countryValue==null || countryValue == ""){
        $("#user_country").css('color','red');
      }

      if(stateValue == null || stateValue == ""){
        $("#user_state").css('color','red');
      }else{
        if(stateValue =="Select State"){
          $("#user_state").css('color','red');
        }
      }

      if(this.city==""){
        $("#user_city").css('color','red');
      }

      if(this.street ==""){
        $("#user_street").css('color','red');
      }

      if(this.zip==""){
        $("#user_zip").css('color','red');
      }

      var birthdateFlag = 0;
      var date_set = new Date(document.getElementById("birthdate").value);

      var two_yrs_ago = new Date();
      two_yrs_ago.setFullYear((two_yrs_ago.getFullYear() - 2));

      if (date_set){
        if(two_yrs_ago<date_set){
          $("#user_birthdate").css('color','red');
          birthdateFlag = 1; 
        }
        else{
          $("#user_birthdate").css('color','black');
          birthdateFlag = 0; 
        }
      }else{
        $("#user_birthdate").css('color','red');
        birthdateFlag = 1;
      }

      if(birthdateFlag == 1 || this.first_name=="" || this.last_name =="" || this.birthdate=="" || date =="" || this.gender=="" || this.mobile_number =="" || countryValue =="" || stateValue =="" || this.city =="" || this.street =="" || this.zip =="" || this.first_name==null || this.last_name ==null || this.birthdate==null || date ==null || this.gender==null || this.mobile_number ==null || countryValue ==null || stateValue ==null || this.city ==null || this.street ==null || this.zip ==null || stateValue =="Select State")
          $scope.warning("All fields marked with asterisk are required.");
      else{

      if(this.contact_number==""){
        this.contact_numbe="N/A";
      }

      if(this.phone_work==""){
        this.phone_work="N/A";
      }


      var str = localStorage.getItem('base_url')+"updateuser/"+$scope.getKey()+"?username="+localStorage.getItem("username")+"&first_name="+this.first_name+"&last_name="+this.last_name+"&birthdate="+date+"&gender="+this.gender+"&contact_number="+this.contact_number+"&phone_work="+this.phone_work+"&mobile_number="+this.mobile_number+"&country="+countryValue+"&state="+stateValue+"&city="+this.city+"&street="+this.street+"&zip="+this.zip;
      var tempFirstName = this.first_name;
      var tempLastName = this.last_name;
      var tempDate = date;
      var tempGender = this.gender;
      var tempCountry = this.country;
      var tempContactNumber = this.contact_number;
      var tempPhoneWork = this.phone_work;
      var tempMobileNumber = this.mobile_number;
      var tempState = this.state;
      var tempCity = this.city;
      var tempStreet = this.street;
      var tempZip = this.zip;

        $scope.showLoader();
        $http.get(str)
            .success(function(data){
              $scope.hideLoader();
              if(data['status']=='success'){

                if($scope.savedImg!=null && (document.getElementById('updateProfileImage').src!=document.getElementById('menuProfileImage').src)){
                    $scope.sendImg($scope.savedImg);
                    $scope.picture=$scope.tempSendImg;
                }
                  $scope.closeUpdatePersonalInfo();
                    $timeout(function(){  
                      localStorage.setItem("first_name",tempFirstName);
                      localStorage.setItem("last_name",tempLastName);
                      localStorage.setItem("birthdate",tempDate);
                      localStorage.setItem("gender",tempGender);
                      localStorage.setItem("contact_number",tempContactNumber);
                      localStorage.setItem("phone_work",tempPhoneWork);
                      localStorage.setItem("mobile_number",tempMobileNumber);
                      localStorage.setItem("country",tempCountry['name']);
                      localStorage.setItem("state",tempState['name']);
                      localStorage.setItem("city",tempCity);
                      localStorage.setItem("street",tempStreet);
                      localStorage.setItem("zip",tempZip);
    
                      $scope.first_name=localStorage.getItem("first_name");
                      $scope.last_name=localStorage.getItem("last_name");
                      $scope.birthdate=new Date(localStorage.getItem("birthdate"));
                      $scope.birthday=localStorage.getItem("birthdate");
                      $scope.gender=localStorage.getItem("gender");
                      $scope.contact_number=localStorage.getItem("contact_number");
                      $scope.phone_work=localStorage.getItem("phone_work");
                      $scope.mobile_number=localStorage.getItem("mobile_number");
                      $scope.country=tempCountry;
                      $scope.state=tempState;
                      $scope.city=localStorage.getItem("city");
                      $scope.street=localStorage.getItem("street");
                      $scope.zip=localStorage.getItem("zip");
                      // $scope.setUpUserDetails();
                      $scope.hideLoader();
                      $scope.success("Successfully Updated.");
                    }, 1000);
              }
            })
            .error(function(data){
                $scope.hideLoader();
                if (navigator.onLine) {
                  $scope.error("Please check your Internet connection.")
                } 

                else {
                  $scope.error("Unable to connect to the server.")
                }
                
            });
      }
    }
    else
      $scope.error("Please check your Internet connection.");
  };

  $scope.first_name=localStorage.getItem("first_name");
  $scope.last_name=localStorage.getItem("last_name");
  $scope.birthdate=new Date(localStorage.getItem("birthdate"));
  $scope.gender=localStorage.getItem("gender");
  $scope.contact_number=localStorage.getItem("contact_number");
  $scope.phone_work=localStorage.getItem("phone_work");
  $scope.mobile_number=localStorage.getItem("mobile_number");
  $scope.picture=localStorage.getItem("picture");
  // $scope.country=localStorage.getItem("country");
  // $scope.state=localStorage.getItem("state");
  $scope.city=localStorage.getItem("city");
  $scope.street=localStorage.getItem("street");
  $scope.zip=localStorage.getItem("zip");
  $scope.updateData = {};

  if(localStorage.getItem("gender")&&localStorage.getItem("gender")!=null){

    if(localStorage.getItem("gender").toUpperCase()=="MALE"||localStorage.getItem("gender").toUpperCase()=="M")
      $scope.maleSelected="true";

    if(localStorage.getItem("gender").toUpperCase()=="FEMALE"||localStorage.getItem("gender").toUpperCase()=="F")
      $scope.femaleSelected="true";
  }



  $ionicModal.fromTemplateUrl('templates/updatePassword.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalPassword = modal;
  });

  $scope.closeUpdatePassword = function() {
    $scope.modalPassword.hide();
    $scope.msg="";
    this.newPass="";
    this.matchPass="";
    this.oldPass="";
  };

  // Open the login modal
  $scope.updatePassword = function() {
    if(navigator.onLine)
      $scope.modalPassword.show();
    else
      $scope.warning("Please check your internet connection.");
  };

  $scope.doUpdatePassword = function() {
    if(navigator.onLine){
      var msg=[];
      var temp="";

      if(this.newPass=="" || this.matchPass=="" || this.oldPass=="" || this.oldPass==null)
        msg.push("All fields are Required.\n");

      else if(this.oldPass!=localStorage.getItem("password"))
        msg.push("Old Password Incorrect.\n");   

      else if(this.newPass!=this.matchPass)
        msg.push("New Passwords do not match.\n");
      else{
        temp=this.newPass;
        //$scope.showLoader();
        var str = localStorage.getItem('base_url')+"changepass/"+$scope.getKey()+"?userid="+localStorage.getItem("userId")+"&oldpassword="+this.oldPass+"&newpassword="+this.newPass;
          $http.get(str)
            .success(function(data){
              $scope.hideLoader();
              if(data.status){
                if(data.status=="success"){

                  
                  $scope.closeUpdatePassword();
                  $timeout(function(){
                    localStorage.setItem("password",temp);
                    $scope.setUpUserDetails();
                    $scope.success("Successfully Updated.");
                  }, 1000);
                }              
                else {
                  $scope.error("Update Failed.");
                }
              }
              else {
                $scope.error("Unable to connect to the server.");
              }
            })
            .error(function(data){
                $scope.hideLoader();
                if (navigator.onLine) {
                  $scope.error("Unable to connect to the server.");
                } 

                else {
                  $scope.error("Please check your Internet connection.");
                }
            });
      }
      
      if(msg.length>0)
      $scope.warning(msg.join());
    }
    else
      $scope.error("Please check your Internet connection.");
  };

  $ionicModal.fromTemplateUrl('templates/updateEmail.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalEmail = modal;
  });


  $scope.closeUpdateEmail = function() {
    $scope.modalEmail.hide();
  };

  // Open the login modal
  $scope.updateEmail = function() {
    if(navigator.onLine)
      $scope.modalEmail.show();
    else
      $scope.warning("Please check your internet connection.");
  };

  $scope.doUpdateEmail = function() {
      var tempEmail = "";
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if((!re.test(this.email))||this.email==""||this.email==null){
        $scope.warning("Valid email Required.");
      }

      else{
        tempEmail=this.email;
        if(navigator.onLine){
          //$scope.showLoader();
          $http.get(localStorage.getItem('base_url')+"updateuser/"+$scope.getKey()+"?username="+localStorage.getItem("username")+"&email="+this.email)
            .success(function(data){
              $scope.hideLoader();
              localStorage.setItem("email",tempEmail);
              $scope.setUpUserDetails();
              $scope.email=tempEmail;
              $scope.closeUpdateEmail();
              $timeout(function(){
              $scope.success("Successfully Updated.");
              }, 1000);
            })
            .error(function(data){
              $scope.hideLoader();
                if (navigator.onLine) {
                  $scope.error("Unable to connect to the server.");
                } 

                else {
                  $scope.error("Please check your Internet connection.");
                }
            });
          }
          else
            $scope.error("Please check your Internet connection.");
      }
      
  };

$scope.mainOptions = [
        {
          name: 'Emergency Contact',
          value: 'Emergency Contact'
        },
      ];
$scope.relationship_data_main_type = $scope.mainOptions[0];

$scope.options = [
        {
          name: 'Guardian',
          value: 'Guardian'
        }, 
        {
          name: 'Father',
          value: 'Father'
        },
        {
          name: 'Mother',
          value: 'Mother'
        }, 
        {
          name: 'Husband',
          value: 'Husband'
        }, 
        {
          name: 'Wife',
          value: 'Wife'
        }, 
        {
          name: 'Son',
          value: 'Son'
        }, 
        {
          name: 'Daugther',
          value: 'Daugther'
        }, 
        {
          name: 'Brother',
          value: 'Brother'
        }, 
        {
          name: 'Sister',
          value: 'Sister'
        }, 
        {
          name: 'Uncle',
          value: 'Uncle'
        }, 
        {
          name: 'Aunt',
          value: 'Aunt'
        }, 
        {
          name: 'Cousin',
          value: 'Cousin'
        }, 
        {
          name: 'Nephew',
          value: 'Nephew'
        }, 
        {
          name: 'Niece',
          value: 'Niece'
        }, 
        {
          name: 'Close Friend',
          value: 'Close Friend'
        }, 
        // {
        //   name: 'Other',
        //   value: 'Other'
        // },
      ];


  $ionicModal.fromTemplateUrl('templates/relationshipForm.html',{
    scope: $scope
  }).then(function(modal) {
    $scope.modalRelationship = modal;
  });



  $scope.closeUserDetails=function(){
    $scope.modalUserDetails.hide();
  }

$scope.viewStudentDetails = function(userid){
  $ionicModal.fromTemplateUrl('templates/userDetailsView.html',{
    scope: $scope
  }).then(function(modal) {
    $scope.modalUserDetails = modal;
  });
  //$scope.showLoader();
    var str = localStorage.getItem('base_url')+"getuserdetails/"+$scope.getKey()+"/?userid="+userid;
    $http.get(str)
    .success(function(data){

      $scope.userDetails_id=data['id'];
      $scope.userDetails_username=data['username'];
      $scope.userDetails_picture=localStorage.getItem('base_url')+data['picture'];
      $scope.userDetails_first_name=data['first_name'];
      $scope.userDetails_last_name=data['last_name'];
      $scope.userDetails_email=data['email'];

      $scope.userDetails_contact_number=data['contact_number'];
      $scope.userDetails_phone_work=data['phone_work'];
      $scope.userDetails_mobile_number=data['mobile_number'];

        var str2 = localStorage.getItem('base_url')+"api/getrelationships/"+$scope.getKey()+"/"+data.id;
        $http.get(str2)
        .success(function(data){

          $scope.userRelationship_id=[];
          $scope.userRelationship_type=[];
          $scope.userRelationship_sub_type=[];
          $scope.userRelationship_first_name=[];
          $scope.userRelationship_last_name=[];
          $scope.userRelationship_email=[];
          $scope.userRelationship_contact_number=[];
          $scope.userRelationship_phone_work=[];
          $scope.userRelationship_mobile_number=[];
          $scope.userRelationship_verification=[];
          $scope.countRelationships=data.length;
          $scope.loopCountRelationships=0;

          if(data.length==0){
            $scope.hideLoader();
            $scope.modalUserDetails.show();
          }
          else{
            for (var i = $scope.countRelationships - 1; i >= 0; i--) {
                var str3 = localStorage.getItem('base_url')+"api/getrelationship/"+$scope.getKey()+"/"+data[i];
                $http.get(str3)
                .success(function(data){
                  var temp_contact_number="";
                  var temp_phone_work="";
                  var temp_mobile_number="";

                  if (data.contact_number != "" && data.contact_number!=null) {
                    temp_contact_number = data.contact_number;
                  }
                  
                  if (data.phone_work != "" && data.phone_work!=null) {
                    temp_phone_work = data.phone_work;
                  }

                  if (data.mobile_number != "" && data.mobile_number!=null) {
                    temp_mobile_number = data.mobile_number;
                  }

                  $scope.loopCountRelationships++;
                  $scope.userRelationship_id.push(data.id);
                  $scope.userRelationship_type.push(data.type);
                  $scope.userRelationship_sub_type.push(data.sub_type);
                  $scope.userRelationship_first_name.push(data.first_name);
                  $scope.userRelationship_last_name.push(data.last_name);
                  $scope.userRelationship_email.push(data.email);
                  $scope.userRelationship_contact_number.push(temp_contact_number);
                  $scope.userRelationship_phone_work.push(temp_phone_work);
                  $scope.userRelationship_mobile_number.push(temp_mobile_number);
                  $scope.userRelationship_verification.push(data.ack);
                  if($scope.countRelationships==$scope.loopCountRelationships){
                    $scope.hideLoader();
                    $scope.modalUserDetails.show();
                  }

                }).error(function(data){
                  $scope.hideLoader();
                  // ("getrelationship")
                });
            }
          }

        }).error(function(data){
          $scope.hideLoader();
          // ("getrelationships")
        });

    }).error(function(data){
      $scope.hideLoader();
      // ("getuserdetails")
    });
};


  $scope.closeRelationshipForm = function(){

    $scope.modalRelationship.hide();
    // this.relationship_data_first_name="";
    // this.relationship_data_last_name="";
    // this.relationship_data_type=$scope.options[1];
    // this.relationship_data_email="";
    // this.relationship_data_contact_number="";
    // this.data_ack_lbl="Pending";

  };

$scope.toggleRel=function(x,str){
  if(str=="display:none;")
    $scope.infoStyle[x]="display:block;";
  else
    $scope.infoStyle[x]="display:none;";
}

  $scope.rebuildRelationships = function(){

    if(localStorage.getItem("relationship_type")){

      $scope.relationship_id = localStorage.getItem("relationship_id").split(",");
      $scope.relationship_type = localStorage.getItem("relationship_type").split(",");
      $scope.relationship_sub_type = localStorage.getItem("relationship_sub_type").split(",");
      $scope.relationship_first_name = localStorage.getItem("relationship_first_name").split(",");
      $scope.relationship_last_name = localStorage.getItem("relationship_last_name").split(",");
      $scope.relationship_email = localStorage.getItem("relationship_email").split(",");
      $scope.relationship_contact_number = localStorage.getItem("relationship_contact_number").split(",");
      $scope.ack = localStorage.getItem("ack").split(",");
      $scope.relationship_existing_user = localStorage.getItem("existing_user").split(",");
      $scope.relationship_permissions = localStorage.getItem("permissions").split(",");
      $scope.relationship_permissions2 = localStorage.getItem("permissions2").split(",");
      $scope.relationship_permissions_label = [];
      $scope.relationship_permissions_label2 = [];
      $scope.infoStyle = [];

      for (var i = 0; i < $scope.relationship_permissions.length; i++){
        if((($scope.relationship_permissions[i]=="check_in_students")&&($scope.relationship_permissions2[i]=="edit_student"))||$scope.relationship_type[i].toUpperCase() == "PAYER"){
          $scope.relationship_permissions_label.push("Yes");
          $scope.relationship_permissions_label2.push("Yes");
        } 
        else{
          if($scope.relationship_permissions[i]=="check_in_students"){
            $scope.relationship_permissions_label.push("Yes");
            $scope.relationship_permissions_label2.push("No");
          }
          else if($scope.relationship_permissions2[i]=="edit_student"){
            $scope.relationship_permissions_label.push("No");
            $scope.relationship_permissions_label2.push("Yes");
          }
          else{
            $scope.relationship_permissions_label.push("No");
            $scope.relationship_permissions_label2.push("No");
          }
        }        
      }

      var relationship = localStorage.getItem("ack").split(",");
      var relationships = [];
      var colorStatus = [];
      var labels = [];
      var sub_labels = [];

      for (var i = 0; i < relationship.length; i++){
        relationships.push(i);
        $scope.infoStyle.push("display:none;");

        if($scope.relationship_type[i].toUpperCase()=="PAYER")
          labels.push("Payer");
        else if($scope.relationship_type[i].toUpperCase()=="EMERGENCY CONTACT")
          labels.push("Emergency Contact");
        else if($scope.relationship_type[i].toUpperCase()=="STUDENT" || $scope.relationship_type[i]=="RELATED STUDENT")
          labels.push("Student");
        else 
          labels.push("Other");

        if($scope.relationship_sub_type[i].toUpperCase()=="GUARDIAN")
          sub_labels.push("Guardian");
        else if($scope.relationship_sub_type[i].toUpperCase()=="FATHER")
          sub_labels.push("Father");
        else if($scope.relationship_sub_type[i].toUpperCase()=="MOTHER")
          sub_labels.push("Mother");
        else if($scope.relationship_sub_type[i].toUpperCase()=="HUSBAND")
          sub_labels.push("Husband");
        else if($scope.relationship_sub_type[i].toUpperCase()=="WIFE")
          sub_labels.push("Wife");
        else if($scope.relationship_sub_type[i].toUpperCase()=="SON")
          sub_labels.push("Son");
        else if($scope.relationship_sub_type[i].toUpperCase()=="DAUGTHER")
          sub_labels.push("Daugther");
        else if($scope.relationship_sub_type[i].toUpperCase()=="BROTHER")
          sub_labels.push("Brother");
        else if($scope.relationship_sub_type[i].toUpperCase()=="SISTER")
          sub_labels.push("Sister");
        else if($scope.relationship_sub_type[i].toUpperCase()=="UNCLE")
          sub_labels.push("Uncle");
        else if($scope.relationship_sub_type[i].toUpperCase()=="AUNT")
          sub_labels.push("Aunt");
        else if($scope.relationship_sub_type[i].toUpperCase()=="COUSIN")
          sub_labels.push("Cousin");
        else if($scope.relationship_sub_type[i].toUpperCase()=="NEPHEW")
          sub_labels.push("Nephew");
        else if($scope.relationship_sub_type[i].toUpperCase()=="NIECE")
          sub_labels.push("Niece");
        else if($scope.relationship_sub_type[i].toUpperCase()=="CLOSE FRIEND")
          sub_labels.push("Close Friend");
        else if($scope.relationship_sub_type[i].toUpperCase()=="PARENT")
          sub_labels.push("Parent");
        else if($scope.relationship_sub_type[i].toUpperCase()=="CHILDREN")
          sub_labels.push("Children");
        else if($scope.relationship_sub_type[i].toUpperCase()=="DEPENDENTS")
          sub_labels.push("Dependents");
        else{
          if ($scope.relationship_sub_type[i] == "OTHER")
            sub_labels.push("Other");
          else
            sub_labels.push("Other - "+$scope.relationship_sub_type[i]);
        }

        if($scope.ack[i]==1)
          colorStatus.push("balanced");
        else
          colorStatus.push("energized");
      }

      $scope.relationship_type_label=labels;
      $scope.relationship_sub_type_label=sub_labels;
      $scope.relationshipIndex=relationships;
      $scope.sub_headder_color=colorStatus;
      $scope.hideLoader();
    }
    else{
      $scope.relationship_id = [];
      $scope.relationship_type = [];
      $scope.relationship_sub_type = [];
      $scope.relationship_first_name = [];
      $scope.relationship_last_name = [];
      $scope.relationship_email = [];
      $scope.relationship_contact_number = [];
      $scope.ack = [];
      $scope.relationship_existing_user = [];
      $scope.relationship_permissions = [];
      $scope.relationship_permissions_label = [];
      $scope.infoStyle = [];
      $scope.hideLoader();
    }

  }



$scope.isAGuardian=function(){
    return localStorage.getItem("role_id")>5||localStorage.getItem("role_id")<4;
};

$scope.showClassesInMenu=function(){
    return localStorage.getItem("role_id")<=5;
};

$scope.isATeacher=function(){
    return localStorage.getItem("role_id")==4;
};

$scope.isASchoolStaff=function(){
    return localStorage.getItem("role_id")<=4;
};

// $scope.showRecord=function(){
//     return $scope.isATeacher()&&
// };

$scope.hideTMAUEnrolled=function(){
  if(localStorage.getItem("tmauEnrolled"))
    return localStorage.getItem("tmauEnrolled")==0;
  else
    return true;
};


$scope.hideRelationship=function(){
  if($scope.relationship_first_name==undefined)
    return false;
  else
    return !$scope.relationship_first_name.length<=0;

  // return $scope.styleNames.length<=0||$scope.styleNames.length==undefined;
};

  $ionicModal.fromTemplateUrl('templates/relationshipDetails.html',{
    scope: $scope
  }).then(function(modal){
    $scope.relationshipDetailsModal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeRelationshipDetails = function(){
    $scope.relationshipDetailsModal.hide();
  };


  $scope.relationshipDetailsShow = function(id){
    if(navigator.onLine){
      //$scope.showLoader();
      $scope.existing_user=localStorage.getItem("existing_user").split(",")[id];
          var str = localStorage.getItem('base_url')+"getuserdetails/"+$scope.getKey()+"/?userid="+$scope.existing_user;
          $http.get(str)
          .success(function(data){
            $scope.relationship_pic=localStorage.getItem('base_url')+data.picture;
            $scope.relationship_username = data['username'];
            $scope.relationship_is_lead = data['is_lead']
            $scope.relationship_isActive = data['isActive'];
          }).error(function(data){
            // ("getuserdetails")
          }); 
      $scope.relationshipDetailsId=id;
      $scope.relationshipDetailsModal.show();
      var attrib_ack = localStorage.getItem('ack').split(',');
      if(attrib_ack[id]==1){
        $scope.data_ack_lbl = "Approved";
      }
      else{
        $scope.data_ack_lbl = "Pending";
      }

      var attrib_relationship_first_name = localStorage.getItem("relationship_first_name").split(",");
      var attrib_relationship_last_name = localStorage.getItem("relationship_last_name").split(",");

      $scope.indexId=id;
      $scope.relationship_data_first_name = attrib_relationship_first_name[id];
      $scope.relationship_data_last_name = attrib_relationship_last_name[id];
      if (localStorage.getItem("existing_user").split(",")[id]!=null||localStorage.getItem("existing_user").split(",")[id]!='')
        $scope.checkValidCheckin(localStorage.getItem("existing_user").split(",")[id],id);
      else{
        $scope.isValidCandidate = false;
        $scope.isValidCandidate2 = false;
      }

document.getElementById("relationship_contact_number_lbl").innerHTML = localStorage.getItem("relationship_contact_number").split(",")[id];

    }
    else
      $scope.warning("Please check your internet connection.");
  };

//   $scope.relationshipFormId = function(id) {

//     if(navigator.onLine){
//       $scope.modalRelationship.show();
//       $scope.indexId=id;

//       var attrib_relationship_type = localStorage.getItem("relationship_type").split(",");
//       var attrib_relationship_sub_type = localStorage.getItem("relationship_sub_type").split(",");
//       var attrib_relationship_first_name = localStorage.getItem("relationship_first_name").split(",");
//       var attrib_relationship_last_name = localStorage.getItem("relationship_last_name").split(",");
//       var attrib_relationship_email = localStorage.getItem("relationship_email").split(",");
//       var attrib_relationship_contact_number = localStorage.getItem("relationship_contact_number").split(",");
//       var attrib_relationship_phone_work = localStorage.getItem("relationship_phone_work").split(",");
//       var attrib_relationship_mobile_number = localStorage.getItem("relationship_mobile_number").split(",");
//       var attrib_ack = localStorage.getItem('ack').split(',');

//       if(attrib_relationship_type[id]=="PAYER" || attrib_relationship_type[id]=="EMERGENCY CONTACT" || id==null){
//         $scope.mainOptions = [
//           {
//             name: 'Emergency Contact',
//             value: 'Emergency Contact'
//           },
//         ];
//         $scope.relationship_data_type = $scope.mainOptions[0];
//       }
//       else if(attrib_relationship_type[id]=="STUDENT" || attrib_relationship_type[id]=="RELATED STUDENT"){
//         $scope.mainOptions = [
//           {
//             name: 'Student',
//             value: 'Student'
//           },
//         ];
//         $scope.relationship_data_type = $scope.mainOptions[0];
//       }
//       else{
//           $scope.mainOptions = [

//           {
//             name: 'Emergency Contact',
//             value: 'Emergency Contact'
//           },
//           {
//             name: 'Other - '+attrib_relationship_type[id],
//             value: 'Other'
//           },
//         ];
//         $scope.relationship_data_type = $scope.mainOptions[1];
//       }

// $scope.options = [
//         {
//           name: 'Guardian',
//           value: 'Guardian'
//         }, 
//         {
//           name: 'Father',
//           value: 'Father'
//         },
//         {
//           name: 'Mother',
//           value: 'Mother'
//         }, 
//         {
//           name: 'Husband',
//           value: 'Husband'
//         }, 
//         {
//           name: 'Wife',
//           value: 'Wife'
//         }, 
//         {
//           name: 'Son',
//           value: 'Son'
//         }, 
//         {
//           name: 'Daugther',
//           value: 'Daugther'
//         }, 
//         {
//           name: 'Brother',
//           value: 'Brother'
//         }, 
//         {
//           name: 'Sister',
//           value: 'Sister'
//         }, 
//         {
//           name: 'Uncle',
//           value: 'Uncle'
//         }, 
//         {
//           name: 'Aunt',
//           value: 'Aunt'
//         }, 
//         {
//           name: 'Cousin',
//           value: 'Cousin'
//         }, 
//         {
//           name: 'Nephew',
//           value: 'Nephew'
//         }, 
//         {
//           name: 'Niece',
//           value: 'Niece'
//         }, 
//         {
//           name: 'Close Friend',
//           value: 'Close Friend'
//         }, 
//         {
//           name: 'Other',
//           value: 'Other'
//         },
//       ];

//       if(attrib_relationship_sub_type[id]=="GUARDIAN")
//         $scope.relationship_data_sub_type = $scope.options[0];
//       else if(attrib_relationship_sub_type[id]=="FATHER")
//         $scope.relationship_data_sub_type = $scope.options[1];
//       else if(attrib_relationship_sub_type[id]=="MOTHER")
//         $scope.relationship_data_sub_type = $scope.options[2];
//       else if(attrib_relationship_sub_type[id]=="HUSBAND")
//         $scope.relationship_data_sub_type = $scope.options[3];
//       else if(attrib_relationship_sub_type[id]=="Wife")
//         $scope.relationship_data_sub_type = $scope.options[4];
//       else if(attrib_relationship_sub_type[id]=="SON")
//         $scope.relationship_data_sub_type = $scope.options[5];
//       else if(attrib_relationship_sub_type[id]=="DAUGTHER")
//         $scope.relationship_data_sub_type = $scope.options[6];
//       else if(attrib_relationship_sub_type[id]=="BROTHER")
//         $scope.relationship_data_sub_type = $scope.options[7];
//       else if(attrib_relationship_sub_type[id]=="SISTER")
//         $scope.relationship_data_sub_type = $scope.options[8];
//       else if(attrib_relationship_sub_type[id]=="UNCLE")
//         $scope.relationship_data_sub_type = $scope.options[9];
//       else if(attrib_relationship_sub_type[id]=="AUNT")
//         $scope.relationship_data_sub_type = $scope.options[10];
//       else if(attrib_relationship_sub_type[id]=="COUSIN")
//         $scope.relationship_data_sub_type = $scope.options[11];
//       else if(attrib_relationship_sub_type[id]=="NEPHEW")
//         $scope.relationship_data_sub_type = $scope.options[12];
//       else if(attrib_relationship_sub_type[id]=="NIECE")
//         $scope.relationship_data_sub_type = $scope.options[13];
//       else if(attrib_relationship_sub_type[id]=="CLOSE FRIEND")
//         $scope.relationship_data_sub_type = $scope.options[14];
//       else{
//         $scope.options = [
//         {
//           name: 'Guardian',
//           value: 'Guardian'
//         }, 
//         {
//           name: 'Father',
//           value: 'Father'
//         },
//         {
//           name: 'Mother',
//           value: 'Mother'
//         }, 
//         {
//           name: 'Husband',
//           value: 'Husband'
//         }, 
//         {
//           name: 'Wife',
//           value: 'Wife'
//         }, 
//         {
//           name: 'Son',
//           value: 'Son'
//         }, 
//         {
//           name: 'Daugther',
//           value: 'Daugther'
//         }, 
//         {
//           name: 'Brother',
//           value: 'Brother'
//         }, 
//         {
//           name: 'Sister',
//           value: 'Sister'
//         }, 
//         {
//           name: 'Uncle',
//           value: 'Uncle'
//         }, 
//         {
//           name: 'Aunt',
//           value: 'Aunt'
//         }, 
//         {
//           name: 'Cousin',
//           value: 'Cousin'
//         }, 
//         {
//           name: 'Nephew',
//           value: 'Nephew'
//         }, 
//         {
//           name: 'Niece',
//           value: 'Niece'
//         }, 
//         {
//           name: 'Close Friend',
//           value: 'Close Friend'
//         }, 
//         {
//           name: 'Other - '+attrib_relationship_sub_type[id],
//           value: 'Other'
//         },
//       ];
//         $scope.relationship_data_sub_type = $scope.options[15];
//       }

//       $scope.addProperties="";
//       $scope.relationship_data_first_name = attrib_relationship_first_name[id];
//       $scope.relationship_data_last_name = attrib_relationship_last_name[id];
//       $scope.relationship_data_email = attrib_relationship_email[id];
//       $scope.relationship_data_contact_number = attrib_relationship_contact_number[id];
//       $scope.relationship_data_phone_work = attrib_relationship_phone_work[id];
//       $scope.relationship_data_mobile_number = attrib_relationship_mobile_number[id];

//       if(attrib_ack[id]==1){
//         $scope.data_ack_lbl = "Approved";
//       }
//       else{
//         $scope.data_ack_lbl = "Pending";
//       }

//     }
//     else
//       $scope.warning("Please check your internet connection.");
//   };


  $scope.isRelationshipApproved=function(id){
    var attrib_ack = localStorage.getItem('ack').split(',');
    return attrib_ack[id]==1;
  };

  $ionicModal.fromTemplateUrl('templates/relationshipAddExistingForm.html',{
    scope: $scope
  }).then(function(modal) {
    $scope.modalAddExistingRelationship = modal;
  });

$scope.closeAddExistingRelationship=function(){
  $scope.modalAddExistingRelationship.hide();
};

   $scope.relationshipForm = function(id,first_name,last_name,email,contact_number,phone_work,mobile_number) {
      if(navigator.onLine){

      $scope.mainOptions = [
        {
          name: 'Emergency Contact',
          value: 'Emergency Contact'
        },
      ];

      $scope.options = [
        {
          name: 'Guardian',
          value: 'Guardian'
        }, 
        {
          name: 'Father',
          value: 'Father'
        },
        {
          name: 'Mother',
          value: 'Mother'
        }, 
        {
          name: 'Husband',
          value: 'Husband'
        }, 
        {
          name: 'Wife',
          value: 'Wife'
        }, 
        {
          name: 'Son',
          value: 'Son'
        }, 
        {
          name: 'Daugther',
          value: 'Daugther'
        }, 
        {
          name: 'Brother',
          value: 'Brother'
        }, 
        {
          name: 'Sister',
          value: 'Sister'
        }, 
        {
          name: 'Uncle',
          value: 'Uncle'
        }, 
        {
          name: 'Aunt',
          value: 'Aunt'
        }, 
        {
          name: 'Cousin',
          value: 'Cousin'
        }, 
        {
          name: 'Nephew',
          value: 'Nephew'
        }, 
        {
          name: 'Niece',
          value: 'Niece'
        }, 
        {
          name: 'Close Friend',
          value: 'Close Friend'
        }, 
        // {
        //   name: 'Other',
        //   value: 'Other'
        // },
      ];

      $scope.modalAddExistingRelationship.show();
      $scope.relationship_add_first_name=first_name; 
      $scope.relationship_add_last_name=last_name;
      $scope.relationship_add_type=$scope.mainOptions[0];
      $scope.relationship_add_sub_type=$scope.options[0];
      $scope.relationship_add_email=email;
      $scope.relationship_add_contact_number=contact_number;
      $scope.relationship_add_phone_work=phone_work;
      $scope.relationship_add_mobile_number=mobile_number;
      $scope.readonlyRelationshipFields=true;
      $scope.userRelationshipId=id;
    }
    else
      $scope.warning("Please check your internet connection.");
  };


// $scope.disableUpdateRelationshipBtn

  $scope.doRelationshipForm = function() {

    if(navigator.onLine){
      var re = /\S+@\S+\.\S+/;
      if(this.relationship_data_first_name==null || this.relationship_data_last_name==null || this.relationship_data_email==null || this.relationship_data_contact_number==null || this.relationship_data_contact_number==null || this.relationship_data_contact_number==null ||this.relationship_data_first_name=="" || this.relationship_data_last_name=="" || this.relationship_data_email=="" || this.relationship_data_contact_number=="")
        $scope.warning("All fields marked with asterisk are required.");
      else if((!re.test(this.relationship_data_email)))
        $scope.warning("Valid email Required.");
      else{
        var str = "";
        var tempIndex=this.indexId;
        var tempRelationship_type=this.relationship_data_type['value'];
        var tempRelationship_sub_type=this.relationship_data_sub_type['value'];

        var access_permissions = "";
        if(this.relationship_data_enable_checkin==true || (this.relationship_data_type['value'].toUpperCase()=="PAYER"))
          access_permissions = "&access_permissions[]=check_in_students&access_permissions[]=edit_student";

        var temprep = '';
        if (this.relationship_data_sub_type['value'].indexOf('Other - ') >= 0)
          this.relationship_data_sub_type['value'] = this.relationship_data_sub_type['value'].substr(0,this.relationship_data_sub_type['value'].indexOf('Other - '))+temprep+this.relationship_data_sub_type['value'].substr(this.relationship_data_sub_type['value'].indexOf('Other - ')+('Other - '.length));
        else if (this.relationship_data_sub_type['value'].toUpperCase().indexOf('OTHER - ') >= 0)
          this.relationship_data_sub_type['value'] = this.relationship_data_sub_type['value'].substr(0,this.relationship_data_sub_type['value'].indexOf('OTHER - '))+temprep+this.relationship_data_sub_type['value'].substr(this.relationship_data_sub_type['value'].indexOf('OTHER - ')+('OTHER - '.length));

        //str = localStorage.getItem('base_url')+"api/updaterelationship/"+$scope.getKey()+"/"+localStorage.getItem("relationship_id").split(",")[this.indexId]+"?type="+this.relationship_data_type['value']+"&sub_type="+this.relationship_data_sub_type['value']+"&first_name="+this.relationship_data_first_name+"&last_name="+this.relationship_data_last_name+"&email="+this.relationship_data_email+"&contact_number="+this.relationship_data_contact_number+access_permissions;

        //$scope.showLoader();
        $http.get(str)
        .success(function(data){
          var attrib_relationship_type = localStorage.getItem("relationship_type").split(",");
          var attrib_relationship_sub_type = localStorage.getItem("relationship_sub_type").split(",");
          var attrib_permissions = localStorage.getItem("permissions").split(",");
          var attrib_permissions2 = localStorage.getItem("permissions2").split(",");
          attrib_relationship_type[tempIndex]=tempRelationship_type;
          attrib_relationship_sub_type[tempIndex]=tempRelationship_sub_type;

          if(access_permissions=="")
            attrib_permissions[tempIndex]="";
          else
            attrib_permissions[tempIndex]="check_in_students";

          localStorage.setItem("relationship_type",attrib_relationship_type);
          localStorage.setItem("relationship_sub_type",attrib_relationship_sub_type);
          localStorage.setItem("permissions",attrib_permissions);
          localStorage.setItem("permissions2",attrib_permissions2);
          $scope.rebuildRelationships();

          $scope.closeRelationshipForm(); 
          $scope.closeRelationshipDetails();
    
          $timeout(function(){
            if(data.status=="success"){
              $scope.hideLoader();
              $scope.success("Successfully Updated.");
              $scope.gotoRelationships();
              // $scope.closeRelationshipForm();
            }
            else{
              $scope.hideLoader();
              $scope.error("Failed to Update Relationship.Try Again Later.");
            }
          }, 1000);
        })
        .error(function(data){
          $scope.hideLoader();
          $scope.error("Failed to Update Relationship.Try Again Later.");
        }); 
        }
      }
      else{
        $scope.hideLoader();
        $scope.error("Please check your Internet connection. Try Again Later.");
      }
  };


  $ionicModal.fromTemplateUrl('templates/relationshipAddForm.html',{
    scope: $scope
  }).then(function(modal) {
    $scope.modalAddRelationship = modal;
  });

  $scope.closeRelationshipAddForm = function(){
    $scope.modalAddRelationship.hide();
    // this.relationship_add_first_name="";
    // this.relationship_add_last_name="";
    // this.relationship_add_type=this.options[0];
    // this.relationship_add_email="";
    // this.relationship_add_contact_number="";

  };

    // Open the login modal
  $scope.relationshipAddForm = function(id) { 

    if(navigator.onLine){

      $scope.mainOptions = [
        {
          name: 'Emergency Contact',
          value: 'Emergency Contact'
        },
      ];

      $scope.options = [
        {
          name: 'Guardian',
          value: 'Guardian'
        }, 
        {
          name: 'Father',
          value: 'Father'
        },
        {
          name: 'Mother',
          value: 'Mother'
        }, 
        {
          name: 'Husband',
          value: 'Husband'
        }, 
        {
          name: 'Wife',
          value: 'Wife'
        }, 
        {
          name: 'Son',
          value: 'Son'
        }, 
        {
          name: 'Daugther',
          value: 'Daugther'
        }, 
        {
          name: 'Brother',
          value: 'Brother'
        }, 
        {
          name: 'Sister',
          value: 'Sister'
        }, 
        {
          name: 'Uncle',
          value: 'Uncle'
        }, 
        {
          name: 'Aunt',
          value: 'Aunt'
        }, 
        {
          name: 'Cousin',
          value: 'Cousin'
        }, 
        {
          name: 'Nephew',
          value: 'Nephew'
        }, 
        {
          name: 'Niece',
          value: 'Niece'
        }, 
        {
          name: 'Close Friend',
          value: 'Close Friend'
        }, 
        // {
        //   name: 'Other',
        //   value: 'Other'
        // },
      ];
      // $scope.relationship_countryNameOptions=localStorage.getItem("listedCountryNames").split(",");
      // $scope.relationship_countryIdOptions=localStorage.getItem("listedCountryIds").split(",");

      // var defaultCountry = 0;
      //   $scope.relationship_countryOptions = [];

      // for (var i = $scope.relationship_countryNameOptions.length-1; i >= 0 ; i--){
      //     $scope.relationship_countryOptions.push({
      //       name: $scope.relationship_countryNameOptions[i],
      //       id: $scope.relationship_countryIdOptions[i]
      //     })

      //     if($scope.relationship_countryNameOptions[i]==localStorage.getItem("country"))
      //         defaultCountry=Math.abs($scope.relationship_countryNameOptions.length-1-i);
      // }

      // $scope.relationship_add_country=$scope.relationship_countryOptions[defaultCountry];

      // $scope.relationship_allStateNames=localStorage.getItem("listedStateNames").split(",");
      // $scope.relationship_allStateIds=localStorage.getItem("listedStateIds").split(",");

      // var defaultState = 0;
      // var c=0;
      // $scope.relationship_stateOptions = [];
      // for (var i = $scope.relationship_allStateNames.length-1; i >= 0; i--) {
      //   if($scope.relationship_allStateIds[i]==$scope.relationship_add_country.id){
      //     c++;
      //     $scope.relationship_stateOptions.push({
      //       name: $scope.relationship_allStateNames[i],
      //       id: $scope.relationship_allStateIds[i]
      //     })
      //     }
      //     if($scope.relationship_allStateNames[i]==localStorage.getItem("state"))
      //       defaultState=c-1;
      // }

      // $scope.relationship_add_state=$scope.relationship_stateOptions[defaultState];

      // $scope.relationshipChangeCountry = function() {

      //   $scope.relationship_stateOptions = [];

      //   $scope.relationship_stateOptions.push({
      //     name: "Select State",
      //     id: ""
      //   })

      //   for (var i = $scope.relationship_allStateNames.length-1; i >= 0; i--) {
      //     if($scope.relationship_allStateIds[i]==this.relationship_add_country.id)
      //       $scope.relationship_stateOptions.push({
      //         name: $scope.relationship_allStateNames[i],
      //         id: $scope.relationship_allStateIds[i]
      //       })
      //   }

      //   $scope.relationship_add_state=$scope.relationship_stateOptions[0];
      // };

      $scope.modalAddRelationship.show();
      $scope.relationship_add_first_name="";
      $scope.relationship_add_last_name="";
      // $scope.relationship_data_main_type=$scope.mainOptions[0];
      // $scope.relationship_add_type=$scope.options[0];
      $scope.relationship_add_type=$scope.mainOptions[0];
      $scope.relationship_add_sub_type=$scope.options[0];
      $scope.relationship_enable_checkin=false;
      // $scope.relationship_enable_edit=false;
      $scope.relationship_add_email="";
      $scope.relationship_add_contact_number="";
      $scope.readonlyRelationshipFields=false;
      $scope.userRelationshipId=null;

    }
    else
      $scope.warning("Please check your internet connection.");
  };
  $scope.changeType = function(){
    if ((this.relationship_add_type['value']=="Payer")) {
      this.relationship_enable_checkin = true;
      // this.relationship_enable_edit = true;
      $scope.warning("Payers can control the student's checkin and profile by default.")
    }
     
  }

  $scope.add_existing_btn="";
  $scope.add_non_existing_user_btn="";
  $scope.disableAddRelationshipBtn = function(){
    $scope.add_existing_btn="disable";
    $scope.add_non_existing_user_btn="disable";
  };

  $scope.addRelationship = function() {
    var id = $scope.userRelationshipId;

    if(navigator.onLine){
      var re = /\S+@\S+\.\S+/;
      var ok = true;
      if (localStorage.getItem("relationship_first_name")){

        var temp_first_name = localStorage.getItem("relationship_first_name").split(",");
        var temp_last_name = localStorage.getItem("relationship_last_name").split(",");
        var temp_email = localStorage.getItem("relationship_email").split(",");

        for (var i = 0; temp_first_name.length > i; i++) {
          if(temp_first_name[i].toUpperCase()==this.relationship_add_first_name.toUpperCase() && temp_last_name[i].toUpperCase()==this.relationship_add_last_name.toUpperCase()){
           ok = false;
           break;
         }
        }
      }

      if(this.relationship_add_first_name==null || this.relationship_add_last_name==null || this.relationship_add_email==null || this.relationship_add_contact_number==null ||this.relationship_add_first_name=="" || this.relationship_add_last_name=="" || this.relationship_add_email=="" || this.relationship_add_contact_number==""){
        $scope.add_existing_btn="";
        $scope.add_non_existing_user_btn="";
        $scope.warning("All fields are Required.");
      }
      else if((!re.test(this.relationship_add_email))){
        $scope.add_existing_btn="";
        $scope.add_non_existing_user_btn="";
        $scope.warning("Valid email Required.");
      }
      else if (!ok) {
        $scope.add_existing_btn="";
        $scope.add_non_existing_user_btn="";
        $scope.warning("This person already listed in your relationships.");
      }
      else{
         var str = "";
         // //$scope.showLoader();
         var type = this.relationship_add_type['name'];
         var name = this.relationship_add_last_name+" "+this.relationship_add_first_name;
         var access_permissions = "";

        if (id==null){
          if((this.relationship_enable_checkin) || (this.relationship_add_type['value'].toUpperCase()=="PAYER")){
            access_permissions = "&access_permissions[]=check_in_students&access_permissions[]=edit_student";
          }
          else{
            if(this.relationship_enable_checkin)
              access_permissions = "&access_permissions[]=check_in_students&access_permissions[]=edit_student";

            else
              access_permissions = "";

          }

            str =localStorage.getItem('base_url')+"api/addrelationship/"+$scope.getKey()+"?type=Emergency Contact&sub_type="+this.relationship_add_sub_type['value']+"&student_id="+localStorage.getItem("userId")+"&first_name="+this.relationship_add_first_name+"&last_name="+this.relationship_add_last_name+"&email="+this.relationship_add_email+"&contact_number="+this.relationship_add_contact_number+"&ack="+0+access_permissions;
          }
        else{
          if((this.relationship_enable_checkin) || (this.relationship_add_type['value'].toUpperCase()=="PAYER")){
            access_permissions = "&access_permissions[]=check_in_students&access_permissions[]=edit_student";
          }
          else{
            if(this.relationship_enable_checkin)
              access_permissions = "&access_permissions[]=check_in_students&access_permissions[]=edit_student";

            else
              access_permissions = "";
          }
              str = localStorage.getItem('base_url')+"api/addrelationship/"+$scope.getKey()+"?type=Emergency Contact&sub_type="+this.relationship_add_sub_type['value']+"&student_id="+localStorage.getItem("userId")+"&first_name="+this.relationship_add_first_name+"&last_name="+this.relationship_add_last_name+"&email="+this.relationship_add_email+"&contact_number="+this.relationship_add_contact_number+"&ack="+0+"&existing_user="+id+access_permissions;
        }


        //$scope.showLoader();
        $http.get(str)
        .success(function(data){
          $scope.add_existing_btn="";
          $scope.add_non_existing_user_btn="";
            if(data.status=="success"){
                localStorage.removeItem("relationship_type");
                localStorage.removeItem("relationship_sub_type");
                localStorage.removeItem("relationship_first_name");
                localStorage.removeItem("relationship_last_name");
                localStorage.removeItem("relationship_email");
                localStorage.removeItem("relationship_contact_number");
                localStorage.removeItem("ack");
                localStorage.removeItem("relationship_id");
                localStorage.removeItem("existing_user");
                localStorage.removeItem("permissions");
                localStorage.removeItem("permissions2");
                $scope.userSearchList=[];
                $scope.setUpRelationshipDetails();
                if($scope.modalAddExistingRelationship)
                  $scope.modalAddExistingRelationship.hide();

                if($scope.modalAddRelationship)
                  $scope.modalAddRelationship.hide();

                if($scope.searchUserModal)
                  $scope.searchUserModal.hide();
                $timeout(function(){
                  $scope.hideLoader();
                  $scope.success("Successfully Sent a Confirmation Email.");
                }, 1000);
            }
            else{
              $scope.warning(data.message);
              $scope.hideLoader();
            }
          })
          .error(function(data){
            $scope.hideLoader();
            $scope.add_existing_btn="";
            $scope.add_non_existing_user_btn="";
            $scope.error("Failed to Add Relationship. Try Again Later.");
            // $scope.error(data);
          });
        }
      }
      else{
        $scope.add_existing_btn="";
        $scope.add_non_existing_user_btn="";
        $scope.hideLoader();
        $scope.error("Please check your Internet connection. Try Again Later.");
      }
  };

   $scope.confirmRemoveRelationship = function(name,index) {
   var confirmPopup = $ionicPopup.confirm({
     title: 'Are you sure?',
     template: '<center>Delete '+name+'?</center>'
   });

   confirmPopup.then(function(res){
    if(navigator.onLine){
       if(res) {
        //$scope.showLoader();
        $http.get(localStorage.getItem('base_url')+"api/removerelationship/"+$scope.getKey()+"/"+localStorage.getItem("relationship_id").split(",")[index])
          .success(function(data){

            var attrib_relationship_type = localStorage.getItem("relationship_type").split(",");
            var attrib_relationship_sub_type = localStorage.getItem("relationship_sub_type").split(",");
            var attrib_relationship_first_name = localStorage.getItem("relationship_first_name").split(",");
            var attrib_relationship_last_name = localStorage.getItem("relationship_last_name").split(",");
            var attrib_relationship_email = localStorage.getItem("relationship_email").split(",");
            var attrib_relationship_contact_number = localStorage.getItem("relationship_contact_number").split(",");
            var attrib_ack = localStorage.getItem('ack').split(',');
            var attrib_relationship_id = localStorage.getItem("relationship_id").split(",");
            var attrib_relationship_existing_user = localStorage.getItem("existing_user").split(",");
            var attrib_relationship_permissions = localStorage.getItem("permissions").split(",");
            var attrib_relationship_permissions2 = localStorage.getItem("permissions2").split(",");

            attrib_relationship_type.splice(index, 1);
            attrib_relationship_sub_type.splice(index, 1);
            attrib_relationship_first_name.splice(index, 1);
            attrib_relationship_last_name.splice(index, 1);
            attrib_relationship_email.splice(index, 1);
            attrib_relationship_contact_number.splice(index, 1);
            attrib_ack.splice(index, 1);
            attrib_relationship_id.splice(index, 1);
            attrib_relationship_existing_user.splice(index, 1);
            attrib_relationship_permissions.splice(index, 1);
            attrib_relationship_permissions2.splice(index, 1);

          if(data.status =="success"){

              localStorage.setItem("relationship_type",attrib_relationship_type);
              localStorage.setItem("relationship_sub_type",attrib_relationship_sub_type);
              localStorage.setItem("relationship_first_name",attrib_relationship_first_name);
              localStorage.setItem("relationship_last_name",attrib_relationship_last_name);
              localStorage.setItem("relationship_email",attrib_relationship_email);
              localStorage.setItem("relationship_contact_number",attrib_relationship_contact_number);
              localStorage.setItem('ack',attrib_ack);
              localStorage.setItem('relationship_id',attrib_relationship_id);
              localStorage.setItem('existing_user',attrib_relationship_existing_user);
              localStorage.setItem('permissions',attrib_relationship_permissions);
              localStorage.setItem('permissions2',attrib_relationship_permissions2);

              $scope.rebuildRelationships();
              $scope.closeRelationshipForm();
              $scope.closeRelationshipDetails();
              // $scope.gotoRelationships();
              
              $timeout(function(){
                $scope.hideLoader();
                $scope.success("Successfully Removed Relationship.");
              }, 1000);
            }
            else{
              $scope.closeRelationshipForm();
              $scope.closeRelationshipDetails();
              $timeout(function(){
                $scope.hideLoader();
                $scope.error(data.message);
              }, 1000);
            }
          })
          .error(function(data){
            $scope.hideLoader();
            $scope.error("Failed to Remove Relationship. Try Again Later.");
          });
       }

     }else{
        $scope.hideLoader();
        $scope.error("Please check your Internet connection. Try Again Later.");
     }
   });
 };

$scope.deleteRelationshipForm= function() {
  if(navigator.onLine){
    var temp = localStorage.getItem("relationship_type").split(",");
    if (localStorage.getItem("relationship_type").split(",")[this.indexId].toUpperCase()=="PAYER" && localStorage.getItem('ack').split(',')[this.indexId]=='1') {
      $scope.warning("Unable to remove Payer.");
    }
    else
      $scope.confirmRemoveRelationship(this.relationship_data_first_name+" "+this.relationship_data_last_name,this.indexId);
  }
  else{
    $scope.error("Please check your Internet connection.");
  }
};


 //$scope.email=localStorage.getItem("email");
//  $scope.username=localStorage.getItem("username");
// })


// .controller('UserDetailsCtrl',function($scope, $http){

$scope.milTime2regTime= function(time, date){

      var timein=time;
      var startdate= date;

      timein=new Date(startdate+" "+timein);
      var hours = timein.getHours();
      var minutes = timein.getMinutes().toString();
      var ampm = "AM";

      if(hours>12){
      hours=hours-12;
        ampm="PM";
      }
      else if(hours==12)
        ampm="NN";
      else if(hours==24||hours==00)
        ampm="MN";

      hours=hours.toString();

      if(hours.length<2)
        hours="0"+hours;

      if(minutes.length<2)
        minutes="0"+minutes;

      return (hours+":"+minutes+" "+ampm);
};

// $scope.jsonStringStuff="";

// $scope.stringifyStuff=function(){
// var string = {userid: '123', type: 3};
// $scope.jsonStringStuff=JSON.stringify(string);
// };

$scope.test = function(){
  if(navigator.onLine)
  $scope.maintenancePageModal.show();
};

  $scope.showAllClasses=false;
  $scope.showSearchClasses=true;
  $scope.showNoResults=true;
  $scope.searchedClasses="";
$scope.checkedin=false;
  $scope.searchForAClass=function(){

    $scope.searchedClasses=this.searchedClasses;

    $scope.searchClasss = [];
    for (var i = 0; i < $scope.classs.length; i++) {
      if($scope.classs[i]['name'].toUpperCase().match($scope.searchedClasses.toUpperCase())){
        $scope.searchClasss.push({
          id: $scope.classs[i]['id'],
          name: $scope.classs[i]['name'],
          time_in: $scope.classs[i]['time_in'],
          time_out: $scope.classs[i]['time_out'],
          scheduleId: $scope.classs[i]['scheduleId'],
          location: $scope.classs[i]['location'],
          // styleName:$scope.classs[i]['styleName'],
          checkedIn: $scope.classs[i]['checkedIn'],
          trueOrFalse: $scope.classs[i]['trueOrFalse'],
          reserved: $scope.classs[i]['reserved'],
        })
      }
    }


    if($scope.searchClass.length>0||$scope.searchedClasses==""){
      $scope.showAllClasses=false;
      $scope.showSearchClasses=true;
      $scope.showNoResults=true;
    }
    else if($scope.searchClasss.length==0 && $scope.searchedClasses!=""){
      $scope.showAllClasses=true;
      $scope.showSearchClasses=false;
      $scope.showNoResults=false;
    }
    else{
      $scope.showAllClasses=true;
      $scope.showSearchClasses=false;
      $scope.showNoResults=true;
    }
  };
  
  $scope.classs = [];
  $scope.searchClass = [];

$scope.pressedMoreClasses=false;
$scope.loadMoreClasses = function(){

  $scope.classs=[];
  if(navigator.onLine){
    var str2 = "";
    str2 = localStorage.getItem('base_url')+"api/getClassesForToday/"+$scope.getKey()+"/"+$scope.selected_schoolId+"?user_id="+localStorage.getItem("userId");
    $scope.showLoader();
    $http.get(str2)
    .success(function(data){
      $scope.hideLoader();
      $scope.pressedMoreClasses = true;
      $scope.class_restriction_enabled = "";
      $scope.searchClasss = [];
      $scope.classs=[];
      var tempAttendances=[];
      var temp_schedule_ids=[];

      for (var i = 0; i < data['reserve_classes'].length; i++) {
        temp_schedule_ids.push(data['reserve_classes'][i]['schedule_id'])
      }

      for (var i = 0; i < data['attendances'].length; i++) {
        if(data['attendances'][i]['user_id']==localStorage.getItem("userId"))
        tempAttendances.push(data['attendances'][i]['dojoclass_schedule_id'])
      }


      for (var i = 0; i < data['classes'].length; i++) {
        if (data['classes'][i]['schedules_today'].length>=1) {
          for (var x = data['classes'][i]['schedules_today'].length - 1; x >= 0; x--) {
            var id = data['classes'][i]['id'];
            var name = data['classes'][i]['name'];

            var time_in = data['classes'][i]['schedules_today'][x]['time_in'];
            time_in = time_in.split(":");
            if(time_in.length>0)
              time_in = time_in[0]+":"+time_in[1];
                
            var time_out = data['classes'][i]['schedules_today'][x]['time_out'];
            time_out = time_out.split(":");
            if(time_out.length>0)
            time_out = time_out[0]+":"+time_out[1];
            // var styleName = $scope.getStyle(data['classes'][i]['timetable']['id'],$scope.classs.length);
            // var startdate = data['classes'][i]['startdate'];
            var trueOrFalse = false;
            // var schedules = data['classes'][i]['schedules'];
            var scheduleId = data['classes'][i]['schedules_today'][x]['id'];
            var location = data['classes'][i]['schedules_today'][x]['area']['area_name'];

            var reserved = false;
            if (temp_schedule_ids) {
              for (var k = 0; k < temp_schedule_ids.length; k++) {
                if(scheduleId==temp_schedule_ids[k]){
                  reserved=true;
                  break;
                }
              }
            }


            if (tempAttendances.indexOf(data['classes'][i]['schedules_today'][x]['id'])!=-1) {
              trueOrFalse = true;
            }


            $scope.classs.push({
            id:   id,
            name: name,
            time_in: time_in,
            time_out: time_out,
            scheduleId: scheduleId,
            location: location,
            // styleName: styleName,
            checkedIn: "button-balanced",
            trueOrFalse: trueOrFalse,
            reserved: reserved
            });
          
          }
        }
      }
        if ($scope.classs){

        $scope.temp_classs=[];
              $scope.temp_classs.push({
              id:   $scope.classs[0]['id'],
              name: $scope.classs[0]['name'],
              time_in: $scope.classs[0]['time_in'],
              time_out: $scope.classs[0]['time_out'],
              scheduleId: $scope.classs[0]['scheduleId'],
              location: $scope.classs[0]['location'],
              // styleName: styleName,
              checkedIn: $scope.classs[0]['checkedIn'],
              trueOrFalse: $scope.classs[0]['trueOrFalse'],
              reserved: $scope.classs[0]['reserved']
              });

        for (var a = 0; a < $scope.classs.length; a++){
              $scope.temp_classs[0]['id'] = $scope.classs[a]['id'];
              $scope.temp_classs[0]['name'] = $scope.classs[a]['name'];
              $scope.temp_classs[0]['time_in'] = $scope.classs[a]['time_in'];
              $scope.temp_classs[0]['time_out'] = $scope.classs[a]['time_out'];
              $scope.temp_classs[0]['scheduleId'] = $scope.classs[a]['scheduleId'];
              $scope.temp_classs[0]['location'] = $scope.classs[a]['location'];
              $scope.temp_classs[0]['checkedIn'] = $scope.classs[a]['checkedIn'];
              $scope.temp_classs[0]['trueOrFalse'] = $scope.classs[a]['trueOrFalse'];
              $scope.temp_classs[0]['reserved'] = $scope.classs[a]['reserved'];

          for (var b = 0; b < temp_schedule_ids.length; b++){
            if ($scope.classs[a]['reserved']==true && ($scope.classs[a]['scheduleId'] == temp_schedule_ids[b])) {
              $scope.classs[a]['id'] = $scope.classs[b]['id'];
              $scope.classs[a]['name'] = $scope.classs[b]['name'];
              $scope.classs[a]['time_in'] = $scope.classs[b]['time_in'];
              $scope.classs[a]['time_out'] = $scope.classs[b]['time_out'];
              $scope.classs[a]['scheduleId'] = $scope.classs[b]['scheduleId'];
              $scope.classs[a]['location'] = $scope.classs[b]['location'];
              $scope.classs[a]['checkedIn'] = $scope.classs[b]['checkedIn'];
              $scope.classs[a]['trueOrFalse'] = $scope.classs[b]['trueOrFalse'];
              $scope.classs[a]['reserved'] = $scope.classs[b]['reserved'];

              $scope.classs[b]['id'] = $scope.temp_classs[0]['id'];
              $scope.classs[b]['name'] = $scope.temp_classs[0]['name'];
              $scope.classs[b]['time_in'] = $scope.temp_classs[0]['time_in'];
              $scope.classs[b]['time_out'] = $scope.temp_classs[0]['time_out'];
              $scope.classs[b]['scheduleId'] = $scope.temp_classs[0]['scheduleId'];
              $scope.classs[b]['location'] = $scope.temp_classs[0]['location'];
              $scope.classs[b]['checkedIn'] = $scope.temp_classs[0]['checkedIn'];
              $scope.classs[b]['trueOrFalse'] = $scope.temp_classs[0]['trueOrFalse'];
              $scope.classs[b]['reserved'] = $scope.temp_classs[0]['reserved'];
            }
          }
        }
      }

$scope.hideLoader();

  }).error(function(data){
    $scope.hideLoader();
  });
  }
  else{
    $scope.hideLoader();
        $scope.classs.push({
        id:   0,
        name: "Please Connect to the Internet.",
        time_in: " ",
        time_out: " ",
        // styleName: " ",
        checkedIn: "button-balanced hide",
        trueOrFalse: false,
        reserved: false
      })
  }

};

$scope.loadClasses = function(schoolId){
  $scope.selected_schoolId = schoolId;
  $scope.see_more_classes = false;
  $scope.classs=[];
  if(navigator.onLine){

    var str = localStorage.getItem('base_url')+"api/getschooldetails/"+$scope.getKey()+"/"+schoolId;

        $http.get(str)
        .success(function(data){

          $scope.class_restriction_enabled = false;
          $scope.class_restriction_msg = "You are trying to check in to a class that is not reserve for you. Please see your instructor for advice.";
            
          if (data['class_restriction']){
              if (data['class_restriction']['enable']==1){
              $scope.class_restriction_enabled = true;
              $scope.class_restriction_msg = data['class_restriction']['message'];
            }
          }

          $scope.show_classes_reserve_only=data['show_classes_reserve_only'];

          var str2 = "";
          if (localStorage.getItem("role_id")<5) {
            str2 = localStorage.getItem('base_url')+"api/getClassesForToday/"+$scope.getKey()+"/"+schoolId+"?user_id="+localStorage.getItem("userId")+"&isInstructor";
          }
          else{
            str2 = localStorage.getItem('base_url')+"api/getClassesForToday/"+$scope.getKey()+"/"+schoolId+"?user_id="+localStorage.getItem("userId");
          }

          $http.get(str2)
          .success(function(data){
            $scope.searchClasss = [];
            $scope.classs=[];
            var tempAttendances=[];
            var temp_schedule_ids=[];

            for (var i = 0; i < data['reserve_classes'].length; i++) {
              temp_schedule_ids.push(data['reserve_classes'][i]['schedule_id'])
            }

            for (var i = 0; i < data['attendances'].length; i++) {
              if(data['attendances'][i]['user_id']==localStorage.getItem("userId"))
              tempAttendances.push(data['attendances'][i]['dojoclass_schedule_id'])
            }


            for (var i = 0; i < data['classes'].length; i++) {
              if (data['classes'][i]['schedules_today'].length>=1) {
                for (var x = data['classes'][i]['schedules_today'].length - 1; x >= 0; x--) {
                  var id = data['classes'][i]['id'];
                  var name = data['classes'][i]['name'];

                  var time_in = data['classes'][i]['schedules_today'][x]['time_in'];
                  time_in = time_in.split(":");
                  if(time_in.length>0)
                    time_in = time_in[0]+":"+time_in[1];
                      
                  var time_out = data['classes'][i]['schedules_today'][x]['time_out'];
                  time_out = time_out.split(":");
                  if(time_out.length>0)
                  time_out = time_out[0]+":"+time_out[1];
                  // var styleName = $scope.getStyle(data['classes'][i]['timetable']['id'],$scope.classs.length);
                  // var startdate = data['classes'][i]['startdate'];
                  var trueOrFalse = false;
                  // var schedules = data['classes'][i]['schedules'];
                  var scheduleId = data['classes'][i]['schedules_today'][x]['id'];
                  var location = data['classes'][i]['schedules_today'][x]['area']['area_name'];

                  var reserved = false;
                  if (temp_schedule_ids) {
                    for (var k = 0; k < temp_schedule_ids.length; k++) {
                      if(scheduleId==temp_schedule_ids[k]){
                        reserved=true;
                        break;
                      }
                    }
                  }


                  if (tempAttendances.indexOf(data['classes'][i]['schedules_today'][x]['id'])!=-1) {
                    trueOrFalse = true;
                  }

                  if (localStorage.getItem("role_id")<5 || $scope.selected_genericRole=="LEAD" || $scope.pressedMoreClasses) {
                    $scope.classs.push({
                    id:   id,
                    name: name,
                    time_in: time_in,
                    time_out: time_out,
                    scheduleId: scheduleId,
                    location: location,
                    // styleName: styleName,
                    checkedIn: "button-balanced",
                    trueOrFalse: trueOrFalse,
                    reserved: reserved
                    });
                  }else{
                    if (($scope.show_classes_reserve_only == false) || ($scope.show_classes_reserve_only && reserved)){
                      $scope.classs.push({
                      id:   id,
                      name: name,
                      time_in: time_in,
                      time_out: time_out,
                      scheduleId: scheduleId,
                      location: location,
                      // styleName: styleName,
                      checkedIn: "button-balanced",
                      trueOrFalse: trueOrFalse,
                      reserved: reserved
                      });
                    }
                  }


                }
              }
            }
              if ($scope.classs.length>0){

              $scope.temp_classs=[];
                    $scope.temp_classs.push({
                    id:   $scope.classs[0]['id'],
                    name: $scope.classs[0]['name'],
                    time_in: $scope.classs[0]['time_in'],
                    time_out: $scope.classs[0]['time_out'],
                    scheduleId: $scope.classs[0]['scheduleId'],
                    location: $scope.classs[0]['location'],
                    // styleName: styleName,
                    checkedIn: $scope.classs[0]['checkedIn'],
                    trueOrFalse: $scope.classs[0]['trueOrFalse'],
                    reserved: $scope.classs[0]['reserved']
                    });

              for (var a = 0; a < $scope.classs.length; a++){
                    $scope.temp_classs[0]['id'] = $scope.classs[a]['id'];
                    $scope.temp_classs[0]['name'] = $scope.classs[a]['name'];
                    $scope.temp_classs[0]['time_in'] = $scope.classs[a]['time_in'];
                    $scope.temp_classs[0]['time_out'] = $scope.classs[a]['time_out'];
                    $scope.temp_classs[0]['scheduleId'] = $scope.classs[a]['scheduleId'];
                    $scope.temp_classs[0]['location'] = $scope.classs[a]['location'];
                    $scope.temp_classs[0]['checkedIn'] = $scope.classs[a]['checkedIn'];
                    $scope.temp_classs[0]['trueOrFalse'] = $scope.classs[a]['trueOrFalse'];
                    $scope.temp_classs[0]['reserved'] = $scope.classs[a]['reserved'];

                for (var b = 0; b < temp_schedule_ids.length; b++){
                  if ($scope.classs[a]['reserved']==true && ($scope.classs[a]['scheduleId'] == temp_schedule_ids[b])) {
                    $scope.classs[a]['id'] = $scope.classs[b]['id'];
                    $scope.classs[a]['name'] = $scope.classs[b]['name'];
                    $scope.classs[a]['time_in'] = $scope.classs[b]['time_in'];
                    $scope.classs[a]['time_out'] = $scope.classs[b]['time_out'];
                    $scope.classs[a]['scheduleId'] = $scope.classs[b]['scheduleId'];
                    $scope.classs[a]['location'] = $scope.classs[b]['location'];
                    $scope.classs[a]['checkedIn'] = $scope.classs[b]['checkedIn'];
                    $scope.classs[a]['trueOrFalse'] = $scope.classs[b]['trueOrFalse'];
                    $scope.classs[a]['reserved'] = $scope.classs[b]['reserved'];

                    $scope.classs[b]['id'] = $scope.temp_classs[0]['id'];
                    $scope.classs[b]['name'] = $scope.temp_classs[0]['name'];
                    $scope.classs[b]['time_in'] = $scope.temp_classs[0]['time_in'];
                    $scope.classs[b]['time_out'] = $scope.temp_classs[0]['time_out'];
                    $scope.classs[b]['scheduleId'] = $scope.temp_classs[0]['scheduleId'];
                    $scope.classs[b]['location'] = $scope.temp_classs[0]['location'];
                    $scope.classs[b]['checkedIn'] = $scope.temp_classs[0]['checkedIn'];
                    $scope.classs[b]['trueOrFalse'] = $scope.temp_classs[0]['trueOrFalse'];
                    $scope.classs[b]['reserved'] = $scope.temp_classs[0]['reserved'];
                  }
                }
              }

            }

      $scope.hideLoader();
          }).error(function(data){
            $scope.hideLoader();
            // ("error in getClassesForToday")
          });
            }).error(function(data){

        });
  }
  else{
    $scope.hideLoader();
        $scope.classs.push({
        id:   0,
        name: "Please Connect to the Internet.",
        time_in: " ",
        time_out: " ",
        // styleName: " ",
        checkedIn: "button-balanced hide",
        trueOrFalse: false,
        reserved: false
      })
  }

};


  $scope.selectSchool=function(indexId){
    if(navigator.onLine){

      $scope.selected_schoolId=localStorage.getItem("myIds").split(",")[indexId];
      $scope.selected_schoolName=localStorage.getItem("mySchoolNames").split(",")[indexId];
      $scope.selected_schoolPic=localStorage.getItem("mySchoolPics").split(",")[indexId];
      $scope.selected_genericRole=localStorage.getItem("myRoles").split(",")[indexId];

      if($scope.selected_genericRole=="ADMIN")
        localStorage.setItem("role_id",1);
      else if($scope.selected_genericRole=="ORGANIZATION OWNER")
        localStorage.setItem("role_id",2);
      else if($scope.selected_genericRole=="MANAGER")
        localStorage.setItem("role_id",3);
      else if($scope.selected_genericRole=="INSTRUCTOR")
        localStorage.setItem("role_id",4);
      else if($scope.selected_genericRole=="STUDENT")
        localStorage.setItem("role_id",5);

      if (localStorage.getItem("role_id")<=5)
        $state.go("app.attendances");
      else
        $state.go("app.profile");
  
      $scope.changeSchoolPopup.close();
      $scope.loadClasses($scope.selected_schoolId);
      $scope.loadProductList($scope.selected_schoolId);
      if (localStorage.getItem("role_id")<5){
        // $scope.loadTasks();
        // $scope.loadStudents();
      }
      
    }else
      $scope.warning("Please check internet connection");
  };


  $scope.showChangeSchool=function(){
  if(localStorage.getItem("myIds")){
    if (localStorage.getItem("myIds").split(",").length>=1){
        var str = "";
        var id = localStorage.getItem("myIds").split(",");
        var name = localStorage.getItem("mySchoolNames").split(",");
        var pic = localStorage.getItem("mySchoolPics").split(",");
        var role = localStorage.getItem("myRoles").split(",");

        for (var i = 0; i <  id.length; i++) {        
          str+="<div class='item item-avatar item-text-wrap' style='border-bottom: 1px inset;border-top:none;border-left:none;border-right:none;' ng-click='selectSchool("+i+")' ><img src='"+pic[i]+"' onerror=this.src='img/logo.png' style='background-position: center;border-radius: 50%;'><h3>"+name[i]+"</h3><center><p>"+role[i]+"</center></p></div>";
        }

      $scope.changeSchoolPopup = $ionicPopup.show({
      template: str,
      title: 'Change School',

      scope: $scope,
      buttons: [
        { text: 'Back',
          type: 'button-gray'
        },
      ]
    });
    }
  }

};


$scope.getSomeonesSchoolDetails=function(schoolId){
if (navigator.onLine) {
    var str = localStorage.getItem('base_url')+"api/getschooldetails/"+$scope.getKey()+"/"+schoolId;
    $http.get(str)
    .success(function(data){
      $scope.someones_schoolIds.push(data.id);
      $scope.someones_schoolNames.push(data.name);
      $scope.someones_schoolPictures.push(localStorage.getItem("base_url")+""+data.picture);
      // ("here"+$scope.someones_schoolIds.length)

      if($scope.someones_schoolIds.length==1){
        $scope.selected_someonesSchoolId=$scope.someones_schoolIds[0];
        $scope.selected_someonesSchoolName=$scope.someones_schoolNames[0];
        $scope.selected_someonesSchoolPic=$scope.someones_schoolPictures[0];
        $scope.selected_school_id=$scope.selected_someonesSchoolId;
        $scope.pressedSomeonesMoreClasses=false;
        $scope.loadSomeonesClasses($scope.someones_userId,$scope.selected_someonesSchoolId);
      }


    }).error(function(data){

    });
  }else{
// ("getSomeonesSchoolDetails")
  }
};

$scope.getSomeonesSchoolIds=function(userId){
if (navigator.onLine){
    var str = localStorage.getItem('base_url')+"api/getSchoolIds/"+$scope.getKey()+"/"+userId;
    $http.get(str)
    .success(function(data){
      if (data!=null){
        $scope.someones_schoolIds=[];
        $scope.someones_schoolNames=[];
        $scope.someones_schoolPictures=[];

        $scope.someones_genericSchoolIds=[];
        $scope.someones_genericRoles=[];

        for (var i = data.length - 1; i >= 0; i--){
          if(data[i]['type'] == "student" || data[i]['type'].toUpperCase() == "LEAD"){
            $scope.getSomeonesSchoolDetails(data[i]['id']);
            $scope.someones_genericSchoolIds.push(data[i]['id']);
            $scope.someones_genericRoles.push(data[i]['type']);
          }
      }
      }

      $scope.hideLoader();
    }).error(function(data){
      $scope.hideLoader();
    });
  }
};

$scope.doUpdateSomeonesPersonalInfo=function(){

var someones_countryValue = document.getElementById("someones_country").options[document.getElementById("someones_country").selectedIndex].text;
var someones_stateValue = document.getElementById("someones_state").options[document.getElementById("someones_state").selectedIndex].text;
      
$scope.temp_index=this.indexId;
$scope.tempUserId2=localStorage.getItem("relationship_id").split(",")[this.indexId];
$scope.temp_type=document.getElementById("relationship_data_type").options[document.getElementById("relationship_data_type").selectedIndex].text;
$scope.temp_sub_type=document.getElementById("relationship_data_sub_type").options[document.getElementById("relationship_data_sub_type").selectedIndex].text;
$scope.temp_first_name=this.someones_first_name;
$scope.temp_last_name=this.someones_last_name;
$scope.temp_email=this.relationship_data_email;
$scope.temp_contact_number=this.someones_mobile_number;
$scope.temp_enable_checkin=this.relationship_data_enable_checkin;
$scope.temp_enable_edit=this.relationship_data_enable_edit;

    if(navigator.onLine){
      var birthdate = new Date(this.someones_birthdate);
      var date = birthdate.getFullYear()+"-"+(birthdate.getMonth()+1)+"-"+birthdate.getDate();    
      $("#someones_first_name_label").css('color','black');
      $("#someones_last_name_label").css('color','black');
      $("#someones_birthdate_label").css('color','black');
      $("#someones_gender_label").css('color','black');
      $("#someones_contact_number_label").css('color','black');
      $("#someones_phone_work_label").css('color','black');
      $("#someones_mobile_number_label").css('color','black');
      $("#someones_country_label").css('color','black');
      $("#someones_city_label").css('color','black');
      $("#someones_state_label").css('color','black');
      $("#someones_street_label").css('color','black');
      $("#someones_zip_label").css('color','black');
      $("#relationship_data_type_label").css('color','black');
      $("#relationship_data_sub_type_label").css('color','black');

      if(this.someones_first_name==""){
        $("#someones_first_name_label").css('color','red');
      }
      if(this.someones_last_name==""){
        $("#someones_last_name_label").css('color','red');
      }

      if(this.someones_birthdate==""){ 
        $("#someones_birthdate_label").css('color','red');
      }

      if(this.someones_gender==""){
        $("#someones_gender_label").css('color','red');
      }

      if(this.someones_contact_number==""){
        this.someones_contact_number="N/A";
      }

      if(this.someones_phone_work==""){
        this.someones_phone_work="N/A";
      }

      if(this.someones_mobile_number==""){
        $("#someones_mobile_number_label").css('color','red');
      }

      if(someones_countryValue==""){
        $("#someones_country_label").css('color','red');
      }

      if(someones_stateValue =="Select State"){
        $("#someones_state_label").css('color','red');
      }

      if(this.someones_city==""){
        $("#someones_city_label").css('color','red');
      }

      if(this.someones_street ==""){
        $("#someones_street_label").css('color','red');
      }

      if(this.someones_zip==""){
        $("#someones_zip_label").css('color','red');
      }

      if($scope.temp_type==""){
        $("#relationship_data_type_label").css('color','red');
      }

      if($scope.temp_sub_type==""){
        $("#relationship_data_sub_type_label").css('color','red');
      }
      var birthdateFlag = 0;
      var date_set = new Date(document.getElementById("someones_birthdate").value);

      var two_yrs_ago = new Date();
      two_yrs_ago.setFullYear((two_yrs_ago.getFullYear() - 2));

      if (date_set){
        if(two_yrs_ago<date_set){
          $("#someones_birthdate_label").css('color','red');
          birthdateFlag = 1; 
        }
        else{
          $("#someones_birthdate_label").css('color','black');
          birthdateFlag = 0; 
        }
      }else{
        $("#someones_birthdate_label").css('color','red');
        birthdateFlag = 1;
      }

      if(birthdateFlag == 1 || $scope.temp_type == "" || $scope.temp_sub_type == "" || $scope.temp_type == null || $scope.temp_sub_type == null || this.someones_first_name=="" || this.someones_last_name =="" || date =="" || this.someones_gender==""|| this.someones_mobile_number =="" || someones_countryValue =="" || someones_stateValue =="" || this.someones_city =="" || this.someones_street =="" || this.someones_zip =="" || this.someones_first_name==null || this.someones_last_name ==null || date ==null || this.someones_gender==null || this.someones_mobile_number ==null || someones_countryValue ==null || someones_stateValue ==null || this.someones_city ==null || this.someones_street ==null || this.someones_zip ==null || someones_stateValue =="Select State")
          $scope.warning("All fields marked with asterisk are required.");
      else{
            
          var str = localStorage.getItem('base_url')+"updateuser/"+$scope.getKey()+"?username="+$scope.relationship_username+"&first_name="+this.someones_first_name+"&last_name="+this.someones_last_name+"&birthdate="+date+"&gender="+this.someones_gender+"&contact_number="+this.someones_contact_number+"&phone_work="+this.someones_phone_work+"&mobile_number="+this.someones_mobile_number+"&country="+someones_countryValue+"&state="+someones_stateValue+"&city="+this.someones_city+"&street="+this.someones_street+"&zip="+this.someones_zip;
          $scope.showLoader();
          $http.get(str)
          .success(function(data){
            if(data['status']=='success'){      

            var temprep = '';
            if ($scope.temp_sub_type.indexOf('Other - ') >= 0)
              $scope.temp_sub_type = $scope.temp_sub_type.substr(0,$scope.temp_sub_type.indexOf('Other - '))+temprep+$scope.temp_sub_type.substr($scope.temp_sub_type.indexOf('Other - ')+('Other - '.length));
            else if ($scope.temp_sub_type.toUpperCase().indexOf('OTHER - ') >= 0)
              $scope.temp_sub_type = $scope.temp_sub_type.substr(0,$scope.temp_sub_type.indexOf('OTHER - '))+temprep+$scope.temp_sub_type.substr($scope.temp_sub_type.indexOf('OTHER - ')+('OTHER - '.length));

              var re = /\S+@\S+\.\S+/;
              if($scope.temp_email==null || $scope.temp_contact_number==null || $scope.temp_email=="" || $scope.temp_contact_number=="")
                $scope.warning("All fields marked with asterisk are required.");
              else if((!re.test($scope.temp_email)))
                $scope.warning("Valid email Required.");
              else{

                var str = "";
                var tempIndex=$scope.temp_index;
                var tempRelationship_type=$scope.temp_type;
                var tempRelationship_sub_type=$scope.temp_sub_type;

                var access_permissions = "";
                if(($scope.temp_enable_checkin) || ($scope.temp_type.toUpperCase()=="PAYER")){
                  access_permissions = "&access_permissions[]=check_in_students&access_permissions[]=edit_student";
                }
                else{
                  if($scope.temp_enable_checkin)
                    access_permissions = "&access_permissions[]=check_in_students&access_permissions[]=edit_student";

                  else
                    access_permissions = "";
                }

                var str2 = localStorage.getItem('base_url')+"api/updaterelationship/"+$scope.getKey()+"/"+$scope.tempUserId2+"?type="+$scope.temp_type+"&sub_type="+$scope.temp_sub_type+"&first_name="+$scope.temp_first_name+"&last_name="+$scope.temp_last_name+"&email="+$scope.temp_email+"&contact_number="+$scope.temp_contact_number+access_permissions;

                //$scope.showLoader();
                $http.get(str2)
                .success(function(data){
                  document.getElementById("relationship_contact_number_lbl").innerHTML = $scope.temp_contact_number;
                  var attrib_relationship_type = localStorage.getItem("relationship_type").split(",");
                  var attrib_relationship_sub_type = localStorage.getItem("relationship_sub_type").split(",");
                  var attrib_relationship_contact_number = localStorage.getItem("relationship_contact_number").split(",");
                  var attrib_permissions = localStorage.getItem("permissions").split(",");
                  var attrib_permissions2 = localStorage.getItem("permissions2").split(",");

                  attrib_relationship_type[$scope.temp_index]=tempRelationship_type;
                  attrib_relationship_sub_type[$scope.temp_index]=tempRelationship_sub_type;
                  attrib_relationship_contact_number[$scope.temp_index]=$scope.temp_contact_number;

                  if((attrib_permissions[$scope.temp_index].indexOf("check_in_students")>0) && (attrib_permissions2.indexOf("edit_student")>0)){
                    attrib_permissions[$scope.temp_index]="check_in_students";
                    attrib_permissions2[$scope.temp_index]="edit_student";
                  }

                  else if(attrib_permissions.indexOf("check_in_students")>0){
                    attrib_permissions[$scope.temp_index]="check_in_students";
                    attrib_permissions2[$scope.temp_index]="";
                  }

                  else if(attrib_permissions2.indexOf("edit_student")>0){
                    attrib_permissions[$scope.temp_index]="";
                    attrib_permissions2[$scope.temp_index]="edit_student";
                  }

                  else{
                    attrib_permissions[$scope.temp_index]="";
                    attrib_permissions2[$scope.temp_index]="";
                  }

                  localStorage.setItem("relationship_type",attrib_relationship_type);
                  localStorage.setItem("relationship_sub_type",attrib_relationship_sub_type);
                  localStorage.setItem("permissions",attrib_permissions);
                  localStorage.setItem("permissions2",attrib_permissions2);
                  localStorage.setItem("relationship_contact_number",attrib_relationship_contact_number);

                  $scope.rebuildRelationships();

              if($scope.someone_savedImg!=null && (document.getElementById('relationshipProfileImage').src!=document.getElementById('updateSomeonesProfileImage').src))
                $scope.someone_sendImg($scope.someone_savedImg,$scope.tempUserId)
                $scope.closeUpdateSomeonesPersonalInfo();

                $timeout(function(){
                  $scope.hideLoader();
                  // $scope.success("Successfully Updated.");
                }, 1000);
                  $timeout(function(){
                    if(data.status=="success"){

                      $scope.hideLoader();
                      $scope.success("Successfully Updated.");
                      // $scope.closeRelationshipForm();
                    }
                    else{
                      $scope.hideLoader();
                      $scope.error("Failed to Update Relationship.Try Again Later.");
                    }
                  }, 1000);
                })
                .error(function(data){
                  $scope.hideLoader();
                  $scope.error("Failed to Update Relationship.Try Again Later.");
                }); 
                }
              }
              else{
                $scope.hideLoader();
                $scope.error("Please check your Internet connection. Try Again Later.");
            }
          })
          .error(function(data){
            $scope.hideLoader();
            if (navigator.onLine) {
              $scope.error("Please check your Internet connection.")
            } 

            else {
              $scope.error("Unable to connect to the server. Please try again later.")
            }
              
          });

      }
    }
    else
      $scope.error("Please check your Internet connection.");

}

  $ionicModal.fromTemplateUrl('templates/updateSomeonesPersonalInfo.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.updateSomeonesPersonalInfoModal = modal;
  });

  $scope.openUpdateSomeonesPersonalInfo = function(id){
$scope.updateSomeonesPersonalInfoModal.show();
    var str = localStorage.getItem('base_url')+"getuserdetails/"+$scope.getKey()+"/?userid="+$scope.tempUserId;
    $http.get(str)
    .success(function(data){


      if(data!=null){$scope.someones_first_name = data['first_name'];
            $scope.someones_last_name = data['last_name'];
            $scope.someones_birthdate = new Date(data['birthdate']);

            if(data['gender'].toUpperCase()=="MALE"||data['gender'].toUpperCase()=="M"){
              $scope.someones_maleSelected="true";
              $scope.someones_gender="Male";
            }

            if(data['gender'].toUpperCase()=="FEMALE"||data['gender'].toUpperCase()=="F"){
              $scope.someones_femaleSelected="true";
              $scope.someones_gender="Female";
            }

            $scope.someones_contact_number = data['contact_number'];
            $scope.someones_phone_work = data['phone_work'];
            $scope.someones_mobile_number = data['mobile_number'];
            $scope.someonestempSendImg = localStorage.getItem("base_url")+data['picture'];
            $scope.someones_city = data['city'];
            $scope.someones_street = data['street'];
            $scope.someones_zip = data['zip'];
      
            $scope.someones_countryNameOptions = [];
            $scope.someones_countryIdOptions = [];

            $scope.someones_countryNameOptions=localStorage.getItem("listedCountryNames").split(",");
            $scope.someones_countryIdOptions=localStorage.getItem("listedCountryIds").split(",");
      
            var defaultCountry = 0;
              $scope.someones_countryOptions = [];

            for (var i = $scope.someones_countryNameOptions.length-1; i >= 0 ; i--) {
                $scope.someones_countryOptions.push({
                  name: $scope.someones_countryNameOptions[i],
                  id: $scope.someones_countryIdOptions[i]
                })
                if ($scope.someones_countryNameOptions[i]==data['country']){
                  defaultCountry=Math.abs($scope.someones_countryNameOptions.length-1-i);
                }
            }

            $scope.someones_country=$scope.someones_countryOptions[defaultCountry];
            this.someones_country=$scope.someones_countryOptions[defaultCountry];


            $scope.someones_allStateNames=localStorage.getItem("listedStateNames").split(",");
            $scope.someones_allStateIds=localStorage.getItem("listedStateIds").split(",");

            var defaultState = 0;
            var c=0;
            $scope.someones_stateOptions = [];

            for (var i = $scope.someones_allStateNames.length-1; i >= 0; i--){
              if($scope.someones_allStateIds[i]==$scope.someones_country.id){
                c++;
                $scope.someones_stateOptions.push({
                  name: $scope.someones_allStateNames[i],
                  id: $scope.someones_allStateIds[i]
                })
                }
                if($scope.someones_allStateNames[i]==data['state'])
                  defaultState=c-1;
            }

            $scope.someones_state=$scope.someones_stateOptions[defaultState];
            this.someones_state=$scope.someones_stateOptions[defaultState];

            $scope.someones_changeCountry = function(){
              $scope.someones_stateOptions = [];
              $scope.someones_stateOptions.push({
                name: "Select State",
                id: ""
              })
      
              for (var i = $scope.someones_allStateNames.length-1; i >= 0; i--){
                if($scope.someones_allStateIds[i]==this.someones_country.id)
                  $scope.someones_stateOptions.push({
                    name: $scope.someones_allStateNames[i],
                    id: $scope.someones_allStateIds[i]
                  })
              }
              $scope.someones_state=$scope.someones_stateOptions[0];
              this.someones_state=$scope.someones_stateOptions[0];
            };


           var tempCountryId = this.someones_country.id;
            $timeout(function(){

              for (var i = 0; i < document.getElementById("someones_country").length; i++) {
               if(document.getElementById("someones_country").options[i].text == data['country']){
                document.getElementById("someones_country").selectedIndex = i;
                break;
               }
              }

              for (var i = $scope.someones_allStateNames.length-1; i >= 0; i--){
                if($scope.someones_allStateIds[i]==tempCountryId)
                  $scope.someones_stateOptions.push({
                    name: $scope.someones_allStateNames[i],
                    id: $scope.someones_allStateIds[i]
                  })
              }

              $timeout(function(){
                for (var i = 0; i < document.getElementById("someones_state").length; i++) {
                 if(document.getElementById("someones_state").options[i].text == data['state']){
                  document.getElementById("someones_state").selectedIndex = i;
                  break;
                 }
                }
              }, 1000);
            }, 1000);


            $scope.indexId=id;

            var attrib_relationship_type = localStorage.getItem("relationship_type").split(",");
            var attrib_relationship_sub_type = localStorage.getItem("relationship_sub_type").split(",");
            var attrib_relationship_first_name = localStorage.getItem("relationship_first_name").split(",");
            var attrib_relationship_last_name = localStorage.getItem("relationship_last_name").split(",");
            var attrib_relationship_email = localStorage.getItem("relationship_email").split(",");
            var attrib_relationship_contact_number = localStorage.getItem("relationship_contact_number").split(",");
            var attrib_ack = localStorage.getItem('ack').split(',');

            if(attrib_relationship_type[id].toUpperCase()=="PAYER"){
              $scope.mainOptions = [
                {
                  name: 'Emergency Contact',
                  value: 'Emergency Contact'
                },
              ];
              this.relationship_data_type = $scope.mainOptions[0];
              $scope.relationship_data_type = $scope.mainOptions[0];
            }
            else if(attrib_relationship_type[id].toUpperCase()=="EMERGENCY CONTACT"){
              $scope.mainOptions = [
                {
                  name: 'Emergency Contact',
                  value: 'Emergency Contact'
                },
              ];
              this.relationship_data_type = $scope.mainOptions[0];
              $scope.relationship_data_type = $scope.mainOptions[0];
            }
            else if(attrib_relationship_type[id].toUpperCase()=="STUDENT" || attrib_relationship_type[id].toUpperCase()=="RELATED STUDENT"){
              $scope.mainOptions = [
                {
                  name: 'Student',
                  value: 'Student'
                },
              ];
              this.relationship_data_type = $scope.mainOptions[0];
              $scope.relationship_data_type = $scope.mainOptions[0];
            }
            else{
                $scope.mainOptions = [
      
                {
                  name: 'Emergency Contact',
                  value: 'Emergency Contact'
                },
                {
                  name: 'Other - '+attrib_relationship_type[id],
                  value: 'Other'
                },
              ];
              this.relationship_data_type = $scope.mainOptions[1];
              $scope.relationship_data_type = $scope.mainOptions[1];
            }

      $scope.options = [
              {
                name: 'Guardian',
                value: 'Guardian'
              }, 
              {
                name: 'Father',
                value: 'Father'
              },
              {
                name: 'Mother',
                value: 'Mother'
              }, 
              {
                name: 'Husband',
                value: 'Husband'
              }, 
              {
                name: 'Wife',
                value: 'Wife'
              }, 
              {
                name: 'Son',
                value: 'Son'
              }, 
              {
                name: 'Daugther',
                value: 'Daugther'
              }, 
              {
                name: 'Brother',
                value: 'Brother'
              }, 
              {
                name: 'Sister',
                value: 'Sister'
              }, 
              {
                name: 'Uncle',
                value: 'Uncle'
              }, 
              {
                name: 'Aunt',
                value: 'Aunt'
              }, 
              {
                name: 'Cousin',
                value: 'Cousin'
              }, 
              {
                name: 'Nephew',
                value: 'Nephew'
              }, 
              {
                name: 'Niece',
                value: 'Niece'
              }, 
              {
                name: 'Close Friend',
                value: 'Close Friend'
              }, 
              // {
              //   name: 'Other',
              //   value: 'Other'
              // },
            ];

            if(attrib_relationship_sub_type[id].toUpperCase()=="GUARDIAN")
              $scope.relationship_data_sub_type = $scope.options[0];
            else if(attrib_relationship_sub_type[id].toUpperCase()=="FATHER")
              $scope.relationship_data_sub_type = $scope.options[1];
            else if(attrib_relationship_sub_type[id].toUpperCase()=="MOTHER")
              $scope.relationship_data_sub_type = $scope.options[2];
            else if(attrib_relationship_sub_type[id].toUpperCase()=="HUSBAND")
              $scope.relationship_data_sub_type = $scope.options[3];
            else if(attrib_relationship_sub_type[id].toUpperCase()=="Wife")
              $scope.relationship_data_sub_type = $scope.options[4];
            else if(attrib_relationship_sub_type[id].toUpperCase()=="SON")
              $scope.relationship_data_sub_type = $scope.options[5];
            else if(attrib_relationship_sub_type[id].toUpperCase()=="DAUGTHER")
              $scope.relationship_data_sub_type = $scope.options[6];
            else if(attrib_relationship_sub_type[id].toUpperCase()=="BROTHER")
              $scope.relationship_data_sub_type = $scope.options[7];
            else if(attrib_relationship_sub_type[id].toUpperCase()=="SISTER")
              $scope.relationship_data_sub_type = $scope.options[8];
            else if(attrib_relationship_sub_type[id].toUpperCase()=="UNCLE")
              $scope.relationship_data_sub_type = $scope.options[9];
            else if(attrib_relationship_sub_type[id].toUpperCase()=="AUNT")
              $scope.relationship_data_sub_type = $scope.options[10];
            else if(attrib_relationship_sub_type[id].toUpperCase()=="COUSIN")
              $scope.relationship_data_sub_type = $scope.options[11];
            else if(attrib_relationship_sub_type[id].toUpperCase()=="NEPHEW")
              $scope.relationship_data_sub_type = $scope.options[12];
            else if(attrib_relationship_sub_type[id].toUpperCase()=="NIECE")
              $scope.relationship_data_sub_type = $scope.options[13];
            else if(attrib_relationship_sub_type[id].toUpperCase()=="CLOSE FRIEND")
              $scope.relationship_data_sub_type = $scope.options[14];
            else{
              $scope.options = [
              {
                name: 'Guardian',
                value: 'Guardian'
              }, 
              {
                name: 'Father',
                value: 'Father'
              },
              {
                name: 'Mother',
                value: 'Mother'
              }, 
              {
                name: 'Husband',
                value: 'Husband'
              }, 
              {
                name: 'Wife',
                value: 'Wife'
              }, 
              {
                name: 'Son',
                value: 'Son'
              }, 
              {
                name: 'Daugther',
                value: 'Daugther'
              }, 
              {
                name: 'Brother',
                value: 'Brother'
              }, 
              {
                name: 'Sister',
                value: 'Sister'
              }, 
              {
                name: 'Uncle',
                value: 'Uncle'
              }, 
              {
                name: 'Aunt',
                value: 'Aunt'
              }, 
              {
                name: 'Cousin',
                value: 'Cousin'
              }, 
              {
                name: 'Nephew',
                value: 'Nephew'
              }, 
              {
                name: 'Niece',
                value: 'Niece'
              }, 
              {
                name: 'Close Friend',
                value: 'Close Friend'
              }, 
              {
                name: 'Other - '+attrib_relationship_sub_type[id],
                value: 'Other'
              },
            ];
              $scope.relationship_data_sub_type = $scope.options[15];
              this.relationship_data_sub_type = $scope.options[15];
            }

            $timeout(function(){
              for (var i = 0; i < document.getElementById("relationship_data_type").length; i++) {
                if(document.getElementById("relationship_data_type").options[i].text.toUpperCase() == attrib_relationship_type[id].toUpperCase()){
                  document.getElementById("relationship_data_type").selectedIndex=i;
                  break;
                }
              }

              for (var i = 0; i < document.getElementById("relationship_data_sub_type").length; i++) {
                if(document.getElementById("relationship_data_sub_type").options[i].text.toUpperCase() == attrib_relationship_sub_type[id].toUpperCase() || document.getElementById("relationship_data_sub_type").options[i].text.toUpperCase() == ("Other - "+attrib_relationship_sub_type[id]).toUpperCase()){
                  document.getElementById("relationship_data_sub_type").selectedIndex=i;
                  break;
                }
              }
            }, 1000);

            $scope.addProperties="";
            $scope.relationship_data_first_name = attrib_relationship_first_name[id];
            $scope.relationship_data_last_name = attrib_relationship_last_name[id];
            $scope.relationship_data_email = attrib_relationship_email[id];
            $scope.relationship_data_contact_number = attrib_relationship_contact_number[id];

            if(attrib_ack[id]==1){
              $scope.data_ack_lbl = "Approved";
            }
            else{
              $scope.data_ack_lbl = "Pending";
            }


          $("#someones_first_name_label").css('color','black');
          $("#someones_last_name_label").css('color','black');
          $("#someones_birthdate_label").css('color','black');
          $("#someones_gender_label").css('color','black');
          $("#someones_contact_number_label").css('color','black');
          $("#someones_phone_work_label").css('color','black');
          $("#someones_mobile_number_label").css('color','black');
          $("#someones_country_label").css('color','black');
          $("#someones_city_label").css('color','black');
          $("#someones_state_label").css('color','black');
          $("#someones_street_label").css('color','black');
          $("#someones_zip_label").css('color','black');

      }
      }).error(function(data){
        //  ("error in getuserdetails")
      });

  };

  $scope.closeUpdateSomeonesPersonalInfo = function(){
    $scope.updateSomeonesPersonalInfoModal.hide();
  };

$scope.picNotification = function(indexId){
  if(($scope.relationship_pic.indexOf("default-user.png")>=0) || ($scope.relationship_pic.indexOf("default_student.png")>=0) || ($scope.relationship_pic.indexOf("default_instructor.png")>=0) && $scope.isValidCandidate==true){
   if($scope.pic_notification_visible==false){
     $scope.pic_notification_visible=true;

     $scope.notifPopup2 = $ionicPopup.show({
      template:  "<center>We noticed this user hasn't changed their profile picture.<br><img src='"+$scope.relationship_pic+"' onerror=this.src='img/logo.png' style='background-position: center;border-radius: 50%;width:100px;' ng-click='openUpdateSomeonesPersonalInfo("+indexId+");notifPopup2.close()'><br>Tap the image above to update profile.</center>",
      title: 'Notice',

      scope: $scope,
      buttons: [
        {
          text: '<b>Later</b>',
          type: 'button-positive',
          onTap: function(e) {
            $scope.pic_notification_visible=false;
          }

        },
      ]
    });
    }
  }
}

$scope.checkValidCheckin=function(userId,indexId){
      $scope.tempUserId = userId;
      //$scope.showLoader();
      var str = localStorage.getItem('base_url')+"api/getSchoolIds/"+$scope.getKey()+"/"+userId;
      $http.get(str)
      .success(function(data){
        $scope.isValidCandidate = false;
        $scope.isValidCandidate2 = false;
        var isValid = false;

        for (var i = data.length - 1; i >= 0; i--){
          if(data[i]['type'] == "student" || data[i]['type'].toUpperCase() == "LEAD")
            isValid = true;
        }

        if(!isValid){
          $scope.isValidCandidate = false;
          $scope.isValidCandidate2 = false;
          $scope.hideLoader();
        }
        else{
            $scope.validateUserId = userId;

            var str2 = localStorage.getItem('base_url')+"api/getrelationships/"+$scope.getKey()+"/"+userId;  
            $http.get(str2)
            .success(function(data){

                if(data.length>0){
                  $scope.countCandidates=data.length;
                  $scope.scannedCandidates=0;
                  for (var i = data.length - 1; i >= 0; i--){
                    var str3 = localStorage.getItem('base_url')+"api/getrelationship/"+$scope.getKey()+"/"+data[i];
                    $http.get(str3)
                    .success(function(data){

                      $scope.hideLoader();
                      if (localStorage.getItem("userId")==data.existing_user){
                        if (data.type){                    
                          if(data.type.toUpperCase()=="PAYER"){
                            $scope.isValidCandidate = true;
                            $scope.isValidCandidate2 = true;
                          }   
                        }

                        if(data.permissions!=null){
                          if(data.permissions.indexOf("check_in_students")>-1){
                            $scope.isValidCandidate=true;
                          }
                         if(data.permissions.indexOf("edit_student")>-1){
                            $scope.isValidCandidate2=true;
                          }
                        }
                        $scope.picNotification(indexId);
                      }
    
                      $scope.scannedCandidates++;
                      if ($scope.countCandidates==$scope.scannedCandidates){
                        $scope.hideLoader();
                        if(!$scope.isValidCandidate==true){
                          $scope.isValidCandidate=false;
                        }
                      }
                    }).error(function(data){
                      $scope.hideLoader();
                      $scope.isValidCandidate=false;
                      $scope.isValidCandidate2=false;
                    }); 
                  }
                }
                else{
                  $scope.hideLoader();
                  $scope.isValidCandidate=false;
                  $scope.isValidCandidate2=false;
                }

            }).error(function(data){
              //("getrelationship fail")
              $scope.hideLoader();
              $scope.isValidCandidate=false;
              $scope.isValidCandidate2=false;
            }); 
          }
      }).error(function(data){
        //("getrelationships fail")
        $scope.hideLoader();
        $scope.isValidCandidate=false;
        $scope.isValidCandidate2=false;
      });
};

$scope.relationship_permission_allow=function(id){
  var attrib_ack = localStorage.getItem('ack').split(',');
  return $scope.isValidCandidate && attrib_ack[id]==1;
};


  $ionicModal.fromTemplateUrl('templates/someonesClassDetails.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.someonesClassDetailsModal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeSomeonesClassDetails = function(){
    $scope.someonesClassDetailsModal.hide();
  };


$scope.checkInSomeone = function(usedid){
  if(usedid!=null)
    if (navigator.onLine){
      //$scope.showLoader();
      var str0 = localStorage.getItem('base_url')+"getuserdetails/"+$scope.getKey()+"/?userid="+usedid;
      $http.get(str0)
      .success(function(data){

        $scope.someones_userId=data['id'];
        $scope.someones_organization_id=data['organization_id'];
        $scope.someones_username=data['username'];
        $scope.someones_role_id=data['role_id'];
        $scope.someones_email=data['email'];
        $scope.someones_first_name=data['first_name'];
        $scope.someones_last_name=data['last_name'];
        $scope.someones_birthdate=data['birthdate'];
        $scope.someones_gender=data['gender'];
        $scope.someones_contact_number=data['contact_number'];
        $scope.someones_phone_work=data['phone_work'];
        $scope.someones_mobile_number=data['mobile_number'];
        $scope.someones_picture=localStorage.getItem("base_url")+""+data['picture'];
        $scope.someones_country=data['country'];
        $scope.someones_state=data['state'];
        $scope.someones_city=data['city'];
        $scope.someones_street=data['street'];
        $scope.someones_zip=data['zip'];
        $scope.someones_user_created_at=data['created_at'];
        $scope.someones_user_updated_at=data['updated_at'];
        $scope.someones_tmauEnrolled=data['tmauEnrolled'];
        $scope.getSomeonesSchoolIds(data['id']);
        $scope.selected_someonesUserId=data['id'];
        var str = localStorage.getItem('base_url')+"api/getSchoolIds/"+$scope.getKey()+"/"+data['id'];
        $http.get(str)
        .success(function(data){
          // $scope.isValidCandidate = false;

          var isValid = false;
          for (var i = data.length - 1; i >= 0; i--) {
            if(data[i]['type'] == "student" || data[i]['type'].toUpperCase() == "LEAD"){
              isValid = true;
            }
          }

          if(!isValid){
            // $scope.isValidCandidate = false;
            $scope.hideLoader();
          }
          else{
              $scope.validateUserId = usedid;
              var str2 = localStorage.getItem('base_url')+"api/getrelationships/"+$scope.getKey()+"/"+usedid;  
              $http.get(str2)
              .success(function(data){
                  if(data.length>0){
                    $scope.countCandidates=data.length;
                    $scope.scannedCandidates=0;
                    for (var i = data.length - 1; i >= 0; i--) {
                      var str3 = localStorage.getItem('base_url')+"api/getrelationship/"+$scope.getKey()+"/"+data[i];
                      $http.get(str3)
                      .success(function(data){


                        if (localStorage.getItem("userId")==data.existing_user){
                          if (data.type.toUpperCase()=="PAYER"){
                            $scope.someonesClassDetailsModal.show();
                            $scope.isValidCandidate=true;
                            $scope.hideLoader();
                          }
                          else{
                            if(data.permissions!=null){
                              if(data.permissions.indexOf("check_in_students")>-1){
                                $scope.someonesClassDetailsModal.show();
                                $scope.isValidCandidate=true;
                                $scope.hideLoader();
                              }
                            }
                          }
                        }
      
                        $scope.scannedCandidates++;
                        if ($scope.countCandidates==$scope.scannedCandidates){
                          $scope.hideLoader();
                          if($scope.isValidCandidate==false){
                            $scope.warning("You do not have the permission to check in "+$scope.someones_username);
                          }
                        }
                      }).error(function(data){
                        $scope.hideLoader();
                        $scope.isValidCandidate=false;
                      }); 
                    }
                  }
                  else{
                    $scope.hideLoader();
                    $scope.isValidCandidate=false;
                  }

              }).error(function(data){
                $scope.hideLoader();
                $scope.isValidCandidate=false;
              }); 
            }
        }).error(function(data){
          $scope.hideLoader();
          $scope.isValidCandidate=false;
        });

        // $scope.someonesShowNoResults=function(){
        // return true;
        // };
      }).error(function(data){
        $scope.hideLoader();
      });

    }
    else
      $scope.warning("Please check internet connection");
};

  $scope.someoneCheckIn = function(classId,id,l,schedule_id){
    if (navigator.onLine){
      var indexId = id;
      var list = l;
      //$scope.showLoader();
      var str = localStorage.getItem('base_url')+"api/class_check_in/"+$scope.getKey()+"/?class_id="+classId+"&school_id="+$scope.selected_someonesSchoolId+"&user_id="+$scope.selected_someonesUserId+"&source=3&dojoclass_schedule_id="+schedule_id;

      $http.get(str)
      .success(function(data){
        $scope.hideLoader();
      if(data == "Check in successful"){
        
        if(list=='someonesClass')
          $scope.someonesClasss[indexId]['trueOrFalse']=true;
        else{
          $scope.someonesSearchClasss[indexId]['trueOrFalse']=true;
          for (var i = 0; $scope.someonesClasss.length > i; i++) {
            if($scope.someonesSearchClasss[indexId]['scheduleId']==$scope.someonesClasss[i]['scheduleId']){ 
              $scope.someonesClasss[i]['trueOrFalse']=true;
              break;
            }
          }
        }

        $scope.searchSomeonesClass="";
        this.searchSomeonesClass="";
        document.getElementById("searchSomeonesClass").value="";
        $scope.searchForSomeonesClass();

        $scope.success("Successfully Checked in");
      }

      else if (data == "Already checked in."){
        $scope.warning(data);
        $scope.hideLoader();
      }

      else if(data == "onhold"){
        $scope.warning("Unable to checkin: Student on Hold.")
        $scope.hideLoader();
      }

      else if(data == "need-risk-waiver"){
  $scope.selected_schoolId=$scope.selected_someonesSchoolId;
  $scope.selected_class_id=classId; 
  $scope.selected_student_id=$scope.selected_someonesUserId;
  $scope.selected_class_schedule_id=schedule_id;
            var str = localStorage.getItem('base_url')+"getuserdetails/"+$scope.getKey()+"/?userid="+$scope.selected_someonesUserId;
            $http.get(str)
            .success(function(data){
              $scope.selected_student_name = data['first_name']+" "+data['last_name'];
              $scope.selected_student_address=""; 

              if(data.street!="" && data.street!=null){
                if (data.street.toUpperCase()!="N/A")
                  $scope.selected_student_address=data.street;
                else
                  $scope.selected_student_address="N/A";
              }
              else
                  $scope.selected_student_address="N/A";
                

              if(data.city!="" && data.city!=null){
                if(data.city.toUpperCase()!="N/A")
                  $scope.selected_student_address=$scope.selected_student_address+", "+data.city;
                else
                  $scope.selected_student_address="N/A";
              }
              else
                  $scope.selected_student_address="N/A";
                

              if(data.country!="" && data.country!=null){
                if(data.country.toUpperCase()!="N/A")
                  $scope.selected_student_address=$scope.selected_student_address+", "+data.country;
                else
                  $scope.selected_student_address="N/A";
              }
              else
                $scope.selected_student_address="N/A";


              if(data.zip!="" && data.zip!=null){
                if (data.zip.toUpperCase()!="N/A")
                  $scope.selected_student_address=$scope.selected_student_address+", "+data.zip;
                else
                  $scope.selected_student_address="N/A";
              }
              else
                $scope.selected_student_address="N/A";

              $scope.selected_student_birthdate=data.birthdate;

            if(data.birthdate==""||data.birthdate==null||data.birthdate=="0000-00-00"||data.birthdate=="1970-01-01")
                $scope.settingupBirthdate(data.username);
            else
                $scope.askForGuardiansNameViaSomeone(true); 
            }).error(function(data){
            });

             $scope.hideLoader();
      }

      else if(data == "exclusive"){
        var sorryPopup = $ionicPopup.alert({
          title: 'Sorry',
          template: "<center>This is an exclusive class.<br>Please speak to your Instructor</center>",
          okType: "button-assertive"
        });

       $scope.hideLoader();
      }

      else{
        $scope.warning(data)
      }
      }).error(function(data){
        $scope.warning("Error");
        $scope.hideLoader();
      });

    }
    else
      $scope.warning("Please check internet connection");
  };



  $scope.someonesToggleCheckin=function(indexId,list,classId, className, classTime,schedule_id){
  // (indexId+"\n"+list+"\n"+classId+"\n"+className+"\n"+classTime)

  var myPopup = $ionicPopup.show({
    template: "<center>Check in "+$scope.someones_first_name+" "+$scope.someones_last_name+" to "+className+" at "+classTime+"?</center>",
    title: 'Check In',

    scope: $scope,
    buttons: [
      { text: 'Back',
      type: 'button-gray' },
      {
        text: '<b>Check In</b>',
        type: 'button-balanced',
        onTap: function(e) {

        if (navigator.onLine) {
          $scope.someoneCheckIn(classId,indexId,list,schedule_id);

        }else{
          $scope.warning("Please check internet connection");
        }
        
        }
      },
    ]
  });
  };



  $scope.someonesSeturnStatus = function(id,list){
    if(list=='someonesClass')
      return $scope.someonesClasss[id]['trueOrFalse'];
    else
      return $scope.someonesSearchClasss[id]['trueOrFalse'];
  }
  // $scope.someonesShowNoResults=function(){
  //   return $scope.someonesSearchClasss.length>0;
  // };


  $scope.someonesShowAllClasses=false;
  $scope.someonesShowSearchClasses=true;
  
  $scope.searchSomeonesClass="";

  $scope.searchForSomeonesClass=function(){

    $scope.someonesSearchClasss = [];

$scope.searchSomeonesClass =this.searchSomeonesClass;

    for (var i = 0; i < $scope.someonesClasss.length; i++) {
      if($scope.someonesClasss[i]['name'].toUpperCase().match($scope.searchSomeonesClass.toUpperCase())){
        $scope.someonesSearchClasss.push({
          id: $scope.someonesClasss[i]['id'],
          name: $scope.someonesClasss[i]['name'],
          time_in: $scope.someonesClasss[i]['time_in'],
          time_out: $scope.someonesClasss[i]['time_out'],
          // styleName:$scope.classs[i]['styleName'],
          location: $scope.someonesClasss[i]['location'],
          scheduleId: $scope.someonesClasss[i]['scheduleId'],
          checkedIn: $scope.someonesClasss[i]['checkedIn'],
          trueOrFalse: $scope.someonesClasss[i]['trueOrFalse'],
          reserved: $scope.someonesClasss[i]['reserved']
        })
      }
    }

    if($scope.someonesSearchClass.length>0||$scope.searchSomeonesClass==""){
      $scope.someonesShowAllClasses=false;
      $scope.someonesShowSearchClasses=true;
    }
    else if($scope.someonesSearchClass.length==0 && $scope.searchSomeonesClass!=""){
      $scope.someonesShowAllClasses=true;
      $scope.someonesShowSearchClasses=false;
    }
    else{
      $scope.someonesShowAllClasses=true;
      $scope.someonesShowSearchClasses=false;
    }
  };
  
  $scope.someonesClasss = [];
  $scope.someonesSearchClass = [];
  
$scope.loadMoreSomeonesClasses = function(){

  if(navigator.onLine){

          var str = localStorage.getItem('base_url')+"api/getClassesForToday/"+$scope.getKey()+"/"+$scope.someones_schoolId+"?user_id="+$scope.someones_userId;

          $http.get(str)
          .success(function(data){
            $scope.pressedSomeonesMoreClasses=true;
            $scope.someones_class_restriction_enabled="";
            $scope.hideLoader();
            $scope.someonesClasss = [];
            var tempAttendances = [];
            var temp_schedule_ids = [];

            for (var i = 0; i < data['reserve_classes'].length; i++) {
              temp_schedule_ids.push(data['reserve_classes'][i]['schedule_id'])
            }

            for (var i = 0; i < data['attendances'].length; i++) {
              if(data['attendances'][i]['user_id']==$scope.someones_userId)
                tempAttendances.push(data['attendances'][i]['dojoclass_schedule_id'])
            }

            for (var i = 0; i < data['classes'].length; i++) {
              if (data['classes'][i]['schedules_today'].length>=1) {
                for (var x = data['classes'][i]['schedules_today'].length - 1; x >= 0; x--) {
                  var id = data['classes'][i]['id'];
                  var name = data['classes'][i]['name'];
                  var time_in = data['classes'][i]['schedules_today'][x]['time_in'];
                  var time_out = data['classes'][i]['schedules_today'][x]['time_out'];
                  // var styleName = $scope.getStyle(data['classes'][i]['timetable']['id'],$scope.classs.length);
                  var startdate = data['classes'][i]['startdate'];
                  var trueOrFalse = false;
                  // var schedules = data['classes'][i]['schedules'];
                  var scheduleId = data['classes'][i]['schedules_today'][x]['id'];
                  var location = data['classes'][i]['schedules_today'][x]['area']['area_name'];

                  if (tempAttendances.indexOf(data['classes'][i]['schedules_today'][x]['id'])!=-1){
                    trueOrFalse = true;
                  }
                  var reserved = false;
                  if (temp_schedule_ids) {
                    for (var k = 0; k < temp_schedule_ids.length; k++) {
                      if(scheduleId==temp_schedule_ids[k]){
                        reserved=true;
                        break;
                      }
                    }
                  }


                  $scope.someonesClasss.push({
                    id:   id,
                    name: name,
                    time_in: time_in,
                    time_out: time_out,
                    scheduleId: scheduleId,
                    location: location,
                    // styleName: styleName,
                    checkedIn: "button-balanced",
                    trueOrFalse: trueOrFalse,
                    reserved: reserved
                  })
                }
              }
            }

              if ($scope.someonesClasss){

              $scope.temp_classs=[];
                    $scope.temp_classs.push({
                    id:   $scope.someonesClasss[0]['id'],
                    name: $scope.someonesClasss[0]['name'],
                    time_in: $scope.someonesClasss[0]['time_in'],
                    time_out: $scope.someonesClasss[0]['time_out'],
                    scheduleId: $scope.someonesClasss[0]['scheduleId'],
                    location: $scope.someonesClasss[0]['location'],
                    // styleName: styleName,
                    checkedIn: $scope.someonesClasss[0]['checkedIn'],
                    trueOrFalse: $scope.someonesClasss[0]['trueOrFalse'],
                    reserved: $scope.someonesClasss[0]['reserved']
                    });

              for (var a = 0; a < $scope.someonesClasss.length; a++){
                    $scope.temp_classs[0]['id'] = $scope.someonesClasss[a]['id'];
                    $scope.temp_classs[0]['name'] = $scope.someonesClasss[a]['name'];
                    $scope.temp_classs[0]['time_in'] = $scope.someonesClasss[a]['time_in'];
                    $scope.temp_classs[0]['time_out'] = $scope.someonesClasss[a]['time_out'];
                    $scope.temp_classs[0]['scheduleId'] = $scope.someonesClasss[a]['scheduleId'];
                    $scope.temp_classs[0]['location'] = $scope.someonesClasss[a]['location'];
                    $scope.temp_classs[0]['checkedIn'] = $scope.someonesClasss[a]['checkedIn'];
                    $scope.temp_classs[0]['trueOrFalse'] = $scope.someonesClasss[a]['trueOrFalse'];
                    $scope.temp_classs[0]['reserved'] = $scope.someonesClasss[a]['reserved'];

                for (var b = 0; b < temp_schedule_ids.length; b++){
                  if ($scope.someonesClasss[a]['reserved']==true && ($scope.someonesClasss[a]['scheduleId'] == temp_schedule_ids[b])) {
                    $scope.someonesClasss[a]['id'] = $scope.someonesClasss[b]['id'];
                    $scope.someonesClasss[a]['name'] = $scope.someonesClasss[b]['name'];
                    $scope.someonesClasss[a]['time_in'] = $scope.someonesClasss[b]['time_in'];
                    $scope.someonesClasss[a]['time_out'] = $scope.someonesClasss[b]['time_out'];
                    $scope.someonesClasss[a]['scheduleId'] = $scope.someonesClasss[b]['scheduleId'];
                    $scope.someonesClasss[a]['location'] = $scope.someonesClasss[b]['location'];
                    $scope.someonesClasss[a]['checkedIn'] = $scope.someonesClasss[b]['checkedIn'];
                    $scope.someonesClasss[a]['trueOrFalse'] = $scope.someonesClasss[b]['trueOrFalse'];
                    $scope.someonesClasss[a]['reserved'] = $scope.someonesClasss[b]['reserved'];

                    $scope.someonesClasss[b]['id'] = $scope.temp_classs[0]['id'];
                    $scope.someonesClasss[b]['name'] = $scope.temp_classs[0]['name'];
                    $scope.someonesClasss[b]['time_in'] = $scope.temp_classs[0]['time_in'];
                    $scope.someonesClasss[b]['time_out'] = $scope.temp_classs[0]['time_out'];
                    $scope.someonesClasss[b]['scheduleId'] = $scope.temp_classs[0]['scheduleId'];
                    $scope.someonesClasss[b]['location'] = $scope.temp_classs[0]['location'];
                    $scope.someonesClasss[b]['checkedIn'] = $scope.temp_classs[0]['checkedIn'];
                    $scope.someonesClasss[b]['trueOrFalse'] = $scope.temp_classs[0]['trueOrFalse'];
                    $scope.someonesClasss[b]['reserved'] = $scope.temp_classs[0]['reserved'];
                  }
                }
              }
            }

          }).error(function(data){
            $scope.hideLoader();
            // ("error in getClassesForToday")
          });

  }
  else{
        $scope.someonesClasss.push({
        id:   0,
        name: "Please Connect to the Internet.",
        time_in: " ",
        time_out: " ",
        // styleName: " ",
        checkedIn: "button-balanced hide",
        trueOrFalse: false,
        reserved: false
      })
  }
}

$scope.pressedSomeonesMoreClasses=false;
$scope.loadSomeonesClasses = function(userId,schoolId){
  $scope.someones_userId=userId;
  $scope.someones_schoolId=schoolId;
  $scope.someonesClasss=[];
  if(navigator.onLine){
        var str2 = localStorage.getItem('base_url')+"api/getschooldetails/"+$scope.getKey()+"/"+schoolId;
        $http.get(str2)
        .success(function(data){

          $scope.someones_class_restriction_enabled = false;
          $scope.someones_class_restriction_msg = "You are trying to check in to a class that is not reserve for you. Please see your instructor for advice.";
            
          if (data['class_restriction']){
              if (data['class_restriction']['enable']==1){
              $scope.someones_class_restriction_enabled = true;
              $scope.someones_class_restriction_msg = data['class_restriction']['message'];
            }
          }
          $scope.someones_show_classes_reserve_only=false;
          $scope.someones_show_classes_reserve_only=data['show_classes_reserve_only'];
          var str = localStorage.getItem('base_url')+"api/getClassesForToday/"+$scope.getKey()+"/"+$scope.someones_schoolId+"?user_id="+$scope.someones_userId;
          $http.get(str)
          .success(function(data){
            $scope.hideLoader();
            $scope.someonesClasss = [];
            var tempAttendances = [];
            var temp_schedule_ids = [];

            for (var i = 0; i < data['reserve_classes'].length; i++) {
              temp_schedule_ids.push(data['reserve_classes'][i]['schedule_id'])
            }

            for (var i = 0; i < data['attendances'].length; i++) {
              if(data['attendances'][i]['user_id']==userId)
                tempAttendances.push(data['attendances'][i]['dojoclass_schedule_id'])
            }

            for (var i = 0; i < data['classes'].length; i++) {
              if (data['classes'][i]['schedules_today'].length>=1) {
                for (var x = data['classes'][i]['schedules_today'].length - 1; x >= 0; x--) {
                  var id = data['classes'][i]['id'];
                  var name = data['classes'][i]['name'];
                  var time_in = data['classes'][i]['schedules_today'][x]['time_in'];
                  var time_out = data['classes'][i]['schedules_today'][x]['time_out'];
                  // var styleName = $scope.getStyle(data['classes'][i]['timetable']['id'],$scope.classs.length);
                  var startdate = data['classes'][i]['startdate'];
                  var trueOrFalse = false;
                  // var schedules = data['classes'][i]['schedules'];
                  var scheduleId = data['classes'][i]['schedules_today'][x]['id'];
                  var location = data['classes'][i]['schedules_today'][x]['area']['area_name'];

                  if (tempAttendances.indexOf(data['classes'][i]['schedules_today'][x]['id'])!=-1){
                    trueOrFalse = true;
                  }
                  var reserved = false;
                  if (temp_schedule_ids) {
                    for (var k = 0; k < temp_schedule_ids.length; k++) {
                      if(scheduleId==temp_schedule_ids[k]){
                        reserved=true;
                        break;
                      }
                    }
                  }
            if($scope.relationship_is_lead == 1 && $scope.relationship_isActive == 3){
              $scope.someonesClasss.push({
                id:   id,
                name: name,
                time_in: time_in,
                time_out: time_out,
                scheduleId: scheduleId,
                location: location,
                // styleName: styleName,
                checkedIn: "button-balanced",
                trueOrFalse: trueOrFalse,
                reserved: reserved
              })
            }
            else{
              if (($scope.someones_show_classes_reserve_only == false) || ($scope.someones_show_classes_reserve_only && reserved)){
                $scope.someonesClasss.push({
                  id:   id,
                  name: name,
                  time_in: time_in,
                  time_out: time_out,
                  scheduleId: scheduleId,
                  location: location,
                  // styleName: styleName,
                  checkedIn: "button-balanced",
                  trueOrFalse: trueOrFalse,
                  reserved: reserved
                })
              }
            }

                  
                }
              }
            }
               if ($scope.someonesClasss){

              $scope.temp_classs=[];
                    $scope.temp_classs.push({
                    id:   $scope.someonesClasss[0]['id'],
                    name: $scope.someonesClasss[0]['name'],
                    time_in: $scope.someonesClasss[0]['time_in'],
                    time_out: $scope.someonesClasss[0]['time_out'],
                    scheduleId: $scope.someonesClasss[0]['scheduleId'],
                    location: $scope.someonesClasss[0]['location'],
                    // styleName: styleName,
                    checkedIn: $scope.someonesClasss[0]['checkedIn'],
                    trueOrFalse: $scope.someonesClasss[0]['trueOrFalse'],
                    reserved: $scope.someonesClasss[0]['reserved']
                    });

              for (var a = 0; a < $scope.someonesClasss.length; a++){
                    $scope.temp_classs[0]['id'] = $scope.someonesClasss[a]['id'];
                    $scope.temp_classs[0]['name'] = $scope.someonesClasss[a]['name'];
                    $scope.temp_classs[0]['time_in'] = $scope.someonesClasss[a]['time_in'];
                    $scope.temp_classs[0]['time_out'] = $scope.someonesClasss[a]['time_out'];
                    $scope.temp_classs[0]['scheduleId'] = $scope.someonesClasss[a]['scheduleId'];
                    $scope.temp_classs[0]['location'] = $scope.someonesClasss[a]['location'];
                    $scope.temp_classs[0]['checkedIn'] = $scope.someonesClasss[a]['checkedIn'];
                    $scope.temp_classs[0]['trueOrFalse'] = $scope.someonesClasss[a]['trueOrFalse'];
                    $scope.temp_classs[0]['reserved'] = $scope.someonesClasss[a]['reserved'];

                for (var b = 0; b < temp_schedule_ids.length; b++){
                  if ($scope.someonesClasss[a]['reserved']==true && ($scope.someonesClasss[a]['scheduleId'] == temp_schedule_ids[b])) {
                    $scope.someonesClasss[a]['id'] = $scope.someonesClasss[b]['id'];
                    $scope.someonesClasss[a]['name'] = $scope.someonesClasss[b]['name'];
                    $scope.someonesClasss[a]['time_in'] = $scope.someonesClasss[b]['time_in'];
                    $scope.someonesClasss[a]['time_out'] = $scope.someonesClasss[b]['time_out'];
                    $scope.someonesClasss[a]['scheduleId'] = $scope.someonesClasss[b]['scheduleId'];
                    $scope.someonesClasss[a]['location'] = $scope.someonesClasss[b]['location'];
                    $scope.someonesClasss[a]['checkedIn'] = $scope.someonesClasss[b]['checkedIn'];
                    $scope.someonesClasss[a]['trueOrFalse'] = $scope.someonesClasss[b]['trueOrFalse'];
                    $scope.someonesClasss[a]['reserved'] = $scope.someonesClasss[b]['reserved'];

                    $scope.someonesClasss[b]['id'] = $scope.temp_classs[0]['id'];
                    $scope.someonesClasss[b]['name'] = $scope.temp_classs[0]['name'];
                    $scope.someonesClasss[b]['time_in'] = $scope.temp_classs[0]['time_in'];
                    $scope.someonesClasss[b]['time_out'] = $scope.temp_classs[0]['time_out'];
                    $scope.someonesClasss[b]['scheduleId'] = $scope.temp_classs[0]['scheduleId'];
                    $scope.someonesClasss[b]['location'] = $scope.temp_classs[0]['location'];
                    $scope.someonesClasss[b]['checkedIn'] = $scope.temp_classs[0]['checkedIn'];
                    $scope.someonesClasss[b]['trueOrFalse'] = $scope.temp_classs[0]['trueOrFalse'];
                    $scope.someonesClasss[b]['reserved'] = $scope.temp_classs[0]['reserved'];
                  }
                }
              }
            }
          }).error(function(data){
            $scope.hideLoader();
            // ("error in getClassesForToday")
          });
        }).error(function(data){
      $scope.hideLoader();
      // ("error in getClassesForToday")
    });
  }
  else{
        $scope.someonesClasss.push({
        id:   0,
        name: "Please Connect to the Internet.",
        time_in: " ",
        time_out: " ",
        // styleName: " ",
        checkedIn: "button-balanced hide",
        trueOrFalse: false,
        reserved: false
      })
  }

};

  $scope.selectSomeonesSchool=function(indexId){

    $scope.selected_someonesSchoolId=$scope.someones_schoolIds[indexId];
    $scope.selected_someonesSchoolName=$scope.someones_schoolNames[indexId];
    $scope.selected_someonesSchoolPic=$scope.someones_schoolPictures[indexId];
    $scope.selected_school_id=$scope.selected_someonesSchoolId;
    $scope.changeSomeonesSchoolPopup.close();
    $scope.pressedSomeonesMoreClasses=false;
    $scope.loadSomeonesClasses($scope.someones_userId,$scope.selected_someonesSchoolId);
  };

  $scope.showSomeonesChangeSchool=function(){
  if ($scope.someones_schoolNames) {
    if ($scope.someones_schoolNames.length==1){}
    else if ($scope.someones_schoolNames.length>0) {
      var str = "";
      var selected = "";
      var schoolIds = $scope.someones_schoolIds;
      var names = $scope.someones_schoolNames;
      var pics = $scope.someones_schoolPictures;
      for (var i = 0; i <  names.length; ++i) {
        if ($scope.selected_someonesSchoolId==schoolIds[i])
          selected="Selected";
        else
          selected="";
        
        str+="<div class='item item-avatar item-text-wrap' style='border-bottom: 1px inset;border-top:none;border-left:none;border-right:none;background: transparent;' ng-click='selectSomeonesSchool("+i+")' ><img src='"+$scope.someones_schoolPictures[i]+"' onerror=this.src='img/logo.png' style='background-position: center;border-radius: 50%;'><h3>"+$scope.someones_schoolNames[i]+"</h3><center><p>"+selected+"</center></p></div>";
      }
      $scope.changeSomeonesSchoolPopup = $ionicPopup.show({
      template: str,
      title: 'Change School',

      scope: $scope,
      buttons: [
        { text: 'Back',
          type: 'button-gray'
        },
      ]
    });
    }
  }
};

$scope.setUpCountries= function(){
  if(!localStorage.getItem("listedCountryNames")){
    if(navigator.onLine){
          var str = localStorage.getItem('base_url')+"api/getallcountries/"+$scope.getKey();
          $http.get(str)
          .success(function(data){
            var countryNames = [];
            var countryIds = [];
            for (var i = data.length - 1; i >= 0; i--) {
              countryNames.push(data[i].name);
              countryIds.push(data[i].id);
            }
    
            localStorage.setItem("listedCountryNames",countryNames);
            localStorage.setItem("listedCountryIds",countryIds);
    
          }).error(function(data){
            // ("listedCountries not loaded")
          });    
        }     
  }

  if(!localStorage.getItem("listedStateNames")){
    if(navigator.onLine){
        var str = localStorage.getItem('base_url')+"api/getallstates/"+$scope.getKey();
        $http.get(str)
        .success(function(data){
          var stateNames = [];
          var stateIds = [];
          for (var i = data.length - 1; i >= 0; i--) {
            stateNames.push(data[i].name);
            stateIds.push(data[i].country_id);
          }
  
          localStorage.setItem("listedStateNames",stateNames);
          localStorage.setItem("listedStateIds",stateIds);
  
        }).error(function(data){
          // ("listedStates not loaded")
        });
      }
  }
};

$scope.setUpUserDetailsNet = function(){
      var str = localStorage.getItem('base_url')+"getuserdetails/"+$scope.getKey()+"/"+localStorage.getItem("username");
      $http.get(str)
      .success(function(data){
        localStorage.setItem("userId",data['id']);
        localStorage.setItem("organization_id",data['organization_id']);
        // localStorage.setItem("role_id",data['role_id']);
        localStorage.setItem("email",data['email']);
        localStorage.setItem("first_name",data['first_name']);
        localStorage.setItem("last_name",data['last_name']);
        localStorage.setItem("birthdate",data['birthdate']);
        localStorage.setItem("gender",data['gender']);
        localStorage.setItem("contact_number",data['contact_number']);
        localStorage.setItem("phone_work",data['phone_work']);
        localStorage.setItem("mobile_number",data['mobile_number']);
        localStorage.setItem("picture",localStorage.getItem("base_url")+""+data['picture']);
        localStorage.setItem("country",data['country']);
        localStorage.setItem("state",data['state']);
        localStorage.setItem("city",data['city']);
        localStorage.setItem("street",data['street']);
        localStorage.setItem("zip",data['zip']);
        localStorage.setItem("user_created_at",data['created_at']);
        localStorage.setItem("user_updated_at",data['updated_at']);
        localStorage.setItem("tmauEnrolled",data['tmauEnrolled']);
        $scope.setUpUserDetails();
      }).error(function(data){
        // ("error in setUpUserDetailsNet")
      });
};

$scope.isBlank = function (str) {
  return (str!="N/A" && str!="" && str!=null && str!="null");
}
$scope.email="";
$scope.setUpUserDetails= function() {
      $scope.headder_color="bar-stable bar";
      $scope.username=localStorage.getItem("username");
      $scope.userId=localStorage.getItem("userId");
      $scope.organizationId=localStorage.getItem("organization_id");
      $scope.role_id=localStorage.getItem("role_id");
      $scope.email=localStorage.getItem("email");
      $scope.first_name=localStorage.getItem("first_name");
      $scope.last_name=localStorage.getItem("last_name");

      if($scope.isBlank(localStorage.getItem("birthdate")))
        $scope.birthday=localStorage.getItem("birthdate");
      else
        $scope.birthday="";

      if($scope.isBlank(localStorage.getItem("gender")))
        $scope.gender=localStorage.getItem("gender");
      else
        $scope.gender="";

      if($scope.isBlank(localStorage.getItem("contact_number")))
        $scope.contact_number=localStorage.getItem("contact_number");
      else
        $scope.contact_number="";

      $scope.ontact_number=localStorage.getItem("contact_number");
      $scope.picture=localStorage.getItem("picture");

      var address = [];

      if(localStorage.getItem("country")){
        $country=localStorage.getItem("country").trim();
        if($scope.isBlank($country))
          address.push(" "+$country);
      }

      if(localStorage.getItem("state")){
        $states=localStorage.getItem("state").trim();
        if($scope.isBlank($states))
          address.push(" "+$states);
      }

      if(localStorage.getItem("city")){
        $city=localStorage.getItem("city").trim();
        if($scope.isBlank($city))
          address.push(" "+$city);
      }

      if(localStorage.getItem("street")){
        $street=localStorage.getItem("street").trim();
        if($scope.isBlank($street))
          address.push(" "+$street);
      }

      if(localStorage.getItem("zip")){
        $zip=localStorage.getItem("zip").trim();
        if($scope.isBlank($zip))
          address.push(" "+$zip);
      }  
      

      $scope.address=address.join();

      $scope.name=localStorage.getItem("name");
      $scope.password=localStorage.getItem("password");

      if(localStorage.getItem("password")==null || localStorage.getItem("password")=="")
        $scope.passwordMasked=localStorage.getItem("password");
      else
        $scope.passwordMasked=localStorage.getItem("password").replace(/./g, '*');
      $scope.getUpdatedUserDetails();
};

$scope.getStyleDetails= function(id) {
    var str = localStorage.getItem('base_url')+"api/getstyledetails/"+$scope.getKey()+"/"+id;
    $http.get(str)
    .success(function(data){
      var temp_styleNames = [];
      if(localStorage.getItem("styleNames")){
        temp_styleNames = localStorage.getItem("styleNames").split(",");
        temp_styleNames.push(data.name);
        localStorage.setItem("styleNames",temp_styleNames);
        $scope.styleNames=temp_styleNames;
      }
      else{
        localStorage.setItem("styleNames",data.name);
        temp_styleNames.push(data.name);
        $scope.styleNames=temp_styleNames;
      }
          
    }).error(function(data){
       // ("style details not loaded")
    });  
};

$scope.hideStyleNames=function(){
  if($scope.styleNames==undefined)
    return true;
  else
    return $scope.styleNames.length<=0;

  // return $scope.styleNames.length<=0||$scope.styleNames.length==undefined;
};

$scope.getRankDetails= function(id) {
    var str = localStorage.getItem('base_url')+"api/getrankdetails/"+$scope.getKey()+"/"+id;
    $http.get(str)
    .success(function(data){

      $scope.getStyleDetails(data.style_id);

      if(localStorage.getItem("rankStyleId")){
        var temp_layer_1 = localStorage.getItem("layer_1").split(",");
        var temp_layer_2 = localStorage.getItem("layer_2").split(",");
        var temp_layer_3 = localStorage.getItem("layer_3").split(",");
        var temp_layer_4 = localStorage.getItem("layer_4").split(",");
        var temp_rank_style_id = localStorage.getItem("rankStyleId").split(",");
        var temp_rank_name = localStorage.getItem("rankName").split(",");

        if(data.type=="solid"){
          temp_layer_1.push(data.primary_color);
          temp_layer_2.push(data.primary_color);
          temp_layer_3.push(data.primary_color);
          temp_layer_4.push(data.primary_color);
        }

        else if(data.type=="double"){
          temp_layer_1.push(data.primary_color);
          temp_layer_2.push(data.primary_color);
          temp_layer_3.push(data.secondary_color);
          temp_layer_4.push(data.secondary_color);
        }

        else if(data.type=="stripe"){
          temp_layer_1.push(data.secondary_color);
          temp_layer_2.push(data.primary_color);
          temp_layer_3.push(data.primary_color);
          temp_layer_4.push(data.secondary_color);
        }

        temp_rank_style_id.push(data.style_id);
        temp_rank_name.push(data.name);

        localStorage.setItem("layer_1",temp_layer_1);
        localStorage.setItem("layer_2",temp_layer_2);
        localStorage.setItem("layer_3",temp_layer_3);
        localStorage.setItem("layer_4",temp_layer_4);
        localStorage.setItem("rankStyleId",temp_rank_style_id);
        localStorage.setItem("rankName",temp_rank_name);
      }
      else{
        if(data.type=="solid"){
          localStorage.setItem("layer_1",data.primary_color);
          localStorage.setItem("layer_2",data.primary_color);
          localStorage.setItem("layer_3",data.primary_color);
          localStorage.setItem("layer_4",data.primary_color);
        }

        else if(data.type=="double"){
          localStorage.setItem("layer_1",data.primary_color);
          localStorage.setItem("layer_2",data.primary_color);
          localStorage.setItem("layer_3",data.secondary_color);
          localStorage.setItem("layer_4",data.secondary_color);
        }

        else if(data.type=="stripe"){
          localStorage.setItem("layer_1",data.secondary_color);
          localStorage.setItem("layer_2",data.primary_color);
          localStorage.setItem("layer_3",data.primary_color);
          localStorage.setItem("layer_4",data.secondary_color);
        }

        localStorage.setItem("rankStyleId",data.style_id);
        localStorage.setItem("rankName",data.name);

      }
      if(localStorage.getItem("rankStyleId")){
        $scope.layer_1=localStorage.getItem("layer_1").split(",");
        $scope.layer_2=localStorage.getItem("layer_2").split(",");
        $scope.layer_3=localStorage.getItem("layer_3").split(",");
        $scope.layer_4=localStorage.getItem("layer_4").split(",");
        $scope.rankNames=localStorage.getItem("rankName").split(",");
        $scope.styleAndRanks_display="display:block;";
      }


    }).error(function(data){
       // ("style details not loaded")
    });  
};

$scope.setUpStyleAndOrgDetails= function() {
      
        if(!localStorage.getItem("styleNames")){
          if(navigator.onLine){
            var str = localStorage.getItem('base_url')+"api/getRankId/"+$scope.getKey()+"/"+localStorage.getItem("userId");
            $http.get(str)
            .success(function(data){
              var rankIds = [];

              if (data) {
                for (var i = data.length - 1; i >= 0; i--){
                  $scope.getRankDetails(data[i]);
                }
                localStorage.setItem("rankIds",data);
              }

              
            }).error(function(data){
               // ("rankIds not loaded")
            });
          }
        }
        else{
          $scope.styleAndRanks_display="display:block;";
          $scope.styleNames=localStorage.getItem("styleNames").split(",");
          $scope.layer_1=localStorage.getItem("layer_1").split(",");
          $scope.layer_2=localStorage.getItem("layer_2").split(",");
          $scope.layer_3=localStorage.getItem("layer_3").split(",");
          $scope.layer_4=localStorage.getItem("layer_4").split(",");
          $scope.rankNames=localStorage.getItem("rankName").split(",");
        }

  
      if(localStorage.getItem("orgName")){
        $scope.orgName = localStorage.getItem("orgName");
        $scope.orgPic = localStorage.getItem("base_url")+""+localStorage.getItem("orgPic");
        $scope.org_display="display:block;";
      }
      else
        $scope.org_display="display:none;";

      if(localStorage.getItem("schoolNames")){
        $scope.schoolNames = localStorage.getItem("schoolNames").split(",");
        $scope.schoolPics = localStorage.getItem("schoolPics").split(",");
        $scope.school_display="display:block;";
      }
      else
        $scope.school_display="display:none;";
};

$scope.setUpRelationshipDetails= function() {
      
    if (navigator.onLine) {
      localStorage.removeItem("relationship_id");
      localStorage.removeItem("relationship_type");
      localStorage.removeItem("relationship_sub_type");
      localStorage.removeItem("relationship_first_name");
      localStorage.removeItem("relationship_last_name");
      localStorage.removeItem("relationship_email");
      localStorage.removeItem("relationship_contact_number");
      localStorage.removeItem("ack");
      localStorage.removeItem("existing_user");
      localStorage.removeItem("permissions");
      localStorage.removeItem("permissions2");

      var str = localStorage.getItem('base_url')+"api/getrelationships/"+$scope.getKey()+"/"+localStorage.getItem("userId");
      $http.get(str)
      .success(function(data){
        //$scope.showLoader();
        var relationshipIds = [];

        for (var i = data.length - 1; i >= 0; i--) {
          relationshipIds.push(data[i]);
        }

        for (var i = relationshipIds.length - 1; i >= 0; i--) {
          $scope.getRelationshipDetails(relationshipIds[i]);
        }
        
      }).error(function(data){
         $scope.hideLoader();
      });  
    }
    else
      $scope.rebuildRelationships();
};



$scope.getUpdatedUserDetails=function(){
    if (navigator.onLine) {

      var str = localStorage.getItem('base_url')+"getuserdetails/"+$scope.getKey()+"/"+localStorage.getItem("username");
      $http.get(str)
      .success(function(data){
        localStorage.setItem("userId",data['id']);
        localStorage.setItem("organization_id",data['organization_id']);
        localStorage.setItem("role_id",data['role_id']);
        localStorage.setItem("email",data['email']);
        localStorage.setItem("first_name",data['first_name']);
        localStorage.setItem("last_name",data['last_name']);
        localStorage.setItem("birthdate",data['birthdate']);
        localStorage.setItem("gender",data['gender']);
        localStorage.setItem("contact_number",data['contact_number']);
        localStorage.setItem("phone_work",data['phone_work']);
        localStorage.setItem("mobile_number",data['mobile_number']);
        localStorage.setItem("picture",localStorage.getItem("base_url")+""+data['picture']);
        localStorage.setItem("country",data['country']);
        localStorage.setItem("state",data['state']);
        localStorage.setItem("city",data['city']);
        localStorage.setItem("street",data['street']);
        localStorage.setItem("zip",data['zip']);
        localStorage.setItem("tmauEnrolled",data['tmauEnrolled']);
        localStorage.setItem("isDeleted",data['isDeleted']);
        localStorage.setItem("isActive",data['isActive']);
        localStorage.setItem("isHold",data['isHold']);

      $scope.username=localStorage.getItem("username");
      $scope.userId=localStorage.getItem("userId");
      $scope.organizationId=localStorage.getItem("organization_id");
      $scope.role_id=localStorage.getItem("role_id");
      $scope.email=localStorage.getItem("email");
      $scope.first_name=localStorage.getItem("first_name");
      $scope.last_name=localStorage.getItem("last_name");

      if($scope.isBlank(localStorage.getItem("birthdate")))
        $scope.birthday=localStorage.getItem("birthdate");
      else
        $scope.birthday="";

      if($scope.isBlank(localStorage.getItem("gender")))
        $scope.gender=localStorage.getItem("gender");
      else
        $scope.gender="";

      if($scope.isBlank(localStorage.getItem("contact_number")))
        $scope.contact_number=localStorage.getItem("contact_number");
      else
        $scope.contact_number="";

      $scope.ontact_number=localStorage.getItem("contact_number");
      $scope.picture=localStorage.getItem("picture");

      var address = [];

      if(localStorage.getItem("country")){
        $country=localStorage.getItem("country").trim();
        if($scope.isBlank($country))
          address.push($country);
      }

      if(localStorage.getItem("state")){
        $states=localStorage.getItem("state").trim();
        if($scope.isBlank($states))
          address.push($states);
      }

      if(localStorage.getItem("city")){
        $city=localStorage.getItem("city").trim();
        if($scope.isBlank($city))
          address.push($city);
      }

      if(localStorage.getItem("street")){
        $street=localStorage.getItem("street").trim();
        if($scope.isBlank($street))
          address.push($street);
      }

      if(localStorage.getItem("zip")){
        $zip=localStorage.getItem("zip").trim();
        if($scope.isBlank($zip))
          address.push($zip);
      }  
      
      $scope.address=address.join();

      }).error(function(data){
         // ("relationshipIds not loaded")
      });  
    }
    // else
    //   $scope.error("Please check your Internet connection.");
};

$scope.getRelationshipDetails=function(id){

        if(navigator.onLine){
          var str = localStorage.getItem('base_url')+"api/getrelationship/"+$scope.getKey()+"/"+id;
          $http.get(str)
          .success(function(data){

            $scope._permissions=[];
            $scope._permissions2=[];

            if(!localStorage.getItem("relationship_type")){

              $scope._relationshipId=data.id;
              $scope._type=data.type.toUpperCase();
              $scope._sub_type=data.sub_type.toUpperCase();
              $scope._first_name=data.first_name;
              $scope._last_name=data.last_name;
              $scope._email=data.email;
              $scope._contact_number=data.contact_number;
              $scope._ack=data.ack;
              $scope._existing_user=data.existing_user;

            if (data.existing_user!=null){
              if(data.permissions!=null){
                if(((data.permissions.indexOf("check_in_students")>-1) && (data.permissions.indexOf("edit_student")>-1)) || $scope._type=="PAYER"){
                  $scope._permissions.push("check_in_students");
                  $scope._permissions2.push("edit_student");
                }
                else{
                  if(data.permissions.indexOf("check_in_students")>-1){
                    $scope._permissions.push("check_in_students");
                    $scope._permissions2.push("");
                  }

                  else if(data.permissions.indexOf("edit_student")>-1){
                    $scope._permissions.push("");
                    $scope._permissions2.push("edit_student");
                  }

                  else{
                    $scope._permissions.push("");
                    $scope._permissions2.push("");
                  }
                }
              }
            }
            else{
              $scope._permissions.push("");
              $scope._permissions2.push("");
            }
          }

          else{


            $scope._relationshipId=localStorage.getItem("relationship_id").split(",");
            $scope._type=localStorage.getItem("relationship_type").split(",");
            $scope._sub_type=localStorage.getItem("relationship_sub_type").split(",");
            $scope._first_name=localStorage.getItem("relationship_first_name").split(",");
            $scope._last_name=localStorage.getItem("relationship_last_name").split(",");
            $scope._email=localStorage.getItem("relationship_email").split(",");
            $scope._contact_number=localStorage.getItem("relationship_contact_number").split(",");
            $scope._ack=localStorage.getItem("ack").split(",");
            $scope._existing_user=localStorage.getItem("existing_user").split(",");
            $scope._permissions=localStorage.getItem("permissions").split(",");
            $scope._permissions2=localStorage.getItem("permissions2").split(",");
  
            $scope._relationshipId.push(data.id);
            $scope._type.push(data.type.toUpperCase());
            $scope._sub_type.push(data.sub_type.toUpperCase());
            $scope._first_name.push(data.first_name);
            $scope._last_name.push(data.last_name);
            $scope._email.push(data.email);
            $scope._contact_number.push(data.contact_number);
            $scope._ack.push(data.ack);
            $scope._existing_user.push(data.existing_user);


            if (data.existing_user!=null){
              if(data.permissions!=null){
                if(((data.permissions.indexOf("check_in_students")>-1) && (data.permissions.indexOf("edit_student")>-1)) || $scope._type=="PAYER"){
                  $scope._permissions.push("check_in_students");
                  $scope._permissions2.push("edit_student");
                }
                else{
                  if(data.permissions.indexOf("check_in_students")>-1){
                    $scope._permissions.push("check_in_students");
                    $scope._permissions2.push("");
                  }

                  else if(data.permissions.indexOf("edit_student")>-1){
                    $scope._permissions.push("");
                    $scope._permissions2.push("edit_student");
                  }

                  else{
                    $scope._permissions.push("");
                    $scope._permissions2.push("");
                  }
                }
              }
            }
            else{
              $scope._permissions.push("");
              $scope._permissions2.push("");
            }
          }

          localStorage.setItem("relationship_id",$scope._relationshipId);
          localStorage.setItem("relationship_type",$scope._type);
          localStorage.setItem("relationship_sub_type",$scope._sub_type);
          localStorage.setItem("relationship_first_name",$scope._first_name);
          localStorage.setItem("relationship_last_name",$scope._last_name);
          localStorage.setItem("relationship_email",$scope._email);
          localStorage.setItem("relationship_contact_number",$scope._contact_number);
          localStorage.setItem("ack",$scope._ack);          
          localStorage.setItem("existing_user",$scope._existing_user);
          localStorage.setItem("permissions",$scope._permissions);
          localStorage.setItem("permissions2",$scope._permissions2);

          $scope.rebuildRelationships();

          }).error(function(data){
            // ("getRelationshipDetails")
          });  
        }
};


$scope.showAllUsers=false;
$scope.showSearchUsers=false;
$scope.showNoUsersResults=true;

$scope.userSearchList=[];
  $scope.searchUserName="";

  $scope.alreadyInRelationship=function(first_name,last_name,email){
    // (first_name+"\n"+last_name+"\n"+email)
    if(localStorage.getItem("relationship_email")){
      var first_names = localStorage.getItem("relationship_first_name").split(",");
      var last_names = localStorage.getItem("relationship_last_name").split(",");
      var emails = localStorage.getItem("relationship_email").split(",");

      if (first_names.length>0) {
        for (var i = first_names.length-1; i >= 0; i--) {
              // (first_names[i].toUpperCase()+"=="+first_name.toUpperCase()+"\n"+
              //   last_names[i].toUpperCase()+"=="+last_name.toUpperCase()+"\n"+
              //   emails[i].toUpperCase()+"=="+email.toUpperCase())
            if(first_names[i].toUpperCase()==first_name.toUpperCase()&&last_names[i].toUpperCase()==last_name.toUpperCase()&&emails[i].toUpperCase()==email.toUpperCase()){
              // ("true")
              return true;
            }
          }
        // ("false loop")
        return false;

        }
        else
        // ("false first_names.length")
        return false;
      }
      else
        // ("false localStorage")
        return false;
  };


  $scope.searchForAUser=function(){
    if(navigator.onLine){
    var str = localStorage.getItem('base_url')+"api/getUsersByName/"+$scope.getKey()+"/?org_id="+localStorage.getItem("organization_id")+"&name="+this.searchUserName;
    var temp=this.searchUserName;
    $http.get(str)
    .success(function(data){
      $scope.userSearchList = [];

      for (var i = 0; i < data.length; i++){
        if (localStorage.getItem("userId")!=data[i]['id'] && !$scope.alreadyInRelationship(data[i]['first_name'],data[i]['last_name'],data[i]['email'])){

          var temp_contact_number="";
          var temp_phone_work="";
          var temp_mobile_number="";

          if (data[i]['contact_number'] != "" && data[i]['contact_number']!=null && data[i]['contact_number'].toUpperCase() != "N/A"){
            temp_contact_number = data[i]['contact_number'];
          }          

          else if (data[i]['phone_work'] != "" && data[i]['phone_work']!=null && data[i]['phone_work'].toUpperCase() != "N/A"){
            temp_contact_number = data[i]['phone_work'];
          }          

          else if (data[i]['mobile_number'] != "" && data[i]['mobile_number']!=null && data[i]['mobile_number'].toUpperCase() != "N/A"){
            temp_contact_number = data[i]['mobile_number'];
          }

          var is_lead_style = "";
          if (data[i]['is_lead']==1) {
            is_lead_style="background-color:#f0e68c;";
          }

          $scope.userSearchList.push({
            id: data[i]['id'],
            username: data[i]['username'],
            role_id: data[i]['role_id'],
            email: data[i]['email'],
            first_name: data[i]['first_name'],
            last_name: data[i]['last_name'],
            contact_number: temp_contact_number,
            picture: data[i]['picture'],
            is_lead: is_lead_style,
            on_hold: data[i]['on_hold'],
          });
        }
      }

      if (temp==""){
        $scope.showAllUsers=true;
        $scope.showSearchUsers=true;
        $scope.showNoUsersResults=true;
      }
      else if($scope.userSearchList.length>0){
        $scope.showAllUsers=true;
        $scope.showSearchUsers=false;
        $scope.showNoUsersResults=true;
      }
      else if($scope.userSearchList.length==0 && temp!=""){
        $scope.showAllUsers=true;
        $scope.showSearchUsers=true;
        $scope.showNoUsersResults=false;
      }
      else{
        $scope.showAllUsers=true;
        $scope.showSearchUsers=true;
        $scope.showNoUsersResults=true;
      }
      
      }).error(function(data){
         // ("getUsersByName not loaded")
      }); 
    }
  
  };

  $scope.reloadPopupIsShow=false;
  $scope.x=0;
  $scope.loopCycle = function() {
    $scope.x++;

    if($scope.x>=600){
      if(navigator.onLine){

        // window.location.reload();
        if ($scope.reloadPopupIsShow==false && localStorage.getItem("userId")!="undefined") {
          $scope.reloadPopupIsShow=true;
          var reloadPopup = $ionicPopup.show({
          template: "<center>You have been idle for a while now.</center>",
          // title: 'Update Now',

          scope: $scope,
          buttons: [
            {
              text: '<b>Reload</b>',
              type: 'button-positive',
              hardwareBackButtonClose: false,
              onTap: function(e) {
                if (localStorage.getItem("role_id")<=5){
                  $state.go("app.attendances");
                  $scope.loadClasses($scope.selected_schoolId);            
                }
                else{
                  $state.go("app.profile");
                }
                $scope.reloadPopupIsShow=false;
                $scope.hideLoader();
                $scope.checkUserValidation();
                $scope.intUserRole();
                $scope.setUpRelationshipDetails();
                $scope.setUpStyleAndOrgDetails();
                $scope.setUpUserDetails();
                // if (localStorage.getItem("role_id")<5){
                //   // $scope.loadTasks();
                //   // $scope.loadStudents();
                // }
                var str = localStorage.getItem('base_url')+"api/get_latest_mobileapp/"+$scope.getKey()+"/?os="+localStorage.getItem("osType");
                $http.get(str)
                .success(function(data){
                  $scope.checkForUpdate(localStorage.getItem(localStorage.getItem("osType")),data.version);
                }).error(function(data){
            });
              }
            },
          ]
          });          
        }

 
      }else
        $scope.hideLoader();
      $scope.x=0;
    }
  };
  $scope.loopThis = function() {
    $scope.loopCycle();
    setInterval($scope.loopCycle,1000);
  };

$scope.loadIntoRankDetails=function(rankIds){
  var str = localStorage.getItem('base_url')+"api/getrankdetails/"+$scope.getKey()+"/"+rankIds;
  $http.get(str)
    .success(function(data){
          $scope.class_details_rank_id.push(data.id);
          $scope.class_details_names.push(data.name);
        if(data.type=="solid"){
          $scope.class_details_layer_1.push(data.primary_color);
          $scope.class_details_layer_2.push(data.primary_color);
          $scope.class_details_layer_3.push(data.primary_color);
          $scope.class_details_layer_4.push(data.primary_color);
        }

        else if(data.type=="double"){
          $scope.class_details_layer_1.push(data.primary_color);
          $scope.class_details_layer_2.push(data.primary_color);
          $scope.class_details_layer_3.push(data.secondary_color);
          $scope.class_details_layer_4.push(data.secondary_color);
        }

        else if(data.type=="stripe"){
          $scope.class_details_layer_1.push(data.secondary_color);
          $scope.class_details_layer_2.push(data.primary_color);
          $scope.class_details_layer_3.push(data.primary_color);
          $scope.class_details_layer_4.push(data.secondary_color);
        }
    if ($scope.class_details_names==null){
      scope.class_details_suggested_ranks="N/a";
    }else if ($scope.class_details_names.length<=0){
      $scope.class_details_suggested_ranks="N/a";
    }
    else{
      $scope.class_details_suggested_ranks="";
    }
    }).error(function(data){

    });

};


  $ionicModal.fromTemplateUrl('templates/myClassRecord.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.myClassRecordModal = modal;
  });

  $scope.closeMyClassRecordModal = function(){
    $scope.myClassRecordModal.hide();
  };

$scope.loadIntoClassDetails=function(classId,disableButton,showRecord,listName,schedule_id){

  $scope.show_lead_filter = this.show_lead_filter;
  var bol_show_lead_filter = 0;
  if (this.show_lead_filter) {
    bol_show_lead_filter = 1;
  }
  $scope.str_show_lead_filter="&include_lead="+bol_show_lead_filter;

$scope.selected_class_schedule_id=schedule_id;
  if (navigator.onLine) {
    $scope.class_details_classId=classId;
    $scope.showRecord=showRecord;

    $scope.myClassRecordModal.show();
    //$scope.showLoader();
    $scope.schedule_id = schedule_id;

    var str = localStorage.getItem('base_url')+"api/getClassDetails/"+$scope.getKey()+"/?classid="+classId;
    $http.get(str)
      .success(function(data){


      var today = new Date();
      var date = today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate();
      $scope.str_ranks = "";

      if (data['rank_ids']){
          var rankIds2 = data['rank_ids'].split("-");
          for (var i = rankIds2.length - 1; i >= 0; i--) {
            $scope.str_ranks=$scope.str_ranks+"&rank_ids[]="+rankIds2[i];
          }
          $scope.str_ranks=$scope.str_ranks+"&style_id="+data['style_id'];
      }

    var str4 = localStorage.getItem('base_url')+"api/get_checkedin_students/"+$scope.getKey()+"/?class_id="+classId+"&date="+date;
    
    $http.get(str4)
      .success(function(data){
        $scope.checkedin_students = [];

        var temp_is_lead = "";
           
        for (var i = 0; i < data['students'].length; i++) {
          temp_is_lead = "";
          
          if (data['students'][i]['is_lead']==1)
          temp_is_lead = "background-color:#f0e68c;";
          else
            temp_is_lead=data['students'][i]['is_lead'];

          $scope.checkedin_students.push({
          name:data['students'][i]['first_name']+" "+data['students'][i]['last_name'],
          username:data['students'][i]['username'],
          pic:localStorage.getItem("base_url")+data['students'][i]['picture'],
          userid:data['students'][i]['id'],
          isLead:temp_is_lead,
          onHold:data['students'][i]['on_hold'],
          show_in_filter:false,
          });
        }

        $scope.hideLoader();

        }).error(function(data){
          $scope.hideLoader();

        });

    var str3 = localStorage.getItem('base_url')+"api/getScheduleDetails/"+$scope.getKey()+"/?schedule_id="+$scope.schedule_id;
    $http.get(str3)
    .success(function(data){

        if(data['time_in']==null||data['time_in']=="")
          $scope.class_details_timeIn="N/a";
        else{
          $scope.class_details_timeIn=data['time_in'].split(":");
          $scope.class_details_timeIn=$scope.class_details_timeIn[0]+":"+$scope.class_details_timeIn[1];
        }
        
        if(data['time_out']==null||data['time_out']=="")
          $scope.class_details_timeOut="N/a";
        else{
          $scope.class_details_timeOut=data['time_out'].split(":");
          $scope.class_details_timeOut=$scope.class_details_timeOut[0]+":"+$scope.class_details_timeOut[1];
        }

        $scope.class_details_area_name = data['area']['area_name'];

        var durationLabel = "";
        var duration = Math.abs(parseInt(data['time_out'].split(":")[0]) - parseInt(data['time_in'].split(":")[0])).toString() +":"+ Math.abs(parseInt(data['time_out'].split(":")[1]) - parseInt(data['time_in'].split(":")[1])).toString();

        var x = (parseInt(data['time_out'].split(":")[0]) - parseInt(data['time_in'].split(":")[0]));
        var y = (parseInt(data['time_out'].split(":")[1]) - parseInt(data['time_in'].split(":")[1]));

        if (y<0) {
          x = x - 1;
          y = 60 + y;
          duration = x+":"+y;
        }

        if(parseInt(duration.split(":")[0])==1){
          durationLabel = (parseInt(duration.split(":")[0])).toString();
          durationLabel = durationLabel+" hr";
          if (parseInt(duration.split(":")[1])>0){
           durationLabel = durationLabel+" & "+parseInt(duration.split(":")[1]).toString()+"mins";
          }
        }
        else if(parseInt(duration.split(":")[0])>1){
          durationLabel = parseInt(duration.split(":")[0]).toString();
          durationLabel = durationLabel+" hrs";
          if (parseInt(duration.split(":")[1])>0) {
            durationLabel = durationLabel+" & "+parseInt(duration.split(":")[1]).toString()+"mins";
          }
        }
        else if(parseInt(duration.split(":")[0])==0){
          if(parseInt(duration.split(":")[1])>0){
            durationLabel = parseInt(duration.split(":")[1]).toString() + "mins";
          }
        }
      
        $scope.class_details_duration = durationLabel;

    }).error(function(data){
      $scope.hideLoader();

    });
        if (data['rank_ids']) {
          var rankIds = data['rank_ids'].split("-");
          $scope.class_details_layer_1=[];
          $scope.class_details_layer_2=[];
          $scope.class_details_layer_3=[];
          $scope.class_details_layer_4=[];
          $scope.class_details_names=[];
          $scope.class_details_rank_id=[];
          for (var i = rankIds.length - 1; i >= 0; i--) {
            $scope.loadIntoRankDetails(rankIds[i]);
          }
        }


        $scope.class_details_name=data['name'];


        $scope.disableButton = function(){
          return disableButton;
        }

        $scope.showRecords = function(){
          return $scope.showRecord && $scope.isASchoolStaff();
        }
      

      }).error(function(data){
        $scope.hideLoader();

      });
  }

};

$scope.checkoff= function(userid,classid,name){

  var checkoffPopup = $ionicPopup.show({
    template: "<center>Are you sure to check off "+name+"?</center>",
    title: 'Check In',

    scope: $scope,
    buttons: [
      { text: 'Back',
      type: 'button-gray' },
      {
        text: '<b>Check Off</b>',
        type: 'button-assertive',
        onTap: function(e) {

        if (navigator.onLine) {
          //$scope.showLoader();
          var today = new Date();
          var date = today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate();
          var str = localStorage.getItem('base_url')+"api/class_checkIn_unset/"+$scope.getKey()+"/?class_id="+classid+"&date="+date+"&user_id="+userid;
          $http.get(str)
          .success(function(data){

            if(data == "Check in unset successful"){

              var str2 = localStorage.getItem('base_url')+"api/get_checkedin_students/"+$scope.getKey()+"/?class_id="+classid+"&date="+date;
              $http.get(str2)
              .success(function(data){

                $scope.checkedin_students = [];

                var temp_is_lead = "";
                   
                for (var i = 0; i < data['students'].length; i++) {
                  temp_is_lead = "";
                  
                  if (data['students'][i]['is_lead']==1)
                  temp_is_lead = "background-color:#f0e68c;";
                  else
                    temp_is_lead=data['students'][i]['is_lead'];

                  $scope.checkedin_students.push({
                  name:data['students'][i]['first_name']+" "+data['students'][i]['last_name'],
                  username:data['students'][i]['username'],
                  pic:localStorage.getItem("base_url")+data['students'][i]['picture'],
                  userid:data['students'][i]['id'],
                  isLead:temp_is_lead,
                  onHold:data['students'][i]['on_hold'],
                  show_in_filter:false,
                  });
                }

                $scope.success("Successfully checked off");   
                $scope.hideLoader();

              }).error(function(data){
                $scope.hideLoader();
                // ("get_checkedin_students")
              });
            }
            else{
              $scope.warning(data);
            }

          }).error(function(data){
            $scope.hideLoader();
            // ("class_checkIn_unset")
          });
        }else{
          $scope.warning("Please check internet connection");
        }
        
        }
      },
    ]
  });

};


$scope.showNoStudetsCheckedIn = function(){
  // (($scope.checkedin_userids.length>0)+"\n"+$scope.checkedin_userids.length+"\n"+$scope.checkedin_userids)

  if ($scope.checkedin_students) {
    return $scope.checkedin_students.length>0;
  }
  else{
    return 0;
  }
   
};

$scope.searchForAStudent = function(){

  $scope.precheckedin2_student=[];

  for (var i = 0; i < $scope.precheckedin_student.length; i++) {
    if($scope.precheckedin_student[i]['name'].toUpperCase().match(this.searchStudentName.toUpperCase())){
      $scope.precheckedin2_student.push({
      name:$scope.precheckedin_student[i]['name'],
      username:$scope.precheckedin_student[i]['username'],
      pic:$scope.precheckedin_student[i]['pic'],
      userid:$scope.precheckedin_student[i]['userid'],
      onHold:$scope.precheckedin_student[i]['onHold'],
      isLead:$scope.precheckedin_student[i]['isLead'],
      show_in_filter:$scope.precheckedin_student[i]['show_in_filter'],
      });
    }
  }


  if($scope.precheckedin2_student.length>0 && this.searchStudentName!=""){
    $scope.showAllStudent=false;
    $scope.showSearchStudent=true;
    $scope.showNoResults=false;
  }
  else if($scope.precheckedin2_student.length==0 && this.searchStudentName!=""){
    $scope.showAllStudent=false;
    $scope.showSearchStudent=false;
    $scope.showNoResults=true;
  }
  else{
    $scope.showAllStudent=true;
    $scope.showSearchStudent=false;
    $scope.showNoResults=false;
  }
  $scope.searchStudentName = this.searchStudentName;
};

$ionicModal.fromTemplateUrl('templates/addStudentToClass.html', {
  scope: $scope
}).then(function(modal) {
  $scope.addStudentToClassModal = modal;
});


$scope.closeAddStudent = function(){
  $scope.addStudentToClassModal.hide();
    this.show_lead_filter = true;
  $scope.show_lead_filter = true;
};

$scope.applyClassFilter = function(){
$scope.filter2=[];
$scope.filter2_lbl="";
  for (i in $scope.classRankFilter){
    if($scope.classRankFilter[i] == true){
      $scope.filter2.push(i);
      for (var j = 0; j < $scope.ranksFiletr.length; j++){
        if (i==$scope.ranksFiletr[j]['id']){
          if ($scope.filter2_lbl==""){
            $scope.filter2_lbl =$scope.ranksFiletr[j]['name'];
          }
          else{
            $scope.filter2_lbl =$scope.filter2_lbl +" ,"+$scope.ranksFiletr[j]['name'];
          }
          break;
        }
      }
    }
  }

};

$scope.selectRankFilter = function(filter1){
  $scope.classRankFilter=[];
  var filterContents = "";
  if ($scope.filter1_lbl!="None"){
    for (var i = 0; i < $scope.class_filters.length; i++) {
      if($scope.class_filters[i]['id']==filter1){
        $scope.ranksFiletr=$scope.class_filters[i]['ranks'];
        for (var j = 0; j < $scope.class_filters[i]['ranks'].length; j++) {
          if (j==0) {
            filterContents="<ion-checkbox ng-model='classRankFilter["+$scope.class_filters[i]['ranks'][j]['id']+"]' value='"+$scope.class_filters[i]['ranks'][j]['id']+"' style='border:solid 3px;'>"+$scope.class_filters[i]['ranks'][j]['name']+"</ion-checkbox>";
          }
          else{
            filterContents=filterContents+"<ion-checkbox ng-model='classRankFilter["+$scope.class_filters[i]['ranks'][j]['id']+"]' value='"+$scope.class_filters[i]['ranks'][j]['id']+"' style='border:solid 3px;'>"+$scope.class_filters[i]['ranks'][j]['name']+"</ion-checkbox>";
          }

        }
        $scope.class_filter_rank_index = i;
      }
    }    
    $scope.classRanksFilterPopup = $ionicPopup.show({
      template: filterContents,
      title: 'Select Ranks to Show',

      scope: $scope,
      buttons: [
        { text: 'Back',
          type: 'button-gray'
        },
        { text: 'Apply Filter Settings',
          type: 'button-balanced',
          onTap: function(e){
            $scope.applyClassFilter();
          }
        },
      ]
    }); 
  }
  else{
    $scope.classFilterPopup.close();
  }

};

$scope.parseFilter = function(i){
  alert(this.filter1)
  $scope.filter1=this.filter1;
  $scope.filter1_lbl=$scope.class_filters[i]['name'];

};


$scope.loadClassFilter = function (){
  var str = localStorage.getItem('base_url')+"api/getSchoolStyles/"+$scope.getKey()+"/"+$scope.selected_schoolId;
  $http.get(str)
  .success(function(data){

    if (data["success"]){
      $scope.class_filters=[{id:0,name:"None"}];
      var name = "";
      var id ="";

      for (var i = 0; i < data["data"].length; i++) {

        id = data["data"][i]["id"];
        name = data["data"][i]["name"];
        var ranks=[];

        if (data["data"][i]["ranks"]){
          for (var j = 0; j < data["data"][i]["ranks"].length; j++){
            ranks.push({
              id: data["data"][i]["ranks"][j]["id"],
              name: data["data"][i]["ranks"][j]["name"]
            });
          }
        }
        $scope.class_filters.push({
          id: id,
          name: name,
          ranks: ranks
        });
      }

      var filterContents="";
      if ($scope.class_filters) {
        for (var i = 0; i < $scope.class_filters.length; i++) {
          if (i==0) {
            filterContents="<ion-radio ng-model='filter1' ng-click='parseFilter("+i+")' name='classFilterOption' type='radio' value='"+$scope.class_filters[i]['id']+"' style='border:solid 3px;'>"+$scope.class_filters[i]['name']+"</ion-radio>";
          }
          else{
            filterContents=filterContents+"<ion-radio ng-model='filter1' ng-click='parseFilter("+i+")' name='classFilterOption' type='radio' value='"+$scope.class_filters[i]['id']+"' style='border:solid 3px;'>"+$scope.class_filters[i]['name']+"</ion-radio>";
          }
        } 

        $scope.classFilterPopup = $ionicPopup.show({
          template: filterContents,
          title: 'Class Filter Settings',
          scope: $scope,
          buttons: [
            { text: 'Back',
              type: 'button-gray'
            },
            { text: 'Done',
              type: 'button-balanced',
              onTap: function(e){
                $scope.selectRankFilter($scope.filter1);
              }
            },
          ]
        }); 
      }
    }

  }).error(function(data){
    // ("error")
  });
};

$scope.showLeadFilterUpdate = function(){
  $scope.show_lead_filter = this.show_lead_filter;
  var bol_show_lead_filter = 0;
  if (this.show_lead_filter) {
    bol_show_lead_filter = 1;
  }
  $scope.str_show_lead_filter="&include_lead="+bol_show_lead_filter;
  $scope.showLoader();
  var today = new Date();
  var date = today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate();
  var str = localStorage.getItem('base_url')+"api/get_not_checkedin_students/"+$scope.getKey()+"/?class_id="+$scope.selected_class_id+"&date="+date+$scope.str_show_lead_filter;

  if (!$scope.show_other_students){
    str = localStorage.getItem('base_url')+"api/get_not_checkedin_students/"+$scope.getKey()+"/?class_id="+$scope.selected_class_id+"&date="+date+$scope.str_ranks+$scope.str_show_lead_filter;
  }

  $scope.showLoader();
  $http.get(str)
  .success(function(data){
    $scope.precheckedin_student=[];
    for (var i = 0; i < data['students'].length; i++) {

      if (data['students'][i]['is_lead']==1)
        temp_is_lead="background-color:#f0e68c;";
      else
        temp_is_lead=data['students'][i]['is_lead'];

      $scope.precheckedin_student.push({
      name:data['students'][i]['first_name']+" "+data['students'][i]['last_name'],
      username:data['students'][i]['username'],
      pic:localStorage.getItem("base_url")+data['students'][i]['picture'],
      userid:data['students'][i]['id'],
      onHold:data['students'][i]['on_hold'],
      isLead:temp_is_lead,
      show_in_filter:false,
      });
    }

    $scope.precheckedin2_student=[];

    for (var i = 0; i < $scope.precheckedin_student.length; i++){
      $scope.precheckedin2_student.push({
      name:$scope.precheckedin_student[i]['name'],
      username:$scope.precheckedin_student[i]['username'],
      pic:$scope.precheckedin_student[i]['pic'],
      userid:$scope.precheckedin_student[i]['userid'],
      onHold:$scope.precheckedin_student[i]['onHold'],
      isLead:$scope.precheckedin_student[i]['isLead'],
      show_in_filter:$scope.precheckedin_student[i]['show_in_filter'],
      });
    }

    $scope.showAllStudent=true;
    $scope.showSearchStudent=false;
    $scope.showNoResults=false;
    $scope.hideLoader();
  }).error(function(data){
    $scope.hideLoader();
  });
};

$scope.addOtherStudents = function(){

  if ($scope.show_other_students==true) {
    $scope.show_other_students=false;
  }
  else{
    $scope.show_other_students=true;
  }
  
  $scope.showLeadFilterUpdate();
}

$scope.showAddStudent = function(classId){
  $scope.selected_school_id=$scope.selected_schoolId;
  $scope.show_other_students = false;
  this.show_lead_filter = true;
  $scope.show_lead_filter = true;
  var bol_show_lead_filter = 0;
  if (this.show_lead_filter) {
    bol_show_lead_filter = 1;
  }
  $scope.str_show_lead_filter="&include_lead="+bol_show_lead_filter;
  $scope.addStudentToClassModal.show(); 
  $scope.selected_class_id=classId;
  var today = new Date();
  var date = today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate();
  var str = localStorage.getItem('base_url')+"api/get_not_checkedin_students/"+$scope.getKey()+"/?class_id="+classId+"&date="+date+$scope.str_ranks+$scope.str_show_lead_filter;
  
  $scope.showLoader();
  $http.get(str)
  .success(function(data){
    $scope.precheckedin_student=[];
    for (var i = 0; i < data['students'].length; i++) {

      if (data['students'][i]['is_lead']==1)
        temp_is_lead="background-color:#f0e68c;";
      else
        temp_is_lead=data['students'][i]['is_lead'];

      $scope.precheckedin_student.push({
      name:data['students'][i]['first_name']+" "+data['students'][i]['last_name'],
      username:data['students'][i]['username'],
      pic:localStorage.getItem("base_url")+data['students'][i]['picture'],
      userid:data['students'][i]['id'],
      onHold:data['students'][i]['on_hold'],
      isLead:temp_is_lead,
      show_in_filter:false,
      });
    }

    $scope.precheckedin2_student=[];

    for (var i = 0; i < $scope.precheckedin_student.length; i++){
      $scope.precheckedin2_student.push({
      name:$scope.precheckedin_student[i]['name'],
      username:$scope.precheckedin_student[i]['username'],
      pic:$scope.precheckedin_student[i]['pic'],
      userid:$scope.precheckedin_student[i]['userid'],
      onHold:$scope.precheckedin_student[i]['onHold'],
      isLead:$scope.precheckedin_student[i]['isLead'],
      show_in_filter:$scope.precheckedin_student[i]['show_in_filter'],
      });
    }

    $scope.showAllStudent=true;
    $scope.showSearchStudent=false;
    $scope.showNoResults=false;
    $scope.hideLoader();
  }).error(function(data){
    $scope.hideLoader();
  });

};

$scope.successfulCheckinViaInstructor = function(){
  $scope.loadClasses($scope.selected_schoolId);
  var today = new Date();
  var date = today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate();  
  var str2 = localStorage.getItem('base_url')+"api/get_not_checkedin_students/"+$scope.getKey()+"/?class_id="+$scope.selected_class_id+"&date="+date+$scope.str_ranks+$scope.str_show_lead_filter;
  $scope.showLoader();

  $http.get(str2)
  .success(function(data){

      $scope.precheckedin_student=[];
      for (var i = 0; i < data['students'].length; i++) {

        if (data['students'][i]['is_lead']==1)
          temp_is_lead="background-color:#f0e68c;";
        else
          temp_is_lead=data['students'][i]['is_lead'];

        $scope.precheckedin_student.push({
          name:data['students'][i]['first_name']+" "+data['students'][i]['last_name'],
          username:data['students'][i]['username'],
          pic:localStorage.getItem("base_url")+data['students'][i]['picture'],
          userid:data['students'][i]['id'],
          onHold:data['students'][i]['on_hold'],
          isLead:temp_is_lead,
          show_in_filter:false,
        });
      }

      $scope.precheckedin2_student=[];

      for (var i = 0; i < $scope.precheckedin_student.length; i++) {
        $scope.precheckedin2_student.push({
        name:$scope.precheckedin_student[i]['name'],
        username:$scope.precheckedin_student[i]['username'],
        pic:$scope.precheckedin_student[i]['pic'],
        userid:$scope.precheckedin_student[i]['userid'],
        onHold:$scope.precheckedin_student[i]['onHold'],
        isLead:$scope.precheckedin_student[i]['isLead'],
        show_in_filter:$scope.precheckedin_student[i]['show_in_filter'],
        });
      }


  if($scope.searchStudentName!=undefined){
    if($scope.searchStudentName!=""){

      for (var i = 0; i < $scope.precheckedin_student.length; i++) {
        if($scope.precheckedin_student[i]['name'].toUpperCase().match($scope.searchStudentName.toUpperCase())){
          $scope.precheckedin2_student.push({
          name:$scope.precheckedin_student[i]['name'],
          username:$scope.precheckedin_student[i]['username'],
          pic:$scope.precheckedin_student[i]['pic'],
          userid:$scope.precheckedin_student[i]['userid'],
          onHold:$scope.precheckedin_student[i]['onHold'],
          isLead:$scope.precheckedin_student[i]['isLead'],
          show_in_filter:$scope.precheckedin_student[i]['show_in_filter'],
          });
        }
      }

    }
  }

    var today = new Date();
    var date2 = today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate();  
    var str3 = localStorage.getItem('base_url')+"api/get_checkedin_students/"+$scope.getKey()+"/?class_id="+$scope.selected_class_id+"&date="+date2;
    $http.get(str3)
    .success(function(data){

        $scope.checkedin_students = [];

        var temp_is_lead = "";
           
        for (var i = 0; i < data['students'].length; i++) {
          temp_is_lead = "";
          
          if (data['students'][i]['is_lead']==1)
          temp_is_lead = "background-color:#f0e68c;";
          else
            temp_is_lead=data['students'][i]['is_lead'];

          $scope.checkedin_students.push({
          name:data['students'][i]['first_name']+" "+data['students'][i]['last_name'],
          username:data['students'][i]['username'],
          pic:localStorage.getItem("base_url")+data['students'][i]['picture'],
          userid:data['students'][i]['id'],
          isLead:temp_is_lead,
          onHold:data['students'][i]['on_hold'],
          show_in_filter:false,
          });
        }


      $scope.hideLoader();

    }).error(function(data){
      $scope.hideLoader();

    });

          }).error(function(data){
    $scope.hideLoader();

  });
}

$scope.checkViaInstructor=function(classId,userId,name,schedule_id){
  $scope.selected_student_name=name;
  $scope.selected_student_id=userId;
  $scope.selected_class_id=classId;
  $scope.selected_student_id=userId;
  $scope.selected_class_schedule_id=schedule_id; 

var checkViaInstructorPopup = $ionicPopup.show({
    template: "<center>Are you sure to check in "+name+"?</center>",
    title: 'Check In',

    scope: $scope,
    buttons: [
      { text: 'Back',
      type: 'button-gray' },
      {
        text: '<b>Check In</b>',
        type: 'button-balanced',
        onTap: function(e) {

        if (navigator.onLine) {
          //$scope.showLoader();
          $scope.someones_userId = userId;
          var str = localStorage.getItem('base_url')+"api/class_check_in/"+$scope.getKey()+"/?class_id="+classId+"&school_id="+$scope.selected_schoolId+"&user_id="+userId+"&source=3&dojoclass_schedule_id="+schedule_id+"&manual=1";
 
          $http.get(str)
          .success(function(data){

          if(data == "Check in successful"){
            $scope.success("Successfully Checked in");
            $scope.successfulCheckinViaInstructor(); 

          }

          else if (data == "Already checked in."){
            $scope.warning(data);
            $scope.hideLoader();
          }

          else if(data == "onhold"){

          $ionicPopup.alert({
            title: 'Unable to check in student',
            template: "<center> Student is currently on hold<br>You can update the students status via the school dashboard</center>",
            okType: 'button-energized'
          });
            $scope.hideLoader();
          }

          else if(data == "need-risk-waiver"){
            //via instructor
            var str = localStorage.getItem('base_url')+"getuserdetails/"+$scope.getKey()+"/?userid="+$scope.selected_student_id;


            $http.get(str)
            .success(function(data){
              $scope.selected_student_address=""; 

              if(data.street!="" && data.street!=null){
                if (data.street.toUpperCase()!="N/A")
                  $scope.selected_student_address=data.street;
                else
                  $scope.selected_student_address="N/A";
              }
              else
                  $scope.selected_student_address="N/A";


              if(data.city!="" && data.city!=null){
                if(data.city.toUpperCase()!="N/A")
                  $scope.selected_student_address=$scope.selected_student_address+", "+data.city;
                else
                  $scope.selected_student_address="N/A";
              }
              else
                  $scope.selected_student_address="N/A";
                

              if(data.country!="" && data.country!=null){
                if(data.country.toUpperCase()!="N/A")
                  $scope.selected_student_address=$scope.selected_student_address+", "+data.country;
                else
                  $scope.selected_student_address="N/A";
              }
              else
                $scope.selected_student_address="N/A";


              if(data.zip!="" && data.zip!=null){
                if (data.zip.toUpperCase()!="N/A")
                  $scope.selected_student_address=$scope.selected_student_address+", "+data.zip;
                else
                  $scope.selected_student_address="N/A";
              }
              else
                $scope.selected_student_address="N/A";

              $scope.selected_student_birthdate=data.birthdate;

            if(data.birthdate==""||data.birthdate==null||data.birthdate=="0000-00-00"||data.birthdate=="1970-01-01")
                $scope.settingupBirthdate(data.username);
            else
                $scope.askForGuardiansNameViaSomeone(false); 

            }).error(function(data){
              // (error)
            });

             $scope.hideLoader();
          }

          else if(data == "exclusive"){
            var sorryPopup = $ionicPopup.alert({
              title: 'Sorry',
              template: "<center>This is an Exclusive class.Please add the Program of this class to the student to enable check in.</center>",
              okType: "button-assertive"
            });

           $scope.hideLoader();
          }

          else{
            $scope.warning(data);
            $scope.hideLoader();
          }
          }).error(function(data){
            $scope.error("Error:"+data);
            $scope.hideLoader();
          });

        }else{
          $scope.warning("Please check internet connection");
        }
        
        }
      },
    ]
  });

};

$scope.settingupBirthdate = function(username){
  $scope.temp_username=username;
  $scope.setupBirthdatePopup = $ionicPopup.show({
    template: "<center><input id='setupBirthdate' type='date' style='border: 1px solid grey;border-radius:5%;padding-bottom:5px; text-align: center;'></input><b id='setupBirthdateLabel' style='color:red;display:none' >Please input valid date.</b><button class='button button-balanced button-full' ng-click='setbirthdate()'>Update</button></center>",
    title: "Please set birthdate.",

    scope: $scope,
      buttons: [{
        text: 'Cancel',
        type: 'button-gray',         
        onTap: function(e) {
          $scope.setupBirthdatePopup.close();
        }},
      ]
  });
}
              

$scope.setbirthdate = function(){

  if(document.getElementById("setupBirthdate").value==""){
      $("#setupBirthdateLabel").css('display','block');
  }
  else{
      var date_set = new Date(document.getElementById("setupBirthdate").value);
      var two_yrs_ago = new Date();
      two_yrs_ago.setFullYear((two_yrs_ago.getFullYear() - 2));

      if (date_set){
        if(two_yrs_ago<date_set){
        $("#setupBirthdateLabel").css('display','block');
      }
      else{
        $("#setupBirthdateLabel").css('display','none');
      $scope.setupBirthdatePopup.close();
      $scope.selected_student_birthdate_temp=document.getElementById("setupBirthdate").value;
      var str = localStorage.getItem('base_url')+"updateuser/"+$scope.getKey()+"?username="+$scope.temp_username+"&birthdate="+document.getElementById("setupBirthdate").value;
      $scope.showLoader();
      $http.get(str)
      .success(function(data){
        $scope.hideLoader();
        $scope.selected_student_birthdate=$scope.selected_student_birthdate_temp;
          $scope.askForGuardiansName();
      }).error(function(data){
       $scope.hideLoader();
      }); 
      }
    }else{
      $("#setupBirthdateLabel").css('display','block');
    }
  }
}

$scope.askForGuardiansNameViaSomeone = function(isCheckedInByParent){
  var guardiansName = "";
  if (isCheckedInByParent) {
    guardiansName = localStorage.getItem("first_name")+" "+localStorage.getItem("last_name");
  }
  var today = new Date();
  var birthDate = new Date($scope.selected_student_birthdate);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) 
  {
      age--;
  }

  $scope.riskWaiverWarningMsg=false;
  $scope.selected_student_age=age;
  $scope.riskWaiverWarning = $ionicPopup.show({
    template: "<center> This student does not have a Risk Waiver signed so you can't check this student in. <br><br><center><input id='guardiansName' type='text' value='"+guardiansName+"' style='border: 1px solid grey;border-radius:5%;padding-bottom:5px; text-align: center;' placeholder='Parent/Guardian's Name></input><b style='color:red;' ng-show='riskWaiverWarningMsg'>If U18 type parent/guardian name here first.</b><button class='button button-balanced' ng-click='showDigitalSignature();'>Read and Sign Risk Waiver</button></center><br>Please note if the student is under 18, the student must get a parent or guardian to sign this on the student's behalf.</center>",
    title: "Warning",

    scope: $scope,
      buttons: [{
        text: 'Cancel',
        type: 'button-gray',         
        onTap: function(e) {
          $scope.riskWaiverWarning.close();
        }},
      ]
  });
}



$scope.askForGuardiansName = function(){
  var today = new Date();
  var birthDate = new Date($scope.selected_student_birthdate);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) 
  {
      age--;
  }

  $scope.riskWaiverWarningMsg=false;
  $scope.selected_student_age=age;
  $scope.riskWaiverWarning = $ionicPopup.show({
    template: "<center> You don't have a Risk Waiver signed so you can't check in. <br><br><center><input id='guardiansName' type='text' style='border: 1px solid grey;border-radius:5%;padding-bottom:5px; text-align: center;' placeholder='Parent/Guardian's Name></input><b style='color:red;' ng-show='riskWaiverWarningMsg'>If U18 type parent/guardian name here first.</b><button class='button button-balanced' ng-click='showDigitalSignature();'>Read and Sign Risk Waiver</button></center><br>Please note if you are under 18 you must get a parent or guardian to sign this on your behalf.</center>",
    title: "Warning",

    scope: $scope,
      buttons: [{
        text: 'Cancel',
        type: 'button-gray',         
        onTap: function(e) {
          $scope.riskWaiverWarning.close();
        }},
      ]
  });
}




$scope.addLead = function(){
  if((this.add_lead_first_name==""||this.add_lead_first_name==null) || (this.add_lead_last_name==""||this.add_lead_last_name==null) || (this.add_lead_email==""||this.add_lead_email==null) || (this.add_lead_contact_number==""||this.add_lead_contact_number==null))
    $scope.warning("<b>Fields with <font color='red'>*</font> are required fields.</b>")
  else{
      var date = new Date(this.add_lead_birthdate);
      alert(this.add_lead_first_name+"\n"+
      this.add_lead_last_name+"\n"+
      this.add_lead_email+"\n"+
      this.add_lead_contact_number+"\n"+
      date.getDate()+"-"+(date.getMonth()+1)+"-"+date.getFullYear()+"\n"+
      this.add_lead_gender+"\n"+
      this.add_lead_country.name+"\n"+
      this.add_lead_state.name+"\n"+
      this.add_lead_city+"\n"+
      this.add_lead_street+"\n"+
      this.add_lead_zip)
    }
}

  $ionicModal.fromTemplateUrl('templates/addLead.html', {
    scope: $scope
  }).then(function(modal){
    $scope.addLeadModal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeAddLeadModal = function(){
    $scope.addLeadModal.hide();
  };

$scope.showAddLead =function(){
  $scope.addLeadModal.show();

$scope.add_lead_gender="Male"
$scope.add_lead_male_selected="true";

      $scope.countryNameOptions=localStorage.getItem("listedCountryNames").split(",");
      $scope.countryIdOptions=localStorage.getItem("listedCountryIds").split(",");

      var defaultCountry = 0;
        $scope.countryOptions = [];

      for (var i = $scope.countryNameOptions.length-1; i >= 0 ; i--) {
          $scope.countryOptions.push({
            name: $scope.countryNameOptions[i],
            id: $scope.countryIdOptions[i]
          })
      }

      $scope.add_lead_country=$scope.countryOptions[12];

      $scope.allStateNames=localStorage.getItem("listedStateNames").split(",");
      $scope.allStateIds=localStorage.getItem("listedStateIds").split(",");

      var defaultState = 0;
      var c=0;
      $scope.stateOptions = [];
      for (var i = $scope.allStateNames.length-1; i >= 0; i--) {
        if($scope.allStateIds[i]==$scope.add_lead_country.id){
          c++;
          $scope.stateOptions.push({
            name: $scope.allStateNames[i],
            id: $scope.allStateIds[i]
          })
          }
      }

      $scope.add_lead_state=$scope.stateOptions[0];

      $scope.changeCountry = function() {

        $scope.stateOptions = [];

        $scope.stateOptions.push({
          name: "Select State",
          id: ""
        });

        for (var i = $scope.allStateNames.length-1; i >= 0; i--) {
          if($scope.allStateIds[i]==this.add_lead_country.id)
            $scope.stateOptions.push({
              name: $scope.allStateNames[i],
              id: $scope.allStateIds[i]
            })
        }
        $scope.add_lead_state=$scope.stateOptions[0];
      };

};

  $ionicModal.fromTemplateUrl('templates/contactLeadDetails.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.contactLeadDetailsModal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeContactLeadDetails = function(){
    $scope.contactLeadDetailsModal.hide();
  };

$scope.showcontactLeadDetails =function(index){
$scope.contact_lead_name = $scope.contact_leads_data[index].lastName+" "+$scope.contact_leads_data[index].firstName;
$scope.contact_lead_status = $scope.contact_leads_data[index].status;
$scope.contact_lead_email = $scope.contact_leads_data[index].email;
$scope.contact_lead_phone_number = $scope.contact_leads_data[index].contactNum;
  $scope.contactLeadDetailsModal.show();
};


  $ionicModal.fromTemplateUrl('templates/bookedLeadDetails.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.bookedLeadDetailsModal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeBookedLeadDetails = function(){
    $scope.bookedLeadDetailsModal.hide();
  };

$scope.showBookedLeadDetails =function(index){
  $scope.booked_lead_name=$scope.booked_leads_data[index].lastName+" "+$scope.booked_leads_data[index].firstName;
  $scope.booked_lead_status=$scope.booked_leads_data[index].status;
  $scope.booked_lead_date=$scope.booked_leads_data[index].date;
  $scope.booked_lead_trials_left=$scope.booked_leads_data[index].trial;

  $scope.bookedLeadDetailsModal.show();
};

  $ionicModal.fromTemplateUrl('templates/visitorsTodayDetails.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.visitorsTodayDetailsModal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeVisitorsTodayDetails = function(){
    $scope.visitorsTodayDetailsModal.hide();
  };

$scope.showVisitorsTodayDetails =function(){
  $scope.visitorsTodayDetailsModal.show();
};


  $ionicModal.fromTemplateUrl('templates/closedLeadDetails.html', {
    scope: $scope
  }).then(function(modal){
    $scope.closedLeadDetailsModal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeClosedLeadDetails = function(){
    $scope.closedLeadDetailsModal.hide();
  };

  $scope.showClosedLeadDetails =function(index){
    $scope.closed_lead_name = $scope.closed_leads_data[index].firstName+" "+$scope.closed_leads_data[index].lastName;
    $scope.closed_lead_status = $scope.closed_leads_data[index].statues;
    $scope.closed_lead_reason = $scope.closed_leads_data[index].reason;
    $scope.closed_lead_last_visited = $scope.closed_leads_data[index].lastVisited;
    $scope.closedLeadDetailsModal.show();
  };


  // $ionicModal.fromTemplateUrl('templates/digitalSignature.html', {
  //   scope: $scope
  // }).then(function(modal) {
  //   $scope.digitalSignaturesModal = modal;
  // });

  // // Triggered in the login modal to close it
  // $scope.closeDigitalSignature = function(){
  //   $scope.digitalSignaturesModal.hide();
  // };

  // $scope.showDigitalSignature =function(){
  //   $scope.signature = document.getElementById("signHere");
  //   // ($scope.signature)
  //   $scope.digitalSignaturesModal.show();
  // };


  // $scope.initCanvas = function () {
  //   $scope.lastPt = new Object();
  //   $scope.touchzone = document.getElementById("mycanvas");
  //   $scope.touchzone.addEventListener("touchmove", $scope.draw, false);
  //   $scope.touchzone.addEventListener("touchend", $scope.end, false);   
  //   $scope.canvas = document.getElementById('mycanvas');
  //   $scope.ctx = $scope.canvas.getContext("2d");
  // }

  // $scope.draw= function (e) {
  //   e.preventDefault();

  //   //Iterate over all touches
  //   for(var i=0;i<e.touches.length;i++) {
  //     var id = e.touches[i].identifier;   
  //     if($scope.lastPt[id]) {
  //       $scope.ctx.beginPath();
  //       $scope.ctx.moveTo($scope.lastPt[id].x- document.getElementById("mycanvas").getBoundingClientRect().left, $scope.lastPt[id].y- document.getElementById("mycanvas").getBoundingClientRect().top);
  //       $scope.ctx.lineTo(e.touches[i].pageX- document.getElementById("mycanvas").getBoundingClientRect().left, e.touches[i].pageY- document.getElementById("mycanvas").getBoundingClientRect().top);
  //       $scope.ctx.strokeStyle = 'black';
  //       $scope.ctx.lineWidth = 5;
  //       $scope.ctx.stroke();

  //     }
  //     // Store last point
  //     $scope.lastPt[id] = {x:e.touches[i].pageX, y:e.touches[i].pageY};
  //     // (e.touches[i].pageX+"\n"+e.touches[i].pageY)
  //   }
  // }
  
  // $scope.end = function(e) {
  //   e.preventDefault();
  //   for(var i=0;i<e.changedTouches.length;i++) {
  //     var id = e.changedTouches[i].identifier;
  //     // Terminate this touch
  //     delete $scope.lastPt[id];
  //   }
  // }  
  
  //   $scope.erase = function() {
  //     $scope.ctx.clearRect(0, 0, $scope.canvas.width, $scope.canvas.height);
  //   }
    
  //  $scope.save = function() {
  //       var dataURL = $scope.canvas.toDataURL();
  //       // (dataURL);
  //       // console.log(dataURL);
  //       // ($scope.signature)
  //       $scope.signature.src=dataURL;
  //       $scope.closeDigitalSignature();
  //       // $scope.signHere=dataURL;
  //   }

    $scope.toggleVisitors = function(){
      if($scope.toggle_visitors==0){
        $scope.toggle_visitors_classes="";
        $scope.toggle_visitors_appointments="button-outline";
        $scope.toggle_visitors=1;
      }

      else{
        $scope.toggle_visitors_classes="button-outline";
        $scope.toggle_visitors_appointments="";
        $scope.toggle_visitors=0;
      }

    }

    $scope.showVisitorsClasses = function(){
      if($scope.toggle_visitors==1)
        return true;
      else
        return false;
    }

    $scope.showVisitorsAppointments = function(){
      if($scope.toggle_visitors==0)
        return true;
      else
        return false;
    }
$scope.selectLeadOption=function (option){

  if(option=='1'){
    $scope.lead_option_1='border-bottom: 6px solid #ffc900;';
    $scope.lead_option_2='';
    $scope.lead_option_3='';
    $scope.lead_option_4='';
    $scope.lead_option=option;
  } 
  else if(option=='2'){
    $scope.lead_option_1='';
    $scope.lead_option_2='border-bottom: 6px solid #33cd5f;';
    $scope.lead_option_3='';
    $scope.lead_option_4='';
    $scope.lead_option=option;
  } 
  else if(option=='3'){
    $scope.lead_option_1='';
    $scope.lead_option_2='';
    $scope.lead_option_3='border-bottom: 6px solid #ef473a;';
    $scope.lead_option_4='';
    $scope.lead_option=option;
    $scope.toggle_visitors=1;
    $scope.toggle_visitors_classes="";
    $scope.toggle_visitors_appointments="button-outline";
  } 
  else if(option=='4'){
    $scope.lead_option_1='';
    $scope.lead_option_2='';
    $scope.lead_option_3='';
    $scope.lead_option_4='border-bottom: 6px solid #444444;';
    $scope.lead_option=option;
  }
  else{
    $scope.lead_option_1='border-bottom: 6px solid #ffc900;';
    $scope.lead_option_2='';
    $scope.lead_option_3='';
    $scope.lead_option_4='';
    $scope.lead_option='1';
  } 
  
};


$scope.taskList=[];
$scope.contact_leads_data=[];
$scope.booked_leads_data=[];
$scope.class_visitors_data=[];
$scope.appointment_visitors_data=[];
$scope.closed_leads_data=[];
$scope.productList=[];

$scope.taskList_all=[];
$scope.taskList_open=[];
$scope.taskList_claimed=[];
$scope.taskList_completed=[];
$scope.taskList_closed=[];


$scope.getTaskData = function(taskId,taskStatus,taskType,processed_by,processed_img,processed_by_id,data_studentId,call_back_date,createdOn,contacted,taskDue){

   var str2 = localStorage.getItem('base_url')+"getuserdetails/"+$scope.getKey()+"/?userid="+data_studentId;

    $http.get(str2)
    .success(function(data){
    $scope.dataCounter++;

      if(data['id']!=undefined){
        var data_first_name = data['first_name'];
        var data_last_name = data['last_name'];
        var data_birthdate = data['birthdate'];
        var data_gender = data['gender'];
        var data_picture = data['picture'];
        var data_script = "N/A";
        var callBackDate2 = "";
        var oneDay = 24*60*60*1000;
        var firstDate = new Date();
        var secondDate = new Date();
        var temp = 0;
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

        var contactsName = [];
        var contactsNumbers = [];
        var contactsRoles = [];
        var color ="";

        if(data['contact_number']!="" && data['contact_number'].toUpperCase()!="N/A"){
          contactsName.push(data_first_name+" "+data_last_name);
          contactsNumbers.push(data['contact_number']);
          contactsRoles.push("Student's Phone (Home)");
        }

        if(data['phone_work']!="" && data['phone_work'].toUpperCase()!="N/A"){
          contactsName.push(data_first_name+" "+data_last_name);
          contactsNumbers.push(data['phone_work']);
          contactsRoles.push("Student's Phone (Work)");
        }

        if(data['mobile_number']!="" && data['mobile_number'].toUpperCase()!="N/A"){
          contactsName.push(data_first_name+" "+data_last_name);
          contactsNumbers.push(data['mobile_number']);
          contactsRoles.push("Student's Mobile Number");
        }

        createdOn = new Date(createdOn.replace(/-/g,'/'));
        createdOn = months[createdOn.getMonth()]+" "+createdOn.getDate()+", "+createdOn.getFullYear();

        if(parseInt(call_back_date)!=0){
          firstDate = new Date(parseInt(call_back_date)*1000);

          temp = Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay));
          temp=Math.floor(temp);
          if (temp <= 1) {
            callBackDate2 = 0;
          }
          else{
            callBackDate2 = temp;
          }
        }
        else
          callBackDate2 = 0;


        var lastAttended = "Today";
        if(parseInt(data.last_attended)!=0){
          temp=0;
          firstDate = new Date(parseInt(data.last_attended)*1000);
          temp = (firstDate.getTime() - secondDate.getTime())/(oneDay);
          var temp2 = Math.abs(temp);
          if (temp2 < 1) {
            lastAttended = Math.abs(Math.round(temp*24))+" hour(s) ago";
          }
          else{
            lastAttended = "Last attended "+Math.abs(Math.round(temp2))+" day(s) ago";
          }
        }
        else
          lastAttended = "No Attendance";


        if(taskDue!=null){
          temp=0;

          firstDate = new Date(taskDue.replace(/-/g,'/'));
          if((taskStatus=="OPEN"||taskStatus=="CLAIMED")&&taskDue!="")
          temp = parseInt(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));

          if (temp <= 1) {
            taskDue = "Due today";
          }
          else{
            taskDue = "Due "+temp+" day(s) ago";
          }
        }
        else{
          taskDue = "Due today";
        }

        if(contacted>0)
          contacted="Contacted "+contacted+" time(s)";
        else
          contacted="Not yet contacted";
        
          if (taskStatus=="OPEN")
        color = "color:#ff6801;";
          else if (taskStatus=="CLAIMED")
        color = "color:#297fb8;";
          else if (taskStatus=="UPCOMING")
        color = "color:#a500c8;";
          else if (taskStatus=="CLOSED")
        color = "color:#a7a7a7;";



        if (taskStatus!="CLOSED") {
            if(taskStatus=='UPCOMING'){
              if (callBackDate2==0) {
                callBackDate2="Today";
              }
              else{
                callBackDate2 = callBackDate2+" day(s) from now";      
              }
            }

            $scope.taskList_all.push({
            id: taskId,
            contactName: contactsName, 
            contactNumber: contactsNumbers,
            contactRole: contactsRoles,
            studentId: data_studentId,
            studentImg: localStorage.getItem('base_url')+data_picture,
            studentName: data_first_name+" "+data_last_name,
            taskType: taskType,
            sudggestedScripts: data_script,
            peoplesImg: processed_img,
            people: processed_by,
            peopleId: processed_by_id,
            status: taskStatus,
            callBackDate: callBackDate2,
            colorType: color,
            createdOn: "Created on "+createdOn,
            lastAttended: lastAttended,
            birthdate: data_birthdate,
            gender: data_gender,
            contacted: contacted,
            due: taskDue,
          });
        }
        else{
            $scope.taskList_closed.push({
            id: taskId,
            contactName: contactsName, 
            contactNumber: contactsNumbers,
            contactRole: contactsRoles,
            studentId: data_studentId,
            studentImg: localStorage.getItem('base_url')+data_picture,
            studentName: data_first_name+" "+data_last_name,
            taskType: taskType,
            sudggestedScripts: data_script,
            peoplesImg: processed_img,
            people: processed_by,
            peopleId: processed_by_id,
            status: taskStatus,
            callBackDate: callBackDate2,
            colorType: color,
            createdOn: "Created on "+createdOn,
            lastAttended: lastAttended,
            birthdate: data_birthdate,
            gender: data_gender,
            contacted: contacted,
            due: taskDue,
          });

        }

      if ($scope.taskList_all.length>0) {
        if (taskStatus=="OPEN")
          $scope.taskList_open.push($scope.taskList_all[$scope.taskList_all.length-1])
        else if (taskStatus=="CLAIMED")
          $scope.taskList_claimed.push($scope.taskList_all[$scope.taskList_all.length-1])
        else if (taskStatus=="UPCOMING")
          $scope.taskList_upcoming.push($scope.taskList_all[$scope.taskList_all.length-1])
      }

//-----------------------------------------
      $scope.taskList_DNA_all=0;
      $scope.taskList_DNA_claimed=0;
      $scope.taskList_DNA_open=0;
      $scope.taskList_DNA_closed=0;

      $scope.taskList_ADHOC_all=0;
      $scope.taskList_ADHOC_claimed=0;
      $scope.taskList_ADHOC_open=0;
      $scope.taskList_ADHOC_closed=0;

      $scope.taskList_MANAGER_all=0;
      $scope.taskList_MANAGER_claimed=0;
      $scope.taskList_MANAGER_open=0;
      $scope.taskList_MANAGER_closed=0;

      $scope.taskList_POSTCARD_all=0;
      $scope.taskList_POSTCARD_claimed=0;
      $scope.taskList_POSTCARD_open=0;
      $scope.taskList_POSTCARD_closed=0;

      $scope.taskList_NewStudent_all=0;
      $scope.taskList_NewStudent_claimed=0;
      $scope.taskList_NewStudent_open=0;
      $scope.taskList_NewStudent_closed=0;



    for(var i = 0; i < $scope.taskList_all.length; i++){
// ($scope.taskList_all[i]['peopleId'] +"\n"+ localStorage.getItem("userId")+"\n"+($scope.taskList_all[i]['peopleId'] == localStorage.getItem("userId")))
      if($scope.taskList_all[i]['taskType']=="DNA"){
        $scope.taskList_DNA_all++;
        if($scope.taskList_all[i]['status']=="OPEN"){
          $scope.taskList_DNA_open++;
        }
        else if($scope.taskList_all[i]['status']=="CLAIMED" && $scope.taskList_all[i]['peopleId'] == localStorage.getItem("userId")){
          $scope.taskList_DNA_claimed++;
        }
      }

      else if($scope.taskList_all[i]['taskType']=="ADHOC"){
        $scope.taskList_ADHOC_all++;
        if($scope.taskList_all[i]['status']=="OPEN"){
          $scope.taskList_ADHOC_open++;
        }
        else if($scope.taskList_all[i]['status']=="CLAIMED" && $scope.taskList_all[i]['peopleId'] == localStorage.getItem("userId")){
          $scope.taskList_ADHOC_claimed++;
        }
      }

      else if($scope.taskList_all[i]['taskType']=="MANAGER"){
        $scope.taskList_MANAGER_all++;
        if($scope.taskList_all[i]['status']=="OPEN"){
          $scope.taskList_MANAGER_open++;
        }
        else if($scope.taskList_all[i]['status']=="CLAIMED" && $scope.taskList_all[i]['peopleId'] == localStorage.getItem("userId")){
          $scope.taskList_MANAGER_claimed++;
        }
      }

      else if($scope.taskList_all[i]['taskType']=="POST-CARD"){
        $scope.taskList_POSTCARD_all++;
        if($scope.taskList_all[i]['status']=="OPEN"){
          $scope.taskList_POSTCARD_open++;
        }
        else if($scope.taskList_all[i]['status']=="CLAIMED" && $scope.taskList_all[i]['peopleId'] == localStorage.getItem("userId")){
          $scope.taskList_POSTCARD_claimed++;
        }
      }

      else if($scope.taskList_all[i]['taskType']=="New Student"){
        $scope.taskList_NewStudent_all++;
        if($scope.taskList_all[i]['status']=="OPEN"){
          $scope.taskList_NewStudent_open++;
        }
        else if($scope.taskList_all[i]['status']=="CLAIMED" && $scope.taskList_all[i]['peopleId'] == localStorage.getItem("userId")){
          $scope.taskList_NewStudent_claimed++;
        }
      }
    }

    for (var i = $scope.taskList_closed.length - 1; i >= 0; i--) {
      if($scope.taskList_closed[i]['taskType']=="DNA"){
        $scope.taskList_DNA_closed++;
      }            
      else if($scope.taskList_closed[i]['taskType']=="ADHOC"){
        $scope.taskList_ADHOC_closed++;
      }
      else if($scope.taskList_closed[i]['taskType']=="MANAGER"){
        $scope.taskList_MANAGER_closed++;
      }
      else if($scope.taskList_closed[i]['taskType']=="POST-CARD"){
        $scope.taskList_POSTCARD_closed++;
      }
      else if($scope.taskList_closed[i]['taskType']=="New Student"){
        $scope.taskList_NewStudent_closed++;
      }
    }

    if($scope.selectedTaskType == 2){
      $scope.mainTaskType_claimed_length = $scope.taskList_ADHOC_claimed;
      $scope.mainTaskType_open_length = $scope.taskList_ADHOC_open;
      $scope.mainTaskType_all_length = $scope.taskList_ADHOC_all;
      $scope.mainTaskType_closed_length = $scope.taskList_ADHOC_closed;
    }
    else if($scope.selectedTaskType == 3){
      $scope.mainTaskType_claimed_length = $scope.taskList_MANAGER_claimed;
      $scope.mainTaskType_open_length = $scope.taskList_MANAGER_open;
      $scope.mainTaskType_all_length = $scope.taskList_MANAGER_all;
      $scope.mainTaskType_closed_length = $scope.taskList_MANAGER_closed;
    }
    else if($scope.selectedTaskType == 4){
      $scope.mainTaskType_claimed_length = $scope.taskList_POSTCARD_claimed;
      $scope.mainTaskType_open_length = $scope.taskList_POSTCARD_open;
      $scope.mainTaskType_all_length = $scope.taskList_POSTCARD_all;
      $scope.mainTaskType_closed_length = $scope.taskList_POSTCARD_closed;
    }
    else if($scope.selectedTaskType == 5){
      $scope.mainTaskType_claimed_length = $scope.taskList_NewStudent_claimed;
      $scope.mainTaskType_open_length = $scope.taskList_NewStudent_open;
      $scope.mainTaskType_all_length = $scope.taskList_NewStudent_all;
      $scope.mainTaskType_closed_length = $scope.taskList_NewStudent_closed;
    }
    else{
      $scope.mainTaskType_claimed_length = $scope.taskList_DNA_claimed;
      $scope.mainTaskType_open_length = $scope.taskList_DNA_open;
      $scope.mainTaskType_all_length = $scope.taskList_DNA_all;
      $scope.mainTaskType_closed_length = $scope.taskList_DNA_closed;
    }
      


    if($scope.dataCounter ==  $scope.datalength){
      $scope.taskList_all=[];

      $scope.taskList_sorted_upcoming=[];
      var upcoming_length=$scope.taskList_upcoming.length;
      var temp_index=0;

      for (var i = 0; i < upcoming_length; i++) {
        temp_index=0;

        for (var j = 0; j < $scope.taskList_upcoming.length; j++) {
           if ($scope.taskList_upcoming[temp_index]['callBackDate']>=$scope.taskList_upcoming[j]['callBackDate']){
            temp_index=j;
           } 
        }

        $scope.taskList_sorted_upcoming.push($scope.taskList_upcoming[temp_index]);
        $scope.taskList_upcoming.splice(temp_index, 1);

      }

      for (var i = $scope.taskList_open.length - 1; i >= 0; i--) {
        $scope.taskList_all.push($scope.taskList_open[i]);
      }

      for (var i = $scope.taskList_claimed.length - 1; i >= 0; i--) {
        $scope.taskList_all.push($scope.taskList_claimed[i]);
      }

      for (var i = $scope.taskList_sorted_upcoming.length-1; i >=0 ; i--) {
        if ($scope.taskList_sorted_upcoming[i]['callBackDate']==0) {
          $scope.taskList_sorted_upcoming[i]['callBackDate']="Today";
        }
        else{
          $scope.taskList_sorted_upcoming[i]['callBackDate'] = $scope.taskList_sorted_upcoming[i]['callBackDate']+" day(s) from now";      
        }
        $scope.taskList_all.push($scope.taskList_sorted_upcoming[i]);
      }

      for (var i = $scope.taskList_closed.length - 1; i >= 0; i--) {
        $scope.taskList_all.push($scope.taskList_closed[i]);
      }

        $scope.hideLoader();
      }
    }
   }).error(function(data){
      // $scope.hideLoader();
      $scope.dataCounter++;
        // ("getuserdetails")
    });

}
        $scope.selectedTaskType=1;
        $scope.selectedSubTaskType="ALL";
$scope.loadTasks = function(){
  if (navigator.onLine){

      $scope.mainTaskType_claimed_length=0;
      $scope.mainTaskType_open_length=0;
      $scope.mainTaskType_all_length=0;
      $scope.mainTaskType_closed_length=0;
      
      $scope.taskList_DNA_all=0;
      $scope.taskList_DNA_claimed=0;
      $scope.taskList_DNA_open=0;
      $scope.taskList_DNA_closed=0;

      $scope.taskList_ADHOC_all=0;
      $scope.taskList_ADHOC_claimed=0;
      $scope.taskList_ADHOC_open=0;
      $scope.taskList_ADHOC_closed=0;

      $scope.taskList_NewStudent_all=0;
      $scope.taskList_NewStudent_claimed=0;
      $scope.taskList_NewStudent_open=0;
      $scope.taskList_NewStudent_closed=0;

      $scope.taskList_POSTCARD_claimed=0;
      $scope.taskList_POSTCARD_open=0;
      $scope.taskList_POSTCARD_all=0;
      $scope.taskList_POSTCARD_closed=0;

      $scope.taskList_MANAGER_claimed=0;
      $scope.taskList_MANAGER_open=0;
      $scope.taskList_MANAGER_all=0;
      $scope.taskList_MANAGER_closed=0;

      $scope.taskList_all=[];
      $scope.taskList_open=[];
      $scope.taskList_claimed=[];
      $scope.taskList_completed=[];
      $scope.taskList_closed=[];
      $scope.taskList_upcoming=[];


      var str = localStorage.getItem('base_url')+"api/return_all_dna_task/"+$scope.getKey()+"/?school_id="+$scope.selected_schoolId;
     $http.get(str)
      .success(function(data){
      if (data.length>0) {
            // //$scope.showLoader();
            $scope.datalength=data.length;
            $scope.dataCounter=0;

            for (var i = data.length - 1; i >= 0; i--){
            var taskId = data[i]['id'];
            var taskStatus = data[i]['status'];
            var processed_by = "N/A";
            var processed_img = "N/A";
            var processed_by_id = "N/A";
            var data_studentId = data[i]['user_id'];
            var taskType = data[i]['task_type'];
            var call_back_date = data[i]['call_back_date'];
            var createdOn = data[i]["due_at"];
            var contacted = data[i]["numberOfCalls"];
            var taskDue = data[i]["due_at"];

           if(data[i]['processed_by']!=null){
              processed_by = data[i]['processed_by']['first_name']+" "+data[i]['processed_by']['last_name'];
              processed_img = localStorage.getItem('base_url')+data[i]['processed_by']['picture'];
              processed_by_id = data[i]['processed_by']['id'];
            }
            $scope.getTaskData(taskId,taskStatus,taskType,processed_by,processed_img,processed_by_id,data_studentId,call_back_date,createdOn,contacted,taskDue);
          }
      }
      else
      $scope.hideLoader();
    // $scope.selectTaskOption(3);
   }).error(function(data){
      $scope.hideLoader();
    });
  }
};

$scope.taskType_dropdown_visibility=false;
$scope.toggleMainTaskType=function(){
  if($scope.taskType_dropdown_visibility)
    $scope.taskType_dropdown_visibility=false;
  else
    $scope.taskType_dropdown_visibility=true;
}

$scope.mainTaskType_label="DNA Phone Calls";
$scope.mainTaskType_value="DNA";

  $scope.selectSubTaskType=function(x){
    if (x==1){
      $scope.task_option_1='border-bottom: 6px solid #297fb8;';
      $scope.task_option_2='';
      $scope.task_option_3='';
      $scope.task_option_4='';
      $scope.selectedSubTaskType="CLAIMED";
    }else if(x==2){
      $scope.task_option_1='';
      $scope.task_option_2='border-bottom: 6px solid #ff6801;';
      $scope.task_option_3='';
      $scope.task_option_4='';
      $scope.selectedSubTaskType="OPEN";
    }else if(x==3){
      $scope.task_option_1='';
      $scope.task_option_2='';
      $scope.task_option_3='border-bottom: 6px solid #a500c8;';
      $scope.task_option_4='';
      $scope.selectedSubTaskType="ALL";
    }else if(x==4) {
      $scope.task_option_1='';
      $scope.task_option_2='';
      $scope.task_option_3='';
      $scope.task_option_4='border-bottom: 6px solid #a7a7a7;';
      $scope.selectedSubTaskType="CLOSED";
    }
    $scope.taskType_dropdown_visibility=false;
  }

  $scope.selectTaskType=function(x){
  if(x==1){
    $scope.mainTaskType_label="DNA Phone Calls";
    $scope.mainTaskType_value="DNA"; 
    $scope.mainTaskType_claimed_length=$scope.taskList_DNA_claimed;
    $scope.mainTaskType_open_length=$scope.taskList_DNA_open;
    $scope.mainTaskType_all_length=$scope.taskList_DNA_all;
    $scope.mainTaskType_closed_length=$scope.taskList_DNA_closed;
    $scope.selectedTaskType=1;
  }

  else if(x==2){
    $scope.mainTaskType_label="Return From Holiday";
    $scope.mainTaskType_value="ADHOC";
    $scope.mainTaskType_claimed_length=$scope.taskList_ADHOC_claimed;
    $scope.mainTaskType_open_length=$scope.taskList_ADHOC_open;
    $scope.mainTaskType_all_length=$scope.taskList_ADHOC_all;
    $scope.mainTaskType_closed_length=$scope.taskList_ADHOC_closed;
    $scope.selectedTaskType=2;
  }

  else if(x==3){
    $scope.mainTaskType_label="Manager's Tasks";
    $scope.mainTaskType_value="MANAGER";
    $scope.mainTaskType_claimed_length=$scope.taskList_MANAGER_claimed;
    $scope.mainTaskType_open_length=$scope.taskList_MANAGER_open;
    $scope.mainTaskType_all_length=$scope.taskList_MANAGER_all;
    $scope.mainTaskType_closed_length=$scope.taskList_MANAGER_closed;
    $scope.selectedTaskType=3;
  }

  else if(x==4){
    $scope.mainTaskType_label="Post Card";
    $scope.mainTaskType_value="POST-CARD";
    $scope.mainTaskType_claimed_length=$scope.taskList_POSTCARD_claimed;
    $scope.mainTaskType_open_length=$scope.taskList_POSTCARD_open;
    $scope.mainTaskType_all_length=$scope.taskList_POSTCARD_all;
    $scope.mainTaskType_closed_length=$scope.taskList_POSTCARD_closed;
    $scope.selectedTaskType=4;
  }

  else if(x==5){
    $scope.mainTaskType_label="New Student";
    $scope.mainTaskType_value="New Student";
    $scope.mainTaskType_claimed_length=$scope.taskList_NewStudent_claimed;
    $scope.mainTaskType_open_length=$scope.taskList_NewStudent_open;
    $scope.mainTaskType_all_length=$scope.taskList_NewStudent_all;
    $scope.mainTaskType_closed_length=$scope.taskList_NewStudent_closed;
    $scope.selectedTaskType=3;
  }
  $scope.taskType_dropdown_visibility=false;
}

$scope.selectSubTaskOption=function (option,subStyle){
  if(option=='1'){
    $scope.task_sub_option_1=subStyle;
    $scope.task_sub_option_2='';
    $scope.task_sub_option_3='';
    $scope.task_sub_option=option;
    $scope.taskSubStyleLabel="DNA";
  } 
  else if(option=='2'){
    $scope.task_sub_option_1='';
    $scope.task_sub_option_2=subStyle;
    $scope.task_sub_option_3='';
    $scope.task_sub_option=option;
    $scope.taskSubStyleLabel="ADHOC";
  } 
  else if(option=='3'){
    $scope.task_sub_option_1='';
    $scope.task_sub_option_2='';
    $scope.task_sub_option_3=subStyle;
    $scope.task_sub_option=option;
    $scope.taskSubStyleLabel="New Student";
  } 

  else{
    $scope.task_sub_option_1=subStyle;
    $scope.task_sub_option_2='';
    $scope.task_sub_option_3='';
    $scope.task_sub_option='1';
    $scope.taskSubStyleLabel="DNA";
  }
};
  

$scope.intUserRole=function(){
    if (navigator.onLine && localStorage.getItem("userId")){

    var str = localStorage.getItem('base_url')+"getuserdetails/"+$scope.getKey()+"/?userid="+localStorage.getItem("userId");
    $http.get(str)
    .success(function(data,responseType){
      if(responseType>=400||responseType=="error"){
        $scope.openMaintenancePage();
      }else if(data.ack_tos==0){
        $scope.showTermsAndCondition();
      }else if((((localStorage.getItem("picture")==(localStorage.getItem("base_url")+"assets/images/default-user.png"))||(localStorage.getItem("picture")==(localStorage.getItem("base_url")+"assets/images/default_student.png"))||(localStorage.getItem("picture")==(localStorage.getItem("base_url")+"assets/images/default_instructor.png"))))&&localStorage.getItem("userId")){
        if ($scope.pic_notification_visible==false){
          $scope.pic_notification_visible=true;
          $scope.notifPopup = $ionicPopup.show({
          template:  "<center>We noticed you haven't added your profile picture.<br><img src='"+localStorage.getItem("picture")+"' onerror=this.src='img/logo.png' style='background-position: center;border-radius: 50%;width:100px;' ng-click='updatePersonalInfo();notifPopup.close()'><br>Tap the image above to update profile.</center>",
          title: 'Notice',

          scope: $scope,
          buttons: [
            {
              text: '<b>Later</b>',
              type: 'button-positive',
              onTap: function(e) {
                $scope.pic_notification_visible=false;
              }
            },
          ]
        });
        }
        
    }

      if (data.role_id) {
        $scope.tempRoleId = data.role_id;
        if(data.role_id<=2){

            var str2 = localStorage.getItem('base_url')+"api/getschoolsbyorg/"+$scope.getKey()+"/?orgid="+localStorage.getItem("organization_id");
                $http.get(str2)
                .success(function(data){

            if (localStorage.getItem("role_id")<=2 && localStorage.getItem("role_id")>=1){
              var roleLabel = "";
              if($scope.tempRoleId==6)
                roleLabel = "GUARDIAN";
              else if($scope.tempRoleId==5)
                roleLabel = "STUDENT";
              else if($scope.tempRoleId==4)
                roleLabel = "INSTRUCTOR";
              else if($scope.tempRoleId==3)
                roleLabel = "MANAGER";
              else if($scope.tempRoleId==2)
                roleLabel = "ORGANIZATION OWNER";
              else if($scope.tempRoleId==1)
                roleLabel = "ADMIN";

              if (localStorage.getItem("myIds").length>0){
                var id = localStorage.getItem("myIds").split(",");
                var name = localStorage.getItem("mySchoolNames").split(",");
                var pic = localStorage.getItem("mySchoolPics").split(",");
                var role = localStorage.getItem("myRoles").split(",");
                
                for(var i = 0; i < data.length; i++) {
                  if(!((id.indexOf(data[i]['id'].toString())>=0) && ((role[id.indexOf(data[i]['id'].toString())]) == roleLabel))){
                    id.push(data[i]['id']);
                    name.push(data[i]['name']);
                    pic.push(localStorage.getItem('base_url')+""+data[i]['picture']);
                    role.push(roleLabel);
                  }
                }
              }

              else{
                var id = [];
                var name = [];
                var pic = [];
                var role = [];


                for(var i = 0; i < data.length; i++) {
                    id.push(data[i]['id']);
                    name.push(data[i]['name']);
                    pic.push(localStorage.getItem('base_url')+""+data[i]['picture']);
                    role.push(roleLabel);
                }
              }

              localStorage.setItem("myIds",id);
              localStorage.setItem("mySchoolNames",name);
              localStorage.setItem("mySchoolPics",pic);
              localStorage.setItem("myRoles",role);


              $scope.selected_schoolId=localStorage.getItem("myIds").split(",")[0];
              $scope.selected_genericRole=localStorage.getItem("myRoles").split(",")[0];
              $scope.selected_schoolName=localStorage.getItem("mySchoolNames").split(",")[0];
              $scope.selected_schoolPic=localStorage.getItem("mySchoolPics").split(",")[0];

              if ($scope.selected_genericRole=="ADMIN"){
                  localStorage.setItem("role_id",1);
              }
              else if ($scope.selected_genericRole=="OWNER"){
                  localStorage.setItem("role_id",2);
              }
              else if ($scope.selected_genericRole=="MANAGER"){
                  localStorage.setItem("role_id",3);
              }
              else if ($scope.selected_genericRole=="INSTRUCTOR"){
                  localStorage.setItem("role_id",4);
              }
              else if ($scope.selected_genericRole=="STUDENT"){
                  localStorage.setItem("role_id",5);
              }
              else if($scope.tempRoleId==6){
                $scope.selected_genericRole="GUARDIAN";
              }

              $scope.checkUserValidation();
              $scope.loadInbox();
              $scope.loadProductList($scope.selected_schoolId);
              $scope.loadClasses($scope.selected_schoolId);

              // if (localStorage.getItem("role_id")<5){
              //   $scope.loadTasks();
              //   $scope.loadStudents();
              // }
              }
            }).error(function(data, responseType){
              if(responseType>=400||responseType=="error")
                $scope.openMaintenancePage();
            });
         }
         else{

          if (localStorage.getItem("myIds")){
            var id = localStorage.getItem("myIds").split(",");
            var name = localStorage.getItem("mySchoolNames").split(",");
            var pic = localStorage.getItem("mySchoolPics").split(",");
            var role = localStorage.getItem("myRoles").split(",");
            var roleLabel = "";

            if($scope.tempRoleId==6)
              roleLabel = "GUARDIAN";
            else if($scope.tempRoleId==5)
              roleLabel = "STUDENT";
            else if($scope.tempRoleId==4)
              roleLabel = "INSTRUCTOR";
            else if($scope.tempRoleId==3)
              roleLabel = "MANAGER";
            else if($scope.tempRoleId==2)
              roleLabel = "ORGANIZATION OWNER";
            else if($scope.tempRoleId==1)
              roleLabel = "ADMIN";

            localStorage.setItem("myIds",id);
            localStorage.setItem("mySchoolNames",name);
            localStorage.setItem("mySchoolPics",pic);
            localStorage.setItem("myRoles",role);

            $scope.selected_schoolId=localStorage.getItem("myIds").split(",")[0];
            $scope.selected_genericRole=localStorage.getItem("myRoles").split(",")[0];
            $scope.selected_schoolName=localStorage.getItem("mySchoolNames").split(",")[0];
            $scope.selected_schoolPic=localStorage.getItem("mySchoolPics").split(",")[0];

            if ($scope.selected_genericRole=="ADMIN"){
                localStorage.setItem("role_id",1);
            }
            else if ($scope.selected_genericRole=="OWNER"){
                localStorage.setItem("role_id",2);
            }
            else if ($scope.selected_genericRole=="MANAGER"){
                localStorage.setItem("role_id",3);
            }
            else if ($scope.selected_genericRole=="INSTRUCTOR"){
                localStorage.setItem("role_id",4);
            }
            else if ($scope.selected_genericRole=="STUDENT"){
                localStorage.setItem("role_id",5);
            }
            else if($scope.tempRoleId==6){
              $scope.selected_genericRole="GUARDIAN";
            }
            $scope.loadProductList($scope.selected_schoolId);
            $scope.loadClasses($scope.selected_schoolId);
            }
            else{
              var roleLabel = "";
              if(localStorage.getItem("role_id")==6)
                $scope.selected_genericRole="GUARDIAN";
              else if(localStorage.getItem("role_id")==5)
               $scope.selected_genericRole="STUDENT";
              else if(localStorage.getItem("role_id")==4)
                $scope.selected_genericRole="INSTRUCTOR";
              else if(localStorage.getItem("role_id")==3)
                $scope.selected_genericRole="MANAGER";
              else if(localStorage.getItem("role_id")==2)
                $scope.selected_genericRole="ORGANIZATION OWNER";
              else if(localStorage.getItem("role_id")==1)
                $scope.selected_genericRole="ADMIN";
              else
                $scope.selected_genericRole="NON MEMBER"; 
                // $scope.hideLoader(); 
            }

              $scope.checkUserValidation();
              $scope.loadInbox();
              $scope.loadProductList($scope.selected_schoolId);
              

        if (localStorage.getItem("role_id")<=5){
          $state.go("app.attendances");
          $scope.loadClasses($scope.selected_schoolId);            
        }
        else
          $state.go("app.profile");
        }
      }
    }).error(function(data){

      //("getuserdetails")
      $scope.hideLoader(); 
      
    });
  }
  else{
    if (localStorage.getItem("role_id")){
    $scope.tempRoleId=localStorage.getItem("role_id");
    if (localStorage.getItem("myIds")){

    var id = localStorage.getItem("myIds").split(",");
    var name = localStorage.getItem("mySchoolNames").split(",");
    var pic = localStorage.getItem("mySchoolPics").split(",");
    var role = localStorage.getItem("myRoles").split(",");
    var roleLabel = "";

    if($scope.tempRoleId==6)
      roleLabel = "GUARDIAN";
    else if($scope.tempRoleId==5)
      roleLabel = "STUDENT";
    else if($scope.tempRoleId==4)
      roleLabel = "INSTRUCTOR";
    else if($scope.tempRoleId==3)
      roleLabel = "MANAGER";
    else if($scope.tempRoleId==2)
      roleLabel = "ORGANIZATION OWNER";
    else if($scope.tempRoleId==1)
      roleLabel = "ADMIN";

    localStorage.setItem("myIds",id);
    localStorage.setItem("mySchoolNames",name);
    localStorage.setItem("mySchoolPics",pic);
    localStorage.setItem("myRoles",role);

    $scope.selected_schoolId=localStorage.getItem("myIds").split(",")[0];      
    $scope.selected_genericRole=localStorage.getItem("myRoles").split(",")[0];
    $scope.selected_schoolName=localStorage.getItem("mySchoolNames").split(",")[0];
    $scope.selected_schoolPic=localStorage.getItem("mySchoolPics").split(",")[0];

    if ($scope.selected_genericRole=="ADMIN"){
        localStorage.setItem("role_id",1);
    }
    else if ($scope.selected_genericRole=="OWNER"){
        localStorage.setItem("role_id",2);
    }
    else if ($scope.selected_genericRole=="MANAGER"){
        localStorage.setItem("role_id",3);
    }
    else if ($scope.selected_genericRole=="INSTRUCTOR"){
        localStorage.setItem("role_id",4);
    }
    else if ($scope.selected_genericRole=="STUDENT"){
        localStorage.setItem("role_id",5);
    }
    else if($scope.tempRoleId==6){
      $scope.selected_genericRole="GUARDIAN";
    }

    $scope.checkUserValidation();
    $scope.loadInbox();
    $scope.loadProductList($scope.selected_schoolId);
    $scope.loadClasses($scope.selected_schoolId);

    if (localStorage.getItem("role_id")<5){
      // $scope.loadTasks();
      // $scope.loadStudents();
    }
    }
    else{
      var roleLabel = "";
      if(localStorage.getItem("role_id")==6)
        $scope.selected_genericRole="GUARDIAN";
      else if(localStorage.getItem("role_id")==5)
       $scope.selected_genericRole="STUDENT";
      else if(localStorage.getItem("role_id")==4)
        $scope.selected_genericRole="INSTRUCTOR";
      else if(localStorage.getItem("role_id")==3)
        $scope.selected_genericRole="MANAGER";
      else if(localStorage.getItem("role_id")==2)
        $scope.selected_genericRole="ORGANIZATION OWNER";
      else if(localStorage.getItem("role_id")==1)
        $scope.selected_genericRole="ADMIN";
      else
        $scope.selected_genericRole="NON MEMBER";  
      $scope.hideLoader(); 
    }
  }
  if (localStorage.getItem("role_id")==5)
    $state.go("app.attendances");
  else
    $state.go("app.profile");
  }

}

$scope.callNumber = function(number){
  window.open('tel:'+number, '_system')
}


$scope.bookDateAndTime=function(){
  var date = new Date(this.book_date);
  var time = new Date(this.book_time);
  var dataNow = new Date();
  var timeNow = new Date();

  if (date > dataNow){
    $scope.warning("Date is Available"+"\n"+date.getDate()+"-"+(date.getMonth()+1)+"-"+date.getFullYear()+"\n"+time.getHours()+":"+time.getMinutes()+":"+time.getSeconds())
  }
  else{
    $scope.warning("Unable To Book Date")
  }
};

  $scope.showBookTrialOption=function(){

  $scope.bookTrialPopup = $ionicPopup.show({
    template: '<center><input type="date" ng-model="book_date" name="book_date"><br><input type="time" ng-model="book_time" name="book_time"><br><button class="button button-block button-positive" ng-click="bookDateAndTime()">Book Now</button></cener>',
    title: 'Book Trial',

    scope: $scope,
    buttons: [
      { text: 'Back',
        type: 'button-gray'
      },
    ]
  });
};

$scope.markAsCloseLead=function(){
  alert(this.closedLeadComment)
}

  $scope.showCloseLeadOption=function(){
  var date = new Date();
  $scope.data_today = date.getDate()+"-"+(date.getMonth()+1)+"-"+date.getFullYear();
  
  $scope.closeLeadPopup = $ionicPopup.show({
    template: '<center>Date to Close:<br>'+$scope.data_today+'<br><br>Comment:<br><textarea ng-model="closedLeadComment" rows="4" cols="50"></textarea><button class="button button-block button-positive" ng-click="markAsCloseLead()">Close Lead Now</button></cener>',
    title: 'Close Lead',

    scope: $scope,
    buttons: [
      { text: 'Back',
        type: 'button-gray'
      },
    ]
  });
};

  $scope.showLeadsAndTask=function(){
    return localStorage.getItem("role_id")<=4;
  }

  $ionicModal.fromTemplateUrl('templates/taskDetails.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.taskDetailsModal = modal;
  });

  $scope.closetaskDetails = function(){
    $scope.taskDetailsModal.hide();
  };

  $scope.showtaskDetails =function(id, listName){
    var x = 0;

    for (var i = $scope.taskList_all.length - 1; i >= 0; i--){
      if($scope.taskList_all[i]['id'] == id){
        x = i;
        break;
      }
    }

    $scope.taskDetails_x=x;
    $scope.userId=localStorage.getItem("userId");

      $scope.taskDetails_id="";    
      $scope.taskDetails_contactName=[];
      $scope.taskDetails_birthdate="";
      $scope.taskDetails_gender="";
      $scope.taskDetails_contactNumber=[];
      $scope.taskDetails_contactRole=[];
      $scope.taskDetails_studentId="";
      $scope.taskDetails_studentImg="";
      $scope.taskDetails_studentName="";
      $scope.taskDetails_suggestedScripts="";
      $scope.taskDetails_peoplesImg=[];
      $scope.taskDetails_peopleId="";
      $scope.taskDetails_people=[];
      $scope.taskDetails_status="";
      $scope.taskDetails_taskType="";
      $scope.taskDetails_listName="";
      $scope.taskDetails_callBackDate="";
      $scope.taskDetails_createdOn="";
      $scope.taskDetails_lastAttended="";
      $scope.taskDetails_contacted="";
      $scope.taskDetails_due="";

      $scope.taskDetails_callBackDate=$scope.taskList_all[x]['callBackDate'];
      $scope.taskDetails_createdOn=$scope.taskList_all[x]['createdOn'];
      $scope.taskDetails_lastAttended=$scope.taskList_all[x]['lastAttended'];
      $scope.taskDetails_contacted=$scope.taskList_all[x]['contacted'];
      $scope.taskDetails_due=$scope.taskList_all[x]['due'];

      var today = new Date();
      var birthDate = new Date($scope.taskList_all[x]['birthdate']);
      var age = today.getFullYear() - birthDate.getFullYear();
      var m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) 
      {
          age--;
      }

      $scope.taskDetails_birthdate=age;
      $scope.taskDetails_gender=$scope.taskList_all[x]['gender'];

      $scope.taskDetails_id=$scope.taskList_all[x]['id'];
    if($scope.taskList_all[x]['contactName'])
      $scope.taskDetails_contactName=$scope.taskList_all[x]['contactName'];
    else
      $scope.taskDetails_contactName=[];

    if($scope.taskList_all[x]['contactNumber'])
      $scope.taskDetails_contactNumber=$scope.taskList_all[x]['contactNumber'];
    else
      $scope.taskDetails_contactNumber=[];

    if($scope.taskList_all[x]['contactRole'])
      $scope.taskDetails_contactRole=$scope.taskList_all[x]['contactRole'];
    else
      $scope.taskDetails_contactRole=[];

      $scope.taskDetails_studentId=$scope.taskList_all[x]['studentId'];
      $scope.taskDetails_studentImg=$scope.taskList_all[x]['studentImg'];
      $scope.taskDetails_studentName=$scope.taskList_all[x]['studentName'];

      // $scope.taskDetails_lastVisit=$scope.taskList_all[x]['lastVisit'].split("-");
      // $scope.taskDetails_programs=$scope.taskList_all[x]['programs'];
      $scope.taskDetails_suggestedScripts=$scope.taskList_all[x]['sudggestedScripts'];
    if($scope.taskList_all[x]['peoplesImg'])
      $scope.taskDetails_peoplesImg=$scope.taskList_all[x]['peoplesImg'].split(" ");
    else
      $scope.taskDetails_peoplesImg=[];

      $scope.taskDetails_peopleId=$scope.taskList_all[x]['peopleId'];

    if ($scope.taskList_all[x]['people'])
      $scope.taskDetails_people=$scope.taskList_all[x]['people'].split(",");
    else
      $scope.taskDetails_people=[];

      $scope.taskDetails_status=$scope.taskList_all[x]['status'];
      $scope.taskDetails_taskType=$scope.taskList_all[x]['taskType'];
      // $scope.taskDetails_dueDate=$scope.taskList_all[x]['dueDate'];
      $scope.taskDetails_listName="all";

    if (navigator.onLine) {

      var str2 = localStorage.getItem('base_url')+"api/getrelationships/"+$scope.getKey()+"/"+$scope.taskDetails_studentId;
      $http.get(str2)
      .success(function(data){

        var str="";
        if(data.length>0){

          for (var i = data.length - 1; i >= 0; i--) {
              var str3 = localStorage.getItem('base_url')+"api/getrelationship/"+$scope.getKey()+"/"+data[i];
              $http.get(str3)
              .success(function(data){
                str="";
                if(data.ack==1){

                  if((data.type!="" && data.type!="N/A") && (data.sub_type!="" && data.sub_type!="N/A")){
                    str = data.type+" - "+data.sub_type;
                  }
                  else if((data.sub_type=="" || data.sub_type=="N/A")){
                    str = data.type;
                  }
                  else if((data.type=="" || data.type=="N/A")){
                    str = data.sub_type; 
                  }

                  if(data.contact_number!="" && data.contact_number.toUpperCase()!="N/A"){
                    $scope.taskDetails_contactName.push(data.first_name+" "+data.last_name);
                    $scope.taskDetails_contactNumber.push(data.contact_number);
                    $scope.taskDetails_contactRole.push(str);
                  }

                  if(data.phone_work!="" && data.phone_work.toUpperCase()!="N/A"){
                    $scope.taskDetails_contactName.push(data.first_name+" "+data.last_name);
                    $scope.taskDetails_contactNumber.push(data.phone_work);
                    $scope.taskDetails_contactRole.push(str);
                  }

                  if(data.mobile_number!="" && data.mobile_number.toUpperCase()!="N/A"){
                    $scope.taskDetails_contactName.push(data.first_name+" "+data.last_name);
                    $scope.taskDetails_contactNumber.push(data.mobile_number);
                    $scope.taskDetails_contactRole.push(str);
                  }
                }
              }).error(function(data){
                // ("getrelationship")
              });
          }
        }

      }).error(function(data){
        // ("getrelationships")
      });
    }

    $scope.taskDetailsModal.show();
  };

$scope.buttonComplete = function(){
var flag = false;
var notes = [];
for (var i = 0; i < $scope.summary.length; i++){
  $scope.summary[i]=$scope.summary[i].replace("<br>","");
  notes.push("&notes[]="+$scope.summary[i]);
  if ($scope.summary[i].indexOf("3. Call back again in")>=0)
    flag = true;
}

if(flag)
  notes.push("&result[result]=call-back&result[message]="+$scope.summary[0]+"&result[value]="+$scope.numOfDays);
else
  notes.push("&result[result]="+$scope.summary[0]+"&result[message]="+$scope.summary[0]);


              var str = localStorage.getItem('base_url')+"api/complete_dna_task/"+$scope.getKey()+"/?task_id="+$scope.taskDetails_id+"&user_id="+localStorage.getItem("userId")+notes;
              $http.get(str)
              .success(function(data){
              if(data['status']=="success"){


                if($scope.callAgain)
                  $scope.callAgain.close();

                if($scope.answeredManager)
                  $scope.answeredManager.close();

                if($scope.reasonForNotReturningPopup)
                  $scope.reasonForNotReturningPopup.close();

                if($scope.reasonForNotAttendingPopup)
                  $scope.reasonForNotAttendingPopup.close();

                if($scope.completeTaskPopup)
                  $scope.completeTaskPopup.close();

                if($scope.didYouLeaveAMessagePopup)
                  $scope.didYouLeaveAMessagePopup.close();

                if($scope.leftAMessageTruePopup) 
                  $scope.leftAMessageTruePopup.close();

                if($scope.leftAMessageFalsePopup)
                  $scope.leftAMessageFalsePopup.close();

                if($scope.callAgainTruePopup)
                  $scope.callAgainTruePopup.close();

                if($scope.callAgainFalsePopup)
                  $scope.callAgainFalsePopup.close();

                if($scope.wasConvenientTimeTruePopup)
                  $scope.wasConvenientTimeTruePopup.close();

                if($scope.wasConvenientTimeFalsePopup)
                  $scope.wasConvenientTimeFalsePopup.close();

                if($scope.willStudentReturnPopup)
                  $scope.willStudentReturnPopup.close();

                if($scope.reasoningPopup)
                  $scope.reasoningPopup.close();

                if($scope.summaryPopup)
                  $scope.summaryPopup.close();

                if($scope.wasItAConvenientTimePopup)
                  $scope.wasItAConvenientTimePopup.close();

                if($scope.messagePopup)
                  $scope.messagePopup.close();

                if($scope.taskDetailsModal)
                  $scope.taskDetailsModal.hide();

                if($scope.callAgainTruePopupNS)
                $scope.callAgainTruePopupNS.close();

                if($scope.callAgainFalsePopupNS)
                $scope.callAgainFalsePopupNS.close();
                
                if(flag){
                  $scope.taskDetails_listName="UPCOMING";
                  $scope.taskDetails_status="UPCOMING";
                  $scope.taskList_all[$scope.taskDetails_x]['status']="UPCOMING";
                }

                else{
                  $scope.taskDetails_listName="CLOSED";
                  $scope.taskDetails_status="CLOSED";
                  $scope.taskList_all[$scope.taskDetails_x]['status']="CLOSED";
                }
                $scope.loadTasks();
              $timeout(function(){
                $scope.success("Task Updated");
              }, 1000);
                

              }
              else{
                $scope.warning(data);
              }


              }).error(function(data){
                  $scope.error("Task was not updated. Try again later.");
              });
}


  $scope.claimTask=function(x, listName, id){

    var str = localStorage.getItem('base_url')+"api/claim_task/"+$scope.getKey()+"/?task_id="+id+"&user_id="+localStorage.getItem("userId");
    $http.get(str)
    .success(function(data){
    if(data['status']=="success"){

      $scope.taskDetails_listName="CLAIMED";
      $scope.taskDetails_status="CLAIMED";
      $scope.taskList_all[x]['status']="CLAIMED";

      $scope.loadTasks();
      $scope.taskDetails_peoplesImg=[];
      $scope.taskDetails_people=[];
      $scope.taskDetails_peopleId=[];
      $scope.taskDetails_peoplesImg.push(localStorage.getItem("picture"));
      $scope.taskDetails_people.push(localStorage.getItem("first_name")+" "+localStorage.getItem("last_name"));
      $scope.taskDetails_peopleId.push(localStorage.getItem("userId"));
      $scope.hideLoader();
      $scope.success("Claimed")

    }
    else{
      $scope.warning(data['status']);
      $scope.hideLoader();
    }

    }).error(function(data){
        // ("claim_task")
        $scope.hideLoader();
    });

  }

$scope.popSummary = function(){
  $scope.summary.pop();
};

$scope.popSummaryWithReason = function(){
  if ($scope.summary[$scope.summary.length-1].indexOf("<br>3. Student will return.")>=0 || $scope.summary[$scope.summary.length-1].indexOf("<br>3. Student won't return.")>=0 || $scope.summary[$scope.summary.length-1].indexOf("<br>3. Do not Call")>=0)
    $scope.summary.pop();
};

$scope.getSummary = function(){
 var filteredSummary = "";
for (var i = 0; i < $scope.summary.length; i++) {
  filteredSummary=filteredSummary+$scope.summary[i].replace(".,",".");
}

    $scope.summaryPopup=$ionicPopup.show({
      template: filteredSummary+"<br><br><button class='button button-balanced button-full' ng-click='buttonComplete()'>Submit</button>",
      title: "Summary",

      scope: $scope,
      buttons: [{
        text: 'Back',
        type: 'button-gray',         
        onTap: function(e) {

          $scope.popSummary();
          $scope.summaryPopup.close();

        }},]
    });
};

$scope.reasoning = function(str,ans){

    $scope.reasonMsg="";
    $scope.reasoningPopup=$ionicPopup.show({
    template: "<textarea class='input' name='reasonMsg' ng-model='reasonMsg' row=5></textarea><button class='button button-full button-balanced' ng-click='getReasonMsg()'>Submit</button>",
    title: 'Reason',

    scope: $scope,
    buttons: [{
      text: 'Back',
      type: 'button-gray',         
      onTap: function(e) {
        $scope.popSummary();
        $scope.callAgainFalsePopup.close();
        $scope.didYouLeaveAMessagePopup.show();
      }},
      {
      text: 'Submit',
      type: 'button-balanced',         
      onTap: function(e) {
        // $scope.callAgainFalsePopup.close();
        if($scope.summary[$scope.summary.length-1].indexOf("<br>3. Student will return.")>=0)
          $scope.summary.push("<br>4. Reason for not attending - "+$scope.reasonMsg+".");
           
        // $scope.didYouLeaveAMessagePopup.show();
      }},
    ]
  });
};

$scope.studentNotReturning = function(opt){

  var str = "attend";
  var num = 2;
  if($scope.summary[$scope.summary.length-1].indexOf("<br>2. Student did not attend")>=0){
    str = "return";
    num = 3;
  }

  if(opt==1){
    if (str == "attend")
      $scope.summary.push("<br>"+num+". Student did not "+str+" because he was not enjoying it.");
    else
      $scope.summary.push("<br>"+num+". Student won't "+str+" because he was not enjoying it.");
      
  }

  else if(opt==2){
    if (str == "attend")
      $scope.summary.push("<br>"+num+". Student did not "+str+" because he was busy for work/school.");
    else
      $scope.summary.push("<br>"+num+". Student won't "+str+" because he was busy for work/school.");
  }

  else if(opt==3){
    if (str == "attend")
      $scope.summary.push("<br>"+num+". Student did not "+str+" because he has injury/medical issue.");
    else
      $scope.summary.push("<br>"+num+". Student won't "+str+" because he has injury/medical issue.");
  }

  else if(opt==4){
    if (str == "attend")
      $scope.summary.push("<br>"+num+". Student did not "+str+" because he had a holiday."); 
    else
      $scope.summary.push("<br>"+num+". Student won't "+str+" because he had a holiday.");
  }


  else{
    $scope.reasonMsg="";
    $scope.anotherReasonPopup = $ionicPopup.show({
      template: "<textarea class='input' name='reasonMsg' ng-model='reasonMsg' row=5></textarea><br></textarea><button class='button button-full button-balanced' ng-click='getReasonMsg()'>Submit</button>",
      title: 'Reason',

      scope: $scope,
      buttons: [{
        text: 'Back',
        type: 'button-gray',         
        onTap: function(e) {
          // $scope.popSummary();
          $scope.anotherReasonPopup.close();
          $scope.reasonForNotAttendingPopup.show();
          // $scope.didYouLeaveAMessagePopup.show();
        }},
      ]
    });

  }

  if (opt>=1 && opt<=4){
    if($scope.summary[$scope.summary.length-1].indexOf("<br>3. Student won't return")>=0)
      $scope.getSummary();
    else{
      $scope.willStudentReturnPopup=$ionicPopup.show({
      template: "<button class='button button-full button-light' ng-click='willStudentReturn(true)'>Yes</button><br><button class='button button-full button-light' ng-click='willStudentReturn(false)'>No </button>",
      title: 'Will the student be returning?',
      scope: $scope,
      buttons: [{
        text: 'Back',
        type: 'button-gray',         
        onTap: function(e) {

          $scope.popSummary();
          $scope.willStudentReturnPopup.close();
          $scope.reasonForNotAttendingPopup.show();
        }},]
      });
    }

  }
};



  $scope.willStudentReturn=function(ans){
    var str = "";
    if(ans==true){
       $scope.summary.push("<br>3. Student will return.");
       $scope.getSummary();
    }

    else{
        $scope.reasonForNotReturningPopup=$ionicPopup.show({
        template: "<button class='button button-full button-light' ng-click='studentNotReturning(1)'>Not enjoying it</button><br><button class='button button-full button-light' ng-click='studentNotReturning(2)'>Busy for work/school</button><br><button class='button button-full button-light' ng-click='studentNotReturning(3)'>Injury / Medical</button><br><button class='button button-full button-light' ng-click='studentNotReturning(4)'>Holiday</button><br><button class='button button-full button-light' ng-click='studentNotReturning(5)'>Another Reason</button>",
        title: "Reason for not returning.",
        scope: $scope,
        buttons: [{
          text: 'Back',
          type: 'button-gray',         
          onTap: function(e) {
            if(!($scope.summary[$scope.summary.length-1].indexOf("<br>2. Student did not attend")>=0))
            $scope.popSummary();
            $scope.reasonForNotReturningPopup.close();
            $scope.willStudentReturnPopup.show();
             
            
          }},]
      });
    }
  }

  $scope.getNumOfDays=function(){
    
    if ($scope.summary[$scope.summary.length-1].indexOf("<br>2. Did not leave a Message")>=0 || $scope.summary[$scope.summary.length-1].indexOf("<br>2. Left a Message")>=0){
      $scope.summary.push("<br>3. Call back again in "+this.numOfDays+" day(s).");
      $scope.numOfDays=this.numOfDays;
    }

    $scope.getSummary();
  }


  $scope.completeTask=function(x, listName, taskType){
    var str ="";
      $scope.buttonComingSoon=function(){
        $scope.message("Coming Soon");
      };

    if(taskType=="DNA")
      str="<button class='button button-full button-light' ng-click='answered()'>Answered</button><br><button class='button button-full button-light' ng-click='noAnswer()'>No Answer</button><br><button class='button button-full button-light' ng-click='cameBackToSchool()'><p style='font-size: 15px;'>Student came back to school</p></button><br><button class='button button-full button-light' ng-click='openOnHoldDetails();'><p style='font-size: 15px;'>Student is on Hold</p></button>";
      
    else if(taskType=="ADHOC")
      str="<button class='button button-full button-light' ng-click='answered()'>Answered</button><br><button class='button button-full button-light' ng-click='noAnswer()'>No Answer</button><br><button class='button button-full button-light' ng-click='cameBackToSchool()'><p style='font-size: 15px;'>Student came back to school</p></button>";
          
    else if (taskType=="MANAGER")
     str="<button class='button button-full button-light' ng-click='answered()'>Answered</button><br><button class='button button-full button-light' ng-click='noAnswer()'>No Answer</button>";

    else if (taskType=="POST-CARD")
     str="<button class='button button-full button-balanced' ng-click='answered()'>Complete Task</button>";

    else if(taskType=="New Student")
      str="<button class='button button-full button-light' ng-click='answered()'>Answered</button><br><button class='button button-full button-light' ng-click='noAnswer()'>No Answer</button>";

    $scope.summary=[];
    $scope.completeTaskPopup = $ionicPopup.show({
    template: str,
    title: 'Contact result',

    scope: $scope,
    buttons: [
      { text: 'Back',
      type: 'button-gray' },
    ]
  });
  }

$scope.cameBackToSchool = function(){
  $scope.summary.push("<br>1.Student has returned to school.");
  $scope.getSummary();
};

  $scope.answered=function(){
    if ($scope.summary) {
      if($scope.summary.length>1){

          if(!($scope.summary[$scope.summary.length-1].indexOf("<br>1. ")>=0))
            $scope.summary.push("<br>1.Contact answered.");
      }
      else
        $scope.summary.push("<br>1.Contact answered.");
    }
    else
      $scope.summary.push("<br>1.Contact answered.");
    
        if($scope.mainTaskType_value=="MANAGER"||$scope.mainTaskType_value=="New Student"){
          $scope.reasonMsg="";
          $scope.answeredManager=$ionicPopup.show({
          template: "<textarea class='input' name='reasonMsg' ng-model='reasonMsg' row=5><br></textarea><button class='button button-full button-balanced' ng-click='getReasonMsg()'>Submit</button>",
          title: 'Write notes of your conversation?',
          scope: $scope,
          buttons: [{
            text: 'Back',
            type: 'button-gray',         
            onTap: function(e){
              if($scope.summary[$scope.summary.length-1].indexOf("<br>2. Conversation -")>=0)
                $scope.popSummary();
              if($scope.summary[$scope.summary.length-1].indexOf("<br>1.Contact answered.")>=0)
                $scope.popSummary();
              $scope.answeredManager.close();
              $scope.completeTaskPopup.show();
            }},
            ]
          });
        }
        else if($scope.mainTaskType_value=="POST-CARD"){
          $scope.buttonComplete();
        }
        else{
          $scope.reasonForNotAttendingPopup=$ionicPopup.show({
            template: "<button class='button button-full button-light' ng-click='studentNotReturning(1)'>Not enjoying it</button><br><button class='button button-full button-light' ng-click='studentNotReturning(2)'>Busy for work/school</button><br><button class='button button-full button-light' ng-click='studentNotReturning(3)'>Injury / Medical</button><br><button class='button button-full button-light' ng-click='studentNotReturning(4)'>Holiday</button><br><button class='button button-full button-light' ng-click='studentNotReturning(5)'>Another Reason</button>",
            title: "Reason for not attending.",

            scope: $scope,
            buttons: [{
              text: 'Back',
              type: 'button-gray',         
              onTap: function(e) {
                $scope.popSummary();
                $scope.reasonForNotAttendingPopup.close();
                $scope.completeTaskPopup.show();
                 
                
              }},]
          });
        }


  };

  $scope.getReasonMsg =  function(){
    if(this.reasonMsg!='' && this.reasonMsg!= null){
      if ($scope.anotherReasonPopup)
        $scope.anotherReasonPopup.close();
      if ($scope.summary[$scope.summary.length-1].indexOf("<br>1.Contact answered.")>=0){
        if($scope.mainTaskType_value=="MANAGER"||$scope.mainTaskType_value=="New Student"){
            $scope.summary.push("<br>2. Conversation - "+this.reasonMsg+".");
            $scope.getSummary();
        }
        else{
          $scope.willStudentReturnPopup=$ionicPopup.show({
            template: "<button class='button button-full button-light' ng-click='willStudentReturn(true)'>Yes</button><br><button class='button button-full button-light' ng-click='willStudentReturn(false)'>No </button>",
            title: 'Will the student be returning?',

            scope: $scope,
            buttons: [{
              text: 'Back',
              type: 'button-gray',         
              onTap: function(e) {
                $scope.popSummary();
                $scope.willStudentReturnPopup.close();
                $scope.reasonForNotAttendingPopup.show();
              }},]
          });
        }
        $scope.summary.push("<br>2. Student did not attend - "+this.reasonMsg+".");


      }
      else if($scope.summary[$scope.summary.length-1].indexOf("<br>2. Student did not attend")>=0){
        $scope.summary.push("<br>3. Student won't return - "+ this.reasonMsg);
        $scope.getSummary();
      }

      else if($scope.summary[$scope.summary.length-1].indexOf("<br>1. No Answer.")>=0){
        $scope.summary.push("<br>2. Left a Message - "+ this.reasonMsg);
          $scope.numOfDays=1;
          $scope.callAgain = $ionicPopup.show({
            template: "<button class='button button-full button-light' ng-click='willYouCallAgain(true)'>Yes</button><br><button class='button button-full button-light' ng-click='willYouCallAgain(false)'>No </button>",
            title: 'Will you call again?',

            scope: $scope,
            buttons: [{
              text: 'Back',
              type: 'button-gray',         
              onTap: function(e) {
                $scope.popSummary();
                $scope.callAgain.close();
                $scope.didYouLeaveAMessagePopup.show();
              }},
            ]
          });
      }

      else if($scope.summary[$scope.summary.length-1].indexOf("<br>2. Left a Message")>=0 || $scope.summary[$scope.summary.length-1].indexOf("<br>2. Did not leave a Message")>=0){
        $scope.summary.push("<br>3. Won't call back - "+ this.reasonMsg);
        $scope.getSummary();
      }
    }
    else{
      $scope.warning("Input Required!");
    }
     
  };

  $scope.willYouCallAgain = function(ans){
      if (ans==true){
        $scope.numOfDays=1;
        $scope.callAgainTruePopup=$ionicPopup.show({
        template: "Number of days<br><select class='item item-input item-select' name='numOfDays' ng-model='numOfDays' style='width:100%;'><option ng-selected='true' value='1'>1 Day</option><option value='2'>2 Days</option><option value='3'>3 Days</option><option value='4'>4 Days</option><option value='5'>5 Days</option><option value='6'>6 Days</option><option value='7'>7 Days</option><option value='8'>8 Days</option><option value='9'>9 Days</option><option value='10'>10 Days</option><option value='11'>11 Days</option><option value='12'>12 Days</option></select><br><button class='button button-full button-balanced' ng-click='getNumOfDays()'>Submit</button>",
        title: 'How many days will you call again?',

        scope: $scope,
        buttons: [{
          text: 'Back',
          type: 'button-gray',         
          onTap: function(e) {
            $scope.callAgainTruePopup.close();
            $scope.callAgain.show();
             
          }},
        ]
      });
      }
      else{
        $scope.reasonMsg="";
        $scope.callAgainFalsePopup=$ionicPopup.show({
        template: "<textarea class='input' name='reasonMsg' ng-model='reasonMsg' row=5><br></textarea><button class='button button-full button-balanced' ng-click='getReasonMsg()'>Submit</button>",
        title: 'Reason',
        scope: $scope,
        buttons: [{
          text: 'Back',
          type: 'button-gray',         
          onTap: function(e) {
            $scope.callAgainFalsePopup.close();
            $scope.callAgain.show();
          }},
          ]
        });
      }
  }

$scope.leftAMessage = function (ans){

  if (ans==true) 
  {
    $scope.reasonMsg="";
    $scope.leftAMessageTruePopup=$ionicPopup.show({
      template: "<textarea class='input' name='reasonMsg' ng-model='reasonMsg' row=5></textarea><br></textarea><button class='button button-full button-balanced' ng-click='getReasonMsg()'>Submit</button>",
      title: 'Message',

      scope: $scope,
      buttons: [{
        text: 'Back',
        type: 'button-gray',         
        onTap: function(e) {
          $scope.leftAMessageTruePopup.close();
          $scope.didYouLeaveAMessagePopup.show();
           
        }},
      ]
  });
  }
  else{

    $scope.summary.push("<br>2. Did not leave a Message");
    $scope.leftAMessageFalsePopup = $ionicPopup.show({
      template: "<button class='button button-full button-light' ng-click='willYouCallAgain(true)'>Yes</button><br><button class='button button-full button-light' ng-click='willYouCallAgain(false)'>No </button>",
      title: 'Will you call again?',

      scope: $scope,
      buttons: [{
        text: 'Back',
        type: 'button-gray',         
        onTap: function(e) {
          $scope.popSummary();
          $scope.leftAMessageFalsePopup.close();
          $scope.didYouLeaveAMessagePopup.show();
        }},
      ]
  });
  }
};

  $scope.noAnswer=function(){
    $scope.summary.push("<br>1. No Answer.");
    $scope.didYouLeaveAMessagePopup=$ionicPopup.show({
    template: "<button class='button button-full button-light' ng-click='leftAMessage(true)' >Yes</button><br><button class='button button-full button-light' ng-click='leftAMessage(false)'>No </button>",
    title: 'Did you leave a message?',

    scope: $scope,
      buttons: [{
        text: 'Back',
        type: 'button-gray',         
        onTap: function(e) {
          $scope.popSummary();
          $scope.didYouLeaveAMessagePopup.close();
          $scope.completeTaskPopup.show();
        }},
      ]
    });
     
  };

  $scope.releaseTask=function(x, listName,id){

    var str = localStorage.getItem('base_url')+"api/release_task/"+$scope.getKey()+"/?task_id="+id+"&user_id="+localStorage.getItem("userId");
    $http.get(str)
    .success(function(data){
      $scope.hideLoader();
    if(data['status']=="success"){
      $scope.taskDetails_listName="OPEN";
      $scope.taskDetails_status="OPEN";
      $scope.taskList_all[x]['status']="OPEN";

      $scope.taskDetails_peoplesImg="N/A";
      $scope.taskDetails_people="N/A";
      $scope.taskDetails_peopleId="N/A";

      $scope.loadTasks();
      $scope.hideLoader();
      $scope.success("Released");
    }
    else{
      $scope.warning(data['status']);
    }

    }).error(function(data){
        // ("release_task")
        $scope.hideLoader();
    });
  }
  

  $scope.alertAddNote=function(){
    $scope.addNotePopup.close();
    alert(this.addNote)
  }

  $scope.showAddNote=function(){
    $scope.addNotePopup = $ionicPopup.show({
      template: '<center>Note:<br><textarea ng-model="addNote" rows="4" cols="50"></textarea><button class="button button-block button-positive" ng-click="alertAddNote()">Add Note</button></center>',
      title: 'Add Note',

      scope: $scope,
      buttons: [
        { text: 'Back',
          type: 'button-gray'
        },
      ]
    });
  };

  $ionicModal.fromTemplateUrl('templates/productDetails.html',{
    scope: $scope
  }).then(function(modal) {
    $scope.productDetailsModal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeproductDetails = function(){
    $scope.productDetailsModal.hide();
  };
  $scope.product_quantity=1;
  $scope.cartList=[];

  $scope.loadCart = function(){
      $scope.stripe_id="";
      var str = localStorage.getItem('base_url')+"getuserdetails/"+$scope.getKey()+"/"+localStorage.getItem("username");
      $http.get(str)
      .success(function(data){
        $scope.stripe_id=data["stripe_id"];

      }).error(function(data){
        $scope.hideLoader();
        $scope.stripe_id="";
      });

      var str2 = localStorage.getItem('base_url')+"api/get_user_cart/"+$scope.getKey()+"/"+localStorage.getItem("userId");
      //$scope.showLoader();
      $http.get(str2)
      .success(function(data){
        $scope.hideLoader();
        $scope.cartList=[];
        var stocks="";
        var flag=0;

        for (var x in data["items"]) {
        flag=0;

          for (var i = 0; i < $scope.cartList.length; i++){
             if(data["items"][x]['product_id']==$scope.cartList[i]['product_id']){
              flag=1;
              $scope.cartList[i]['quantity']++;
              break;
             }
          }

          $.each(data["items"], function(index,item){
            item.id
            
          })

          if(flag==0){
            $scope.cartList.push({
            id: data["items"][x]['id'],
            picture: localStorage.getItem('base_url')+data["items"][x]['product']['picture'],
            name: data["items"][x]['product']['name'],
            stock: data["items"][x]['product']['stock'],
            type: data["items"][x]['product']['product_type_id'],
            service_type:data["items"][x]['product']['service_sub_type_id'],
            level: data["items"][x]['product']['level'],
            price: data["items"][x]['product']['price'],
            description: data["items"][x]['product']['description'],
            quantity: 1,
            status_id: data["items"][x]['status_id'],
            product_id: data["items"][x]['product_id']
          });
          }

        }
        $scope.cartTotal=0;
        for (var i = 0; i < $scope.cartList.length; i++) {
          $scope.cartTotal = parseFloat($scope.cartTotal) + (parseFloat($scope.cartList[i]['price'])* parseFloat($scope.cartList[i]['quantity']));
        }
        
      }).error(function(data){
        $scope.hideLoader();
      });
  };



  $scope.addToCart=function(id,quantity,name){

  if (!$scope.currentProductIsRecomended) {
    $scope.showPromp(id,quantity,name);
  }
  else{
    $scope.temp_name=name;
    var str = localStorage.getItem('base_url')+"api/add_item_to_user_cart/"+$scope.getKey()+"/"+localStorage.getItem("userId")+"?product_id="+id;
    $scope.showLoader();
    $http.get(str)
    .success(function(data){
      var temp="";
      $scope.hideLoader();
    if(data['success']==true){

      $scope.loadCart();
      $scope.productDetailsModal.hide();
      $scope.success("Successfully added <b>1</b> Item of <b>"+$scope.temp_name+"</b>.");
    }
    else{
      $scope.warning("<br>Opps!<br>Something went wrong.<br>Try Again Later.");
    }

    }).error(function(data){
        $scope.hideLoader();
        $scope.warning("<br>Opps!<br>Something went wrong.<br>Try Again Later");
    });
  }
};


  $ionicModal.fromTemplateUrl('templates/checkoutDetails.html',{
    scope: $scope
  }).then(function(modal) {
    $scope.checkoutDetailsModal = modal;
  });

$scope.placeOrder2 = function(){

  var str = '<div class="row"><div class="col" style="border: 1px solid gray;">Name</div><div class="col" style="border: 1px solid gray;">Qty</div><div class="col" style="border: 1px solid gray;">Price</div><div class="col" style="border: 1px solid gray;">Sub Total</div></div>';

  var total = 0;
  for (var i = 0; i < $scope.cartList.length; i++){  
    str=str+('<div class="row"><div class="col" style="border: 1px solid gray;">'+$scope.cartList[i]['name']+'</div><div class="col" style="border: 1px solid gray;">'+$scope.cartList[i]['quantity']+'</div><div class="col" style="border: 1px solid gray;"> $'+$scope.cartList[i]['price']+'</div><div class="col" style="border: 1px solid gray;"> $'+((parseFloat(Math.round((($scope.cartList[i]['price'])*($scope.cartList[i]['quantity'])) * 100) / 100).toFixed(2)))+'</div></div>');
    total = total + ($scope.cartList[i]['price'])*($scope.cartList[i]['quantity']);
  }
  str=str+'<div class="row"><div class="col col-75" style="border: 1px solid gray;">Total</div><div class="col" style="border: 1px solid gray;"> $'+((parseFloat(Math.round((total) * 100) / 100).toFixed(2)))+'</div></div>';

  $scope.placeOrderPopup = $ionicPopup.show({
    template: '<center>'+str+'</center>',
    scope: $scope,
    buttons: [{
      text: 'Cancel',
      type: 'button-gray' 
    },]
  }); 
}

// $scope.confirmOrder =function(){
//   $scope.handler.open({
//     name: 'Oz Kez Pty Ltd',
//     description: '2 widgets',
//     zipCode: true,
//     currency: 'aud',
//     amount: 2000
//   });
// }



$scope.plsWait = function(){
  // document.getElementById("waitBtn").setAttribute("display","none");
  $scope.showLoader();
  document.getElementById("waitBtn").value="Please Wait";

  $timeout(function(){
    $scope.hideLoader();
    // document.getElementById("waitBtn").removeAttribute("block");
    document.getElementById("waitBtn").value="Process Payment";
  }, 10000);
};

$scope.placeOrder = function(product_id,product_name,product_price,product_description,product_picture,product_cart_id,product_qty){
  if($scope.cartList.length){
    var str = '<br><div class="row"><div class="col col-33" style="border: 1px solid gray;">Name</div><div class="col" style="border: 1px solid gray;">Qty</div><div class="col" style="border: 1px solid gray;">Price</div><div class="col col-20" style="border: 1px solid gray;">Sub Total</div></div>';
    var total = 0;
    for (var i = 0; i < $scope.cartList.length; i++) {  
      if(product_id==$scope.cartList[i]['product_id']){
        str=str+('<div class="row"><div class="col col-33" style="border: 1px solid gray;">'+product_name+'</div><div class="col" style="border: 1px solid gray;">1</div><div class="col" style="border: 1px solid gray;"> $'+product_price+'</div><div class="col col-20" style="border: 1px solid gray;">$'+((parseFloat(Math.round(((product_price)*(1)) * 100) / 100).toFixed(2)))+'</div></div>');
        total = total + (product_price)*(1);
        break;
      }
    }
    str=str+'<div class="row"><div class="col col-80" style="border: 1px solid gray;">Processing Fee</div><div class="col col-20" style="border: 1px solid gray;">$'+((total*(0.029))+(0.30)).toFixed(2)+'</div></div>';
    str=str+'<div class="row"><div class="col col-80" style="border: 1px solid gray;">Total</div><div class="col col-20" style="border: 1px solid gray;">$'+(((total*(0.029))+(0.30))+total).toFixed(2)+'</div></div>';
// ng-click="placeOrderPopup.close();cartModal.hide();"
// <div width="100%"><label class="item item-divider" for="card-element">Credit or debit card</label><div id="card-element"></div><div id="card-errors" role="alert" style="color:red;"></div></div><input type="submit" class="submit button button-positive" value="Process Payment"></div>
    var url_str=localStorage.getItem('base_url')+"api/checkoutItem/"+$scope.getKey();
    var user_id=localStorage.getItem("userId");
    if($scope.stripe_id=="" || $scope.stripe_id==null){
      $scope.waitBtnShow=false;
      $scope.placeOrderPopup = $ionicPopup.show({
        title: 'Order Summary',
        //template: '<center>'+str+'<form action="'+url_str+'" method="POST" id="payment-form" ><div id="stripe_script" ng-click="placeOrderPopup.close();cartModal.hide();"></div><input name="user_id" type="hidden" value="'+user_id+'"><input name="qty" type="hidden" value="'+product_qty+'"><input name="product_id" type="hidden" value="'+product_id+'"><input name="cart_items_id" type="hidden" value="'+product_cart_id+'"></center></form>',
        template: '<center><form action="'+url_str+'" method="POST" id="payment-form"><div width="100%"><label class="item item-divider" for="card-element">Credit or debit card</label><div id="card-element"></div><div id="card-errors" role="alert" style="color:red;"></div></div><input id="waitBtn" ng-show="waitBtnShow" type="submit" ng-click="plsWait()" class="submit button button-positive" value="Process Payment"></div><input name="user_id" type="hidden" value="'+user_id+'"><input name="qty" type="hidden" value="'+product_qty+'"><input name="product_id" type="hidden" value="'+product_id+'"><input name="cart_items_id" type="hidden" value="'+product_cart_id+'"></form>'+str+'</center>',
        scope: $scope,
        buttons: [{
          text: 'Cancel',
          type: 'button-gray' 
        },]
      });
      // 
// alert(product_cart_id+"\n"+
// product_qty+"\n"+
// product_id)

      // action="'+localStorage.getItem('base_url')+"api/checkoutItem/"+$scope.getKey()+'"
      // $timeout(function(){
      //   var script = document.createElement('script');
      //   script.src = "https://checkout.stripe.com/checkout.js";

      //   var attr = document.createAttribute("class")
      //   attr.value = "stripe-button";
      //   script.setAttributeNode(attr);

      //   attr = document.createAttribute("data-key")
      //   attr.value = "";//Set stripe keye here
      //   script.setAttributeNode(attr);

      //   attr = document.createAttribute("data-amount")
      //   attr.value = product_price*100;
      //   script.setAttributeNode(attr);
        
      //   $("#stripe_script").append(script);
      // }, 1000);


  $timeout(function(){
    $scope.waitBtnShow=true;
  }, 3000);

    $timeout(function(){
    // document.getElementById("waitBtn").setAttribute("display","block");
    $scope.errorText="";
    var stripe = Stripe('pk_test_ltUTw74tV8FsNnjzn0zs5W9y');//Set Stripe Key here
    var elements = stripe.elements();
    var card = elements.create('card',{
      hidePostalCode: true,
    'style': {
      'base': {
        'fontFamily': 'Arial, sans-serif',
        'fontSize': '20px',
        'color': 'black',
      },
      'invalid': {
        'color': 'red',
      },
    }});
    card.addEventListener('change', function(event) {
      // alert();
      var displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
      $scope.errorText=displayError.textContent;
    });
    card.mount('#card-element');

  function stripeTokenHandler(token) {
  // Insert the token ID into the form so it gets submitted to the server
  var form = document.getElementById('payment-form');
  var hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', 'stripeToken');
  hiddenInput.setAttribute('value', token.id);
  form.appendChild(hiddenInput);

  // Submit the form
  form.submit();
}

  function createToken() {
    stripe.createToken(card).then(function(result) {
      if (result.error) {
        // Inform the user if there was an error
        var errorElement = document.getElementById('card-errors');
        errorElement.textContent = result.error.message;
      } else {
        // Send the token to your server
        stripeTokenHandler(result.token);
      }
    });
};

// Create a token when the form is submitted.
var form = document.getElementById('payment-form');
form.addEventListener('submit', function(e) {
  e.preventDefault();
  createToken();
});

  }, 1000);
    }

    else{
      $scope.placeOrderPopup = $ionicPopup.show({
        title: 'Order Summary',
        template: '<center>'+str+'<br><form action="'+localStorage.getItem('base_url')+"api/checkoutUserItem/"+$scope.getKey()+'" method="POST"><div id="stripe_script" ng-click="placeOrderPopup.close();cartModal.hide();"></div><input name="user_id" type="hidden" value="'+localStorage.getItem("userId")+'"><input name="product_id" type="hidden" value="'+product_id+'"><input name="cart_items_id" type="hidden" value="'+product_cart_id+'"><input name="qty" type="hidden" value="'+product_qty+'"><input class="button button-balanced" type="submit" value="Confirm"></form></center>',
        scope: $scope,
        buttons: [{
          text: 'Cancel',
          type: 'button-gray' 
        },]
      });
    }
  }
  else{
    $scope.warning("Cart is Empty.");
  }
}

$scope.showPromp = function(id,quantity,name){
$scope.willAddToCart =false;

$ionicPopup.show({
    template: '<center>You currently don\'t have the desired Rank for this item.<br><b>Are you sure to purchase this product?</b></center>',
    scope: $scope,
    buttons: [
      { text: 'No',
      type: 'button-assertive' },
      {
        text: '<b>Yes</b>',
        type: 'button-balanced',
        onTap: function(e) {
          $scope.temp_name=name;
          var str = localStorage.getItem('base_url')+"api/add_item_to_user_cart/"+$scope.getKey()+"/"+localStorage.getItem("userId")+"?product_id="+id;
          $scope.showLoader();
          $http.get(str)
          .success(function(data){
            var temp="";
            $scope.hideLoader();
          if(data['success']==true){

            $scope.loadCart();
            $scope.productDetailsModal.hide();
            $scope.success("Successfully added <b>1</b> Item of <b>"+$scope.temp_name+"</b>.");
          }
          else{
            $scope.warning("<br>Opps!<br>Something went wrong.<br>Try Again Later.");
          }

          }).error(function(data){
              $scope.hideLoader();
              $scope.warning("<br>Opps!<br>Something went wrong.<br>Try Again Later");
          });
        }
      },
    ]
  });

};


$scope.removeItemFromCart=function(x){
    var temp = "";
    for (var i = 0; i < $scope.cartList.length; i++){
      if($scope.cartList[i]["product_id"]==x){
        temp=i;
        $scope.temp_name=$scope.cartList[i]["name"];
        break;
      }
    }
 

  $ionicPopup.show({
    template: "<center>Are you sure to remove <b>1</b> item of <b>"+$scope.cartList[temp]["name"]+"</b>?</center>",
    scope: $scope,
    buttons: [
      { text: 'Cancel',
      type: 'button-gray' },
      {
        text: '<b>Remove</b>',
        type: 'button-assertive',
        onTap: function(e) {
          var str = localStorage.getItem('base_url')+"api/remove_item_from_cart/"+$scope.getKey()+"/"+$scope.cartList[temp]["id"];
          //$scope.showLoader();
          $http.get(str)
          .success(function(data){
            
          if(data['success']==true){
            $scope.loadCart();
            $scope.productDetailsModal.hide();
            $scope.success("<b>1</b> item of <b>"+$scope.temp_name+"</b> has been removed from cart.");
          }
          else{
            $scope.hideLoader();
            $scope.warning("<br>Opps!<br>Something went wrong.<br>Try Again Later.");
          }

          }).error(function(data){
              $scope.hideLoader();
              $scope.warning("<br>Opps!<br>Something went wrong.<br>Try Again Later");
          });
        }
      },
    ]
  });




}

  $scope.loadProductList = function(schoolId){
  $scope.loadCart();
    $scope.selected_product_option=1;
    $scope.product_option_1='background-color: #9c0f5f;border: 5px solid #9c0f5f;';
    $scope.product_option_2='background-color: #160a47;border: 5px solid #160a47;';

    var str = localStorage.getItem('base_url')+"api/get_all_products/"+$scope.getKey()+"/"+localStorage.getItem("userId")+"?school_id="+schoolId;

    $scope.showLoader();
    $scope.productList=[];
    $http.get(str)
    .success(function(data){

    $scope.hideLoader();
      var stocks = "";

      if(data['recommended']){
        for (var x in data['recommended']){

            $scope.productList.push({
              id: data['recommended'][x]['id'],
              picture: localStorage.getItem('base_url')+data['recommended'][x]['picture'],
              name: data['recommended'][x]['name'].replace(',', ' '),
              stock: 0,
              service_sub_type_id: data['recommended'][x]['service_sub_type_id'],
              level: data['recommended'][x]['level'],
              price: data['recommended'][x]['price'],
              product_type_id: data['recommended'][x]['product_type_id'],
              description: data['recommended'][x]['description'].replace(',', ' '),
              recomended: true,
            });
        }
      }

      if(data['all']){
        for (var x in data['all']){
          if(data['all'][x]['level']=="organization"){
            stocks= data['all'][x]['pivot']['stock'];
          }
          else{
            stocks= data['all'][x]['stock'];
          }
            $scope.productList.push({
              id: data['all'][x]['id'],
              picture: localStorage.getItem('base_url')+data['all'][x]['picture'],
              name: data['all'][x]['name'].replace(',', ' '),
              stock: stocks,
              service_sub_type_id: data['all'][x]['service_sub_type_id'],
              level: data['all'][x]['level'],
              price: data['all'][x]['price'],
              product_type_id: data['all'][x]['product_type_id'],
              description: data['all'][x]['description'].replace(',', ' '),
              recomended: false,
            });
        }
      }
      $scope.searchProduct="";
      $scope.searchProducts_length=0;
      $scope.searchForAProduct();
    }).error(function(data){
      $scope.hideLoader();
    });    

  };



$scope.searchForAProduct = function(){
  $scope.searchProduct = this.searchProduct; 
  $scope.searchProducts_length=0;
  for (var i = 0; i < $scope.productList.length; i++) {
    if ($scope.productList[i]['name'].toUpperCase().indexOf($scope.searchProduct.toUpperCase())>=0) {
      $scope.searchProducts_length++;
    }
  }
};

  $scope.showproductDetails =function(x,list){
$scope.product_list=list;
$scope.currentProductIsRecomended = false;
  if(list=='catalog'){
      $scope.product_index = x;
      $scope.product_id = $scope.productList[x]['id'];
      $scope.product_picture = $scope.productList[x]['picture'];
      $scope.product_name = $scope.productList[x]['name'];
      $scope.product_stock = $scope.productList[x]['stock'];
      $scope.product_type = $scope.productList[x]['type'];
      $scope.product_level = $scope.productList[x]['level'];
      $scope.product_price = $scope.productList[x]['price'];
      $scope.product_description = $scope.productList[x]['description'];
      $scope.currentProductIsRecomended = $scope.productList[x]['recomended'];
  }
  else if(list=='cart'){
      $scope.product_index = x;
      $scope.product_id = $scope.cartList[x]['product_id'];
      $scope.product_picture = $scope.cartList[x]['picture'];
      $scope.product_name = $scope.cartList[x]['name'];
      $scope.product_stock = $scope.cartList[x]['stock'];
      $scope.product_type = $scope.cartList[x]['type'];
      $scope.product_level = $scope.cartList[x]['level'];
      $scope.product_price = $scope.cartList[x]['price'];
      $scope.product_description = $scope.cartList[x]['description'];
      $scope.currentProductIsRecomended = $scope.productList[x]['recomended'];
  }
    $scope.productDetailsModal.show();
  };

  $ionicModal.fromTemplateUrl('templates/cart.html',{
    scope: $scope
  }).then(function(modal) {
    $scope.cartModal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeCartDetails = function(){
    $scope.cartModal.hide();
  };
$scope.cartTotal=0;
  $scope.showCartDetails =function(){
    $scope.cartTotal=0;
    for (var i = 0; i < $scope.cartList.length; i++) {
      $scope.cartTotal = parseFloat($scope.cartTotal) + (parseFloat($scope.cartList[i]['price'])* parseFloat($scope.cartList[i]['quantity']));
    }
    $scope.cartModal.show();
  };

  $scope.incrementQuantity=function(){
    $scope.product_quantity++;
  }

  $scope.decrementQuantity=function(){
    if ($scope.product_quantity>1)
      $scope.product_quantity--;
  }


  $ionicModal.fromTemplateUrl('templates/messageDetails.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.messageDetailsModal = modal;
  });

  $scope.closeMessageDetailsModal = function(){
  if ($scope.messageDetail_id){
    var str = localStorage.getItem('base_url')+"api/set_notification_as_seen/"+$scope.getKey()+"?notification_id="+$scope.messageDetail_id;
    $http.get(str)
    .success(function(data){                            
      if (data.status=="success"){
        $scope.loadInbox();
      }
    }).error(function(data){
      //("set_notification_as_seen");
    }); 
  }
    $scope.messageDetailsModal.hide();
  }

$scope.inboxContents=[];

  $scope.loadInbox = function(){
        $scope.inboxContents=[];
        $scope.inboxContents_read=[];
        $scope.inboxContents_unread=[];
        var allMsgs = 0;
        var readMsgs = 0;
        var unreadMsgs = 0;
        $scope.allMsgsLength = 0;
        $scope.readMsgsLength = 0;
        $scope.unreadMsgsLength = 0;
    if(navigator.onLine){
      var str = localStorage.getItem('base_url')+"api/return_user_notification/"+$scope.getKey()+"?user_id="+localStorage.getItem("userId");
        $http.get(str)
        .success(function(data){

        if(data!="user does not exist"){
          for (var x = 0; x < data.length; x++){
            allMsgs++;

            if (data[x]["viewed"]==1) {
              readMsgs++;
            }
            else{
              unreadMsgs++;
            }

              var raw_message = "";
            raw_message = data[x]["data"]["message"];
            var temprep = '<img width="40px" length="40px" src=';
            if (raw_message.indexOf('<img src=') >= 0)
              raw_message = raw_message.substr(0,raw_message.indexOf('<img src='))+temprep+raw_message.substr(raw_message.indexOf('<img src=')+('<img src='.length));

            if(data[x]["viewed"]==1){
              $scope.inboxContents_read.push({
              id: data[x]["id"],
              user_id: data[x]["user_id"],
              data: data[x]["data"],
              message: raw_message,
              preview_message: data[x]["data"]["preview_message"],
              type: data[x]["type"],
              viewed: data[x]["viewed"],
              newsletter_history_id: data[x]["newsletter_history_id"],
              sender: data[x]["sender"],
              date: data[x]["created_at"].split(" ")[0]
            })
            }else{
              $scope.inboxContents_unread.push({
              id: data[x]["id"],
              user_id: data[x]["user_id"],
              data: data[x]["data"],
              message: raw_message,
              preview_message: data[x]["data"]["preview_message"],
              type: data[x]["type"],
              viewed: data[x]["viewed"],
              newsletter_history_id: data[x]["newsletter_history_id"],
              sender: data[x]["sender"],
              date: data[x]["created_at"].split(" ")[0]
            })
            }
          }

          for (var i = $scope.inboxContents_unread.length - 1; i >= 0; i--) {
            $scope.inboxContents.push($scope.inboxContents_unread[i]);
          }
          for (var i = $scope.inboxContents_read.length - 1; i >= 0; i--) {
            $scope.inboxContents.push($scope.inboxContents_read[i]);
          }


          $scope.allMsgsLength = allMsgs;
          $scope.readMsgsLength = readMsgs;
          $scope.unreadMsgsLength = unreadMsgs;
          $scope.hideLoader();
        }


        }).error(function(data){
          $scope.hideLoader();
          // ("get_all_products");
        });
    }
        
  }
    $scope.inboxView_style1="";
    $scope.inboxView_style2="button-outline";
    $scope.inboxView_style3="button-outline";
    $scope.inboxView=1;
$scope.toggleInboxView=function(x){
  if (x==1) {
    $scope.inboxView_style1="";
    $scope.inboxView_style2="button-outline";
    $scope.inboxView_style3="button-outline";
    $scope.inboxView=1;
  }else if (x==2) {
    $scope.inboxView_style1="button-outline";
    $scope.inboxView_style2="";
    $scope.inboxView_style3="button-outline";
    $scope.inboxView=2;
  }else if (x==3) {
    $scope.inboxView_style1="button-outline";
    $scope.inboxView_style2="button-outline";
    $scope.inboxView_style3="";
    $scope.inboxView=3;
  } 
}

  $scope.showMessageDetails = function(x){

    $scope.messageDetail_id="";
    $scope.messageDetail_user_id="";
    $scope.messageDetail_data="";
    $scope.messageDetail_message="";
    $scope.messageDetail_preview_message="";
    $scope.messageDetail_type="";
    $scope.messageDetail_viewed="";
    $scope.messageDetail_newsletter_history_id="";
    $scope.messageDetail_sender="";

    $scope.messageDetail_id=$scope.inboxContents[x]["id"];
    $scope.messageDetail_user_id=$scope.inboxContents[x]["user_id"];
    $scope.messageDetail_data=$scope.inboxContents[x]["data"];
    $scope.messageDetail_message=$scope.inboxContents[x]["message"];
    $scope.messageDetail_preview_message=$scope.inboxContents[x]["preview_message"];
    $scope.messageDetail_type=$scope.inboxContents[x]["type"];
    $scope.messageDetail_viewed=$scope.inboxContents[x]["viewed"];
    $scope.messageDetail_newsletter_history_id=$scope.inboxContents[x]["newsletter_history_id"];
    $scope.messageDetail_sender=$scope.inboxContents[x]["sender"];

    $scope.messageDetailsModal.show();
  }


  $ionicModal.fromTemplateUrl('templates/sendMessage.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.sendMessageModal = modal;
  });

  $scope.openSendMessageModal = function(){
    $scope.sendMessageModal.show();
  }
  $scope.closeSendMessageModal = function(){
    $scope.sendMessageModal.hide();
  }
$scope.sendToUsers=[];
$scope.sendToUsers.push({
  id: 0,
  name: "Eric Angelo Castanares",
  picture: localStorage.getItem("picture"),
  selected: false,
},
{
  id: 1,
  name: "Irvine Kinneas",
  picture: localStorage.getItem("picture"),
  selected: false,
},
{
  id: 2,
  name: "Samwell tarly",
  picture: localStorage.getItem("picture"),
  selected: false,
},
{
  id: 3,
  name: "Eric Liam Castanares",
  picture: localStorage.getItem("picture"),
  selected: false,
},
{
  id: 4,
  name: "Darrene Athena Castanares",
  picture: localStorage.getItem("picture"),
  selected: false,
},
{
  id: 5,
  name: "Sean Wagas",
  picture: localStorage.getItem("picture"),
  selected: false,
},
{
  id: 6,
  name: "Joshua Davidson Yap",
  picture: localStorage.getItem("picture"),
  selected: false,
},
{
  id: 7,
  name: "Kobe Bryan Alda",
  picture: localStorage.getItem("picture"),
  selected: false,
},
{
  id: 8,
  name: "Oliver Barola",
  picture: localStorage.getItem("picture"),
  selected: false,
}
);

$scope.selectAllUsers=function(){
  if($scope.select_all_users)
    $scope.select_all_users=false;
  else
    $scope.select_all_users=true;

  for (var x = 0; x < $scope.sendToUsers.length; x++){
    $scope.sendToUsers[x]['selected']=$scope.select_all_users;
  }
  
};

$scope.selectMatched=function(x){
  if($scope.sendToUsers[x]['selected'])
    $scope.sendToUsers[x]['selected']=false;
  else
    $scope.sendToUsers[x]['selected']=true;
};


$scope.sendToUserSelected=[];
$scope.selectAllUsersSelected=function(){
  if($scope.select_all_selected_users)
    $scope.select_all_selected_users=false;
  else
    $scope.select_all_selected_users=true;

  for (var x = 0; x < $scope.sendToUserSelected.length; x++){
    $scope.sendToUserSelected[x]['selected'] = $scope.select_all_selected_users;
  }
};

$scope.selectSelected=function(x){
  if($scope.sendToUserSelected[x]['selected'])
    $scope.sendToUserSelected[x]['selected']=false;
  else
    $scope.sendToUserSelected[x]['selected']=true;
};

$scope.transferIndividualToSelected=function(){
  for (var i = $scope.sendToUsers.length - 1; i >= 0; i--) {
    if ($scope.sendToUsers[i]['selected']){
      $scope.sendToUsers[i]['selected']=false;
      $scope.sendToUserSelected.push($scope.sendToUsers[i]);
      $scope.sendToUsers.splice(i,1);
    }
  }
};

$scope.transferIndividualToMatched=function(){
  for (var i = $scope.sendToUserSelected.length - 1; i >= 0; i--) {
    if ($scope.sendToUserSelected[i]['selected']) {
      $scope.sendToUserSelected[i]['selected']=false;
      $scope.sendToUsers.push($scope.sendToUserSelected[i]);
      $scope.sendToUserSelected.splice(i,1);
    }
  }
};

$scope.transferAllIndividualToSelected=function(){
  for (var i = $scope.sendToUsers.length - 1; i >= 0; i--) {
    $scope.sendToUsers[i]['selected']=false;
    $scope.sendToUserSelected.push($scope.sendToUsers[i]);
    $scope.sendToUsers.splice(i,1);
  }
};

$scope.transferAllIndividualToMatched=function(){
  for (var i = $scope.sendToUserSelected.length - 1; i >= 0; i--) {
    $scope.sendToUserSelected[i]['selected']=false;
    $scope.sendToUsers.push($scope.sendToUserSelected[i]);
    $scope.sendToUserSelected.splice(i,1);
  }
};

$scope.listedDtudent=[];
$scope.searchStudentsNameame ="";
$scope.loadStudents=function(){
  $scope.searchStudentsNameame = this.searchStudentsNameame;
  $scope.students_active = 0;
  $scope.students_inactive = 0;
  $scope.students_onHold = 0;
  $scope.students_lead = 0;
  var str = localStorage.getItem('base_url')+"api/getUsersByName/"+$scope.getKey()+"/?name="+$scope.searchStudentsNameame+"&school_id="+$scope.selected_schoolId+"&limit=100&student_only=1";
  $http.get(str)
  .success(function(data){
    $scope.listedStudent=[];

    for (var i = 0; i < data.length; i++){

      var is_lead_style="";
        is_lead="";
        if(data[i]['is_lead']>0){
          is_lead_style="background-color:#f0e68c;";
          $scope.students_lead++;
        }

        if(data[i]['on_hold']>0)
          $scope.students_onHold++;

        if(data[i]['isActive']>0)
          $scope.students_active++;
        else
          $scope.students_inactive++;

        $scope.listedStudent.push({
          id: data[i]['id'],
          username: data[i]['username'],
          name: data[i]['first_name']+" "+data[i]['last_name'],
          pic: data[i]['picture'],
          is_lead: data[i]['is_lead'],
          on_hold:data[i]['on_hold'],
          is_active:data[i]['isActive'],
          is_lead_style:is_lead_style,
          role_id:data[i]['role_id'],
        });
      
    }

  }).error(function(data){
    // ("getrelationship")
  });
};//end of loadStudents()


$scope.student_option_1 = "background-color:#9c0f5f";
$scope.student_option_2 = "background-color:#160a47";
$scope.student_option_3 = "background-color:#160a47";
$scope.student_option_4 = "background-color:#160a47";

$scope.selected_students_active = 1;
$scope.selected_students_inactive = 0;
$scope.selected_students_onHold = 0;
$scope.selected_students_lead = 0;

$scope.selectStudentType=function(type){

  if (type==1) {
    if($scope.student_option_1=="background-color:#9c0f5f"){
      $scope.student_option_1 = "background-color:#160a47";
      $scope.selected_students_active = 0;
    }
    else{
      $scope.student_option_1 = "background-color:#9c0f5f";
      $scope.selected_students_active = 1;
    }
  }

  else if (type==2) {
    if($scope.student_option_2=="background-color:#9c0f5f"){
      $scope.student_option_2 = "background-color:#160a47";
      $scope.selected_students_inactive = 0;
    }
    else{
      $scope.student_option_2 = "background-color:#9c0f5f";
      $scope.selected_students_inactive = 1;
    }
  }

  else if (type==3) {
    if($scope.student_option_3=="background-color:#9c0f5f"){
      $scope.student_option_3 = "background-color:#160a47";
      $scope.selected_students_onHold = 0;
    }
    else{
      $scope.student_option_3 = "background-color:#9c0f5f";
      $scope.selected_students_onHold = 1;
    }
  }

  else if (type==4) {
    if($scope.student_option_4=="background-color:#9c0f5f"){
      $scope.student_option_4 = "background-color:#160a47";
      $scope.selected_students_lead = 0;
    }
    else{
      $scope.student_option_4 = "background-color:#9c0f5f";
      $scope.selected_students_lead = 1;
    }
  }
}//end of selectStudentType(type)

  $ionicModal.fromTemplateUrl('templates/selectRecipients.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.selectRecipientsModal = modal;
  });

  $scope.openSelectRecipientsModal = function(){
    $scope.selectRecipientsModal.show();
  }

  $scope.closeSelectRecipientsModal = function(){
    $scope.selectRecipientsModal.hide();
  }

$scope.msg_recipients=[];

$scope.msg_SMS=true;
$scope.msg_Email=false;
$scope.msg_SMS_Email=false;

$scope.msgSMSEmailSelect=function(x){
  if (x=='1') {
    $scope.msg_SMS=true;
    $scope.msg_Email=false;
    $scope.msg_SMS_Email=false;
  }
  else if(x=='2'){
    $scope.msg_SMS=false;
    $scope.msg_Email=true;
    $scope.msg_SMS_Email=false;
  }
  else if(x=='3'){
    $scope.msg_SMS=false;
    $scope.msg_Email=false;
    $scope.msg_SMS_Email=true;
  }
};

$scope.msg_Push_Notification=true;
$scope.msgPushNotification=function(){
  if ($scope.msg_Push_Notification)
    $scope.msg_Push_Notification=false;
  else
    $scope.msg_Push_Notification=true;
}

$scope.isOnHold=function(effective_hold_date,onHold){
  var unixtime = new Date().getTime()/1000;
  if(effective_hold_date==0){
    return onHold==1;
  }
  else{
      if(unixtime > effective_hold_date){
        return onHold==1;
      }
      else{
        return false;
      }
  }
};

  $scope.studentStat = [];
  $scope.studentStat.push({
    id: 0,
    name: "Select Status"
  },{
    id: 1,
    name: "Injured"
  },{
    id: 2,
    name: "Sick"
  },{
    id:3,
    name:"On a vacation"
  },{
    id:4,
    name:"Struggling"
  },{
    id:5,
    name:"Other"
  });

  $scope.time=[];
      $scope.time.push({
      id:0,
      name:"Select Time",
      value:(0)
    });
for (var i = 1; i < 26; i++) {
  if (i<12) {
    $scope.time.push({
      id:i,
      name:(i)+" AM",
      value:(i)
    });
  }else if (i==12) {
    $scope.time.push({
      id:i,
      name:(i)+" NN",
      value:(i)
    });
  }
  else if (i>12&&i<24) {
    $scope.time.push({
      id:i,
      name:(i-12)+" PM",
      value:(i)
    });
  }
  else if (i==26) {
    $scope.time.push({
      id:i,
      name:(i-12)+" MN",
      value:(i)
    });
  }
}
  $scope.method=[];
  $scope.method.push({
      id:0,
      name:"Select Method",
      value:"none"
    },{
      id:1,
      name:"Task Engine Contact Task",
      value:"task-engine"
    },
    {
      id:2,
      name:"Email",
      value:"email"
    },
    {
      id:3,
      name:"SMS",
      value:"sms"
    });

  $scope.template=[];
  $scope.template.push({
      id:1,
      name:"Select Template",
      value:""
    },
    {
      id:2,
      name:"Sample",
      value:"<h1>sample 1</h1>"
    });

  $ionicModal.fromTemplateUrl('templates/onHoldDetails.html', {
    scope: $scope,
  }).then(function(modal) {
    $scope.onHoldDetailsModal = modal;
  });

  $scope.openOnHoldDetails = function(){
    if($scope.completeTaskPopup)
      $scope.completeTaskPopup.close();

    // if ($scope.taskDetails_birthdate!='N/A' || $scope.taskDetails_birthdate=='') {
    //   var temp1 = new Date()
    //   var temp2 = new Date()
    // }

    $scope.onHoldDetails_age = $scope.taskDetails_birthdate;
    $scope.onHoldDetails_gender = $scope.taskDetails_gender;
    $scope.onHoldDetails_studentId = $scope.taskDetails_studentId;
    $scope.onHoldDetails_id = $scope.taskDetails_id;
    $scope.onHoldDetails_pic = $scope.taskDetails_studentImg;
    $scope.onHoldDetails_name = $scope.taskDetails_studentName;

    $scope.onHoldDetails_status_student=$scope.studentStat[0];
    
    $scope.onHoldDetails_follow_up_time=$scope.time[0];
    $scope.onHoldDetails_method=$scope.method[0];
    $scope.onHoldDetails_template=$scope.template[0];

    $scope.onHoldDetails_effective_date="";
    $scope.onHoldDetails_return_date="";

    $scope.onHoldDetails_follow_up_day="";
    $scope.onHoldDetails_hold_billing=false;

    
    $scope.onHoldDetailsFollowUpScript="";

    $scope.onHoldDetailsModal.show();
this.onHoldDetails_hold_billing=false;
      document.getElementById("onHoldDetails_method").selectedIndex =0;
      // document.getElementById("onHoldDetails_template").selectedIndex =0;
      document.getElementById("onHoldDetails_follow_up_time").selectedIndex =0;
      document.getElementById("onHoldDetails_status_student").selectedIndex =0;

      document.getElementById("onHoldDetails_effective_date").value ="";
      document.getElementById("onHoldDetails_follow_up_day").value ="";
      document.getElementById("onHoldDetails_return_date").value ="";

      document.getElementById("onHoldDetails_hold_billing").checked =false;

      document.getElementById("onHoldDetails_follow_up_script").value="";
      $("#onHoldDetails_follow_up_script").css('border-color','gray');
      $("#onHoldDetails_follow_up_script_msg").css('display','none');
      $("#onHoldDetails_return_date").css('border-color','gray');
      $("#onHoldDetails_return_date_msg").css('display','none');
      $("#onHoldDetails_follow_up_day").css('border-color','gray');
      $("#onHoldDetails_follow_up_day_msg").css('display','none');
      $("#hold_amount").css('border-color','gray');
      $("#onHoldDetails_hold_amount_msg").css('display','none');
      $("#onHoldDetails_status_student_other").css('display','none');
      $("#onHoldDetails_status_student").css('border-color','gray');
      $("#onHoldDetails_status_student_msg").css('display','none');
      $("#onHoldDetails_follow_up_time").css('border-color','gray');
      $("#onHoldDetails_follow_up_time_msg").css('display','none');
      $("#onHoldDetails_method").css('border-color','gray');
      $("#onHoldDetails_method_msg").css('display','none');
      $("#onHoldDetails_effective_date").css('border-color','gray');
      $("#onHoldDetails_effective_date_msg").css('display','none');
  };

$scope.selected_others=false;
$scope.selectStatus=function(){
    $scope.onHoldDetails_status_student=this.onHoldDetails_status_student;
document.getElementById("onHoldDetails_status_student_other").value="";
    if (this.onHoldDetails_status_student.name=='Other') {
      $("#onHoldDetails_status_student_other").css('display','block');
    }

    else{
      $("#onHoldDetails_status_student_other").css('display','none');
    }
}

$scope.selectTime=function(){
    $scope.onHoldDetails_follow_up_time=this.onHoldDetails_follow_up_time;
}

$scope.selectMethod=function(){
    $scope.onHoldDetails_method=this.onHoldDetails_method;
}

$scope.selectTemplate=function(){
    $scope.onHoldDetails_template=this.onHoldDetails_template;
    $scope.onHoldDetails_follow_up_script=this.onHoldDetails_template.value;
    this.onHoldDetails_follow_up_script=this.onHoldDetails_template.value;
    document.getElementById("onHoldDetails_follow_up_script").value=this.onHoldDetails_template.value;
}

$scope.closeOnHoldDetails = function(){
  if ($scope.onHoldDetailsModal)
  $scope.onHoldDetailsModal.hide();

  if ($scope.completeTaskPopup)
  $scope.completeTaskPopup.show();
};


$scope.adjustToOrgDateFormat=function(date){
  var orgFormat = localStorage.getItem("orgDateFormat");
  if (orgFormat==1)
    return date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate();
  else if (orgFormat==2)
    return date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
  else if (orgFormat==3)
    return (date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear();
};


$scope.saveOnholdDetails=function(){
  var flag=0;
  if (navigator.onLine) {




      $("#hold_amount").css('border-color','gray');
      $("#onHoldDetails_hold_amount_msg").css('display','none');

      var studentId = $scope.onHoldDetails_studentId;
      var studentStat = $scope.onHoldDetails_status_student.name;

      if(studentStat=="Other")
        studentStat=document.getElementById("onHoldDetails_status_student_other").value;

      var day = new Date(document.getElementById("onHoldDetails_follow_up_day").value);
      var tempDay = day.getTime();
      day = $scope.adjustToOrgDateFormat(day);

      var time = $scope.time[document.getElementById("onHoldDetails_follow_up_time").selectedIndex].value;    
      var method = $scope.method[document.getElementById("onHoldDetails_method").selectedIndex].value;
      var holdBilling = 0;
      var holdFee = 0;
      var holdAmount = 0;
      var schoolId = $scope.selected_schoolId;
      var rdate = new Date(document.getElementById("onHoldDetails_return_date").value);

      var tempRdate = rdate.getTime();
      rdate =  $scope.adjustToOrgDateFormat(rdate);

      var edate = new Date(document.getElementById("onHoldDetails_effective_date").value);
      var tempEdate = edate.getTime();
      edate =  $scope.adjustToOrgDateFormat(edate);

      var script = document.getElementById("onHoldDetails_follow_up_script").value;
      var userId = localStorage.getItem("userId");

        if ((document.getElementById("onHoldDetails_effective_date").value==""||document.getElementById("onHoldDetails_effective_date").value==null)) {
          $("#onHoldDetails_effective_date").css('border-color','red');
          $("#onHoldDetails_effective_date_msg").css('display','block');
          flag++; 
        }
        else{
          $("#onHoldDetails_effective_date").css('border-color','gray');
          $("#onHoldDetails_effective_date_msg").css('display','none');
        }

        if ($scope.onHoldDetails_status_student.name=="Select Status") {
          $("#onHoldDetails_status_student").css('border-color','red');
          $("#onHoldDetails_status_student_msg").css('display','block');
          flag++; 
        }
        else{
          $("#onHoldDetails_status_student").css('border-color','gray');
          $("#onHoldDetails_status_student_msg").css('display','none');
        }

        if (time==0) {
          $("#onHoldDetails_follow_up_time").css('border-color','red');
          $("#onHoldDetails_follow_up_time_msg").css('display','block');
          flag++;
        }
        else{
          $("#onHoldDetails_follow_up_time").css('border-color','gray');
          $("#onHoldDetails_follow_up_time_msg").css('display','none');
        }

        if (method=="none") {
          $("#onHoldDetails_method").css('border-color','red');
          $("#onHoldDetails_method_msg").css('display','block');
          flag++;
        }
        else{
          $("#onHoldDetails_method").css('border-color','gray');
          $("#onHoldDetails_method_msg").css('display','none');
        }

        if (document.getElementById("onHoldDetails_follow_up_script").value!="") {
          $("#onHoldDetails_follow_up_script").css('border-color','gray');
          $("#onHoldDetails_follow_up_script_msg").css('display','none');
        }
        else{
          $("#onHoldDetails_follow_up_script").css('border-color','red');
          $("#onHoldDetails_follow_up_script_msg").css('display','block');
          flag++;
        }

        if((!(tempEdate<tempRdate)) || (document.getElementById("onHoldDetails_return_date").value==""||document.getElementById("onHoldDetails_return_date").value==null)){
          $("#onHoldDetails_return_date").css('border-color','red');
          $("#onHoldDetails_return_date_msg").css('display','block');
          flag++;
        }
        else{
          $("#onHoldDetails_return_date").css('border-color','gray');
          $("#onHoldDetails_return_date_msg").css('display','none');
        }
          
        if((!(tempDay>=tempEdate && tempDay<=tempRdate)) || (document.getElementById("onHoldDetails_follow_up_day").value==""||document.getElementById("onHoldDetails_follow_up_day").value==null)){
          $("#onHoldDetails_follow_up_day").css('border-color','red');
          $("#onHoldDetails_follow_up_day_msg").css('display','block');
          flag++;
        }
        else{
              $("#onHoldDetails_follow_up_day").css('border-color','gray');
              $("#onHoldDetails_follow_up_day_msg").css('display','none');
        }

          
          if ($('input[name=onHoldDetails_hold_billing]:checked').val()!=undefined)
            holdBilling=1;
          
          holdFee=$("input[name=hold_fees]:checked").val();

          if($("#hold_amount").val()!="")
            holdAmount=$("#hold_amount").val();

          if(holdBilling==1){
            if(holdFee==1){
              if (holdAmount<=0) {
                $("#hold_amount").css('border-color','red');
                $("#onHoldDetails_hold_amount_msg").css('display','block');
                flag++;
              }

              else{
                $("#hold_amount").css('border-color','gray');
                $("#onHoldDetails_hold_amount_msg").css('display','none');
              }

            }else{
              holdFee=0;
              holdAmount=0;
              $("#hold_amount").css('border-color','gray');
              $("#onHoldDetails_hold_amount_msg").css('display','none');
            }
          }

          else{
            holdFee=0;
            holdAmount=0;
            $("#hold_amount").css('border-color','gray');
            $("#onHoldDetails_hold_amount_msg").css('display','none');
          }

          if(flag==0){
              
            var str=localStorage.getItem("base_url")+"/api/setStudentOnHold/"+$scope.getKey()+"?user_id="+studentId+"&student_status="+studentStat+"&type="+method+"&day="+day+"&time="+time+"&hold_billing="+holdBilling+"&hold_amount="+holdAmount+"&with_hold_fee="+holdFee+"&school_id="+schoolId+"&return_date="+rdate+"&effective_date="+edate+"&script="+script+"&author_id="+userId;

            //$scope.showLoader();
            $http.get(str)
            .success(function(data,responseType){
              if (data.status=="success"){
                $scope.success("Student is now on hold, Task Closed.");
                $scope.hideLoader();
                $scope.loadTasks();
                $scope.closetaskDetails(); 
                $scope.closeOnHoldDetails();
              }
              else{
                $scope.warning("Hold failed, please try again later.");
              }
                  
            }).error(function(data,responseType){
              $scope.hideLoader();
              $scope.warning("Hold failed, please try again later.");
            });
          }

        

  }

};

$scope.declineTAC = function() {
  
var myPopup = $ionicPopup.show({
    template: "<center><icon class='ion-alert' style='font-size:72px;color:#f8c686;'></icon><br><b>Are you sure?</b><p style='color:gray;'>You will be logged out from WhiteBelt Mobile!</p></center>",
    scope: $scope,
    buttons: [
      { text: 'Back',
      type: 'button-gray' },
      {
        text: '<b>Yes, I disagree!</b>',
        type: 'button-assertive',
        onTap: function(e) {
          window.location.href = "index.html";
          localStorage.clear();
          $scope.termsAndConditionModal.hide();
        }
      },
    ]
  });

};
    

  $scope.exitApp=function(){
    window.location.href = "index.html";
    localStorage.clear();
  };

  $ionicModal.fromTemplateUrl('templates/termsAndCondition.html', {
    hardwareBackButtonClose: false,
    scope: $scope,
  }).then(function(modal) {
    $scope.termsAndConditionModal = modal;
  });

  $scope.showTermsAndCondition = function(){
    var str = localStorage.getItem('base_url')+"whitebelttos/";
    $http.get(str)
    .success(function(data){
        $scope.digital_tac=data['tos']['contents'];
        $scope.termsAndConditionModal.show();
    }).error(function(data){
        // ("Error")
    });
  };

  $scope.agreeWithTAC = function(){
    // //$scope.showLoader();
    var str = localStorage.getItem('base_url')+"api/ack_tos/"+$scope.getKey()+"?student_id="+localStorage.getItem("userId")+"&ack=1";
    $http.get(str)
    .success(function(data){
      $scope.hideLoader();
      $scope.termsAndConditionModal.hide();
    }).error(function(data){
      $scope.hideLoader();
    });
  };



  $scope.scrollTop = function() {
    $ionicScrollDelegate.$getByHandle('modalContent').scrollTop(true);
  }


  $ionicModal.fromTemplateUrl('templates/riskWaiver.html', {
    scope: $scope,
  }).then(function(modal) {
    $scope.digitalSignaturesModal = modal;
  }); 

  $scope.encodeRiskWaiver=function(str){
    return str
    .replace(/&nbsp;/g,"_html_space_")
    .replace(/&/g,"_and_sign_");

  };
  $scope.decodeRiskWaiver=function(str){
    return str
    .replace(/_and_sign_/g,"&")
    .replace(/_html_space_/g,"&nbsp;");
  };


$scope.loadYesterdaysReport = function(){
    var str = localStorage.getItem('base_url')+"api/get_yesterdays_figure/"+$scope.getKey()+"?school_id="+$scope.selected_schoolId;
    $scope.showLoader();
    $http.get(str)
    .success(function(data){
      $scope.hideLoader();

      $scope.report_success=data["success"];
      if(data["success"]){
        $scope.report_date=$scope.adjustToOrgDateFormat(new Date(data["data"]["date"]));
        $scope.report_students_total_attendance=data["data"]["data"]["students_total_attendance"];
        $scope.report_leads_total_attendance=data["data"]["data"]["leads_total_attendance"];
        $scope.report_leads_total_no_show=data["data"]["data"]["leads_total_no_show"];

        $scope.report_paysmart_on=data["data"]["data"]["paysmart_on"];

        $scope.report_total_overdue=data["data"]["data"]["total_overdue"];
        $scope.report_total_incomplete=data["data"]["data"]["total_incomplete"];
      }
      else{
        $scope.report_msg=data["msg"];
      }

    }).error(function(data){
      $scope.hideLoader();
    });
}



  $scope.showDigitalSignature =function(){

$scope.riskWaiverWarningMsg=false;
if(document.getElementById("guardiansName").value!="" || $scope.selected_student_age>=18){
  $scope.riskWaiverWarningMsg=false;

    $scope.riskWaiverWarning.close();

    var str = localStorage.getItem('base_url')+"api/get_legal_form/"+$scope.getKey()+"/?school_id="+$scope.selected_school_id+"&guardian="+document.getElementById("guardiansName").value+"&type=waiver&name="+$scope.selected_student_name+"&dob="+$scope.selected_student_birthdate+"&address="+$scope.selected_student_address;
    // alert(str)
    $http.get(str)
    .success(function(data){
      $timeout(function(){
      $scope.risk_waiver=data.output;      
      

      $scope.signed_label="button-assertive";
      $('#json').prop('disabled', true);
      $scope.signature_label="Not Signed";
      $scope.scrollTop();

      $scope.checkSignature = function(){
        if ($('#sig').signature('isEmpty')){
          $scope.signed_label = " button-assertive ";
          $('#json').prop('disabled', true);
          $scope.signature_label="Not Signed";
        }

        else{
          $scope.signed_label = " button-balanced ";
          $('#json').prop('disabled', false);
          $scope.signature_label="Signed";
        }
      };

      $('#sig').signature();
      $('#sig').signature('clear');

      $scope.clearSignauteLable = function(){
        $scope.signed_label = " button-assertive ";
        $('#json').prop('disabled', true);
        $scope.signature_label="Not Signed";
      };

      $('#clear').click(function() {
        $('#sig').signature('clear');
      });

      $('#json').click(function() {

          $('#json').prop('disabled', true);
          $scope.risk_waiver=$scope.decodeRiskWaiver($scope.risk_waiver); 
          $scope.digitalSignaturesModal.hide();
          $scope.control=0;

          var str2 = localStorage.getItem('base_url')+'addwaiver/'+$scope.getKey();
          $http.post(str2,{user_id:$scope.selected_student_id, signature:$('#sig').signature('toJSON'), waiver_form:$scope.encodeRiskWaiver($scope.risk_waiver), is_paper_waiver:0})
          .success(function(data){

            var str3 = localStorage.getItem('base_url')+"api/class_check_in/"+$scope.getKey()+"/?class_id="+$scope.selected_class_id+"&school_id="+$scope.selected_school_id+"&user_id="+$scope.selected_student_id+"&source=3&dojoclass_schedule_id="+$scope.selected_class_schedule_id;
            $http.get(str3)
            .success(function(data){

            if(data == "Check in successful" && $scope.control==0){
              $scope.x=0;
              $scope.control++;
              $('#json').prop('disabled', false);
              $scope.success('<center class="ion-checkmark-circled" style="background-color:white;color:green;font-size:100px;"><p style="color:black;font-size:10px;">Check in Successful!<br>You can now proceed to your designated Class.</p></center>');
              $scope.digitalSignaturesModal.hide(); 

              if($scope.addStudentToClassModal) 
                $scope.successfulCheckinViaInstructor();

              if($scope.selected_someonesSchoolId)
                if($scope.selected_someonesUserId)
                  $scope.loadSomeonesClasses($scope.selected_someonesUserId,$scope.selected_someonesSchoolId)
            }

            else if (data == "Already checked in." && $scope.control==0){
              $scope.control++;
              $scope.warning(data);
            }

            else if(data == "onhold" && $scope.control==0){
              $scope.control++;
              var onHoldPopup = $ionicPopup.show({
                title: 'Sorry',
                template: "<center style='font-size:14px;'>Unable to check in<br> Your account is currently <b>ON HOLD</b><br>Please speak to your Instructor.<br><br><b>You will now be logged out.</b></center>",
                hardwareBackButtonClose: false,
                buttons: [{
                  text: '<b>Ok</b>',
                  type: 'button-energized',
                  onTap: function(e) {

                    localStorage.clear();
                    window.location.href = "index.html";

                  }
                },]
              });
            }

            else if(data == "need-risk-waiver"&&$scope.control==0){
              $scope.control++;
            var str = localStorage.getItem('base_url')+"getuserdetails/"+$scope.getKey()+"/?userid="+$scope.userId;
            $http.get(str)
            .success(function(data){
              $scope.selected_student_address=""; 

              if(data.street!="" && data.street!=null){
                if (data.street.toUpperCase()!="N/A")
                  $scope.selected_student_address=data.street;
                else
                  $scope.selected_student_address="N/A";
              }
              else
                  $scope.selected_student_address="N/A";
                

              if(data.city!="" && data.city!=null){
                if(data.city.toUpperCase()!="N/A")
                  $scope.selected_student_address=$scope.selected_student_address+", "+data.city;
                else
                  $scope.selected_student_address="N/A";
              }
              else
                  $scope.selected_student_address="N/A";
                

              if(data.country!="" && data.country!=null){
                if(data.country.toUpperCase()!="N/A")
                  $scope.selected_student_address=$scope.selected_student_address+", "+data.country;
                else
                  $scope.selected_student_address="N/A";
              }
              else
                $scope.selected_student_address="N/A";


              if(data.zip!="" && data.zip!=null){
                if (data.zip.toUpperCase()!="N/A")
                  $scope.selected_student_address=$scope.selected_student_address+", "+data.zip;
                else
                  $scope.selected_student_address="N/A";
              }
              else
                $scope.selected_student_address="N/A";

              $scope.selected_student_birthdate=data.birthdate;
            if(data.birthdate==""||data.birthdate==null||data.birthdate=="0000-00-00"||data.birthdate=="1970-01-01")
                $scope.settingupBirthdate(data.username);
            else
                $scope.askForGuardiansName();
            }).error(function(data){
              $('#json').prop('disabled', false);
            });

             $scope.hideLoader();
            }

            else if(data == "exclusive"&&$scope.control==0){
              var sorryPopup = $ionicPopup.alert({
                title: 'Sorry',
                template: "<center>This is an exclusive class.<br>Please speak to your Instructor</center>",
                okType: "button-assertive"
              });
            }

            else if($scope.control==0){
              $scope.warning(data);
            }

            }).error(function(data){
              $scope.error("Error "+data);
            });


          }).error(function(data){
            $scope.warning("Error "+data);
          });

      });  }, 1000);

    }).error(function(data){
      $scope.warning("Error "+JSON.stringify(data));
    });
    }
    else if( document.getElementById("guardiansName").value=="" || $scope.selected_student_age<18){
      $scope.riskWaiverWarningMsg=true;
      // $scope.warning("Please ask your parent/guardian to sign the risk waiver on your behalf.");
    }

    if(document.getElementById("guardiansName").value!="" || $scope.selected_student_age>=18){
      $scope.digitalSignaturesModal.show();
    }
  };
      $scope.selected_product_option=1;
      $scope.product_option_1='background-color: #9c0f5f;border: 5px solid #9c0f5f;';
      $scope.product_option_2='background-color: #160a47;border: 5px solid #160a47;';
  $scope.selectProductCatalogType=function(x){
    if (x==1){
      $scope.product_option_1='background-color: #9c0f5f;border: 5px solid #9c0f5f;';
      $scope.product_option_2='background-color: #160a47;border: 5px solid #160a47;';
      $scope.selected_product_option=1;
    }else if(x==2){
      $scope.product_option_1='background-color: #160a47;border: 5px solid #160a47;';
      $scope.product_option_2='background-color: #9c0f5f;border: 5px solid #9c0f5f;';
      $scope.selected_product_option=2;
    }
  }


  $ionicModal.fromTemplateUrl('templates/orderHistory.html', {
    scope: $scope,
  }).then(function(modal) {
    $scope.orderHistoryModal = modal;
  }); 

  $ionicModal.fromTemplateUrl('templates/receipt.html', {
    scope: $scope,
  }).then(function(modal) {
    $scope.receiptModal = modal;
  }); 

$scope.showRecipt = function(id){
      var str = localStorage.getItem('base_url')+"api/order_view_summary/"+$scope.getKey()+"?order_id="+id;
      // alert(str)
      $scope.showLoader();
      $http.get(str)
      .success(function(data){
        // alert(1)
        
        $scope.receipt=[];
        $scope.receipt.push({
          success: data['success'],
          order_id: data['order_id'],
          payer_name: data['payer_name'],
          product_name: data['product_name'],
          product_price: data['product_price'],
          product_qty: data['product_qty'],
          stripe_fee: data['stripe_fee'],
          total_amount: data['total_amount'],
          purchased_date: data['purchased_date'],
        });
        $scope.receiptModal.show();
        $scope.hideLoader();
        // alert(2)
        alert(JSON.stringify($scope.receipt))
        // alert(3)
      }).error(function(data){
        // alert("error")
        $scope.hideLoader();
      })
}


  $scope.showOrderHistory = function(){
    $scope.orderHistoryModal.show();
    $scope.orderHistory=[];
      var str = localStorage.getItem('base_url')+"api/user_purchase_history/"+$scope.getKey()+"?user_id="+localStorage.getItem("userId");
      $scope.showLoader();
      $http.get(str)
      .success(function(data){
        $scope.hideLoader();
        

        for (var x in data){

          var temp = "";
          if (data[x]["variable"]) {
            temp = JSON.parse(data[x]["variable"]);
          }
          
          var temp_qty="";
          if (data[x]["quantity"]==undefined && data[x]["product_type_id"]==1){
              temp_qty=1;
              temp_qty_lbl="Product Type:Services";
          }else{
              temp_qty=data[x]["quantity"];
              temp_qty_lbl="Qty: "+data[x]["quantity"];
          }

          $scope.orderHistory.push({
            order_id: data[x]["order_id"],
            picture: localStorage.getItem('base_url')+data[x]['picture'],
            name: data[x]["name"],
            description: data[x]["description"],
            quantity: temp_qty_lbl,
            variable: temp,
            duration_type_id: data[x]["duration_type_id"],
            price: ((parseFloat(data[x]["price"]))*parseFloat(temp_qty)).toFixed(2),
            date_purchased: data[x]["date_purchased"],
            product_status_id: data[x]["product_status_id"],
          });
        }

      }).error(function(data){
        $scope.hideLoader();
      });
  }

  $ionicModal.fromTemplateUrl('templates/activeProductList.html', {
    scope: $scope,
  }).then(function(modal) {
    $scope.activeProductModal = modal;
  }); 

  $scope.showActiveProductList = function(){
    $scope.activeProductModal.show();
    $scope.activeProduct = [];
    $scope.activeProduct2 =[];
    var str = localStorage.getItem('base_url')+"api/user_purchase_list/"+$scope.getKey()+"?user_id="+localStorage.getItem("userId");

    $scope.showLoader();
    $http.get(str)
    .success(function(data){

      $scope.hideLoader();
      var temp = "";
      var status = "";
      
        for (var x in data){
          status = "";
          if (data[x]["product_type_id"]==1) {
            temp="";
            if (data[x]["variable"])
            temp = data[x]["variable"].replace("{", '').replace("}", '').replace("[", '').replace("]", '').replace(/"/g, "").replace(/'/g, "");

            var temp_qty="";
            if (data[x]["quantity"]!=undefined && data[x]["quantity"]!=""){
              temp_qty=data[x]["quantity"];
              temp_qty_lbl="Qty: "+data[x]["quantity"];
            }
            else if (data[x]["product_type_id"]==1){
                temp_qty=1;
                temp_qty_lbl="Product Type:Services";
            }

            var consumed_style = "";
            var consumed_style2 = "";
            if (data[x]["consumed"]==1){
              status="Consumed";
              consumed_style="background-color:#edeff2;color:#a9abad;";
              consumed_style2="opacity: 0.4;";

            $scope.activeProduct2.push({
              product_id: data[x]["id"],
              name: data[x]["name"],
              description: data[x]["description"],
              quantity: temp_qty,
              variable: temp,
              duration_type_id: data[x]["duration_type_id"],
              picture: localStorage.getItem('base_url')+data[x]["picture"],
              price: ((parseFloat(data[x]["price"]))*parseFloat(temp_qty)).toFixed(2),
              consumed: consumed_style,
              consumed2: consumed_style2,
              date_purchased: data[x]["date_purchased"],
              status: status,
            });
            }else{
              status="Active";
              $scope.activeProduct.push({
                product_id: data[x]["id"],
                name: data[x]["name"],
                description: data[x]["description"],
                quantity: temp_qty,
                variable: temp,
                duration_type_id: data[x]["duration_type_id"],
                picture: localStorage.getItem('base_url')+data[x]["picture"],
                price: ((parseFloat(data[x]["price"]))*parseFloat(temp_qty)).toFixed(2),
                consumed: consumed_style,
                consumed2: consumed_style2,
                date_purchased: data[x]["date_purchased"],
                status: status,
              });
            }
          }        
        }

        for (var i = 0; i < $scope.activeProduct2.length; i++) {
          $scope.activeProduct.push($scope.activeProduct2[i]);
        }
    }).error(function(data){

      $scope.hideLoader();
    });
  }

  $ionicModal.fromTemplateUrl('templates/riskWaiverCopy.html', {
    scope: $scope,
  }).then(function(modal) {
    $scope.riskWaiverCopyModal = modal;
  });


$scope.openCopyRiskWaiver = function(){
$scope.riskWaiverCopyModal.show();
  var str = localStorage.getItem('base_url')+"api/get_riskwaiver/"+$scope.getKey()+"?user_id="+localStorage.getItem("userId");
    $scope.showLoader();
    $http.get(str)
    .success(function(data){
      $scope.hideLoader();
      if (data['waiver']!=null && data['success']==true){
        if (data['waiver']['paper_waiver']==0){
          $('#sig_copy').signature();
          $('#sig_copy').signature('enable').signature('draw',data['waiver']['signatory']);
          $('#sig_copy').signature({disabled: true}); 

          $scope.risk_waiver_copy=data['waiver']['content'];
        }
        else
          $scope.risk_waiver_copy="Risk Waiver was signed on paper.";
      }
      else
        $scope.risk_waiver_copy="Risk Waiver was not signed.";

    }).error(function(data){
      $scope.hideLoader();
      $scope.risk_waiver_copy="Risk Waiver was not loaded. Try againb Later";
    });
}

$scope.pic_notification_visible=false;

if(localStorage.getItem("userId")!="undefined" && localStorage.getItem("userId")!=null){

  $scope.hideLoader();
  $scope.setUpRelationshipDetails();
  $scope.setUpStyleAndOrgDetails();
  $scope.setUpCountries();
  $scope.setUpUserDetails();
  $scope.intUserRole();
  $scope.loopThis();
}

})



// app.controller('MapController', function($scope, $ionicLoading) {
//   // location.reload();
//     google.maps.event.addDomListener(document.getElementById("map"), 'click', function() {

//         var myLatlng = new google.maps.LatLng(-31.884774, 115.865214);
 
//         var mapOptions = {
//             center: myLatlng,
//             zoom: 18,
//             mapTypeId: google.maps.MapTypeId.SATELLITE,
//             zoomControl: false,
//             mapTypeControl: false,
//             scaleControl: false,
//             streetViewControl: false,
//             rotateControl: false
//         };
 
//         var map = new google.maps.Map(document.getElementById("map"), mapOptions);
//         $scope.gpsStatus = 0;
//         navigator.geolocation.getCurrentPosition(function(pos) {
//           $scope.gpsStatus=1;
//             map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
//             var myLocation = new google.maps.Marker({
//                 position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
//                 map: map,
//                 title: "My Location"
//             });
//         });
//         $scope.map = map;
//     });
// });

// app.controller('ClassesController', function($scope, $ionicModal, $timeout, $ionicPopup,$http, $ionicLoading, $location, $ionicNavBarDelegate, $state, $cookies) {
//   $scope.showAllClasses=false;
//   $scope.showSearchClasses=true;
//   $scope.showNoResults=true;
//   $scope.search="";

//   $scope.searchForAClass=function(){

//     $scope.searchClasss = [];
//     for (var i = 0; i < $scope.classs.length; i++) {
//       if($scope.classs[i]['name'].toUpperCase().match(this.search.toUpperCase())){
//         $scope.searchClasss.push({
//           id: $scope.classs[i]['id'],
//           name: $scope.classs[i]['name'],
//           time_in: $scope.classs[i]['time_in'],
//           time_out: $scope.classs[i]['time_out'],
//           // styleName:$scope.classs[i]['styleName'],
//           checkedIn: $scope.classs[i]['checkedIn'],
//           trueOrFalse: $scope.classs[i]['trueOrFalse']
//         })
//       }
//     }

//     if($scope.searchClass.length>0||this.search==""){
//       $scope.showAllClasses=false;
//       $scope.showSearchClasses=true;
//       $scope.showNoResults=true;
//     }
//     else if($scope.searchClasss.length==0 && this.search!=""){
//       $scope.showAllClasses=true;
//       $scope.showSearchClasses=false;
//       $scope.showNoResults=false;
//     }
//     else{
//       $scope.showAllClasses=true;
//       $scope.showSearchClasses=false;
//       $scope.showNoResults=true;
//     }
//   };
  
//   $scope.classs = [];
//   $scope.searchClass = [];


// $scope.loadClasses($scope.selected_schoolId);
// });

