import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import find from 'lodash/find';
import { PropertiesService } from '../../../../src/app/properties.service';
import { WhoisMetaService } from '../../../../src/app/shared/whois-meta.service';
import { WhoisResourcesService } from '../../../../src/app/shared/whois-resources.service';
import { OrganisationHelperService } from '../../../../src/app/updatesweb/organisation-helper.service';
import { RestService } from '../../../../src/app/updatesweb/rest.service';

describe('OrganisationHelperService', () => {
    let organisationHelperService: OrganisationHelperService;

    beforeEach(() => {
        const routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                OrganisationHelperService,
                WhoisResourcesService,
                WhoisMetaService,
                RestService,
                PropertiesService,
                { provide: Router, useValue: routerMock },
            ],
        });
        organisationHelperService = TestBed.inject(OrganisationHelperService);
    });

    it('should inform if no abuse-c is available', () => {
        const attributes = [
            {
                name: 'organisation',
                value: 'ORG-TEST70-RIPE',
            },
            {
                name: 'e-mail',
                value: 'a@b.c',
            },
        ];
        expect(organisationHelperService.containsAttribute(attributes, 'abuse-c')).toBeFalse();
    });

    it('should inform if abuse-c is available', () => {
        const attributes = [
            {
                name: 'organisation',
                value: 'ORG-TEST70-RIPE',
            },
            {
                name: 'e-mail',
                value: 'a@b.c',
            },
            {
                name: 'abuse-c',
                value: 'some abuse-c',
            },
        ];
        expect(organisationHelperService.containsAttribute(attributes, 'abuse-c')).toBeTruthy();
    });

    it('should inform if abuse-c is available but with empty value', () => {
        const attributes = [
            {
                name: 'organisation',
                value: 'ORG-TEST70-RIPE',
            },
            {
                name: 'e-mail',
                value: 'a@b.c',
            },
            {
                name: 'abuse-c',
            },
        ];
        expect(organisationHelperService.containsAttribute(attributes, 'abuse-c')).toBeFalse();
    });

    it('should inform if abuse-c is available but with empty string', () => {
        const attributes = [
            {
                name: 'organisation',
                value: 'ORG-TEST70-RIPE',
            },
            {
                name: 'e-mail',
                value: 'a@b.c',
            },
            {
                name: 'abuse-c',
                value: ' ',
            },
        ];
        expect(organisationHelperService.containsAttribute(attributes, 'abuse-c')).toBeFalse();
    });

    it('should add abuse-c is object type is organisation', () => {
        const attributes = [
            {
                name: 'organisation',
                value: 'ORG-TEST70-RIPE',
            },
            {
                name: 'e-mail',
                value: 'a@b.c',
            },
        ];

        const attrs = organisationHelperService.addAbuseC('organisation', attributes);
        const abuseC = find(attrs, (attr) => {
            return attr.name === 'abuse-c';
        });

        expect(abuseC).toBeDefined();
    });

    it('should not add abuse-c is object type is not organisation', () => {
        const attributes = [
            {
                name: 'something',
                value: 'BLATST-RIPE',
            },
        ];

        const attrs = organisationHelperService.addAbuseC('something', attributes);
        const abuseC = find(attrs, (attr) => {
            return attr.name === 'abuse-c';
        });

        expect(abuseC).toBeUndefined();
    });

    it('should be valid if it is not an organisation object', () => {
        expect(organisationHelperService.validateOrganisationAttributes('mntner', [])).toBeTruthy();
    });

    it('should be valid if abuse-c is not present', () => {
        const attributes = [
            {
                name: 'organisation',
                value: 'ORG-TEST70-RIPE',
            },
            {
                name: 'e-mail',
                value: 'a@b.c',
            },
        ];

        expect(organisationHelperService.validateOrganisationAttributes('organisation', attributes)).toBeTruthy();
    });

    it('should be invalid if abuse-c is empty', () => {
        const attributes = [
            {
                name: 'organisation',
                value: 'ORG-TEST70-RIPE',
            },
            {
                name: 'e-mail',
                value: 'a@b.c',
            },
            {
                name: 'abuse-c',
            },
        ];

        expect(organisationHelperService.validateOrganisationAttributes('organisation', attributes)).toBeFalse();
    });

    it('should be set message if abuse-c is empty', () => {
        const attributes = [
            {
                name: 'organisation',
                value: 'ORG-TEST70-RIPE',
            },
            {
                name: 'e-mail',
                value: 'a@b.c',
            },
            {
                name: 'abuse-c',
            },
        ];

        organisationHelperService.validateOrganisationAttributes('organisation', attributes);
        const abuseC = find(attributes, (attr) => {
            return attr.name === 'abuse-c';
        });
        //@ts-ignore
        expect(abuseC.$$error).toBe('Please provide an Abuse-c or remove the attribute if you would like to do it later');
    });

    it('should be valid if abuse-c is not present', () => {
        const attributes = [
            {
                name: 'organisation',
                value: 'ORG-TEST70-RIPE',
            },
            {
                name: 'e-mail',
                value: 'a@b.c',
            },
        ];

        expect(organisationHelperService.validateOrganisationAttributes('organisation', attributes)).toBeTruthy();
    });

    it('should be valid if abuse-c is present', () => {
        const attributes = [
            {
                name: 'organisation',
                value: 'ORG-TEST70-RIPE',
            },
            {
                name: 'e-mail',
                value: 'a@b.c',
            },
            {
                name: 'abuse-c',
                value: 'some abuse-c',
            },
        ];

        expect(organisationHelperService.validateOrganisationAttributes('organisation', attributes)).toBeTruthy();
    });

    it('should be set message if country is empty', () => {
        const attributes = [
            {
                name: 'organisation',
                value: 'ORG-TEST70-RIPE',
            },
            {
                name: 'e-mail',
                value: 'a@b.c',
            },
            {
                name: 'country',
            },
        ];

        organisationHelperService.validateOrganisationAttributes('organisation', attributes);
        const abuseC = find(attributes, (attr) => {
            return attr.name === 'country';
        });
        //@ts-ignore
        expect(abuseC.$$error).toBe('Please provide a valid country code or remove the attribute if you would like to do it later');
    });
});
