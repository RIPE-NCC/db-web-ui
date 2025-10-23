import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CoreModule } from '../../../src/app/core/core.module';
import { FullTextResponseService } from '../../../src/app/fulltextsearch/full-text-response.service';
import { FullTextResultSummaryComponent } from '../../../src/app/fulltextsearch/full-text-result-summary.component';
import { FullTextSearchComponent } from '../../../src/app/fulltextsearch/full-text-search.component';
import { FullTextSearchService } from '../../../src/app/fulltextsearch/full-text-search.service';
import { PropertiesService } from '../../../src/app/properties.service';
import { SharedModule } from '../../../src/app/shared/shared.module';
import { WhoisMetaService } from '../../../src/app/shared/whois-meta.service';

describe('FullTextSearchComponent', () => {
    let component: FullTextSearchComponent;
    let fixture: ComponentFixture<FullTextSearchComponent>;
    let fullTextSearchService: any;

    beforeEach(() => {
        fullTextSearchService = jasmine.createSpyObj('FullTextSearchService', ['doSearch']);
        TestBed.configureTestingModule({
            imports: [SharedModule, CoreModule, RouterTestingModule, FullTextSearchComponent, FullTextResultSummaryComponent],
            providers: [
                { provide: FullTextSearchService, useValue: fullTextSearchService },
                FullTextResponseService,
                WhoisMetaService,
                PropertiesService,
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FullTextSearchComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should support addition and removal of object types and attributes', () => {
        const expectedObjectTypes = [
            'as-block',
            'as-set',
            'aut-num',
            'domain',
            'filter-set',
            'inet-rtr',
            'inet6num',
            'inetnum',
            'irt',
            'key-cert',
            'mntner',
            'organisation',
            'peering-set',
            'person',
            'poem',
            'poetic-form',
            'role',
            'route',
            'route-set',
            'route6',
            'rtr-set',
        ];

        fixture.detectChanges();
        expect(expectedObjectTypes.length).toEqual(component.objectTypes.length);

        for (let i = 0; i < expectedObjectTypes.length; i++) {
            expect(expectedObjectTypes[i]).toEqual(component.objectTypes[i]);
        }

        fullTextSearchService.doSearch.and.returnValue(of(responseEtchMnt));
        expect(component.selectedObjectTypes.length).toEqual(0);
        component.toggleSearchMode();
        expect(component.advancedSearch).toEqual(true);
        expect(component.queryHash()).toEqual('alltrue');

        component.addObjectToFilter('inetnum');
        expect(component.selectedObjectTypes.length).toEqual(1);
        component.addObjectToFilter('inetnum'); // Still 1 coz it's already added
        expect(component.selectedObjectTypes.length).toEqual(1);
        // without source attribute
        expect(component.selectableAttributes.length).toEqual(24);
        expect(component.queryHash()).toEqual('alltrueinetnum');

        component.selectAll();
        expect(component.selectedObjectTypes.length).toEqual(21);
        expect(component.selectableAttributes.length).toEqual(101);
        expect(component.queryHash()).toEqual(
            'alltrueas-blockas-setaut-numdomainfilter-setinet-rtrinet6numinetnumirtkey-certmntnerorganisationpeering-setpersonpoempoetic-formrolerouteroute-setroute6rtr-set',
        );

        component.selectNone();
        expect(component.selectedObjectTypes.length).toEqual(0);
        expect(component.selectableAttributes.length).toEqual(0);
        expect(component.selectedAttrs.length).toEqual(0);
        expect(component.queryHash()).toEqual('alltrue');

        component.addObjectToFilter('inetnum');
        component.selectedAttrs = ['country'];
        expect(component.queryHash()).toEqual('alltrueinetnumcountry');
    });

    it('should be able to search and process the result', () => {
        fixture.detectChanges();
        fullTextSearchService.doSearch.and.returnValue(of(responseEtchMnt));
        component.searchClicked();
        fixture.detectChanges();
        expect(component.alertsService.alerts.warnings[0].plainText).toEqual('Empty query - please specify at least one character');
        component.ftquery = 'etch-mnt';
        component.searchClicked();
        fixture.detectChanges();
        expect(component.alertsService.alerts.warnings.length > 0).toBeFalsy();
        expect(component.numResults).toEqual(7);
        component.searchClicked();
        fixture.detectChanges();
        expect(component.alertsService.alerts.warnings.length > 0).toBeFalsy();
        expect(component.numResults).toEqual(7);
        fullTextSearchService.doSearch.and.returnValue(of(responseEmpty));
        component.searchClicked();
        fixture.detectChanges();
        expect(component.alertsService.alerts.warnings.length > 0).toBeTruthy();
        expect(component.numResults).toEqual(0);
    });
});

const responseEmpty: any = {
    result: {
        name: 'response',
        numFound: 0,
        start: 0,
        docs: [],
    },
    lsts: [
        {
            lst: {
                name: 'responseHeader',
                ints: [
                    {
                        int: {
                            name: 'status',
                            value: '0',
                        },
                    },
                    {
                        int: {
                            name: 'QTime',
                            value: '1824',
                        },
                    },
                ],
                strs: null,
                lsts: [
                    {
                        lst: {
                            name: 'params',
                            ints: null,
                            strs: [
                                {
                                    str: {
                                        name: 'q',
                                        value: '(lkjlkjlkjlkjlknkjnkjnkjnb)',
                                    },
                                },
                                {
                                    str: {
                                        name: 'rows',
                                        value: '10',
                                    },
                                },
                                {
                                    str: {
                                        name: 'start',
                                        value: '0',
                                    },
                                },
                                {
                                    str: {
                                        name: 'hl',
                                        value: 'true',
                                    },
                                },
                                {
                                    str: {
                                        name: 'hl.test.pre',
                                        value: '<b>',
                                    },
                                },
                                {
                                    str: {
                                        name: 'hl.test.post',
                                        value: '</b>',
                                    },
                                },
                                {
                                    str: {
                                        name: 'wt',
                                        value: 'json',
                                    },
                                },
                                {
                                    str: {
                                        name: 'facet',
                                        value: 'true',
                                    },
                                },
                            ],
                            lsts: null,
                            arrs: null,
                        },
                    },
                ],
                arrs: null,
            },
        },
        {
            lst: {
                name: 'highlighting',
                ints: null,
                strs: null,
                lsts: [],
                arrs: null,
            },
        },
        {
            lst: {
                name: 'facet_counts',
                ints: null,
                strs: null,
                lsts: [
                    {
                        lst: {
                            name: 'facet_fields',
                            ints: null,
                            strs: null,
                            lsts: [],
                            arrs: null,
                        },
                    },
                ],
                arrs: null,
            },
        },
    ],
};

const responseEtchMnt: any = {
    result: {
        name: 'response',
        numFound: 7,
        start: 0,
        docs: [
            {
                doc: {
                    strs: [
                        {
                            str: {
                                name: 'primary-key',
                                value: '15319480',
                            },
                        },
                        {
                            str: {
                                name: 'object-type',
                                value: 'inetnum',
                            },
                        },
                        {
                            str: {
                                name: 'lookup-key',
                                value: '185.169.96.0 - 185.169.99.255',
                            },
                        },
                        {
                            str: {
                                name: 'inetnum',
                                value: '185.169.96.0 - 185.169.99.255',
                            },
                        },
                        {
                            str: {
                                name: 'netname',
                                value: 'NETNAME-TST-20160923',
                            },
                        },
                        {
                            str: {
                                name: 'country',
                                value: 'PT',
                            },
                        },
                        {
                            str: {
                                name: 'org',
                                value: 'ORG-TEST36-RIPE',
                            },
                        },
                        {
                            str: {
                                name: 'admin-c',
                                value: 'SR11550-RIPE',
                            },
                        },
                        {
                            str: {
                                name: 'tech-c',
                                value: 'SR11550-RIPE',
                            },
                        },
                        {
                            str: {
                                name: 'status',
                                value: 'ALLOCATED PA',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'RIPE-NCC-HM-MNT',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'TEST27-MNT',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'etch-mnt',
                            },
                        },
                        {
                            str: {
                                name: 'created',
                                value: '2016-10-11T11:14:23Z',
                            },
                        },
                        {
                            str: {
                                name: 'last-modified',
                                value: '2016-10-24T15:33:06Z',
                            },
                        },
                    ],
                },
            },
            {
                doc: {
                    strs: [
                        {
                            str: {
                                name: 'primary-key',
                                value: '3386406',
                            },
                        },
                        {
                            str: {
                                name: 'object-type',
                                value: 'inetnum',
                            },
                        },
                        {
                            str: {
                                name: 'lookup-key',
                                value: '194.171.2.0 - 194.171.2.255',
                            },
                        },
                        {
                            str: {
                                name: 'inetnum',
                                value: '194.171.2.0 - 194.171.2.255',
                            },
                        },
                        {
                            str: {
                                name: 'netname',
                                value: 'NETNAME-TEST05',
                            },
                        },
                        {
                            str: {
                                name: 'descr',
                                value: 'SUPERTESTORG LAN at RU',
                            },
                        },
                        {
                            str: {
                                name: 'country',
                                value: 'NL',
                            },
                        },
                        {
                            str: {
                                name: 'admin-c',
                                value: 'TSTADMINC-RIPE',
                            },
                        },
                        {
                            str: {
                                name: 'tech-c',
                                value: 'TSTADMINC-RIPE',
                            },
                        },
                        {
                            str: {
                                name: 'status',
                                value: 'ASSIGNED PA',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'etch-mnt',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'TST01-MNT',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-irt',
                                value: 'TSTIRT-MNT',
                            },
                        },
                        {
                            str: {
                                name: 'created',
                                value: '2005-01-17T10:51:33Z',
                            },
                        },
                        {
                            str: {
                                name: 'last-modified',
                                value: '2017-06-07T10:51:43Z',
                            },
                        },
                    ],
                },
            },
            {
                doc: {
                    strs: [
                        {
                            str: {
                                name: 'primary-key',
                                value: '15319374',
                            },
                        },
                        {
                            str: {
                                name: 'object-type',
                                value: 'mntner',
                            },
                        },
                        {
                            str: {
                                name: 'lookup-key',
                                value: 'etch-mnt',
                            },
                        },
                        {
                            str: {
                                name: 'mntner',
                                value: 'etch-mnt',
                            },
                        },
                        {
                            str: {
                                name: 'admin-c',
                                value: 'TSTADMINC1-RIPE',
                            },
                        },
                        {
                            str: {
                                name: 'upd-to',
                                value: 'petchells@ripe.net',
                            },
                        },
                        {
                            str: {
                                name: 'auth',
                                value: 'SSO',
                            },
                        },
                        {
                            str: {
                                name: 'auth',
                                value: 'MD5-PW',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'etch-mnt',
                            },
                        },
                        {
                            str: {
                                name: 'created',
                                value: '2016-06-29T11:37:40Z',
                            },
                        },
                        {
                            str: {
                                name: 'last-modified',
                                value: '2016-10-07T12:12:53Z',
                            },
                        },
                    ],
                },
            },
            {
                doc: {
                    strs: [
                        {
                            str: {
                                name: 'primary-key',
                                value: '15319375',
                            },
                        },
                        {
                            str: {
                                name: 'object-type',
                                value: 'person',
                            },
                        },
                        {
                            str: {
                                name: 'lookup-key',
                                value: 'TSTADMINC1-RIPE',
                            },
                        },
                        {
                            str: {
                                name: 'person',
                                value: 'Paul Etchells',
                            },
                        },
                        {
                            str: {
                                name: 'address',
                                value: 'singel, amsterdam',
                            },
                        },
                        {
                            str: {
                                name: 'phone',
                                value: '+316 1234 5678',
                            },
                        },
                        {
                            str: {
                                name: 'nic-hdl',
                                value: 'TSTADMINC1-RIPE',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'etch-mnt',
                            },
                        },
                        {
                            str: {
                                name: 'created',
                                value: '2016-06-29T11:37:41Z',
                            },
                        },
                        {
                            str: {
                                name: 'last-modified',
                                value: '2016-06-29T11:37:41Z',
                            },
                        },
                    ],
                },
            },
            {
                doc: {
                    strs: [
                        {
                            str: {
                                name: 'primary-key',
                                value: '15323016',
                            },
                        },
                        {
                            str: {
                                name: 'object-type',
                                value: 'person',
                            },
                        },
                        {
                            str: {
                                name: 'lookup-key',
                                value: 'TST2-RIPE',
                            },
                        },
                        {
                            str: {
                                name: 'person',
                                value: 'Penelope Tester',
                            },
                        },
                        {
                            str: {
                                name: 'address',
                                value: 'Test address',
                            },
                        },
                        {
                            str: {
                                name: 'phone',
                                value: '+123',
                            },
                        },
                        {
                            str: {
                                name: 'nic-hdl',
                                value: 'TST2-RIPE',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'SHRYANE-MNT',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'xxx',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'TST3-RIPE',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'TEST17-MNT',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'etchells-mnt',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'etch-mnt',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'TST4-MNT',
                            },
                        },
                        {
                            str: {
                                name: 'created',
                                value: '2017-10-13T13:54:43Z',
                            },
                        },
                        {
                            str: {
                                name: 'last-modified',
                                value: '2017-10-17T13:11:18Z',
                            },
                        },
                    ],
                },
            },
            {
                doc: {
                    strs: [
                        {
                            str: {
                                name: 'primary-key',
                                value: '15323018',
                            },
                        },
                        {
                            str: {
                                name: 'object-type',
                                value: 'person',
                            },
                        },
                        {
                            str: {
                                name: 'lookup-key',
                                value: 'TST5-RIPE',
                            },
                        },
                        {
                            str: {
                                name: 'person',
                                value: 'John Tester',
                            },
                        },
                        {
                            str: {
                                name: 'address',
                                value: 'Hollywood',
                            },
                        },
                        {
                            str: {
                                name: 'phone',
                                value: '+123',
                            },
                        },
                        {
                            str: {
                                name: 'nic-hdl',
                                value: 'TST5-RIPE',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'SHRYANE-MNT',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'xxx',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'TST3-RIPE',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'TEST17-MNT',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'etchells-mnt',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'etch-mnt',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'TST4-MNT',
                            },
                        },
                        {
                            str: {
                                name: 'created',
                                value: '2017-10-13T14:05:33Z',
                            },
                        },
                        {
                            str: {
                                name: 'last-modified',
                                value: '2017-10-13T14:05:33Z',
                            },
                        },
                    ],
                },
            },
            {
                doc: {
                    strs: [
                        {
                            str: {
                                name: 'primary-key',
                                value: '15323015',
                            },
                        },
                        {
                            str: {
                                name: 'object-type',
                                value: 'person',
                            },
                        },
                        {
                            str: {
                                name: 'lookup-key',
                                value: 'TST6-RIPE',
                            },
                        },
                        {
                            str: {
                                name: 'person',
                                value: 'Peter Perfect',
                            },
                        },
                        {
                            str: {
                                name: 'address',
                                value: 'Whacky Races 7',
                            },
                        },
                        {
                            str: {
                                name: 'phone',
                                value: '+123',
                            },
                        },
                        {
                            str: {
                                name: 'nic-hdl',
                                value: 'TST6-RIPE',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'SHRYANE-MNT',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'xxx',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'TST3-RIPE',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'TEST17-MNT',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'etchells-mnt',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'etch-mnt',
                            },
                        },
                        {
                            str: {
                                name: 'mnt-by',
                                value: 'TST4-MNT',
                            },
                        },
                        {
                            str: {
                                name: 'created',
                                value: '2017-10-13T13:54:00Z',
                            },
                        },
                        {
                            str: {
                                name: 'last-modified',
                                value: '2017-10-17T13:18:35Z',
                            },
                        },
                    ],
                },
            },
        ],
    },
    lsts: [
        {
            lst: {
                name: 'responseHeader',
                ints: [
                    {
                        int: {
                            name: 'status',
                            value: '0',
                        },
                    },
                    {
                        int: {
                            name: 'QTime',
                            value: '45',
                        },
                    },
                ],
                strs: null,
                lsts: [
                    {
                        lst: {
                            name: 'params',
                            ints: null,
                            strs: [
                                {
                                    str: {
                                        name: 'q',
                                        value: '(etch-mnt)',
                                    },
                                },
                                {
                                    str: {
                                        name: 'rows',
                                        value: '10',
                                    },
                                },
                                {
                                    str: {
                                        name: 'start',
                                        value: '0',
                                    },
                                },
                                {
                                    str: {
                                        name: 'hl',
                                        value: 'true',
                                    },
                                },
                                {
                                    str: {
                                        name: 'hl.test.pre',
                                        value: '<b>',
                                    },
                                },
                                {
                                    str: {
                                        name: 'hl.test.post',
                                        value: '</b>',
                                    },
                                },
                                {
                                    str: {
                                        name: 'wt',
                                        value: 'json',
                                    },
                                },
                                {
                                    str: {
                                        name: 'facet',
                                        value: 'true',
                                    },
                                },
                            ],
                            lsts: null,
                            arrs: null,
                        },
                    },
                ],
                arrs: null,
            },
        },
        {
            lst: {
                name: 'highlighting',
                ints: null,
                strs: null,
                lsts: [
                    {
                        lst: {
                            name: '15319480',
                            ints: null,
                            strs: null,
                            lsts: null,
                            arrs: [
                                {
                                    arr: {
                                        name: 'mnt-by',
                                        str: {
                                            name: null,
                                            value: '<b>etch-mnt</b>',
                                        },
                                    },
                                },
                            ],
                        },
                    },
                    {
                        lst: {
                            name: '3386406',
                            ints: null,
                            strs: null,
                            lsts: null,
                            arrs: [
                                {
                                    arr: {
                                        name: 'mnt-by',
                                        str: {
                                            name: null,
                                            value: '<b>etch-mnt</b>',
                                        },
                                    },
                                },
                            ],
                        },
                    },
                    {
                        lst: {
                            name: '15319374',
                            ints: null,
                            strs: null,
                            lsts: null,
                            arrs: [
                                {
                                    arr: {
                                        name: 'lookup-key',
                                        str: {
                                            name: null,
                                            value: '<b>etch-mnt</b>',
                                        },
                                    },
                                },
                                {
                                    arr: {
                                        name: 'mntner',
                                        str: {
                                            name: null,
                                            value: '<b>etch-mnt</b>',
                                        },
                                    },
                                },
                                {
                                    arr: {
                                        name: 'mnt-by',
                                        str: {
                                            name: null,
                                            value: '<b>etch-mnt</b>',
                                        },
                                    },
                                },
                            ],
                        },
                    },
                    {
                        lst: {
                            name: '15319375',
                            ints: null,
                            strs: null,
                            lsts: null,
                            arrs: [
                                {
                                    arr: {
                                        name: 'mnt-by',
                                        str: {
                                            name: null,
                                            value: '<b>etch-mnt</b>',
                                        },
                                    },
                                },
                            ],
                        },
                    },
                    {
                        lst: {
                            name: '15323016',
                            ints: null,
                            strs: null,
                            lsts: null,
                            arrs: [
                                {
                                    arr: {
                                        name: 'mnt-by',
                                        str: {
                                            name: null,
                                            value: '<b>etch-mnt</b>',
                                        },
                                    },
                                },
                            ],
                        },
                    },
                    {
                        lst: {
                            name: '15323018',
                            ints: null,
                            strs: null,
                            lsts: null,
                            arrs: [
                                {
                                    arr: {
                                        name: 'mnt-by',
                                        str: {
                                            name: null,
                                            value: '<b>etch-mnt</b>',
                                        },
                                    },
                                },
                            ],
                        },
                    },
                    {
                        lst: {
                            name: '15323015',
                            ints: null,
                            strs: null,
                            lsts: null,
                            arrs: [
                                {
                                    arr: {
                                        name: 'mnt-by',
                                        str: {
                                            name: null,
                                            value: '<b>etch-mnt</b>',
                                        },
                                    },
                                },
                            ],
                        },
                    },
                ],
                arrs: null,
            },
        },
        {
            lst: {
                name: 'facet_counts',
                ints: null,
                strs: null,
                lsts: [
                    {
                        lst: {
                            name: 'facet_fields',
                            ints: null,
                            strs: null,
                            lsts: [
                                {
                                    lst: {
                                        name: 'object-type',
                                        ints: [
                                            {
                                                int: {
                                                    name: 'person',
                                                    value: '4',
                                                },
                                            },
                                            {
                                                int: {
                                                    name: 'inetnum',
                                                    value: '2',
                                                },
                                            },
                                            {
                                                int: {
                                                    name: 'mntner',
                                                    value: '1',
                                                },
                                            },
                                        ],
                                        strs: null,
                                        lsts: null,
                                        arrs: null,
                                    },
                                },
                            ],
                            arrs: null,
                        },
                    },
                ],
                arrs: null,
            },
        },
    ],
};
