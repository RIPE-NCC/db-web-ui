import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { of } from 'rxjs';
import { PropertiesService } from '../../../src/app/properties.service';
import { WhoisMetaService } from '../../../src/app/shared/whois-meta.service';
import { WhoisResourcesService } from '../../../src/app/shared/whois-resources.service';
import { IAttributeModel } from '../../../src/app/shared/whois-response-type.model';
import { LinkService } from '../../../src/app/updatesweb/link.service';
import { MessageStoreService } from '../../../src/app/updatesweb/message-store.service';
import { MntnerService } from '../../../src/app/updatesweb/mntner.service';
import { ScreenLogicInterceptorService } from '../../../src/app/updatesweb/screen-logic-interceptor.service';
import { UpdatesWebModule } from '../../../src/app/updatesweb/updateweb.module';

describe('ScreenLogicInterceptorService Inet6Num', () => {
    let interceptor: ScreenLogicInterceptorService;
    let whoisResourcesService: WhoisResourcesService;
    let whoisMetaService: WhoisMetaService;

    let MockMntnerService = {
        isNccMntner: (mntnerKey: string) => {
            return _.includes(['RIPE-NCC-HM-MNT', 'RIPE-NCC-END-MNT', 'RIPE-NCC-LEGACY-MNT'], mntnerKey.toUpperCase());
        },
        isAnyNccMntner: (mntnerKey: string) => {
            return _.includes(
                [
                    'RIPE-NCC-HM-MNT',
                    'RIPE-NCC-END-MNT',
                    'RIPE-NCC-HM-PI-MNT',
                    'RIPE-GII-MNT',
                    'RIPE-DBM-MNT',
                    'RIPE-NCC-LOCKED-MNT',
                    'RIPE-ERX-MNT',
                    'RIPE-NCC-LEGACY-MNT',
                    'RIPE-NCC-MNT',
                ],
                mntnerKey.toUpperCase(),
            );
        },
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [UpdatesWebModule],
            providers: [
                ScreenLogicInterceptorService,
                MessageStoreService,
                LinkService,
                WhoisMetaService,
                WhoisResourcesService,
                {
                    provide: 'OrganisationHelperService',
                    useValue: { containsAttribute: (attributes: any, attribute: string) => attributes, addAbuseC: (attributes: any) => attributes },
                },
                { provide: MntnerService, useValue: MockMntnerService },
                { provide: Router, useValue: { navigate: () => {}, events: of() } },
                PropertiesService,
            ],
        });
        interceptor = TestBed.inject(ScreenLogicInterceptorService);
        whoisResourcesService = TestBed.inject(WhoisResourcesService);
        whoisMetaService = TestBed.inject(WhoisMetaService);
    });

    it('should disable org attribute from inet6num when status is ASSIGNED PI', () => {
        let inet6NumSubject = _wrap('inet6num', inet6NumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inet6NumSubject, 'status', 'ASSIGNED PI');

        const attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inet6num', inet6NumSubject);

        const orgAttr = whoisResourcesService.getSingleAttributeOnName(attributes, 'org');
        expect(orgAttr.$$meta.$$disable).toBeTruthy();
    });

    it('should disable netname attribute from inet6num when status is ALLOCATED PA, ALLOCATED UNSPECIFIED or ALLOCATED-BY-RIR', () => {
        let inet6NumSubject = _wrap('inet6num', inet6NumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inet6NumSubject, 'status', 'ALLOCATED PA');

        const attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inet6num', inet6NumSubject);

        const netnameAttr = whoisResourcesService.getSingleAttributeOnName(attributes, 'netname');
        expect(netnameAttr.$$meta.$$disable).toBeTruthy();
    });

    it('should not remove sponsoring org from inet6num addable attributes when status is LEGACY', () => {
        let inet6NumSubject = _wrap('inet6num', inet6NumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inet6NumSubject, 'status', 'LEGACY');

        const addableAttributes = _wrap('inet6num', whoisResourcesService.getAddableAttributes(inet6NumSubject, 'inet6num', inet6NumSubject));

        const filteredAddableAttributes = interceptor.beforeAddAttribute('Modify', 'RIPE', 'inet6num', inet6NumSubject, addableAttributes);

        const sponsoringOrgAttr = whoisResourcesService.getSingleAttributeOnName(filteredAddableAttributes, 'sponsoring-org');
        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it('should not remove sponsoring org from inet6num addable attributes when status is ASSIGNED-PI', () => {
        let inet6NumSubject = _wrap('inet6num', inet6NumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inet6NumSubject, 'status', 'ASSIGNED PI');

        const addableAttributes = _wrap('inet6num', whoisResourcesService.getAddableAttributes(inet6NumSubject, 'inet6num', inet6NumSubject));

        const filteredAddableAttributes = interceptor.beforeAddAttribute('Modify', 'RIPE', 'inet6num', inet6NumSubject, addableAttributes);

        const sponsoringOrgAttr = whoisResourcesService.getSingleAttributeOnName(filteredAddableAttributes, 'sponsoring-org');
        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it('should not remove sponsoring org from inet6num addable attributes when status is ASSIGNED-ANYCAST', () => {
        let inet6NumSubject = _wrap('inet6num', inet6NumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inet6NumSubject, 'status', 'ASSIGNED ANYCAST');

        const addableAttributes = _wrap('inet6num', whoisResourcesService.getAddableAttributes(inet6NumSubject, 'inet6num', inet6NumSubject));

        const filteredAddableAttributes = interceptor.beforeAddAttribute('Modify', 'RIPE', 'inet6num', inet6NumSubject, addableAttributes);

        const sponsoringOrgAttr = whoisResourcesService.getSingleAttributeOnName(filteredAddableAttributes, 'sponsoring-org');
        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it('should remove sponsoring org from inet6num addable attributes when status is not ASSIGNED-PI or ASSIGNED-ANYCAST', () => {
        let inet6NumSubject = _wrap('inet6num', inet6NumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inet6NumSubject, 'status', 'ASSIGNED');

        let addableAttributes = _wrap('inet6num', whoisResourcesService.getAddableAttributes(inet6NumSubject, 'inet6num', inet6NumSubject));

        const filteredAddableAttributes = interceptor.beforeAddAttribute('Modify', 'RIPE', 'inet6num', inet6NumSubject, addableAttributes);

        let sponsoringOrgAttr = whoisResourcesService.getSingleAttributeOnName(filteredAddableAttributes, 'sponsoring-org');
        expect(sponsoringOrgAttr).toBeUndefined();
    });

    it('should not remove sponsoring org from inet6num addable attributes when status is empty', () => {
        let inet6NumSubject = _wrap('inet6num', inet6NumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inet6NumSubject, 'status', '');

        const addableAttributes = _wrap('inet6num', whoisResourcesService.getAddableAttributes(inet6NumSubject, 'inet6num', inet6NumSubject));

        let filteredAddableAttributes = interceptor.beforeAddAttribute('Modify', 'RIPE', 'inet6num', inet6NumSubject, addableAttributes);

        let sponsoringOrgAttr = whoisResourcesService.getSingleAttributeOnName(filteredAddableAttributes, 'sponsoring-org');
        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it('should disable mnt-domains with ripe maintainers on modify', () => {
        let inetNumSubject = _wrap('inet6num', inet6NumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inetNumSubject, 'mnt-domains', 'RIPE-NCC-HM-MNT');

        const attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inet6num', inetNumSubject);

        let mntDomains = whoisResourcesService.getSingleAttributeOnName(attributes, 'mnt-domains');
        expect(mntDomains.$$meta.$$disable).toBeTruthy();
    });

    it('should NOT disable mnt-domains with non-ripe maintainers on modify', () => {
        let inetNumSubject = _wrap('inet6num', inet6NumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inetNumSubject, 'mnt-domains', 'NON-RIPE-MNT');

        const attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inet6num', inetNumSubject);

        let mntDomains = whoisResourcesService.getSingleAttributeOnName(attributes, 'mnt-domains');
        expect(mntDomains.$$meta.$$disable).toBeFalsy();
    });

    it('should disable mnt-lower with ripe maintainers on modify', () => {
        let inetNumSubject = _wrap('inet6num', inet6NumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inetNumSubject, 'mnt-lower', 'RIPE-NCC-HM-MNT');

        const attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inet6num', inetNumSubject);

        let mntLower = whoisResourcesService.getSingleAttributeOnName(attributes, 'mnt-lower');
        expect(mntLower.$$meta.$$disable).toBeTruthy();
    });

    it('should NOT disable mnt-lower with non-ripe maintainers on modify', () => {
        let inetNumSubject = _wrap('inet6num', inet6NumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inetNumSubject, 'mnt-lower', 'NON-RIPE-MNT');

        const attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inet6num', inetNumSubject);

        let mntLower = whoisResourcesService.getSingleAttributeOnName(attributes, 'mnt-lower');
        expect(mntLower.$$meta.$$disable).toBeFalsy();
    });

    it('should disable mnt-routes with ripe maintainers on modify', () => {
        let inetNumSubject = _wrap('inet6num', inet6NumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inetNumSubject, 'mnt-routes', 'RIPE-NCC-HM-MNT');

        const attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inet6num', inetNumSubject);

        let mntLower = whoisResourcesService.getSingleAttributeOnName(attributes, 'mnt-routes');
        expect(mntLower.$$meta.$$disable).toBeTruthy();
    });

    it('should disable mnt-routes with ripe maintainers on modify', () => {
        let inetNumSubject = _wrap('inet6num', inet6NumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inetNumSubject, 'mnt-routes', 'RIPE-ERX-MNT');

        const attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inet6num', inetNumSubject);

        let mntLower = whoisResourcesService.getSingleAttributeOnName(attributes, 'mnt-routes');
        expect(mntLower.$$meta.$$disable).toBeTruthy();
    });

    it('should NOT disable mnt-routes with non-ripe maintainers on modify', () => {
        let inetNumSubject = _wrap('inet6num', inet6NumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inetNumSubject, 'mnt-routes', 'NON-RIPE-MNT');

        const attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inet6num', inetNumSubject);

        let mntLower = whoisResourcesService.getSingleAttributeOnName(attributes, 'mnt-routes');
        expect(mntLower.$$meta.$$disable).toBeFalsy();
    });

    const _wrap = (type: string, attrs: IAttributeModel[]) => {
        return whoisResourcesService.wrapAndEnrichAttributes(type, attrs);
    };

    const inet6NumAttributes = [
        {
            name: 'inet6num',
            value: '2001:7f8:7::/48',
        },
        {
            name: 'netname',
            value: 'NETNAME-TST-20020201',
        },
        {
            name: 'descr',
            value: 'Test org',
        },
        {
            name: 'country',
            value: 'FI',
        },
        {
            name: 'org',
            value: 'ORG-TST05-RIPE',
        },
        {
            name: 'admin-c',
            value: 'TSTADMINC-RIPE',
        },
        {
            name: 'tech-c',
            value: 'TSTADMINC-RIPE',
        },
        {
            name: 'mnt-by',
            value: 'RIPE-NCC-END-MNT',
        },
        {
            name: 'mnt-by',
            value: 'TST05-MNT',
        },
        {
            name: 'mnt-domains',
            value: 'TST05-MNT',
        },
        {
            name: 'mnt-lower',
            value: 'TST05-MNT',
        },
        {
            name: 'mnt-routes',
            value: 'TST05-MNT',
        },
        {
            name: 'notify',
            value: '***@test.net',
        },
        {
            name: 'status',
            value: 'ASSIGNED PI',
        },
        {
            name: 'created',
            value: '2002-08-06T05:54:20Z',
        },
        {
            name: 'last-modified',
            value: '2016-03-06T10:58:07Z',
        },
        {
            name: 'source',
            value: 'RIPE',
        },
    ];
});
