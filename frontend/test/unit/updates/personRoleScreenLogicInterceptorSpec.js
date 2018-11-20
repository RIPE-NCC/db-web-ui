/*global beforeEach, describe, expect, inject, it, module*/
'use strict';

describe('updates: Person/Role ScreenLogicInterceptorService', function () {

    var interceptor;
    var whoisResources;
    var whoisMetaService;

    beforeEach(module('updates'));

    beforeEach(inject(function (WhoisResources, WhoisMetaService, ScreenLogicInterceptorService) {
        whoisResources = WhoisResources;
        whoisMetaService = WhoisMetaService;
        interceptor = ScreenLogicInterceptorService;
    }));

    it('should set default nic-ndl before-edit person on Create operation', function() {
        var before = whoisResources.wrapAttributes(whoisMetaService.getMandatoryAttributesOnObjectType('person', true));

        var errors = [];
        var warnings = [];
        var infos = [];
        var after = interceptor.beforeEdit('Create', 'RIPE', 'person', before, errors, warnings, infos);

        var nicHdle = after.getAllAttributesOnName('nic-hdl');
        expect(nicHdle.length).toEqual(1);
        expect(nicHdle[0].name).toEqual('nic-hdl');
        expect(nicHdle[0].value).toEqual('AUTO-1');
    });

    it('should NOT set default nic-ndl before-edit person on Modify operation', function() {
        var personSubject = _wrap('person', personAttributes);
        personSubject.setSingleAttributeOnName('nic-hdl', 'SOME_NIC');

        var errors = [];
        var warnings = [];
        var infos = [];
        var after = interceptor.beforeEdit('Modify', 'RIPE', 'person', personSubject, errors, warnings, infos);

        var nicHdle = after.getAllAttributesOnName('nic-hdl');
        expect(nicHdle.length).toEqual(1);
        expect(nicHdle[0].name).toEqual('nic-hdl');
        expect(nicHdle[0].value).toEqual('SOME_NIC');

    });

    it('should set default nic-ndl before-edit role on Create operation', function() {
        var before = whoisResources.wrapAttributes(whoisMetaService.getMandatoryAttributesOnObjectType('role', true));

        var errors = [];
        var warnings = [];
        var infos = [];
        var after = interceptor.beforeEdit('Create', 'RIPE', 'role', before, errors, warnings, infos);

        var nicHdle = after.getAllAttributesOnName('nic-hdl');
        expect(nicHdle.length).toEqual(1);
        expect(nicHdle[0].name).toEqual('nic-hdl');
        expect(nicHdle[0].value).toEqual('AUTO-1');

    });

    it('should NOT set default nic-ndl before-edit role on Modify operation', function() {
        var roleSubject = _wrap('person', roleAttributes);
        roleSubject.setSingleAttributeOnName('nic-hdl', 'SOME_NIC');

        var errors = [];
        var warnings = [];
        var infos = [];
        var after = interceptor.beforeEdit('Modify', 'RIPE', 'person', roleSubject, errors, warnings, infos);

        var nicHdle = after.getAllAttributesOnName('nic-hdl');
        expect(nicHdle.length).toEqual(1);
        expect(nicHdle[0].name).toEqual('nic-hdl');
        expect(nicHdle[0].value).toEqual('SOME_NIC');

    });

    var _wrap = function(type, attrs) {
        return whoisResources.wrapAndEnrichAttributes(type, attrs);
    };

    var personAttributes = [{
        name :'person',
        value :'Name Removed'
    }, {
        name :'address',
        value :'The Netherlands'
    }, {
        name :'phone',
        value :'+31 20 ... ....'
    }, {
        name :'e-mail',
        value :'****@ripe.net'
    }, {
        name :'mnt-by',
        value :'aardvark-mnt'
    }, {
        name :'nic-hdl',
        value :'DW-RIPE'
    }, {
        name :'source',
        value :'RIPE'
    } ];

    var roleAttributes = [{
        name :'role',
        value :'Name Removed'
    }, {
        name :'address',
        value :'The Netherlands'
    }, {
        name :'phone',
        value :'+31 20 ... ....'
    }, {
        name :'e-mail',
        value :'****@ripe.net'
    }, {
        name :'mnt-by',
        value :'aardvark-mnt'
    }, {
        name :'nic-hdl',
        value :'DW-RIPE'
    }, {
        name :'source',
        value :'RIPE'
    } ];

});
