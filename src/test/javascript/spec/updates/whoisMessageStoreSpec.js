'use strict';

describe('updates: MessageStore', function () {

    var $messageStore;

    beforeEach(module('updates'));

    beforeEach(inject(function (MessageStore) {
        $messageStore = MessageStore;
    }));

    afterEach(function() {

    });

    it('should get message', function(){
        $messageStore.add("1", "value 1")
        expect($messageStore.get( "1")).toEqual("value 1");
    });

    it('should not get message with uknown key', function(){
        $messageStore.add("1", "value 1")
        expect($messageStore.get( "2")).toEqual(undefined);
    });

    it('should not get message on second get', function(){
        $messageStore.add("1", "value 1")
        $messageStore.get( "1");

        expect($messageStore.get( "1")).toEqual(undefined);
    });

});
