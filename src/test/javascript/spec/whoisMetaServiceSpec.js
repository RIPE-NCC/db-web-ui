'use strict';

describe('dbWebuiApp: WhoisMetaService', function () {

    var $whoisMetaService;


    beforeEach(module('dbWebuiApp'));

    beforeEach(inject(function (WhoisMetaService) {
        $whoisMetaService = WhoisMetaService;
    }));

    afterEach(function() {

    });

    it('should return all objectTypes', function(){
        $whoisMetaService._objectTypesMap =
        {
            "type1" : { "name": "type1", "description":"Z"},
            "type2" : { "name": "type2", "description":"X"}
        };

        expect($whoisMetaService.getObjectTypes()).toEqual([
            "type1", "type2"])
    });

    it('should fail when no object supplied', function(){

    });

    it('should return all attributes for a given type', function(){

        $whoisMetaService._objectTypesMap =
        {
            "type1" : { "name": "type1", "description":"Z",
                "attributes":[
                    { "name":"mandatory1", "mandatory":true, "multiple":false, "description":"A"},
                    { "name":"optional1", "mandatory":false, "multiple":true, "description":"B"}
                ]
            }
        };

        expect($whoisMetaService.getAllAttributesOnObjectType("type1")).toEqual([
            { "name":"mandatory1", "mandatory":true, "multiple":false, "description":"A"},
            { "name":"optional1", "mandatory":false, "multiple":true, "description":"B"}
        ])
    });

    it('should return exactly the mandatory attributes for a given type', function(){

        $whoisMetaService._objectTypesMap =
        {
            "type1" : { "name": "type1", "description":"Z",
                "attributes":[
                    { "name":"mandatory1", "mandatory":true, "multiple":false, "description":"A"},
                    { "name":"optional1", "mandatory":false, "multiple":true, "description":"B"}
                ]
            }
        };

        expect($whoisMetaService.getMandatoryAttributesOnObjectType("type1")).toEqual([
            { "name":"mandatory1", "mandatory":true, "multiple":false, "description":"A"}
        ])
    });



});
