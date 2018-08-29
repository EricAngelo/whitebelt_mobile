// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.profile', {
    url: '/profile',
    views: {
      'menuContent': {
        templateUrl: 'templates/profile.html'
      }
    }
  })

  .state('app.commingSoonCover', {
    url: '/commingSoonCover',
    views: {
      'menuContent': {
        templateUrl: 'templates/commingSoonCover.html'
      }
    }
  })

  .state('app.attendances', {
    url: '/attendances',
    views: {
      'menuContent': {
        templateUrl: 'templates/attendances.html',
        // controller: 'UserDetailsCtrl'
      }
    }
  })

  .state('app.billing', {
    url: '/billing',
    views: {
      'menuContent': {
        templateUrl: 'templates/billingPage.html'
      }
    }
  })

  .state('app.classes', {
    url: '/classes',
    views: {
      'menuContent': {
        templateUrl: 'templates/classesPage.html'
        // ,
        // controller: 'ClassesController'
      }
    }
  })

  .state('app.someonesClassDetails', {
    url: '/someonesClassDetails',
    views: {
      'menuContent': {
        templateUrl: 'templates/someonesClassDetails.html'
      }
    }
  })

  .state('app.searchUser', {
    url: '/searchUser',
    views: {
      'menuContent': {
        templateUrl: 'templates/searchUser.html'
      }
    }
  })

  .state('app.geolocation', {
    url: '/geolocation',
    views: {
      'menuContent': {
        templateUrl: 'templates/geolocation.html',
        controller: 'MapController'
      }
    }
  })

  .state('app.relationships', {
    url: '/relationships',
    views: {
      'menuContent': {
        templateUrl: 'templates/relationships.html'
      }
    }
  })

  .state('app.myClasses', {
    url: '/myClasses',
    views: {
      'menuContent': {
        templateUrl: 'templates/myClasses.html'
      }
    }
  })

  .state('app.relationshipDetails', {
    url: '/relationshipDetails',
    views: {
      'menuContent': {
        templateUrl: 'templates/relationshipDetails.html'
      }
    }
  })

  .state('app.myClassRecord', {
    url: '/myClassRecord',
    views: {
      'menuContent': {
        templateUrl: 'templates/myClassRecord.html'
      }
    }
  })

  .state('app.leadView', {
    url: '/leadView',
    views: {
      'menuContent': {
        templateUrl: 'templates/leadView.html'
      }
    }
  })

  .state('app.addLead', {
    url: '/addLead',
    views: {
      'menuContent': {
        templateUrl: 'templates/addLead.html'
      }
    }
  })

  .state('app.contactLeadDetails', {
    url: '/contactLeadDetails',
    views: {
      'menuContent': {
        templateUrl: 'templates/contactLeadDetails.html'
      }
    }
  })

  .state('app.bookedLeadDetails', {
    url: '/bookedLeadDetails',
    views: {
      'menuContent': {
        templateUrl: 'templates/bookedLeadDetails.html'
      }
    }
  })

  .state('app.visitorsTodayDetails', {
    url: '/visitorsTodayDetails',
    views: {
      'menuContent': {
        templateUrl: 'templates/visitorsTodayDetails.html'
      }
    }
  })

.state('app.closedLeadDetails', {
    url: '/closedLeadDetails',
    views: {
      'menuContent': {
        templateUrl: 'templates/closedLeadDetails.html'
      }
    }
  })


.state('app.digitalSignature', {
    url: '/digitalSignature',
    views: {
      'menuContent': {
        templateUrl: 'templates/digitalSignature.html'
      }
    }
  })

.state('app.login', {
    url: '/login',
    views: {
      'menuContent': {
        templateUrl: 'index.html'
      }
    }
  })

// .state('app.riskWaiver', {
//     url: '/riskWaiver',
//     views: {
//       'menuContent': {
//         templateUrl: 'templates/riskWaiver.html'
//       }
//     }
//   })

.state('app.taskDetails', {
    url: '/taskDetails',
    views: {
      'menuContent': {
        templateUrl: 'templates/taskDetails.html'
      }
    }
  })

.state('app.productCatalogue', {
    url: '/productCatalogue',
    views: {
      'menuContent': {
        templateUrl: 'templates/productCatalogue.html'
      }
    }
  })

.state('app.productDetails', {
    url: '/productDetails',
    views: {
      'menuContent': {
        templateUrl: 'templates/productDetails.html'
      }
    }
  })

.state('app.taskViews', {
    url: '/taskViews',
    views: {
      'menuContent': {
        templateUrl: 'templates/taskViews.html'
      }
    }
  })

.state('app.inbox', {
    url: '/inbox',
    views: {
      'menuContent': {
        templateUrl: 'templates/inbox.html'
      }
    }
  })

.state('app.messageDetails', {
    url: '/messageDetails',
    views: {
      'menuContent': {
        templateUrl: 'templates/messageDetails.html'
      }
    }
  })

.state('app.studentList', {
    url: '/studentList',
    views: {
      'menuContent': {
        templateUrl: 'templates/studentList.html'
      }
    }
  })

.state('app.onHoldDetails', {
    url: '/onHoldDetails',
    views: {
      'menuContent': {
        templateUrl: 'templates/onHoldDetails.html'
      }
    }
  })

.state('app.report', {
    url: '/report',
    views: {
      'menuContent': {
        templateUrl: 'templates/report.html'
      }
    }
  })
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('app/profile');
});
