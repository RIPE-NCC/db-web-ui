import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgSelectModule } from '@ng-select/ng-select';
import { CookieService } from 'ngx-cookie-service';
import { of } from 'rxjs';
import { PropertiesService } from '../../../src/app/properties.service';
import { SessionInfoService } from '../../../src/app/sessioninfo/session-info.service';
import { AlertsService } from '../../../src/app/shared/alert/alerts.service';
import { WhoisResourcesService } from '../../../src/app/shared/whois-resources.service';
import { IObjectVersionResponse, IObjectVersionsModel, IWhoisResponseModel } from '../../../src/app/shared/whois-response-type.model';
import { VersionsLookupService } from '../../../src/app/versions/versions-lookup.service';
import { VersionsComponent } from '../../../src/app/versions/versions.component';

const versionsMock: IObjectVersionsModel = {
    versions: {
        type: 'mntner',
        key: 'MHM-MNT',
        version: [
            {
                revision: 1,
                date: new Date('2025-04-08T08:52:24Z'),
                operation: 'ADD/UPD',
            },
            {
                revision: 2,
                date: new Date('2025-04-08T08:52:24Z'),
                operation: 'ADD/UPD',
            },
            {
                revision: 3,
                date: new Date('2025-04-08T08:52:24Z'),
                operation: 'ADD/UPD',
            },
            {
                revision: 4,
                date: new Date('2025-04-08T08:52:24Z'),
                operation: 'ADD/UPD',
            },
            {
                revision: 5,
                date: new Date('2025-04-08T08:52:24Z'),
                operation: 'ADD/UPD',
            },
        ],
    },
} as IObjectVersionsModel;

const versionMock: IObjectVersionResponse = {
    objects: {
        object: [
            {
                type: 'mntner',
                link: {
                    type: 'locator',
                    href: 'https://rest-prepdev.db.ripe.net/ripe/mntner/MHM-MNT',
                },
                source: {
                    id: 'ripe',
                },
                'primary-key': {
                    attribute: [{ name: 'mntner', value: 'MHM-MNT' }],
                },
                attributes: {
                    attribute: [
                        { name: 'mntner', value: 'MHM-MNT' },
                        {
                            link: {
                                type: 'locator',
                                href: 'https://rest-prepdev.db.ripe.net/ripe/mntner/MHM-MNT',
                            },
                            name: 'mnt-by',
                            value: 'MHM-MNT',
                            'referenced-type': 'mntner',
                        },
                        { name: 'created', value: '2025-04-08T08:52:24Z' },
                        { name: 'last-modified', value: '2025-04-08T08:52:24Z' },
                        { name: 'source', value: 'RIPE', comment: 'Filtered' },
                    ],
                },
                version: 5,
            },
        ],
    },
} as IObjectVersionResponse;

const lookupMock: IWhoisResponseModel = {
    version: {
        version: '1.123-SNAPSHOT',
        timestamp: '2026-06-03T13:29:29Z',
        'commit-id': '84cbccb',
    },
} as IWhoisResponseModel;

describe('VersionsComponent', () => {
    let component: VersionsComponent;
    let fixture: ComponentFixture<VersionsComponent>;
    let versionsLookupServiceSpy: jasmine.SpyObj<VersionsLookupService>;
    let router: Router;

    beforeEach(() => {
        versionsLookupServiceSpy = jasmine.createSpyObj('VersionsLookupService', ['versionsLookup', 'getVersion', 'getVersions']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, NgSelectModule, RouterTestingModule, VersionsComponent],
            providers: [
                { provide: VersionsLookupService, useValue: versionsLookupServiceSpy },
                SessionInfoService,
                CookieService,
                PropertiesService,
                AlertsService,
                WhoisResourcesService,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        queryParams: of({
                            type: 'mntner',
                            key: 'MHM-MNT',
                            source: 'TEST',
                            from: 'query',
                            searchtext: 'MHM-MNT',
                        }),
                    },
                },
            ],
        });

        fixture = TestBed.createComponent(VersionsComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);

        versionsLookupServiceSpy.versionsLookup.and.returnValue(of(lookupMock));
        versionsLookupServiceSpy.getVersions.and.returnValue(of(versionsMock));
        versionsLookupServiceSpy.getVersion.and.returnValue(of(versionMock));
    });

    it('should create', () => {
        component.ngOnInit();
        expect(component).toBeTruthy();
    });

    it('should read query params on init', () => {
        component.ngOnInit();
        expect(component.objectType).toEqual('mntner');
        expect(component.objectName).toEqual('MHM-MNT');
        expect(component.source).toEqual('TEST');
        expect(component.from).toEqual('query');
        expect(component.searchText).toEqual('MHM-MNT');
    });

    it('should load versions list on init', () => {
        component.ngOnInit();
        expect(versionsLookupServiceSpy.getVersions).toHaveBeenCalledWith('TEST', 'mntner', 'MHM-MNT');
        expect(component.versions.length).toEqual(5);
    });

    it('should preselect the latest version', () => {
        component.ngOnInit();
        expect(component.selectedVersionId).toEqual(5);
    });

    it('should fetch the preselected version and set its attributes', () => {
        component.ngOnInit();
        expect(versionsLookupServiceSpy.getVersion).toHaveBeenCalledWith('TEST', 'mntner', 'MHM-MNT', 5);
        expect(component.selectedVersion).toBeTruthy();
    });

    it('should mark the preselected version as latest', () => {
        component.ngOnInit();
        expect(component.isLatest).toBeTrue();
    });

    it('should set whoisVersion from the lookup response', () => {
        component.ngOnInit();
        expect(versionsLookupServiceSpy.versionsLookup).toHaveBeenCalledWith('TEST', 'mntner', 'MHM-MNT');
        expect(component.whoisVersion).toBeTruthy();
    });

    it('should fetch a version when one is selected from the dropdown', () => {
        component.ngOnInit();
        component.onVersionSelect(3);
        expect(versionsLookupServiceSpy.getVersion).toHaveBeenCalledWith('TEST', 'mntner', 'MHM-MNT', 3);
        expect(component.selectedVersion).toBeTruthy();
    });

    it('should mark a non-max version as not latest when selected', () => {
        component.ngOnInit();
        versionsLookupServiceSpy.getVersion.and.returnValue(
            of({ objects: { object: [{ ...versionMock.objects.object[0], version: 3 }] } } as IObjectVersionResponse),
        );
        component.onVersionSelect(3);
        expect(component.isLatest).toBeFalse();
    });

    it('should cache fetched versions and not refetch the same id', () => {
        component.ngOnInit();
        component.onVersionSelect(3);
        const callsAfterFirst = versionsLookupServiceSpy.getVersion.calls.count();
        component.onVersionSelect(3);
        expect(versionsLookupServiceSpy.getVersion.calls.count()).toEqual(callsAfterFirst);
    });

    it('should navigate to version-diff with query params including from and searchtext', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.ngOnInit();
        component.navigateToVersionDiff();
        expect(navigateSpy).toHaveBeenCalledWith(['version-diff'], {
            queryParams: {
                source: 'TEST',
                type: 'mntner',
                key: 'MHM-MNT',
                version: 5,
                from: 'query',
                searchtext: 'MHM-MNT',
            },
        });
    });
});
