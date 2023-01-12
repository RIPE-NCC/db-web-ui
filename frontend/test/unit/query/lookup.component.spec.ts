import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { PropertiesService } from '../../../src/app/properties.service';
import { LookupComponent } from '../../../src/app/query/lookup.component';
import { SharedModule } from '../../../src/app/shared/shared.module';
import { UserInfoService } from '../../../src/app/userinfo/user-info.service';
import { WhoisObjectViewerComponent } from '../../../src/app/whois-object/whois-object-viewer.component';

describe('LookupComponent', () => {
    let component: LookupComponent;
    let fixture: ComponentFixture<LookupComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SharedModule, HttpClientTestingModule, RouterTestingModule],
            declarations: [LookupComponent, WhoisObjectViewerComponent],
            providers: [
                PropertiesService,
                {
                    provide: UserInfoService,
                    useValue: {
                        isLogedIn: () => true,
                        userLoggedIn$: of(),
                    },
                },
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LookupComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('should shows an object', () => {
        it('with abuse headers and highlighted RIPE attributes', () => {
            component.whoisObject = mockResponse.singleResult.objects.object[0];
            component.ngOnChanges();
            expect(component.abuseContactFound).toEqual(false);
            expect(component.header).toEqual(true);
            expect(component.resourceHolderFound).toEqual(true);
        });

        it('with abuse headers but with suspected org-id', () => {
            component.whoisObject = mockAbuseCResponse1.objects.object[0];
            component.ngOnChanges();
            expect(component.header).toEqual(true);
            expect(component.abuseContactSuspected).toEqual(true);
            expect(component.whoisObject['abuse-contact']['org-id'] !== '').toEqual(true);
        });

        it('with abuse headers but without suspected org-id', () => {
            mockAbuseCResponse2.objects.object[0]['abuse-contact']['org-id'] = '';
            component.whoisObject = mockAbuseCResponse2.objects.object[0];
            component.ngOnChanges();
            expect(component.abuseContactFound).toEqual(true);
            expect(component.header).toEqual(true);
            expect(component.abuseContactSuspected).toEqual(true);
            expect(component.whoisObject['abuse-contact']['org-id'] !== '').toEqual(false);
        });
    });

    const mockResponse = {
        singleResult: {
            service: {
                name: 'search',
            },
            parameters: {
                'inverse-lookup': {},
                'type-filters': {
                    'type-filter': [
                        {
                            id: 'INETNUM',
                        },
                    ],
                },
                flags: {
                    flag: [
                        {
                            value: 'no-referenced',
                        },
                        {
                            value: 'no-filtering',
                        },
                    ],
                },
                'query-strings': {
                    'query-string': [
                        {
                            value: '193.0.0.0/26',
                        },
                    ],
                },
                sources: {},
            },
            objects: {
                object: [
                    {
                        type: 'inetnum',
                        link: {
                            type: 'locator',
                            href: 'http://rest-prepdev.db.ripe.net/ripe/inetnum/193.0.0.0 - 193.0.0.63',
                        },
                        source: {
                            id: 'ripe',
                        },
                        'primary-key': {
                            attribute: [
                                {
                                    name: 'inetnum',
                                    value: '193.0.0.0 - 193.0.0.63',
                                },
                            ],
                        },
                        attributes: {
                            attribute: [
                                {
                                    name: 'inetnum',
                                    value: '193.0.0.0 - 193.0.0.63',
                                    managed: true,
                                },
                                {
                                    name: 'netname',
                                    value: 'NON-RIPE-NCC-MANAGED-ADDRESS-BLOCK',
                                    managed: true,
                                },
                                {
                                    name: 'descr',
                                    value: 'IPv4 address block not managed by the RIPE NCC',
                                },
                                {
                                    name: 'remarks',
                                    value: '------------------------------------------------------',
                                },
                                {
                                    name: 'remarks',
                                    value: '',
                                },
                                {
                                    name: 'remarks',
                                    value: 'You can find the whois server to query, or the',
                                },
                                {
                                    name: 'remarks',
                                    value: 'IANA registry to query on this web page:',
                                },
                                {
                                    name: 'remarks',
                                    value: 'http://www.iana.org/assignments/ipv4-address-space',
                                },
                                {
                                    name: 'remarks',
                                    value: '',
                                },
                                {
                                    name: 'remarks',
                                    value: "You can access databases of other RIR's at:",
                                },
                                {
                                    name: 'remarks',
                                    value: '',
                                },
                                {
                                    name: 'remarks',
                                    value: 'AFRINIC (Africa)',
                                },
                                {
                                    name: 'remarks',
                                    value: 'http://www.afrinic.net/ whois.afrinic.net',
                                },
                                {
                                    name: 'remarks',
                                    value: '',
                                },
                                {
                                    name: 'remarks',
                                    value: 'APNIC (Asia Pacific)',
                                },
                                {
                                    name: 'remarks',
                                    value: 'http://www.apnic.net/ whois.apnic.net',
                                },
                                {
                                    name: 'remarks',
                                    value: '',
                                },
                                {
                                    name: 'remarks',
                                    value: 'ARIN (Northern America)',
                                },
                                {
                                    name: 'remarks',
                                    value: 'http://www.arin.net/ whois.arin.net',
                                },
                                {
                                    name: 'remarks',
                                    value: '',
                                },
                                {
                                    name: 'remarks',
                                    value: 'LACNIC (Latin America and the Carribean)',
                                },
                                {
                                    name: 'remarks',
                                    value: 'http://www.lacnic.net/ whois.lacnic.net',
                                },
                                {
                                    name: 'remarks',
                                    value: '',
                                },
                                {
                                    name: 'remarks',
                                    value: '------------------------------------------------------',
                                },
                                {
                                    name: 'country',
                                    value: 'EU',
                                    comment: 'Country is really world wide',
                                },
                                {
                                    link: {
                                        type: 'locator',
                                        href: 'http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-IANA1-RIPE',
                                    },
                                    name: 'org',
                                    value: 'ORG-IANA1-RIPE',
                                    'referenced-type': 'organisation',
                                    managed: true,
                                },
                                {
                                    link: {
                                        type: 'locator',
                                        href: 'http://rest-prepdev.db.ripe.net/ripe/role/IANA1-RIPE',
                                    },
                                    name: 'admin-c',
                                    value: 'IANA1-RIPE',
                                    'referenced-type': 'role',
                                },
                                {
                                    link: {
                                        type: 'locator',
                                        href: 'http://rest-prepdev.db.ripe.net/ripe/role/IANA1-RIPE',
                                    },
                                    name: 'tech-c',
                                    value: 'IANA1-RIPE',
                                    'referenced-type': 'role',
                                },
                                {
                                    name: 'status',
                                    value: 'ALLOCATED UNSPECIFIED',
                                    managed: true,
                                },
                                {
                                    link: {
                                        type: 'locator',
                                        href: 'http://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-HM-MNT',
                                    },
                                    name: 'mnt-by',
                                    value: 'RIPE-NCC-HM-MNT',
                                    'referenced-type': 'mntner',
                                    managed: true,
                                },
                                {
                                    link: {
                                        type: 'locator',
                                        href: 'http://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-HM-MNT',
                                    },
                                    name: 'mnt-lower',
                                    value: 'RIPE-NCC-HM-MNT',
                                    'referenced-type': 'mntner',
                                },
                                {
                                    link: {
                                        type: 'locator',
                                        href: 'http://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-RPSL-MNT',
                                    },
                                    name: 'mnt-routes',
                                    value: 'RIPE-NCC-RPSL-MNT',
                                    'referenced-type': 'mntner',
                                },
                                {
                                    name: 'created',
                                    value: '2016-04-25T13:00:50Z',
                                },
                                {
                                    name: 'last-modified',
                                    value: '2016-04-25T13:00:50Z',
                                },
                                {
                                    name: 'source',
                                    value: 'RIPE',
                                    managed: true,
                                },
                            ],
                        },
                        'resource-holder': {
                            key: 'ORG-IANA1-RIPE',
                            name: 'Internet Assigned Numbers Authority',
                        },
                        managed: true,
                    },
                ],
            },
            'terms-and-conditions': {
                type: 'locator',
                href: '/docs/22.Terms-And-Conditions.html#introduction',
            },
        },
    };

    const mockAbuseCResponse1 = {
        objects: {
            object: [
                {
                    type: 'inetnum',
                    link: {
                        type: 'locator',
                        href: 'http://rest-prepdev.db.ripe.net/ripe/inetnum/24.132.74.0 - 24.132.77.255',
                    },
                    source: {
                        id: 'ripe',
                    },
                    'primary-key': {
                        attribute: [
                            {
                                name: 'inetnum',
                                value: '24.132.74.0 - 24.132.77.255',
                            },
                        ],
                    },
                    attributes: {
                        attribute: [
                            {
                                name: 'inetnum',
                                value: '24.132.74.0 - 24.132.77.255',
                            },
                            {
                                name: 'netname',
                                value: 'VODA-ZIGGO',
                            },
                            {
                                name: 'descr',
                                value: 'CPE Customers NL',
                            },
                            {
                                name: 'country',
                                value: 'NL',
                            },
                            {
                                link: {
                                    type: 'locator',
                                    href: 'http://rest-prepdev.db.ripe.net/ripe/role/LGI-RIPE',
                                },
                                name: 'admin-c',
                                value: 'LGI-RIPE',
                                'referenced-type': 'role',
                            },
                            {
                                link: {
                                    type: 'locator',
                                    href: 'http://rest-prepdev.db.ripe.net/ripe/role/LGI-RIPE',
                                },
                                name: 'tech-c',
                                value: 'LGI-RIPE',
                                'referenced-type': 'role',
                            },
                            {
                                name: 'status',
                                value: 'ASSIGNED PA',
                            },
                            {
                                name: 'remarks',
                                value: 'Contact abuse@ziggo.nl concerning criminal',
                            },
                            {
                                name: 'remarks',
                                value: 'activities like spam, hacks, portscans',
                            },
                            {
                                name: 'notify',
                                value: '***@chello.at',
                            },
                            {
                                link: {
                                    type: 'locator',
                                    href: 'http://rest-prepdev.db.ripe.net/ripe/mntner/ZIGGO-SERVICES-MNT',
                                },
                                name: 'mnt-by',
                                value: 'ZIGGO-SERVICES-MNT',
                                'referenced-type': 'mntner',
                            },
                            {
                                name: 'created',
                                value: '2008-12-02T10:26:51Z',
                            },
                            {
                                name: 'last-modified',
                                value: '2017-12-06T14:29:33Z',
                            },
                            {
                                name: 'source',
                                value: 'RIPE',
                            },
                        ],
                    },
                    tags: {
                        tag: [
                            {
                                id: 'RIPE-USER-RESOURCE',
                            },
                        ],
                    },
                    'resource-holder': {
                        key: 'ORG-CB6-RIPE',
                        name: 'Ziggo Services B.V.',
                    },
                    'abuse-contact': {
                        key: 'UNA7-RIPE',
                        email: 'abuse@ziggo.nl',
                        suspect: true,
                        'org-id': 'ORG-CB6-RIPE',
                    },
                    managed: false,
                },
            ],
        },
        'terms-and-conditions': {
            type: 'locator',
            href: '/docs/22.Terms-And-Conditions.html#introduction',
        },
    };

    const mockAbuseCResponse2 = {
        objects: {
            object: [
                {
                    type: 'inetnum',
                    link: {
                        type: 'locator',
                        href: 'http://rest-prepdev.db.ripe.net/ripe/inetnum/24.132.74.0 - 24.132.77.255',
                    },
                    source: {
                        id: 'ripe',
                    },
                    'primary-key': {
                        attribute: [
                            {
                                name: 'inetnum',
                                value: '24.132.74.0 - 24.132.77.255',
                            },
                        ],
                    },
                    attributes: {
                        attribute: [
                            {
                                name: 'inetnum',
                                value: '24.132.74.0 - 24.132.77.255',
                            },
                            {
                                name: 'netname',
                                value: 'VODA-ZIGGO',
                            },
                            {
                                name: 'descr',
                                value: 'CPE Customers NL',
                            },
                            {
                                name: 'country',
                                value: 'NL',
                            },
                            {
                                link: {
                                    type: 'locator',
                                    href: 'http://rest-prepdev.db.ripe.net/ripe/role/LGI-RIPE',
                                },
                                name: 'admin-c',
                                value: 'LGI-RIPE',
                                'referenced-type': 'role',
                            },
                            {
                                link: {
                                    type: 'locator',
                                    href: 'http://rest-prepdev.db.ripe.net/ripe/role/LGI-RIPE',
                                },
                                name: 'tech-c',
                                value: 'LGI-RIPE',
                                'referenced-type': 'role',
                            },
                            {
                                name: 'status',
                                value: 'ASSIGNED PA',
                            },
                            {
                                name: 'remarks',
                                value: 'Contact abuse@ziggo.nl concerning criminal',
                            },
                            {
                                name: 'remarks',
                                value: 'activities like spam, hacks, portscans',
                            },
                            {
                                name: 'notify',
                                value: '***@chello.at',
                            },
                            {
                                link: {
                                    type: 'locator',
                                    href: 'http://rest-prepdev.db.ripe.net/ripe/mntner/ZIGGO-SERVICES-MNT',
                                },
                                name: 'mnt-by',
                                value: 'ZIGGO-SERVICES-MNT',
                                'referenced-type': 'mntner',
                            },
                            {
                                name: 'created',
                                value: '2008-12-02T10:26:51Z',
                            },
                            {
                                name: 'last-modified',
                                value: '2017-12-06T14:29:33Z',
                            },
                            {
                                name: 'source',
                                value: 'RIPE',
                            },
                        ],
                    },
                    tags: {
                        tag: [
                            {
                                id: 'RIPE-USER-RESOURCE',
                            },
                        ],
                    },
                    'resource-holder': {
                        key: 'ORG-CB6-RIPE',
                        name: 'Ziggo Services B.V.',
                    },
                    'abuse-contact': {
                        key: 'UNA7-RIPE',
                        email: 'abuse@ziggo.nl',
                        suspect: true,
                        'org-id': 'ORG-CB6-RIPE',
                    },
                    managed: false,
                },
            ],
        },
        'terms-and-conditions': {
            type: 'locator',
            href: 'http://www.ripe.net/db/support/db-terms-conditions.pdf',
        },
    };
});
