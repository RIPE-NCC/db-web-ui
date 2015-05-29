'use strict';

angular.module('dbWebApp', [
    'ui.router',
    'ngResource',
    'webUpdates'])
.config(function ($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
})
.factory('MessageBus', function(){
    var messages = {};

    messages.add = function(key, value){
        messages[key] = value;
    };

    messages.get = function(key){
        var value = messages[key];
        delete messages[key];
        return value;
    };

    return messages;
});

