'use strict';

angular.module('dbWebApp').service('MessageStore', [ function( ) {
    var messages = {};

    messages.add = function(key, value){
        messages[key] = value;
        console.log("MessageStore.add:" + key + ":" + value)
    };

    messages.get = function(key){
        var value = messages[key];
        console.log("MessageStore.get:" + key + ":" + value)

        delete messages[key];
        return value;
    };

    return messages;
}]);
