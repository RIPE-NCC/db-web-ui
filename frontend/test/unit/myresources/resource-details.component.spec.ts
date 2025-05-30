import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgSelectModule } from '@ng-select/ng-select';
import * as _ from 'lodash';
import { CookieService } from 'ngx-cookie-service';
import { AttributeRendererComponent } from '../../../src/app/attribute/attribute-renderer.component';
import { AttributeReverseZonesComponent } from '../../../src/app/attribute/attribute-reverse-zones.component';
import { CoreModule } from '../../../src/app/core/core.module';
import { OrgDropDownSharedService } from '../../../src/app/dropdown/org-drop-down-shared.service';
import { AssociatedObjectsComponent } from '../../../src/app/myresources/associatedobjects/associated-objects.component';
import { HierarchySelectorComponent } from '../../../src/app/myresources/hierarchyselector/hierarchy-selector.component';
import { HierarchySelectorService } from '../../../src/app/myresources/hierarchyselector/hierarchy-selector.service';
import { IpAddressService } from '../../../src/app/myresources/ip-address.service';
import { IpUsageComponent } from '../../../src/app/myresources/ip-usage.component';
import { IpUsageService } from '../../../src/app/myresources/ip-usage.service';
import { MoreSpecificsComponent } from '../../../src/app/myresources/morespecifics/more-specifics.component';
import { MoreSpecificsService } from '../../../src/app/myresources/morespecifics/more-specifics.service';
import { RefreshComponent } from '../../../src/app/myresources/refresh/refresh.component';
import { ResourceStatusService } from '../../../src/app/myresources/resource-status.service';
import { ResourceDetailsComponent } from '../../../src/app/myresources/resourcedetails/resource-details.component';
import { ResourcesDataService } from '../../../src/app/myresources/resources-data.service';
import { PropertiesService } from '../../../src/app/properties.service';
import { FlagComponent } from '../../../src/app/shared/flag/flag.component';
import { SharedModule } from '../../../src/app/shared/shared.module';
import { RpslService } from '../../../src/app/updatestext/rpsl.service';
import { TextCommonsService } from '../../../src/app/updatestext/text-commons.service';
import { MntnerService } from '../../../src/app/updatesweb/mntner.service';
import { PreferenceService } from '../../../src/app/updatesweb/preference.service';
import { RestService } from '../../../src/app/updatesweb/rest.service';
import { UserInfoService } from '../../../src/app/userinfo/user-info.service';
import { MaintainersEditorComponent } from '../../../src/app/whois-object/maintainers-editor.component';
import { WhoisObjectEditorComponent } from '../../../src/app/whois-object/whois-object-editor.component';
import { WhoisObjectTextEditorComponent } from '../../../src/app/whois-object/whois-object-text-editor.component';
import { WhoisObjectViewerComponent } from '../../../src/app/whois-object/whois-object-viewer.component';

