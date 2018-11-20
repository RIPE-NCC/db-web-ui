/*global beforeEach, describe, expect, inject, it*/
'use strict';

describe('webUpdates: OrganisationHelperService', function () {

    var OrganisationHelperService;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_OrganisationHelperService_) {
            OrganisationHelperService = _OrganisationHelperService_;
        });
    });

    it('should inform if no abuse-c is available', function () {
        var attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
        }, {
            'name': 'e-mail',
            'value': 'a@b.c'
        }];
        expect(OrganisationHelperService.containsAbuseC(attributes)).toBe(false);
    });

    it('should inform if abuse-c is available', function () {
        var attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
        }, {
            'name': 'e-mail',
            'value': 'a@b.c'
        }, {
            'name' : 'abuse-c',
            'value' : 'some abuse-c'
        }];
        expect(OrganisationHelperService.containsAbuseC(attributes)).toBe(true);
    });

    it('should inform if abuse-c is available but with empty value', function () {
        var attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
        }, {
            'name': 'e-mail',
            'value': 'a@b.c'
        }, {
            'name' : 'abuse-c'
        }];
        expect(OrganisationHelperService.containsAbuseC(attributes)).toBe(false);
    });

    it('should inform if abuse-c is available but with empty string', function () {
        var attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
        }, {
            'name': 'e-mail',
            'value': 'a@b.c'
        }, {
            'name' : 'abuse-c',
            'value' : ' '
        }];
        expect(OrganisationHelperService.containsAbuseC(attributes)).toBe(false);
    });

    it('should add abuse-c is object type is organisation', function () {
        var attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
        }, {
            'name': 'e-mail',
            'value': 'a@b.c'
        }];

        var attrs = OrganisationHelperService.addAbuseC('organisation', attributes);
        var abuseC = _.find(attrs, function(attr) {
            return attr.name === 'abuse-c';
        });

        expect(abuseC).toBeDefined();
    });

    it('should not add abuse-c is object type is not organisation', function () {
        var attributes = [ {
            'name' : 'something',
            'value' : 'BLA-RIPE'
        }];

        var attrs = OrganisationHelperService.addAbuseC('something', attributes);
        var abuseC = _.find(attrs, function(attr) {
            return attr.name === 'abuse-c';
        });

        expect(abuseC).toBeUndefined();
    });

    it('should be valid if it is not an organisation object', function () {
        expect(OrganisationHelperService.validateAbuseC('mntner', [])).toBe(true);
    });

    it('should be valid if abuse-c is not present', function () {
        var attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
        }, {
            'name': 'e-mail',
            'value': 'a@b.c'
        }];

        expect(OrganisationHelperService.validateAbuseC('organisation', attributes)).toBe(true);
    });

    it('should be invalid if abuse-c is empty', function () {
        var attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
        }, {
            'name': 'e-mail',
            'value': 'a@b.c'
        }, {
            'name': 'abuse-c'
        }];

        expect(OrganisationHelperService.validateAbuseC('organisation', attributes)).toBe(false);
    });

    it('should be set message if abuse-c is empty', function () {
        var attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
        }, {
            'name': 'e-mail',
            'value': 'a@b.c'
        }, {
            'name': 'abuse-c'
        }];

        OrganisationHelperService.validateAbuseC('organisation', attributes);
        var abuseC = _.find(attributes, function(attr) {
            return attr.name === 'abuse-c';
        });

        expect(abuseC.$$error).toBe('Please provide an Abuse-c or remove the attribute if you would like to do it later');
    });


    it('should be valid if abuse-c is not present', function () {
        var attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
        }, {
            'name': 'e-mail',
            'value': 'a@b.c'
        }];

        expect(OrganisationHelperService.validateAbuseC('organisation', attributes)).toBe(true);
    });

    it('should be valid if abuse-c is present', function () {
        var attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
        }, {
            'name': 'e-mail',
            'value': 'a@b.c'
        }, {
            'name' : 'abuse-c',
            'value' : 'some abuse-c'
        }];

        expect(OrganisationHelperService.validateAbuseC('organisation', attributes)).toBe(true);
    });

});


