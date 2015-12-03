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
        }];
        expect(OrganisationHelper.containsAbuseC(attributes)).toBe(false);
    });

    it('should inform if abuse-c is available', function () {
        var attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
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
            'name' : 'abuse-c'
        }];
        expect(OrganisationHelper.containsAbuseC(attributes)).toBe(false);
    });

    it('should inform if abuse-c is available but with empty string', function () {
        var attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
        }, {
            'name' : 'abuse-c',
            'value' : ' '
        }];
        expect(OrganisationHelper.containsAbuseC(attributes)).toBe(false);
    });

});


