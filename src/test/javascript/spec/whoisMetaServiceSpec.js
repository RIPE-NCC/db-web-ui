'use strict';

describe('dbWebuiApp: WhoisMetaService', function () {

    var $whoisMetaService;

    beforeEach(module('dbWebuiApp'));

    beforeEach(inject(function (WhoisMetaService) {
        $whoisMetaService = WhoisMetaService;

    }));

    afterEach(function() {

    });

    it('should make true equals true', function() {

        console.log($whoisMetaService.getObjectTypes())
    });

    it('should return all objectTypes', function(){

    });

    it('should fail when no object supplied', function(){

    });

    it('should return all attributes for a given type', function(){

    });

    it('should return exactly the mandatory attributes for a given type', function(){

    });



});
