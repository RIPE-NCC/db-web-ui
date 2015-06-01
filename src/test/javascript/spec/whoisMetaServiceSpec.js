'use strict';

describe('dbWebApp: WhoisMetaService', function () {

    var $whoisMetaService;

    beforeEach(module('dbWebApp'));
    beforeEach(module('webUpdates'));

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

    it('should enrich attributes with meta attributes for a given type', function(){

        $whoisMetaService._objectTypesMap =
        {
            "type1" : { "name": "type1", "description":"Z",
                "attributes":[
                    { "name":"mandatory1", "mandatory":true, "multiple":false, "description":"A"},
                    { "name":"optional1", "mandatory":false, "multiple":true, "description":"B"}
                ]
            }
        };

        var attrs = [
            {name: 'mandatory1', value:'mandatory1value'},
            {name: 'optional1', value:'optional1value'}
        ];
        expect($whoisMetaService.enrichAttributesWithMetaInfo("type1", attrs)).toEqual([
            {name: 'mandatory1', value:'mandatory1value', $$meta: {$$mandatory:true, $$description:'A'}},
            {name: 'optional1', value:'optional1value', $$meta: {$$mandatory:false, $$description:'B'}}
        ])
    });


    it('should return exactly the mandatory meta attributes for a given type', function(){

        $whoisMetaService._objectTypesMap =
        {
            "type1" : { "name": "type1", "description":"Z",
                "attributes":[
                    { "name":"mandatory1", "mandatory":true, "multiple":false, "description":"A"},
                    { "name":"optional1", "mandatory":false, "multiple":true, "description":"B"}
                ]
            }
        };

        expect($whoisMetaService._getMetaAttributesOnObjectType("type1",true)).toEqual([
            { "name":"mandatory1", "mandatory":true, "multiple":false, "description":"A"}
        ])
    });

    it('should return all meta attributes for a given type', function(){

        $whoisMetaService._objectTypesMap =
        {
            "type1" : { "name": "type1", "description":"Z",
                "attributes":[
                    { "name":"mandatory1", "mandatory":true, "multiple":false, "description":"A"},
                    { "name":"optional1", "mandatory":false, "multiple":true, "description":"B"}
                ]
            }
        };

        expect($whoisMetaService._getMetaAttributesOnObjectType("type1",false)).toEqual([
            { "name":"mandatory1", "mandatory":true, "multiple":false, "description":"A"},
            { "name":"optional1", "mandatory":false, "multiple":true, "description":"B"}
        ])
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
            { "name":"mandatory1", $$meta: {"$$mandatory":true, "$$description":"A"}},
            { "name":"optional1",  $$meta: {"$$mandatory":false,  "$$description":"B"}}
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
            { "name":"mandatory1",  $$meta: {"$$mandatory":true, "$$description":"A"}}
        ])
    });



});
