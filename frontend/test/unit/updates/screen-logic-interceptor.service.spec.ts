import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { PropertiesService } from '../../../src/app/properties.service';
import { CredentialsService } from '../../../src/app/shared/credentials.service';
import { WhoisMetaService } from '../../../src/app/shared/whois-meta.service';
import { WhoisResourcesService } from '../../../src/app/shared/whois-resources.service';
import { LinkService } from '../../../src/app/updatesweb/link.service';
import { MessageStoreService } from '../../../src/app/updatesweb/message-store.service';
import { MntnerService } from '../../../src/app/updatesweb/mntner.service';
import { ScreenLogicInterceptorService } from '../../../src/app/updatesweb/screen-logic-interceptor.service';
import { UpdatesWebModule } from '../../../src/app/updatesweb/updateweb.module';

describe('ScreenLogicInterceptorService', () => {
    let interceptor: ScreenLogicInterceptorService;
    let whoisResourcesService: WhoisResourcesService;
    let whoisMetaService: WhoisMetaService;

    const credentialServiceMock = {
        getCredentials: () => {
            return { mntner: 'B-MNT', successfulPassword: 'secret' };
        },
        hasCredentials: () => {
            return true;
        },
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [UpdatesWebModule],
            providers: [
                ScreenLogicInterceptorService,
                { provide: '$log', useValue: { info: () => {}, error: () => {} } },
                {
                    provide: 'OrganisationHelperService',
                    useValue: { containsAttribute: (attributes: any, attribute: string) => attributes, addAbuseC: (attributes: any) => attributes },
                },
                { provide: CredentialsService, useValue: credentialServiceMock },
                MessageStoreService,
                { provide: MntnerService, useValue: { ssoMntners: [], isNccMntner: (mntnerKey: string) => true } },
                LinkService,
                WhoisMetaService,
                WhoisResourcesService,
                { provide: Router, useValue: { navigate: () => {}, events: of() } },
                PropertiesService,
            ],
        });
        interceptor = TestBed.inject(ScreenLogicInterceptorService);
        whoisResourcesService = TestBed.inject(WhoisResourcesService);
        whoisMetaService = TestBed.inject(WhoisMetaService);
    });

    it('should disable org attribute from aut-num when status is ASSIGNED PI', () => {
        let autNumSubject = _wrap('aut-num', autNumAttributes);
        whoisResourcesService.setSingleAttributeOnName(autNumSubject, 'status', 'ASSIGNED PI');

        let attributes = interceptor.beforeEdit('Modify', 'RIPE', 'aut-num', autNumSubject);

        let orgAttr = whoisResourcesService.getSingleAttributeOnName(attributes, 'org');
        expect(orgAttr.$$meta.$$disable).toBeTruthy();
    });

    it('should set default source before-edit any object on Create operation', () => {
        let before = whoisResourcesService.validateAttributes(whoisMetaService.getMandatoryAttributesOnObjectType('organisation'));

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        let after = interceptor.beforeEdit('Create', 'TEST', 'organisation', before, errors, warnings, infos);

        let organisation = WhoisResourcesService.getAllAttributesOnName(after, 'source');
        expect(organisation.length).toEqual(1);
        expect(organisation[0].name).toEqual('source');
        expect(organisation[0].value).toEqual('TEST');
        expect(organisation[0].$$meta.$$disable).toBeTruthy();
    });

    it('should not change addable attributes by default', () => {
        let autNumSubject = _wrap('aut-num', autNumAttributes);
        whoisResourcesService.setSingleAttributeOnName(autNumSubject, 'status', 'ASSIGNED PI');

        let addableAttributes = { attr: 'some data' };
        let addableAttributesAfter = interceptor.beforeAddAttribute('Modify', 'RIPE', 'aut-num', autNumSubject, addableAttributes);

        expect(addableAttributesAfter).toBe(addableAttributes);
    });

    it('should disable primary key attribute from object on modify', () => {
        let autNumSubject = _wrap('aut-num', autNumAttributes);

        let attributes = interceptor.beforeEdit('Modify', 'RIPE', 'aut-num', autNumSubject);

        let primaryKey = whoisResourcesService.getSingleAttributeOnName(attributes, 'aut-num');
        expect(primaryKey.$$meta.$$disable).toBeTruthy();
    });

    it('should disable status attribute on modify if not "ALLOCATED PA", "ALLOCATED-ASSIGNED PA" nor "NOT-SET"', () => {
        let inetnumSubject = _wrap('inetnum', inetnumAssigned);

        let attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inetnum', inetnumSubject);

        let status = whoisResourcesService.getSingleAttributeOnName(attributes, 'status');
        expect(status.$$meta.$$disable).toBeTruthy();
    });

    it('should enable status attribute on modify if "ALLOCATED PA"', () => {
        let inetnumSubject = _wrap('inetnum', inetnumAllocatedPa);

        let attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inetnum', inetnumSubject);

        let status = whoisResourcesService.getSingleAttributeOnName(attributes, 'status');
        expect(status.$$meta.$$disable).toBeFalsy();
    });

    const _wrap = (type: any, attrs: any) => {
        return whoisResourcesService.wrapAndEnrichAttributes(type, attrs);
    };

    let autNumAttributes = [
        {
            name: 'aut-num',
            value: 'AS123',
        },
        {
            name: 'as-name',
            value: 'EXAMPLE',
        },
        {
            name: 'status',
            value: 'ASSIGNED PI',
        },
        {
            name: 'org',
            value: 'ORG-TST05-RIPE',
        },
        {
            name: 'mnt-by',
            value: 'RIPE-NCC-END-MNT',
        },
        {
            name: 'source',
            value: 'RIPE',
        },
    ];

    let inetnumAssigned = [
        {
            name: 'inetnum',
            value: 'AS123',
        },
        {
            name: 'status',
            value: 'ASSIGNED PI',
        },
        {
            name: 'mnt-by',
            value: 'RIPE-NCC-END-MNT',
        },
        {
            name: 'source',
            value: 'RIPE',
        },
    ];

    let inetnumAllocatedPa = [
        {
            name: 'inetnum',
            value: 'AS123',
        },
        {
            name: 'status',
            value: 'ALLOCATED PA',
        },
        {
            name: 'mnt-by',
            value: 'RIPE-NCC-END-MNT',
        },
        {
            name: 'source',
            value: 'RIPE',
        },
    ];
});
