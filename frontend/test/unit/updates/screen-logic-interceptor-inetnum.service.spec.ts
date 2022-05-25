import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { of } from 'rxjs';
import { WhoisMetaService } from '../../../src/app/shared/whois-meta.service';
import { WhoisResourcesService } from '../../../src/app/shared/whois-resources.service';
import { IAttributeModel } from '../../../src/app/shared/whois-response-type.model';
import { LinkService } from '../../../src/app/updatesweb/link.service';
import { MessageStoreService } from '../../../src/app/updatesweb/message-store.service';
import { MntnerService } from '../../../src/app/updatesweb/mntner.service';
import { ScreenLogicInterceptorService } from '../../../src/app/updatesweb/screen-logic-interceptor.service';
import { UpdatesWebModule } from '../../../src/app/updatesweb/updateweb.module';

describe('ScreenLogicInterceptorService InetNum', () => {
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
                    useValue: { containsAbuseC: (attributes: any) => attributes, addAbuseC: (attributes: any) => attributes },
                },
                { provide: MntnerService, useValue: MockMntnerService },
                { provide: Router, useValue: { navigate: () => {}, events: of() } },
            ],
        });
        interceptor = TestBed.inject(ScreenLogicInterceptorService);
        whoisResourcesService = TestBed.inject(WhoisResourcesService);
        whoisMetaService = TestBed.inject(WhoisMetaService);
    });

    it('should disable org attribute from inetnum when status is ASSIGNED PI', () => {
        let inetNumSubject = _wrap('inetnum', inetNumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inetNumSubject, 'status', 'ASSIGNED PI');

        const attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inetnum', inetNumSubject);

        const orgAttr = whoisResourcesService.getSingleAttributeOnName(attributes, 'org');
        expect(orgAttr.$$meta.$$disable).toBeTruthy();
    });

    it('should not remove sponsoring org from inetnum addable attributes when status is LEGACY', () => {
        let inetNumSubject = _wrap('inetnum', inetNumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inetNumSubject, 'status', 'LEGACY');

        const addableAttributes = _wrap('inetnum', whoisResourcesService.getAddableAttributes(inetNumSubject, 'inetnum', inetNumSubject));

        const filteredAddableAttributes = interceptor.beforeAddAttribute('Modify', 'RIPE', 'inetnum', inetNumSubject, addableAttributes);

        const sponsoringOrgAttr = whoisResourcesService.getSingleAttributeOnName(filteredAddableAttributes, 'sponsoring-org');
        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it('should not remove sponsoring org from inetnum addable attributes when status is ASSIGNED-PI', () => {
        let inetNumSubject = _wrap('inetnum', inetNumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inetNumSubject, 'status', 'ASSIGNED PI');

        const addableAttributes = _wrap('inetnum', whoisResourcesService.getAddableAttributes(inetNumSubject, 'inetnum', inetNumSubject));

        const filteredAddableAttributes = interceptor.beforeAddAttribute('Modify', 'RIPE', 'inetnum', inetNumSubject, addableAttributes);

        const sponsoringOrgAttr = whoisResourcesService.getSingleAttributeOnName(filteredAddableAttributes, 'sponsoring-org');
        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it('should not remove sponsoring org from inetnum addable attributes when status is ASSIGNED-ANYCAST', () => {
        let inetNumSubject = _wrap('inetnum', inetNumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inetNumSubject, 'status', 'ASSIGNED ANYCAST');

        const addableAttributes = _wrap('inetnum', whoisResourcesService.getAddableAttributes(inetNumSubject, 'inetnum', inetNumSubject));

        const filteredAddableAttributes = interceptor.beforeAddAttribute('Modify', 'RIPE', 'inetnum', inetNumSubject, addableAttributes);

        const sponsoringOrgAttr = whoisResourcesService.getSingleAttributeOnName(filteredAddableAttributes, 'sponsoring-org');
        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it('should remove sponsoring org from inetnum addable attributes when status is not ASSIGNED-PI or ASSIGNED-ANYCAST', () => {
        let inetNumSubject = _wrap('inetnum', inetNumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inetNumSubject, 'status', 'ASSIGNED');

        const addableAttributes = _wrap('inetnum', whoisResourcesService.getAddableAttributes(inetNumSubject, 'inetnum', inetNumSubject));

        const filteredAddableAttributes = interceptor.beforeAddAttribute('Modify', 'RIPE', 'inetnum', inetNumSubject, addableAttributes);

        const sponsoringOrgAttr = whoisResourcesService.getSingleAttributeOnName(filteredAddableAttributes, 'sponsoring-org');
        expect(sponsoringOrgAttr).toBeUndefined();
    });

    it('should not remove sponsoring org from inetnum addable attributes when status is empty', () => {
        let inetNumSubject = _wrap('inetnum', inetNumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inetNumSubject, 'status', '');

        const addableAttributes = _wrap('inetnum', whoisResourcesService.getAddableAttributes(inetNumSubject, 'inetnum', inetNumSubject));

        const filteredAddableAttributes = interceptor.beforeAddAttribute('Modify', 'RIPE', 'inetnum', inetNumSubject, addableAttributes);

        const sponsoringOrgAttr = whoisResourcesService.getSingleAttributeOnName(filteredAddableAttributes, 'sponsoring-org');
        expect(sponsoringOrgAttr).not.toBeUndefined();
    });

    it('should disable mnt-domains with ripe maintainers on modify', () => {
        let inetNumSubject = _wrap('inetnum', inetNumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inetNumSubject, 'mnt-domains', 'RIPE-NCC-HM-MNT');

        const attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inetnum', inetNumSubject);

        const mntDomains = whoisResourcesService.getSingleAttributeOnName(attributes, 'mnt-domains');
        expect(mntDomains.$$meta.$$disable).toBeTruthy();
    });

    it('should NOT disable mnt-domains with non-ripe maintainers on modify', () => {
        let inetNumSubject = _wrap('inetnum', inetNumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inetNumSubject, 'mnt-domains', 'NON-RIPE-MNT');

        const attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inetnum', inetNumSubject);

        const mntDomains = whoisResourcesService.getSingleAttributeOnName(attributes, 'mnt-domains');
        expect(mntDomains.$$meta.$$disable).toBeFalsy();
    });

    it('should disable mnt-lower with ripe maintainers on modify', () => {
        let inetNumSubject = _wrap('inetnum', inetNumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inetNumSubject, 'mnt-lower', 'RIPE-NCC-HM-MNT');

        const attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inetnum', inetNumSubject);

        const mntLower = whoisResourcesService.getSingleAttributeOnName(attributes, 'mnt-lower');
        expect(mntLower.$$meta.$$disable).toBeTruthy();
    });

    it('should NOT disable mnt-lower with non-ripe maintainers on modify', () => {
        let inetNumSubject = _wrap('inetnum', inetNumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inetNumSubject, 'mnt-lower', 'NON-RIPE-MNT');

        const attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inetnum', inetNumSubject);

        const mntLower = whoisResourcesService.getSingleAttributeOnName(attributes, 'mnt-lower');
        expect(mntLower.$$meta.$$disable).toBeFalsy();
    });

    it('should disable mnt-routes with ripe maintainers on modify', () => {
        let inetNumSubject = _wrap('inetnum', inetNumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inetNumSubject, 'mnt-routes', 'RIPE-NCC-HM-MNT');

        const attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inetnum', inetNumSubject);

        const mntLower = whoisResourcesService.getSingleAttributeOnName(attributes, 'mnt-routes');
        expect(mntLower.$$meta.$$disable).toBeTruthy();
    });

    it('should NOT disable mnt-routes with non-ripe maintainers on modify', () => {
        let inetNumSubject = _wrap('inetnum', inetNumAttributes);
        whoisResourcesService.setSingleAttributeOnName(inetNumSubject, 'mnt-routes', 'NON-RIPE-MNT');

        const attributes = interceptor.beforeEdit('Modify', 'RIPE', 'inetnum', inetNumSubject);

        const mntLower = whoisResourcesService.getSingleAttributeOnName(attributes, 'mnt-routes');
        expect(mntLower.$$meta.$$disable).toBeFalsy();
    });

    const _wrap = (type: string, attrs: IAttributeModel[]) => {
        return whoisResourcesService.wrapAndEnrichAttributes(type, attrs);
    };

    const inetNumAttributes = [
        {
            name: 'inetnum',
            value: '192.0.0.0 - 192.0.0.255',
        },
        {
            name: 'netname',
            value: 'FICIX-V6-20020201',
        },
        {
            name: 'descr',
            value: 'Finnish Communication and Internet Exchange - FICIX ryy',
        },
        {
            name: 'country',
            value: 'FI',
        },
        {
            name: 'org',
            value: 'ORG-Fr4-RIPE',
        },
        {
            name: 'admin-c',
            value: 'JM289-RIPE',
        },
        {
            name: 'tech-c',
            value: 'JM289-RIPE',
        },
        {
            name: 'mnt-by',
            value: 'RIPE-NCC-END-MNT',
        },
        {
            name: 'mnt-by',
            value: 'jome-mnt',
        },
        {
            name: 'mnt-domains',
            value: 'jome-mnt',
        },
        {
            name: 'mnt-lower',
            value: 'jome-mnt',
        },
        {
            name: 'mnt-routes',
            value: 'jome-mnt',
        },
        {
            name: 'notify',
            value: '***@ficix.fi',
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