describe('ResourceDetailsComponent', () => {
    let component: ResourceDetailsComponent;
    let fixture: ComponentFixture<ResourceDetailsComponent>;
    let httpMock: HttpTestingController;

    let MockMntnerService = {
        isNccMntner: (mntnerKey: string) => {
            return _.includes(['RIPE-NCC-HM-MNT', 'RIPE-NCC-END-MNT', 'RIPE-NCC-LEGACY-MNT'], mntnerKey.toUpperCase());
        },
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                ResourceDetailsComponent,
                FlagComponent,
                HierarchySelectorComponent,
                IpUsageComponent,
                MoreSpecificsComponent,
                AssociatedObjectsComponent,
                WhoisObjectViewerComponent,
                WhoisObjectEditorComponent,
                WhoisObjectTextEditorComponent,
                MaintainersEditorComponent,
                AttributeRendererComponent,
                AttributeReverseZonesComponent,
                RefreshComponent,
            ],
            imports: [SharedModule, CoreModule, NgSelectModule, RouterTestingModule],
            providers: [
                IpAddressService,
                ResourceStatusService,
                HierarchySelectorService,
                { provide: MntnerService, useValue: MockMntnerService },
                RestService,
                MoreSpecificsService,
                PropertiesService,
                PreferenceService,
                TextCommonsService,
                RpslService,
                ResourcesDataService,
                OrgDropDownSharedService,
                IpUsageService,
                UserInfoService,
                CookieService,
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('on inetnum detail page', () => {
        beforeEach(() => {
            TestBed.inject(ActivatedRoute).snapshot.params = {
                objectType: 'inetnum',
                objectName: '212.58.224.0 - 212.58.255.255',
            };
            httpMock = TestBed.inject(HttpTestingController);
            fixture = TestBed.createComponent(ResourceDetailsComponent);
            component = fixture.componentInstance;
            httpMock
                .expectOne({
                    method: 'GET',
                    url: 'api/whois-internal/api/resources/inetnum/212.58.224.0 - 212.58.255.255',
                })
                .flush(INETNUM_MOCK);
            httpMock
                .expectOne({
                    method: 'GET',
                    url: 'api/ba-apps/resources/ORG-TEST01-RIPE/212.58.224.0 - 212.58.255.255',
                })
                .flush(MOCK_BA_RESPONSE);
        });

        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should show IRR and rDNS flag', () => {
            expect(component.flags.length).toEqual(6);
            expect(component.flags[4].colour).toEqual('green');
            expect(component.flags[4].text).toEqual('IRR');
            expect(component.flags[4].tooltip).toEqual('Related route(6) object(s) found');
            expect(component.flags[5].colour).toEqual('green');
            expect(component.flags[5].text).toEqual('rDNS');
            expect(component.flags[5].tooltip).toEqual('Related domain object(s) found');
        });
    });

    describe('on aut-num detail page', () => {
        beforeEach(() => {
            TestBed.inject(ActivatedRoute).snapshot.params = {
                objectType: 'aut-num',
                objectName: 'AS2818',
            };
            httpMock = TestBed.inject(HttpTestingController);
            fixture = TestBed.createComponent(ResourceDetailsComponent);
            component = fixture.componentInstance;
            httpMock
                .expectOne({
                    method: 'GET',
                    url: 'api/whois-internal/api/resources/aut-num/AS2818',
                })
                .flush(MOCK_AUTNUM);
            httpMock
                .expectOne({
                    method: 'GET',
                    url: 'api/ba-apps/resources/ORG-TEST01-RIPE/AS2818',
                })
                .flush('{"tickets":{"AS2818":[]}}');
        });

        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should show IRR and rDNS flag', async () => {
            expect(component.flags[2].colour).toEqual('green');
            expect(component.flags[2].text).toEqual('IRR');
            expect(component.flags[2].tooltip).toEqual('Related route(6) object(s) found');
        });
    });
});

const INETNUM_MOCK = {
    resources: [
        {
            resource: '212.58.224.0 - 212.58.255.255',
            status: 'ALLOCATED PA',
            type: 'inetnum',
            iRR: true,
            rDNS: true,
            netname: 'NETNAME-TEST20',
            usage: {
                total: 8192,
                used: 2592,
                blockSize: 32,
            },
        },
    ],
    totalNumberOfResources: 1,
    filteredSize: 1,
    pageSize: 1,
    object: {
        type: 'inetnum',
        link: {
            type: 'locator',
            href: 'https://rest-prepdev.db.ripe.net/ripe/inetnum/212.58.224.0 - 212.58.255.255',
        },
        source: {
            id: 'ripe',
        },
        'primary-key': {
            attribute: [
                {
                    name: 'inetnum',
                    value: '212.58.224.0 - 212.58.255.255',
                },
            ],
        },
        attributes: {
            attribute: [
                {
                    name: 'inetnum',
                    value: '212.58.224.0 - 212.58.255.255',
                },
                {
                    link: {
                        type: 'locator',
                        href: 'https://rest-prepdev.db.ripe.net/ripe/organisation/ORG-TEST01-RIPE',
                    },
                    name: 'org',
                    value: 'ORG-TEST01-RIPE',
                    'referenced-type': 'organisation',
                },
                {
                    name: 'netname',
                    value: 'NETNAME-TEST20',
                },
                {
                    name: 'country',
                    value: 'GB',
                },
                {
                    link: {
                        type: 'locator',
                        href: 'https://rest-prepdev.db.ripe.net/ripe/role/TEST01-RIPE',
                    },
                    name: 'admin-c',
                    value: 'TEST01-RIPE',
                    'referenced-type': 'role',
                },
                {
                    link: {
                        type: 'locator',
                        href: 'https://rest-prepdev.db.ripe.net/ripe/role/TEST01-RIPE',
                    },
                    name: 'tech-c',
                    value: 'TEST01-RIPE',
                    'referenced-type': 'role',
                },
                {
                    name: 'status',
                    value: 'ALLOCATED PA',
                },
                {
                    link: {
                        type: 'locator',
                        href: 'https://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-HM-MNT',
                    },
                    name: 'mnt-by',
                    value: 'RIPE-NCC-HM-MNT',
                    'referenced-type': 'mntner',
                },
                {
                    link: {
                        type: 'locator',
                        href: 'https://rest-prepdev.db.ripe.net/ripe/mntner/TEST01-MNT',
                    },
                    name: 'mnt-by',
                    value: 'TEST01-MNT',
                    'referenced-type': 'mntner',
                },
                {
                    link: {
                        type: 'locator',
                        href: 'https://rest-prepdev.db.ripe.net/ripe/mntner/TEST01-MNT',
                    },
                    name: 'mnt-routes',
                    value: 'TEST01-MNT',
                    'referenced-type': 'mntner',
                },
                {
                    name: 'created',
                    value: '2001-12-17T10:27:29Z',
                },
                {
                    name: 'last-modified',
                    value: '2017-03-01T18:09:38Z',
                },
                {
                    name: 'source',
                    value: 'RIPE',
                },
            ],
        },
    },
};
const MOCK_BA_RESPONSE = {
    tickets: {
        '212.58.224.0 - 212.58.255.255': [
            {
                number: 'NCC#1999097789',
                date: '1999-10-08',
                resource: '212.58.224.0/19',
            },
        ],
    },
};

