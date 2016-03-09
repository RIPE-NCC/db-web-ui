'use strict';

describe('updates: ScreenLogicInterceptor', function () {

    var interceptor;
    var whoisResources;

    beforeEach(module('updates'));

    beforeEach(inject(function (WhoisResources, ScreenLogicInterceptor) {
        whoisResources = WhoisResources;
        interceptor = ScreenLogicInterceptor;
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

    it('should disable org attribute from inet6num when status is ASSIGNED PI', function() {

        var inet6NumSubject = _wrap('inet6num', inet6NumAttributes);
        inet6NumSubject.setSingleAttributeOnName('status', 'ASSIGNED PI');

        var attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inet6num', inet6NumSubject);

        var orgAttr = attributes.getSingleAttributeOnName('org');
        expect(orgAttr.$$meta.$$disable).toBe(true);
    });

    it('should disable org attribute from inetnum when status is ASSIGNED PI', function() {

        var inetNumSubject = _wrap('inetnum', inetNumAttributes);
        inetNumSubject.setSingleAttributeOnName('status', 'ASSIGNED PI');

        var attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inetnum', inetNumSubject);

        var orgAttr = attributes.getSingleAttributeOnName('org');
        expect(orgAttr.$$meta.$$disable).toBe(true);
    });

    it('should disable org attribute from aut-num when status is ASSIGNED PI', function() {

        var autNumSubject = _wrap('aut-num', autNumAttributes);
        autNumSubject.setSingleAttributeOnName('status', 'ASSIGNED PI');

        var attributes = interceptor.beforeEdit('Modify', 'RIPE', 'aut-num', autNumSubject);

        var orgAttr = attributes.getSingleAttributeOnName('org');
        expect(orgAttr.$$meta.$$disable).toBe(true);
    });

    it('should not remove sponsoring org from inet6num addable attributes when status is LEGACY', function() {

        var inet6NumSubject = _wrap('inet6num', inet6NumAttributes);
        inet6NumSubject.setSingleAttributeOnName('status', 'LEGACY');

        var addableAttributes = _wrap('inet6num', inet6NumSubject.getAddableAttributes('inet6num', inet6NumSubject));

        var filteredAddableAttributes = interceptor.beforeAddAttribute('Modify', 'RIPE', 'inet6num', inet6NumSubject, addableAttributes);

        var sponsoringOrgAttr = filteredAddableAttributes.getSingleAttributeOnName('sponsoring-org');
        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it('should not remove sponsoring org from inet6num addable attributes when status is ASSIGNED-PI', function() {

        var inet6NumSubject = _wrap('inet6num', inet6NumAttributes);
        inet6NumSubject.setSingleAttributeOnName('status', 'ASSIGNED PI');

        var addableAttributes = _wrap('inet6num', inet6NumSubject.getAddableAttributes('inet6num', inet6NumSubject));

        var filteredAddableAttributes = interceptor.beforeAddAttribute('Modify', 'RIPE', 'inet6num', inet6NumSubject, addableAttributes);

        var sponsoringOrgAttr = filteredAddableAttributes.getSingleAttributeOnName('sponsoring-org');
        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it('should not remove sponsoring org from inet6num addable attributes when status is ASSIGNED-ANYCAST', function() {

        var inet6NumSubject = _wrap('inet6num', inet6NumAttributes);
        inet6NumSubject.setSingleAttributeOnName('status', 'ASSIGNED ANYCAST');

        var addableAttributes = _wrap('inet6num', inet6NumSubject.getAddableAttributes('inet6num', inet6NumSubject));

        var filteredAddableAttributes = interceptor.beforeAddAttribute('Modify', 'RIPE', 'inet6num', inet6NumSubject, addableAttributes);

        var sponsoringOrgAttr = filteredAddableAttributes.getSingleAttributeOnName('sponsoring-org');
        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it('should remove sponsoring org from inet6num addable attributes when status is not ASSIGNED-PI or ASSIGNED-ANYCAST', function() {

        var inet6NumSubject = _wrap('inet6num', inet6NumAttributes);
        inet6NumSubject.setSingleAttributeOnName('status', 'ASSIGNED');

        var addableAttributes = _wrap('inet6num', inet6NumSubject.getAddableAttributes('inet6num', inet6NumSubject));

        var filteredAddableAttributes = interceptor.beforeAddAttribute('Modify', 'RIPE', 'inet6num', inet6NumSubject, addableAttributes);

        var sponsoringOrgAttr = filteredAddableAttributes.getSingleAttributeOnName('sponsoring-org');
        expect(sponsoringOrgAttr).toBeUndefined();
    });

    it('should not remove sponsoring org from inetnum addable attributes when status is LEGACY', function() {

        var inetNumSubject = _wrap('inetnum', inetNumAttributes);
        inetNumSubject.setSingleAttributeOnName('status', 'LEGACY');

        var addableAttributes = _wrap('inetnum', inetNumSubject.getAddableAttributes('inetnum', inetNumSubject));

        var filteredAddableAttributes = interceptor.beforeAddAttribute('Modify', 'RIPE', 'inetnum', inetNumSubject, addableAttributes);

        var sponsoringOrgAttr = filteredAddableAttributes.getSingleAttributeOnName('sponsoring-org');
        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it('should not remove sponsoring org from inetnum addable attributes when status is ASSIGNED-PI', function() {

        var inetNumSubject = _wrap('inetnum', inetNumAttributes);
        inetNumSubject.setSingleAttributeOnName('status', 'ASSIGNED PI');

        var addableAttributes = _wrap('inetnum', inetNumSubject.getAddableAttributes('inetnum', inetNumSubject));

        var filteredAddableAttributes = interceptor.beforeAddAttribute('Modify', 'RIPE', 'inetnum', inetNumSubject, addableAttributes);

        var sponsoringOrgAttr = filteredAddableAttributes.getSingleAttributeOnName('sponsoring-org');
        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it('should not remove sponsoring org from inetnum addable attributes when status is ASSIGNED-ANYCAST', function() {

        var inetNumSubject = _wrap('inetnum', inetNumAttributes);
        inetNumSubject.setSingleAttributeOnName('status', 'ASSIGNED ANYCAST');

        var addableAttributes = _wrap('inetnum', inetNumSubject.getAddableAttributes('inetnum', inetNumSubject));

        var filteredAddableAttributes = interceptor.beforeAddAttribute('Modify', 'RIPE', 'inetnum', inetNumSubject, addableAttributes);

        var sponsoringOrgAttr = filteredAddableAttributes.getSingleAttributeOnName('sponsoring-org');
        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it('should remove sponsoring org from inetnum addable attributes when status is not ASSIGNED-PI or ASSIGNED-ANYCAST', function() {

        var inetNumSubject = _wrap('inetnum', inetNumAttributes);
        inetNumSubject.setSingleAttributeOnName('status', 'ASSIGNED');

        var addableAttributes = _wrap('inetnum', inetNumSubject.getAddableAttributes('inetnum', inetNumSubject));

        var filteredAddableAttributes = interceptor.beforeAddAttribute('Modify', 'RIPE', 'inetnum', inetNumSubject, addableAttributes);

        var sponsoringOrgAttr = filteredAddableAttributes.getSingleAttributeOnName('sponsoring-org');
        expect(sponsoringOrgAttr).toBeUndefined();
    });

    it('should set default nic-ndl before-edit person on Create operation', function() {
        var before = whoisResources.wrapAttributes(whoisResources.getMandatoryAttributesOnObjectType('person', true));

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
        var before = whoisResources.wrapAttributes(whoisResources.getMandatoryAttributesOnObjectType('role', true));

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

    it('should set default organisation before-edit organisation on Create operation', function() {
        var before = whoisResources.wrapAttributes(whoisResources.getMandatoryAttributesOnObjectType('organisation', true));

        var errors = [];
        var warnings = [];
        var infos = [];
        var after = interceptor.beforeEdit('Create', 'RIPE', 'organisation', before, errors, warnings, infos);

        var organisation = after.getAllAttributesOnName('organisation');
        expect(organisation.length).toEqual(1);
        expect(organisation[0].name).toEqual('organisation');
        expect(organisation[0].value).toEqual('AUTO-1');

    });

    it('should NOT set default organisation before-edit organisation on Modify operation', function() {
        var organisationSubject = _wrap('organisation', organisationAttributes);
        organisationSubject.setSingleAttributeOnName('organisation', 'SOME_ORG');

        var errors = [];
        var warnings = [];
        var infos = [];
        var after = interceptor.beforeEdit('Modify', 'RIPE', 'organisation', organisationSubject, errors, warnings, infos);

        var organisation = after.getAllAttributesOnName('organisation');
        expect(organisation.length).toEqual(1);
        expect(organisation[0].name).toEqual('organisation');
        expect(organisation[0].value).toEqual('SOME_ORG');

    });

    it('should set default org-type before-edit organisation on Create operation', function() {
        var before = whoisResources.wrapAttributes(whoisResources.getMandatoryAttributesOnObjectType('organisation', true));

        var errors = [];
        var warnings = [];
        var infos = [];
        var after = interceptor.beforeEdit('Create', 'RIPE', 'organisation', before, errors, warnings, infos);

        var organisation = after.getAllAttributesOnName('org-type');
        expect(organisation.length).toEqual(1);
        expect(organisation[0].name).toEqual('org-type');
        expect(organisation[0].value).toEqual('OTHER');
        expect(organisation[0].$$meta.$$disable).toBe(true);

    });

    it('should NOT set default org-type before-edit organisation on Modify operation', function() {
        var organisationSubject = _wrap('organisation', organisationAttributes);
        organisationSubject.setSingleAttributeOnName('org-type', 'SOME_ORG_TYPE');

        var errors = [];
        var warnings = [];
        var infos = [];
        var after = interceptor.beforeEdit('Modify', 'RIPE', 'organisation', organisationSubject, errors, warnings, infos);

        var organisation = after.getAllAttributesOnName('org-type');
        expect(organisation.length).toEqual(1);
        expect(organisation[0].name).toEqual('org-type');
        expect(organisation[0].value).toEqual('SOME_ORG_TYPE');
        expect(organisation[0].$$meta.$$disable).toBe(true);

    });

    it('should set default source before-edit any object on Create operation', function() {
        var before = whoisResources.wrapAttributes(whoisResources.getMandatoryAttributesOnObjectType('organisation', true));

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

    var _wrap = function(type, attrs) {
        return whoisResources.wrapAndEnrichAttributes(type, attrs);
    };

    var inet6NumAttributes =  [{
        name :'inet6num',
        value :'2001:7f8:7::/48'
    }, {
        name :'netname',
        value :'FICIX-V6-20020201'
    }, {
        name :'descr',
        value :'Finnish Communication and Internet Exchange - FICIX ryy'
    }, {
        name :'country',
        value :'FI'
    }, {
        name :'org',
        value :'ORG-Fr4-RIPE'
    }, {
        name :'admin-c',
        value :'JM289-RIPE'
    }, {
        name :'tech-c',
        value :'JM289-RIPE'
    }, {
        name :'mnt-by',
        value :'RIPE-NCC-END-MNT'
    }, {
        name :'mnt-by',
        value :'jome-mnt'
    }, {
        name :'mnt-domains',
        value :'jome-mnt'
    }, {
        name :'notify',
        value :'***@ficix.fi'
    }, {
        name :'status',
        value :'ASSIGNED PI'
    }, {
        name :'created',
        value :'2002-08-06T05:54:20Z'
    }, {
        name :'last-modified',
        value :'2016-03-06T10:58:07Z'
    }, {
        name :'source',
        value :'RIPE'
    } ];

    var inetNumAttributes =  [{
        name :'inetnum',
        value :'192.0.0.0 - 192.0.0.255'
    }, {
        name :'netname',
        value :'FICIX-V6-20020201'
    }, {
        name :'descr',
        value :'Finnish Communication and Internet Exchange - FICIX ryy'
    }, {
        name :'country',
        value :'FI'
    }, {
        name :'org',
        value :'ORG-Fr4-RIPE'
    }, {
        name :'admin-c',
        value :'JM289-RIPE'
    }, {
        name :'tech-c',
        value :'JM289-RIPE'
    }, {
        name :'mnt-by',
        value :'RIPE-NCC-END-MNT'
    }, {
        name :'mnt-by',
        value :'jome-mnt'
    }, {
        name :'mnt-domains',
        value :'jome-mnt'
    }, {
        name :'notify',
        value :'***@ficix.fi'
    }, {
        name :'status',
        value :'ASSIGNED PI'
    }, {
        name :'created',
        value :'2002-08-06T05:54:20Z'
    }, {
        name :'last-modified',
        value :'2016-03-06T10:58:07Z'
    }, {
        name :'source',
        value :'RIPE'
    } ];

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

    var organisationAttributes =  [ {
         name : 'organisation',
         value :'ORG-WA56-RIPE'
    }, {
         name :'org-name',
         value :'Rop Gonggrijp'
    }, {
         name :'org-type',
         value :'OTHER'
    }, {
         name :'address',
         value :'The Netherlands'
    }, {
         name :'abuse-c',
         value :'AC29651-RIPE'
    }, {
         name :'admin-c',
         value :'WH869-RIPE'
    }, {
         name :'tech-c',
         value :'WH869-RIPE'
    }, {
         name :'mnt-ref',
         value :'WHAT-A-MESH-MNT'
    }, {
         name :'mnt-by',
         value :'WHAT-A-MESH-MNT'
    }, {
         name :'source',
         value :'RIPE'
    } ];

});
