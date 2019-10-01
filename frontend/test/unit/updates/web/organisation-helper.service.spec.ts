import {TestBed} from "@angular/core/testing";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {OrganisationHelperService} from "../../../../app/ng/updates/web/organisation-helper.service";
import {WhoisResourcesService} from "../../../../app/ng/shared/whois-resources.service";
import {WhoisMetaService} from "../../../../app/ng/shared/whois-meta.service";
import {RestService} from "../../../../app/ng/updates/rest.service";
import {Router} from "@angular/router";

describe('OrganisationHelperService', function () {

    let organisationHelperService: OrganisationHelperService;

    beforeEach(() => {
        const routerMock = jasmine.createSpyObj("Router", ["navigate", "navigateByUrl"]);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                OrganisationHelperService,
                WhoisResourcesService,
                WhoisMetaService,
                RestService,
                {provide: Router, useValue: routerMock},
            ],
        });
        organisationHelperService = TestBed.get(OrganisationHelperService);
    });

    it('should inform if no abuse-c is available', function () {
        const attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
        }, {
            'name': 'e-mail',
            'value': 'a@b.c'
        }];
        expect(organisationHelperService.containsAbuseC(attributes)).toBe(false);
    });

    it('should inform if abuse-c is available', function () {
        const attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
        }, {
            'name': 'e-mail',
            'value': 'a@b.c'
        }, {
            'name' : 'abuse-c',
            'value' : 'some abuse-c'
        }];
        expect(organisationHelperService.containsAbuseC(attributes)).toBe(true);
    });

    it('should inform if abuse-c is available but with empty value', function () {
        const attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
        }, {
            'name': 'e-mail',
            'value': 'a@b.c'
        }, {
            'name' : 'abuse-c'
        }];
        expect(organisationHelperService.containsAbuseC(attributes)).toBe(false);
    });

    it('should inform if abuse-c is available but with empty string', function () {
        const attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
        }, {
            'name': 'e-mail',
            'value': 'a@b.c'
        }, {
            'name' : 'abuse-c',
            'value' : ' '
        }];
        expect(organisationHelperService.containsAbuseC(attributes)).toBe(false);
    });

    it('should add abuse-c is object type is organisation', function () {
        const attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
        }, {
            'name': 'e-mail',
            'value': 'a@b.c'
        }];

        const attrs = organisationHelperService.addAbuseC('organisation', attributes);
        const abuseC = _.find(attrs, function(attr) {
            return attr.name === 'abuse-c';
        });

        expect(abuseC).toBeDefined();
    });

    it('should not add abuse-c is object type is not organisation', function () {
        const attributes = [ {
            'name' : 'something',
            'value' : 'BLA-RIPE'
        }];

        const attrs = organisationHelperService.addAbuseC('something', attributes);
        const abuseC = _.find(attrs, function(attr) {
            return attr.name === 'abuse-c';
        });

        expect(abuseC).toBeUndefined();
    });

    it('should be valid if it is not an organisation object', function () {
        expect(organisationHelperService.validateAbuseC('mntner', [])).toBe(true);
    });

    it('should be valid if abuse-c is not present', function () {
        const attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
        }, {
            'name': 'e-mail',
            'value': 'a@b.c'
        }];

        expect(organisationHelperService.validateAbuseC('organisation', attributes)).toBe(true);
    });

    it('should be invalid if abuse-c is empty', function () {
        const attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
        }, {
            'name': 'e-mail',
            'value': 'a@b.c'
        }, {
            'name': 'abuse-c'
        }];

        expect(organisationHelperService.validateAbuseC('organisation', attributes)).toBe(false);
    });

    it('should be set message if abuse-c is empty', function () {
        const attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
        }, {
            'name': 'e-mail',
            'value': 'a@b.c'
        }, {
            'name': 'abuse-c'
        }];

        organisationHelperService.validateAbuseC('organisation', attributes);
        const abuseC = _.find(attributes, function(attr) {
            return attr.name === 'abuse-c';
        });
        //@ts-ignore
        expect(abuseC.$$error).toBe('Please provide an Abuse-c or remove the attribute if you would like to do it later');
    });


    it('should be valid if abuse-c is not present', function () {
        const attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
        }, {
            'name': 'e-mail',
            'value': 'a@b.c'
        }];

        expect(organisationHelperService.validateAbuseC('organisation', attributes)).toBe(true);
    });

    it('should be valid if abuse-c is present', function () {
        const attributes = [ {
            'name' : 'organisation',
            'value' : 'ORG-UA300-RIPE'
        }, {
            'name': 'e-mail',
            'value': 'a@b.c'
        }, {
            'name' : 'abuse-c',
            'value' : 'some abuse-c'
        }];

        expect(organisationHelperService.validateAbuseC('organisation', attributes)).toBe(true);
    });

});


