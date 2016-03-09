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
