/*global beforeEach, describe, expect, inject, it*/
'use strict';

describe('updates: Inet6Num ScreenLogicInterceptorService', function () {

    var interceptor;
    var whoisResources;

    beforeEach(module('updates'));

    beforeEach(inject(function (WhoisResources, ScreenLogicInterceptorService) {
        whoisResources = WhoisResources;
        interceptor = ScreenLogicInterceptorService;
    }));

    it('should disable org attribute from inet6num when status is ASSIGNED PI', function() {

        var inet6NumSubject = _wrap('inet6num', inet6NumAttributes);
        inet6NumSubject.setSingleAttributeOnName('status', 'ASSIGNED PI');

        var attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inet6num', inet6NumSubject);

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

    it('should not remove sponsoring org from inet6num addable attributes when status is empty', function() {

        var inet6NumSubject = _wrap('inet6num', inet6NumAttributes);
        inet6NumSubject.setSingleAttributeOnName('status', '');

        var addableAttributes = _wrap('inet6num', inet6NumSubject.getAddableAttributes('inet6num', inet6NumSubject));

        var filteredAddableAttributes = interceptor.beforeAddAttribute('Modify', 'RIPE', 'inet6num', inet6NumSubject, addableAttributes);

        var sponsoringOrgAttr = filteredAddableAttributes.getSingleAttributeOnName('sponsoring-org');
        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it('should disable mnt-domains with ripe maintainers on modify', function() {

        var inetNumSubject = _wrap('inet6num', inet6NumAttributes);
        inetNumSubject .setSingleAttributeOnName('mnt-domains', 'RIPE-NCC-HM-MNT');

        var attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inet6num', inetNumSubject);

        var mntDomains = attributes.getSingleAttributeOnName('mnt-domains');
        expect(mntDomains.$$meta.$$disable).toBe(true);
    });

    it('should NOT disable mnt-domains with non-ripe maintainers on modify', function() {

        var inetNumSubject = _wrap('inet6num', inet6NumAttributes);
        inetNumSubject.setSingleAttributeOnName('mnt-domains', 'NON-RIPE-MNT');

        var attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inet6num', inetNumSubject);

        var mntDomains = attributes.getSingleAttributeOnName('mnt-domains');
        expect(mntDomains.$$meta.$$disable).toBeFalsy();
    });

    it('should disable mnt-lower with ripe maintainers on modify', function() {

        var inetNumSubject = _wrap('inet6num', inet6NumAttributes);
        inetNumSubject.setSingleAttributeOnName('mnt-lower', 'RIPE-NCC-HM-MNT');

        var attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inet6num', inetNumSubject);

        var mntLower = attributes.getSingleAttributeOnName('mnt-lower');
        expect(mntLower.$$meta.$$disable).toBe(true);
    });

    it('should NOT disable mnt-lower with non-ripe maintainers on modify', function() {

        var inetNumSubject = _wrap('inet6num', inet6NumAttributes);
        inetNumSubject.setSingleAttributeOnName('mnt-lower', 'NON-RIPE-MNT');

        var attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inet6num', inetNumSubject);

        var mntLower = attributes.getSingleAttributeOnName('mnt-lower');
        expect(mntLower.$$meta.$$disable).toBeFalsy();
    });

    it('should disable mnt-routes with ripe maintainers on modify', function() {

        var inetNumSubject = _wrap('inet6num', inet6NumAttributes);
        inetNumSubject.setSingleAttributeOnName('mnt-routes', 'RIPE-NCC-HM-MNT');

        var attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inet6num', inetNumSubject);

        var mntLower = attributes.getSingleAttributeOnName('mnt-routes');
        expect(mntLower.$$meta.$$disable).toBe(true);
    });

    it('should NOT disable mnt-routes with non-ripe maintainers on modify', function() {

        var inetNumSubject = _wrap('inet6num', inet6NumAttributes);
        inetNumSubject.setSingleAttributeOnName('mnt-routes', 'NON-RIPE-MNT');

        var attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inet6num', inetNumSubject);

        var mntLower = attributes.getSingleAttributeOnName('mnt-routes');
        expect(mntLower.$$meta.$$disable).toBeFalsy();
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
        name :'mnt-lower',
        value :'jome-mnt'
    }, {
        name :'mnt-routes',
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

});
