'use strict';

describe('webUpdates: OrganisationHelper', function () {

    var OrganisationHelper;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_OrganisationHelper_) {
            OrganisationHelper = _OrganisationHelper_;
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
        expect(OrganisationHelper.containsAbuseC(attributes)).toBe(false);
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
        expect(OrganisationHelper.containsAbuseC(attributes)).toBe(true);
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
        expect(OrganisationHelper.containsAbuseC(attributes)).toBe(false);
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
        expect(OrganisationHelper.containsAbuseC(attributes)).toBe(false);
    });

    it('should add abuse-c is object type is organisation', function () {
        var attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
        }, {
            'name': 'e-mail',
            'value': 'a@b.c'
        }];

        var attrs = OrganisationHelper.addAbuseC('organisation', attributes);
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

        var attrs = OrganisationHelper.addAbuseC('something', attributes);
        var abuseC = _.find(attrs, function(attr) {
            return attr.name === 'abuse-c';
        });

        expect(abuseC).toBeUndefined();
    });

    it('should be valid if it is not an organisation object', function () {
        expect(OrganisationHelper.validateAbuseC('mntner', [])).toBe(true);
    });

    it('should be valid if abuse-c is not present', function () {
        var attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
        }, {
            'name': 'e-mail',
            'value': 'a@b.c'
        }];

        expect(OrganisationHelper.validateAbuseC('organisation', attributes)).toBe(true);
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

        expect(OrganisationHelper.validateAbuseC('organisation', attributes)).toBe(false);
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

        OrganisationHelper.validateAbuseC('organisation', attributes);
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

        expect(OrganisationHelper.validateAbuseC('organisation', attributes)).toBe(true);
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

        expect(OrganisationHelper.validateAbuseC('organisation', attributes)).toBe(true);
    });

});


