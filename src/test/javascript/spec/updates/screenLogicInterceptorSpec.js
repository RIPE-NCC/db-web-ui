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


    //"ASSIGNED-PI" or "ASSIGNED-ANYCAST".
    it('should remove sponsoring org from intnum when status is ASSIGNED-PI', function() {

        var inet6NumSubject = whoisResources.wrapAndEnrichAttributes('inet6num', inet6NumAttributes);
        var addableAttributes = whoisResources.wrapAndEnrichAttributes('inet6num', inet6NumSubject.getAddableAttributes('inet6num', inet6NumSubject));

        var filteredAddableAttributes = interceptor.beforeAddAttribute('Modify', 'RIPE', 'inet6num', inet6NumSubject, addableAttributes);

        var sponsoringOrgAttr = filteredAddableAttributes.getSingleAttributeOnName('sponsoring-org');

        expect(sponsoringOrgAttr).toBeUndefined();
    });

    it('should not remove sponsoring org from int6num when status is not ASSIGNED-PI', function() {

        var inet6NumSubject = whoisResources.wrapAndEnrichAttributes('inet6num', inet6NumAttributes);

        inet6NumSubject.setSingleAttributeOnName('status', 'ASSIGNED');

        var addableAttributes = whoisResources.wrapAndEnrichAttributes('inet6num', inet6NumSubject.getAddableAttributes('inet6num', inet6NumSubject));

        var filteredAddableAttributes = interceptor.beforeAddAttribute('Modify', 'RIPE', 'inet6num', inet6NumSubject, addableAttributes);

        var sponsoringOrgAttr = filteredAddableAttributes.getSingleAttributeOnName('sponsoring-org');

        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it('should call before-edit interceptor for person', function() {
        var before = whoisResources.wrapAttributes(whoisResources.getMandatoryAttributesOnObjectType('person', true));
        var errors = [];
        var warnings = [];
        var infos = [];


        var after = interceptor.beforeEdit('Create', 'RIPE', 'person', before, errors, warnings, infos );

        expect(after.length).toEqual(6);

        expect(after.getSingleAttributeOnName('source').value).toBe('RIPE');

        var nicHdle = after.getAllAttributesOnName('nic-hdl');
        expect(nicHdle.length).toEqual(1);
        expect(nicHdle[0].name).toEqual('nic-hdl');
        expect(nicHdle[0].value).toEqual('AUTO-1');

        expect(errors.length).toBe(0);
        expect(warnings.length).toBe(0);
        expect(infos.length).toBe(0);
    });


    var inet6NumAttributes =  [{
        name : 'inet6num',
        value : '2001:7f8:7::/48'
    }, {
        name : 'netname',
        value : 'FICIX-V6-20020201'
    }, {
        name : 'descr',
        value : 'Finnish Communication and Internet Exchange - FICIX ryy'
    }, {
        name : 'country',
        value : 'FI'
    }, {
        name : 'org',
        value : 'ORG-Fr4-RIPE'
    }, {
        name : 'admin-c',
        value : 'JM289-RIPE'
    }, {
        name : 'tech-c',
        value : 'JM289-RIPE'
    }, {
        name : 'mnt-by',
        value : 'RIPE-NCC-END-MNT'
    }, {
        name : 'mnt-by',
        value : 'jome-mnt'
    }, {
        name : 'mnt-domains',
        value : 'jome-mnt'
    }, {
        name : 'notify',
        value : '***@ficix.fi'
    }, {
        name : 'status',
        value : 'ASSIGNED PI'
    }, {
        name : 'created',
        value : '2002-08-06T05:54:20Z'
    }, {
        name : 'last-modified',
        value : '2016-03-06T10:58:07Z'
    }, {
        name : 'source',
        value : 'RIPE'
    } ];


});
