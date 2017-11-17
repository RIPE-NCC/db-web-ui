/*global afterEach,beforeEach,describe,expect,inject,it*/

'use strict';

describe('dbWebApp: WhoisMetaService', function () {

    var $whoisMetaService;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (WhoisMetaService) {
        $whoisMetaService = WhoisMetaService;
    }));

    it('should return correct documentation based on object- and attribute-name', function () {
        expect($whoisMetaService.getAttributeDescription('mntner', 'admin-c')).toEqual('References an on-site administrative contact.');
        expect($whoisMetaService.getAttributeDescription('inet-rtr', 'mp-peer')).toEqual('Details of any (interior or exterior) multiprotocol router peerings.');
    });

    it('should return correct syntax based on object- and attribute-name', function () {
        expect($whoisMetaService.getAttributeSyntax('mntner', 'admin-c')).toEqual('From 2 to 4 characters, followed by up to 6 digits and a source specification. The first digit must not be \"0\". The source specification is \"-RIPE\" for the RIPE Database.');
        expect($whoisMetaService.getAttributeSyntax('inet-rtr', 'mp-peer')).toEqual('&lt;protocol&gt; &lt;ipv4-address&gt; &lt;options&gt;&lt;br/&gt;| &lt;protocol&gt; &lt;inet-rtr-name&gt; &lt;options&gt;&lt;br/&gt;| &lt;protocol&gt; &lt;rtr-set-name&gt; &lt;options&gt;&lt;br/&gt;| &lt;protocol&gt; &lt;peering-set-name&gt; &lt;options&gt;');
    });

    it('should return all objectTypes', function () {
        $whoisMetaService._objectTypesMap = {
            type1: {name: 'type1'},
            type2: {name: 'type2'}
        };

        expect($whoisMetaService.getObjectTypes()).toEqual(['type1', 'type2']);
    });

    it('should find meta attribute on objectType and name', function () {
        $whoisMetaService._objectTypesMap = {
            'type1': {
                name: 'type1', description: 'Z',
                'attributes': [
                    {name: 'mandatory1', mandatory: true, 'multiple': false, refs: []},
                    {name: 'optional1', mandatory: false, 'multiple': true, refs: ['b']}
                ]
            }
        };
        expect($whoisMetaService.findMetaAttributeOnObjectTypeAndName('type1', 'mandatory1')).toEqual(
            {name: 'mandatory1', mandatory: true, 'multiple': false, refs: []}
        );
        expect($whoisMetaService.findMetaAttributeOnObjectTypeAndName('type1', 'mandatory3')).toBeUndefined();
    });

    it('should enrich attributes with meta attributes for a given type', function () {

        $whoisMetaService._objectTypesMap =
            {
                'type1': {
                    name: 'type1', description: 'Z',
                    'attributes': [
                        {name: 'mandatory1', mandatory: true, 'multiple': false, refs: []},
                        {name: 'optional1', mandatory: false, 'multiple': true, refs: ['b'], isEnum: true}
                    ]
                }
            };

        var attrs = [
            {name: 'mandatory1', value: 'mandatory1value', link: {type: 'locator', href: 'http://abc.com/here'}},
            {name: 'optional1', value: 'optional1value', comment: 'My comment', 'referenced-type': 'dummy'}
        ];
        expect($whoisMetaService.enrichAttributesWithMetaInfo('type1', attrs)).toEqual([
            {
                name: 'mandatory1',
                value: 'mandatory1value',
                comment: undefined,
                link: {type: 'locator', href: 'http://abc.com/here'},
                'referenced-type': undefined,
                $$meta: {$$idx: undefined, $$mandatory: true, $$multiple: false, $$primaryKey: undefined, $$refs: [], $$isEnum: undefined}
            },
            {
                name: 'optional1',
                value: 'optional1value',
                comment: 'My comment',
                link: undefined,
                'referenced-type': 'dummy',
                $$meta: {$$idx: undefined, $$mandatory: false, $$multiple: true, $$primaryKey: undefined, $$refs: ['b'], $$isEnum: true}
            }
        ]);
    });

    it('should return exactly the mandatory meta attributes for a given type', function () {

        $whoisMetaService._objectTypesMap =
            {
                'type1': {
                    name: 'type1', description: 'Z',
                    attributes: [
                        {name: 'mandatory1', mandatory: true, multiple: false, refs: []},
                        {name: 'optional1', mandatory: false, multiple: true, refs: []}
                    ]
                }
            };


        expect($whoisMetaService._getMetaAttributesOnObjectType('type1', true)).toEqual([
            {name: 'mandatory1', mandatory: true, 'multiple': false, refs: []}
        ]);
    });

    it('should return all meta attributes for a given type', function () {

        $whoisMetaService._objectTypesMap =
            {
                'type1': {
                    name: 'type1', description: 'Z',
                    'attributes': [
                        {name: 'mandatory1', mandatory: true, multiple: false, refs: []},
                        {name: 'optional1', mandatory: false, multiple: true, refs: []}
                    ]
                }
            };
        expect($whoisMetaService._getMetaAttributesOnObjectType('type1', false)).toEqual([
            {name: 'mandatory1', mandatory: true, multiple: false, refs: []},
            {name: 'optional1', mandatory: false, multiple: true, refs: []}
        ]);
    });

    it('should return all attributes for a given type', function () {

        $whoisMetaService._objectTypesMap =
            {
                'type1': {
                    name: 'type1', description: 'Z',
                    'attributes': [
                        {name: 'mandatory1', mandatory: true, multiple: false, refs: []},
                        {name: 'optional1', mandatory: false, 'multiple': true, refs: []}
                    ]
                }
            };

        expect($whoisMetaService.getAllAttributesOnObjectType('type1')).toEqual([
            {
                name: 'mandatory1',
                value: undefined,
                comment: undefined,
                link: undefined,
                'referenced-type': undefined,
                $$meta: {$$idx: 0, $$mandatory: true, $$multiple: false, $$primaryKey: undefined, $$refs: [], $$isEnum: undefined}
            },
            {
                name: 'optional1',
                value: undefined,
                comment: undefined,
                link: undefined,
                'referenced-type': undefined,
                $$meta: {$$idx: 1, $$mandatory: false, $$multiple: true, $$primaryKey: undefined, $$refs: [], $$isEnum: undefined}
            }
        ]);
    });

    it('should return exactly the mandatory attributes for a given type', function () {

        $whoisMetaService._objectTypesMap = {
            'type1': {
                name: 'type1', description: 'Z',
                'attributes': [
                    {name: 'mandatory1', mandatory: true, 'multiple': false, refs: []},
                    {name: 'optional1', mandatory: false, 'multiple': true, refs: []}
                ]
            }
        };

        expect($whoisMetaService.getMandatoryAttributesOnObjectType('type1')).toEqual([
            {
                name: 'mandatory1',
                value: '',
                comment: undefined,
                link: undefined,
                'referenced-type': undefined,
                $$meta: {
                    $$idx: 0, $$mandatory: true, $$multiple: false, $$primaryKey: undefined, $$refs: [], $$isEnum: undefined
                }
            }
        ]);
    });

    it('should return empty array for non existing object type', function () {
        var mandatoryAttributesOnObjectType = $whoisMetaService.getMandatoryAttributesOnObjectType('blablabla');
        expect(mandatoryAttributesOnObjectType).toEqual([]);
    });

});
