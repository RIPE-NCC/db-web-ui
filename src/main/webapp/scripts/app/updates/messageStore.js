'use strict';

angular.module('updates').service('MessageStore', [ function( ) {
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
}]);
