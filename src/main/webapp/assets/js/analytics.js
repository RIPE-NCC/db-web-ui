angular.module('dbWebuiApp', ['angularytics'])
  .config(function(AngularyticsProvider) {
    AngularyticsProvider.setEventHandlers(['Console', 'GoogleUniversal']);
  }).run(function(Angularytics) {
    Angularytics.init();
  });