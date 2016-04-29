'use strict';

describe('updates: Organisation ScreenLogicInterceptor', function () {

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

        var orgType = after.getAllAttributesOnName('org-type');
        expect(orgType.length).toEqual(1);
        expect(orgType[0].name).toEqual('org-type');
        expect(orgType[0].value).toEqual('OTHER');
        expect(orgType[0].$$meta.$$disable).toBe(true);

    });

    it('should NOT set default org-type before-edit organisation on Modify operation', function() {
        var organisationSubject = _wrap('organisation', organisationAttributes);
        organisationSubject.setSingleAttributeOnName('org-type', 'SOME_ORG_TYPE');

        var errors = [];
        var warnings = [];
        var infos = [];
        var after = interceptor.beforeEdit('Modify', 'RIPE', 'organisation', organisationSubject, errors, warnings, infos);

        var orgType = after.getAllAttributesOnName('org-type');
        expect(orgType.length).toEqual(1);
        expect(orgType[0].name).toEqual('org-type');
        expect(orgType[0].value).toEqual('SOME_ORG_TYPE');
        expect(orgType[0].$$meta.$$disable).toBe(true);

    });

    it('should add empty abuse-c by default organisation before-edit organisation on Create operation', function() {
        var before = whoisResources.wrapAttributes(whoisResources.getMandatoryAttributesOnObjectType('organisation', true));

        var errors = [];
        var warnings = [];
        var infos = [];
        var after = interceptor.beforeEdit('Create', 'RIPE', 'organisation', before, errors, warnings, infos);

        var abuseC = after.getAllAttributesOnName('abuse-c');
        expect(abuseC.length).toEqual(1);
        expect(abuseC[0].name).toEqual('abuse-c');
        expect(abuseC[0].value).toEqual('');

    });

    it('should add flag if abuse-c is not present for the organisation before-edit organisation on Modify operation', function() {
        var organisationSubject = _wrap('organisation', organisationAttributes);

        var errors = [];
        var warnings = [];
        var infos = [];
        var after = interceptor.beforeEdit('Modify', 'RIPE', 'organisation', organisationSubject, errors, warnings, infos);

        var abuseC = after.getAllAttributesOnName('abuse-c');
        expect(abuseC.length).toEqual(1);
        expect(abuseC[0].name).toEqual('abuse-c');
        expect(abuseC[0].value).toEqual('');
        expect(abuseC[0].$$meta.$$missing).toBe(true);
        expect(warnings.length).toEqual(1);
        expect(warnings[0]).toEqual('<p>There is currently no abuse contact set up for your organisation, which is required under <a href="https://www.ripe.net/manage-ips-and-asns/resource-management/abuse-c-information" target="_blank">policy 2011-06</a>.</p><p>Please specify the abuse-c attribute below.</p>');

    });

    it('should add warning if abuse-c is not present for the organisation before-edit organisation on Modify operation', function() {
        var organisationSubject = _wrap('organisation', organisationAttributes);

        var errors = [];
        var warnings = [];
        var infos = [];
        interceptor.beforeEdit('Modify', 'RIPE', 'organisation', organisationSubject, errors, warnings, infos);

        expect(warnings.length).toEqual(1);
        expect(warnings[0]).toEqual('<p>There is currently no abuse contact set up for your organisation, which is required under <a href="https://www.ripe.net/manage-ips-and-asns/resource-management/abuse-c-information" target="_blank">policy 2011-06</a>.</p><p>Please specify the abuse-c attribute below.</p>');

    });

    it('should NOT add empty abuse-c if it exists for default organisation before-edit organisation on Create operation', function() {
        var before = whoisResources.wrapAttributes(whoisResources.getMandatoryAttributesOnObjectType('organisation', true));
        var errors = [];
        var warnings = [];
        var infos = [];
        var after0 = interceptor.beforeEdit('Create', 'RIPE', 'organisation', before, errors, warnings, infos);
        after0.setSingleAttributeOnName('abuse-c', 'bogus abuse-c string');
        var after1 = interceptor.beforeEdit('Create', 'RIPE', 'organisation', after0, errors, warnings, infos);

        var abuseC = after1.getAllAttributesOnName('abuse-c');
        expect(abuseC.length).toEqual(1);
        expect(abuseC[0].name).toEqual('abuse-c');
        expect(abuseC[0].value).toEqual('bogus abuse-c string');

    });

    it('should disable all mnt-by before-edit organisation on Modify operation for LIRs', function() {
        var organisationSubject = _wrap('organisation', organisationAttributes);
        organisationSubject.setSingleAttributeOnName('org-type', 'LIR');

        var errors = [];
        var warnings = [];
        var infos = [];
        var after = interceptor.beforeEdit('Modify', 'RIPE', 'organisation', organisationSubject, errors, warnings, infos);

        var mntByList = after.getAllAttributesOnName('mnt-by');
        expect(mntByList.length).toEqual(2);
        expect(mntByList[0].$$meta.$$disable).toBe(true);
        expect(mntByList[1].$$meta.$$disable).toBe(true);

    });

    it('should NOT disable any mnt-by before-edit organisation on Modify operation for non-LIRs', function() {
        var organisationSubject = _wrap('organisation', organisationAttributes);
        organisationSubject.setSingleAttributeOnName('org-type', 'OTHER');

        var errors = [];
        var warnings = [];
        var infos = [];
        var after = interceptor.beforeEdit('Modify', 'RIPE', 'organisation', organisationSubject, errors, warnings, infos);

        var mntByList = after.getAllAttributesOnName('mnt-by');
        expect(mntByList.length).toEqual(2);
        expect(mntByList[0].$$meta.$$disable).toBeUndefined();
        expect(mntByList[1].$$meta.$$disable).toBeUndefined();

    });

    it('should NOT disable mnt-by before-edit organisation on Create operation', function() {
        var before = whoisResources.wrapAttributes(whoisResources.getMandatoryAttributesOnObjectType('organisation', true));

        var errors = [];
        var warnings = [];
        var infos = [];
        var after = interceptor.beforeEdit('Create', 'RIPE', 'organisation', before, errors, warnings, infos);

        var mntByList = after.getAllAttributesOnName('mnt-by');
        expect(mntByList[0].$$meta.$$disable).toBeUndefined();
    });

    var _wrap = function(type, attrs) {
        return whoisResources.wrapAndEnrichAttributes(type, attrs);
    };

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
        name :'e-mail',
        value :'bla@blu.net'
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
        name :'mnt-by',
        value :'WHAT-A-MESH2-MNT'
    }, {
         name :'source',
         value :'RIPE'
    } ];

});