const MOCK_AUTNUM = {
    resources: [
        {
            resource: 'AS2818',
            status: 'ASSIGNED',
            type: 'aut-num',
            orgName: 'ORG-TEST01-RIPE',
            iRR: true,
            rDNS: false,
            asname: 'TEST01',
        },
    ],
    totalNumberOfResources: 0,
    filteredSize: 0,
    pageSize: 1,
    object: {
        type: 'aut-num',
        link: {
            type: 'locator',
            href: 'https://rest-prepdev.db.ripe.net/ripe/aut-num/AS2818',
        },
        source: {
            id: 'ripe',
        },
        'primary-key': {
            attribute: [
                {
                    name: 'aut-num',
                    value: 'AS2818',
                },
            ],
        },
        attributes: {
            attribute: [
                {
                    name: 'aut-num',
                    value: 'AS2818',
                },
                {
                    link: {
                        type: 'locator',
                        href: 'https://rest-prepdev.db.ripe.net/ripe/organisation/ORG-TEST01-RIPE',
                    },
                    name: 'org',
                    value: 'ORG-TEST01-RIPE',
                    'referenced-type': 'organisation',
                },
                {
                    name: 'as-name',
                    value: 'TEST01',
                },
                {
                    name: 'descr',
                    value: 'TEST01 Internet Services',
                },
                {
                    name: 'import',
                    value: 'from AS42 action pref=100; accept AS-PCH',
                },
                {
                    name: 'import',
                    value: 'from AS286 action pref=100; accept AS-KPN',
                },
                {
                    name: 'export',
                    value: 'to AS42 announce AS-TEST01',
                },
                {
                    name: 'export',
                    value: 'to AS286 announce AS-TEST01',
                },
                {
                    name: 'default',
                    value: 'to AS9156 action pref=40; networks ANY',
                },
                {
                    link: {
                        type: 'locator',
                        href: 'https://rest-prepdev.db.ripe.net/ripe/role/TEST01-RIPE',
                    },
                    name: 'admin-c',
                    value: 'TEST01-RIPE',
                    'referenced-type': 'role',
                },
                {
                    link: {
                        type: 'locator',
                        href: 'https://rest-prepdev.db.ripe.net/ripe/role/TEST01-RIPE',
                    },
                    name: 'tech-c',
                    value: 'TEST01-RIPE',
                    'referenced-type': 'role',
                },
                {
                    name: 'status',
                    value: 'ASSIGNED',
                },
                {
                    link: {
                        type: 'locator',
                        href: 'https://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-END-MNT',
                    },
                    name: 'mnt-by',
                    value: 'RIPE-NCC-END-MNT',
                    'referenced-type': 'mntner',
                },
                {
                    link: {
                        type: 'locator',
                        href: 'https://rest-prepdev.db.ripe.net/ripe/mntner/TEST01-MNT',
                    },
                    name: 'mnt-by',
                    value: 'TEST01-MNT',
                    'referenced-type': 'mntner',
                },
                {
                    name: 'created',
                    value: '2002-09-19T17:00:19Z',
                },
                {
                    name: 'last-modified',
                    value: '2019-09-03T09:56:27Z',
                },
                {
                    name: 'source',
                    value: 'RIPE',
                },
            ],
        },
    },
};
