'use strict';

describe('dbWebApp: WhoisMetaService', function () {

    var $whoisMetaService;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (WhoisMetaService) {
        $whoisMetaService = WhoisMetaService;
    }));

    afterEach(function() {

    });

    it('should return correct documentation based on object- and attribute-name',function() {
        expect($whoisMetaService.getAttributeDocumentation("mntner","admin-c")).toEqual("References an on-site administrative contact.")
        expect($whoisMetaService.getAttributeDocumentation("inet-rtr","mp-peer")).toEqual("Details of any (interior or exterior) multiprotocol router peerings.")
    });

    it('should return correct syntax based on object- and attribute-name',function() {
        expect($whoisMetaService.getAttributeSyntax("mntner","admin-c")).toEqual("TODO admin-c syntax")
        expect($whoisMetaService.getAttributeSyntax("inet-rtr","mp-peer")).toEqual("TODO mp-peer attr of inet-rtr")
    });

    it('should return all objectTypes', function(){
        $whoisMetaService._objectTypesMap =
        {
            type1 : { name: 'type1'},
            type2 : { name: 'type2'}
        };

        expect($whoisMetaService.getObjectTypes()).toEqual([
            'type1', 'type2'])
    });

    it('should enrich attributes with meta attributes for a given type', function(){

        $whoisMetaService._objectTypesMap =
        {
            'type1' : { name: 'type1', description:'Z',
                'attributes':[
                    { name:'mandatory1', mandatory:true,  'multiple':false, refs:[]},
                    { name:'optional1',  mandatory:false, 'multiple':true,  refs:['b']}
                ]
            }
        };
        $whoisMetaService._attrDocumentation = {
            mandatory1: { description: 'A', syntax:'S A' },
            optional1:  { description: 'B', syntax:'S B' }
        };

        var attrs = [
            {name: 'mandatory1', value:'mandatory1value'},
            {name: 'optional1', value:'optional1value'}
        ];
        expect($whoisMetaService.enrichAttributesWithMetaInfo('type1', attrs)).toEqual([
            { name: 'mandatory1', value:'mandatory1value', $$meta: {$$idx: undefined, $$mandatory:true,  $$multiple:false, $$primaryKey: undefined, $$description:'A', $$syntax:'S A', $$refs:[]}},
            { name: 'optional1',  value:'optional1value',  $$meta: {$$idx: undefined, $$mandatory:false, $$multiple:true,  $$primaryKey: undefined, $$description:'B', $$syntax:'S B', $$refs:['b']}}
        ])
    });


    it('should return exactly the mandatory meta attributes for a given type', function(){

        $whoisMetaService._objectTypesMap =
        {
            'type1' : {
                name: 'type1', description:'Z',
                attributes:[
                    { name:'mandatory1', mandatory:true, multiple:false, description:'A', syntax: 'S A', refs:[]},
                    { name:'optional1',  mandatory:false, multiple:true, description:'B', syntax: 'S B', refs:[]}
                ]
            }
        };
        $whoisMetaService._attrDocumentation = {
            mandatory1: { description: 'A', syntax:'S A' },
            optional1:  { description: 'B', syntax:'S B' }
        };

        expect($whoisMetaService._getMetaAttributesOnObjectType('type1',true)).toEqual([
            { name:'mandatory1', mandatory:true, 'multiple':false, description:'A', syntax: 'S A', refs:[]}
        ])
    });

    it('should return all meta attributes for a given type', function(){

        $whoisMetaService._objectTypesMap =
        {
            'type1' : { name: 'type1', description:'Z',
                'attributes':[
                    { name:'mandatory1', mandatory:true, multiple:false, description:'A', refs:[]},
                    { name:'optional1',  mandatory:false, multiple:true, description:'B', refs:[]}
                ]
            }
        };
        $whoisMetaService._attrDocumentation = {
            mandatory1: { description: 'A', syntax:'S A' },
            optional1:{ description: 'B',   syntax:'S B' }
        };

        expect($whoisMetaService._getMetaAttributesOnObjectType('type1',false)).toEqual([
            { name:'mandatory1', mandatory:true, multiple:false, description:'A', refs:[]},
            { name:'optional1',  mandatory:false, multiple:true, description:'B', refs:[]}
        ])
    });

    it('should return all attributes for a given type', function(){

        $whoisMetaService._objectTypesMap =
        {
            'type1' : { name: 'type1', description:'Z',
                'attributes':[
                    { name:'mandatory1', mandatory:true, multiple:false, description:'A', refs:[]},
                    { name:'optional1',  mandatory:false, 'multiple':true, description:'B', refs:[]}
                ]
            }
        };
        $whoisMetaService._attrDocumentation = {
            mandatory1: { description: 'A', syntax:'S A' },
            optional1:{ description: 'B', syntax:'S B' }
        };

        expect($whoisMetaService.getAllAttributesOnObjectType('type1')).toEqual([
            { name:'mandatory1', $$meta: {$$idx:0, $$mandatory:true, $$multiple:false,  $$primaryKey: undefined, $$description:'A', $$syntax:'S A', $$refs:[]}},
            { name:'optional1',  $$meta: {$$idx:1, $$mandatory:false, $$multiple:true,  $$primaryKey: undefined, $$description:'B', $$syntax:'S B', $$refs:[]}}
        ])
    });

    it('should return exactly the mandatory attributes for a given type', function(){

        $whoisMetaService._objectTypesMap =
        {
            'type1' : { name: 'type1', description:'Z',
                'attributes':[
                    { name:'mandatory1', mandatory:true, 'multiple':false, description:'A', syntax: 'A S', refs:[]},
                    { name:'optional1', mandatory:false, 'multiple':true,  description:'B', syntax: 'B S', refs:[]}
                ]
            }
        };
        $whoisMetaService._attrDocumentation = {
            mandatory1: { description: 'A', syntax:'S A' },
            optional1:{ description: 'B', syntax:'S B' }
        };

        expect($whoisMetaService.getMandatoryAttributesOnObjectType('type1')).toEqual([
            {
                name:'mandatory1',
                $$meta: {
                    $$idx:0,$$mandatory:true, $$multiple:false, $$primaryKey: undefined, $$description: 'A', $$syntax:'S A', $$refs:[]
                }
            }
        ])
    });


    it('should return empty array for non existing object type', function(){
      var mandatoryAttributesOnObjectType = $whoisMetaService.getMandatoryAttributesOnObjectType('blablabla');
        expect(mandatoryAttributesOnObjectType).toEqual([]);
    });

});
