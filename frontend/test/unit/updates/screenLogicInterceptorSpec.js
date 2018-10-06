'use strict';

describe('updates: ScreenLogicInterceptorService', function () {

    var interceptor;
    var whoisResources;
    var whoisMetaService;

    beforeEach(module('updates'));

    beforeEach(inject(function (WhoisResources, WhoisMetaService, ScreenLogicInterceptorService) {
        whoisResources = WhoisResources;
        whoisMetaService = WhoisMetaService;
        interceptor = ScreenLogicInterceptorService;
    }));

    afterEach(function() {
    });


    function printAttrs( msg, attrs ) {
        console.log(
            msg + ':' + JSON.stringify(
                _.map(attrs, function(attr) {
                    return {name: attr.name, value: attr.value};
                }
                ))
        );
    }

    it('should disable org attribute from aut-num when status is ASSIGNED PI', function() {

        var autNumSubject = _wrap('aut-num', autNumAttributes);
        autNumSubject.setSingleAttributeOnName('status', 'ASSIGNED PI');

        var attributes = interceptor.beforeEdit('Modify', 'RIPE', 'aut-num', autNumSubject);

        var orgAttr = attributes.getSingleAttributeOnName('org');
        expect(orgAttr.$$meta.$$disable).toBe(true);
    });

    it('should set default source before-edit any object on Create operation', function() {
        var before = whoisResources.wrapAttributes(whoisMetaService.getMandatoryAttributesOnObjectType('organisation', true));

        var errors = [];
        var warnings = [];
        var infos = [];
        var after = interceptor.beforeEdit('Create', 'TEST', 'organisation', before, errors, warnings, infos);

        var organisation = after.getAllAttributesOnName('source');
        expect(organisation.length).toEqual(1);
        expect(organisation[0].name).toEqual('source');
        expect(organisation[0].value).toEqual('TEST');
        expect(organisation[0].$$meta.$$disable).toBe(true);

    });

    it('should not change addable attributes by default', function() {

        var autNumSubject = _wrap('aut-num', autNumAttributes);
        autNumSubject.setSingleAttributeOnName('status', 'ASSIGNED PI');

        var addableAttributes = {attr:'some data'};
        var addableAttributesAfter = interceptor.beforeAddAttribute('Modify', 'RIPE', 'aut-num', autNumSubject, addableAttributes);

        expect(addableAttributesAfter).toBe(addableAttributes);
    });

    it('should disable primary key attribute from object on modify', function() {

        var autNumSubject = _wrap('aut-num', autNumAttributes);

        var attributes = interceptor.beforeEdit('Modify', 'RIPE', 'aut-num', autNumSubject);

        var primaryKey = attributes.getSingleAttributeOnName('aut-num');
        expect(primaryKey.$$meta.$$disable).toBe(true);
    });


    var _wrap = function(type, attrs) {
        return whoisResources.wrapAndEnrichAttributes(type, attrs);
    };

    var autNumAttributes =  [{
        name :'aut-num',
        value :'AS123'
    }, {
        name :'as-name',
        value :'EXAMPLE'
    }, {
        name :'status',
        value :'ASSIGNED PI'
    }, {
        name :'org',
        value :'ORG-Fr4-RIPE'
    }, {
        name :'mnt-by',
        value :'RIPE-NCC-END-MNT'
    }, {
        name :'source',
        value :'RIPE'
    } ];

});
