import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgSelectModule } from '@ng-select/ng-select';
import { CookieService } from 'ngx-cookie-service';
import { of } from 'rxjs';
import { PropertiesService } from '../../../src/app/properties.service';
import { SessionInfoService } from '../../../src/app/sessioninfo/session-info.service';
import { AlertsService } from '../../../src/app/shared/alert/alerts.service';
import { WhoisResourcesService } from '../../../src/app/shared/whois-resources.service';
import { IObjectVersionResponse, IObjectVersionsModel } from '../../../src/app/shared/whois-response-type.model';
import { DiffComponent } from '../../../src/app/versions/diff/diff.component';
import { VersionsLookupService } from '../../../src/app/versions/versions-lookup.service';

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

const leftVersionMock: IObjectVersionResponse = {
    objects: {
        object: [
            {
                type: 'mntner',
                link: {
                    type: 'locator',
                    href: 'https://rest-prepdev.db.ripe.net/test/mntner/MHM-MNT',
                },
                source: {
                    id: 'test',
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
                                href: 'https://rest-prepdev.db.ripe.net/test/mntner/MHM-MNT',
                            },
                            name: 'mnt-by',
                            value: 'MHM-MNT',
                            'referenced-type': 'mntner',
                        },
                        { name: 'created', value: '2025-04-08T08:52:24Z' },
                        { name: 'last-modified', value: '2025-04-08T08:52:24Z' },
                        { name: 'source', value: 'TEST', comment: 'Filtered' },
                    ],
                },
                version: 1,
            },
        ],
    },
} as IObjectVersionResponse;

describe('DiffComponent', () => {
    let component: DiffComponent;
    let fixture: ComponentFixture<DiffComponent>;
    let versionsLookupServiceSpy: jasmine.SpyObj<VersionsLookupService>;

    beforeEach(() => {
        versionsLookupServiceSpy = jasmine.createSpyObj('VersionsLookupService', ['versionsLookup', 'getVersion', 'getVersions']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, NgSelectModule, RouterTestingModule, DiffComponent],
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
                        snapshot: {
                            url: [new UrlSegment('query', {})],
                            queryParams: {
                                type: 'mntner',
                                key: 'MHM-MNT',
                                source: 'TEST',
                                version: 1,
                                from: 'query',
                                searchtext: 'MHM-MNT',
                            },
                        },
                    },
                },
            ],
        });

        fixture = TestBed.createComponent(DiffComponent);
        component = fixture.componentInstance;

        versionsLookupServiceSpy.versionsLookup.and.returnValue(of(leftVersionMock));
        versionsLookupServiceSpy.getVersions.and.returnValue(of(versionsMock));
        versionsLookupServiceSpy.getVersion.and.returnValue(of(leftVersionMock));
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
        expect(component.leftVersionId).toEqual(1);
        expect(component.from).toEqual('query');
        expect(component.searchText).toEqual('MHM-MNT');
    });

    it('should load versions list on init', () => {
        component.ngOnInit();
        expect(versionsLookupServiceSpy.getVersions).toHaveBeenCalledWith('TEST', 'mntner', 'MHM-MNT');
        expect(component.versions.length).toEqual(5);
    });

    it('should display the left version selected on the versions page', () => {
        component.ngOnInit();
        fixture.detectChanges();
        expect(versionsLookupServiceSpy.getVersion).toHaveBeenCalledWith('TEST', 'mntner', 'MHM-MNT', 1);
        expect(component.leftDiff).toBeTruthy();
    });

    it('should mark left version as not latest when revision is below max', () => {
        component.ngOnInit();
        expect(component.isLeftLatest).toBeFalse();
    });

    it('should mark version as latest when it equals the max revision', () => {
        component.ngOnInit();
        expect(component.isLatest(5)).toBeTrue();
        expect(component.isLatest(3)).toBeFalse();
    });

    it('should not render right diff when no diff param is present', () => {
        component.ngOnInit();
        expect(component.rightDiff).toBeUndefined();
        expect(component.diffVersionId).toBeNull();
    });

    it('should fetch and set right diff when a right version is selected', () => {
        component.ngOnInit();
        component.onRightVersionSelect(3);
        expect(versionsLookupServiceSpy.getVersion).toHaveBeenCalledWith('TEST', 'mntner', 'MHM-MNT', 3);
        expect(component.rightDiff).toBeTruthy();
    });

    it('should ignore right selection when id is null', () => {
        component.ngOnInit();
        const callsBefore = versionsLookupServiceSpy.getVersion.calls.count();
        component.onRightVersionSelect(null);
        expect(versionsLookupServiceSpy.getVersion.calls.count()).toEqual(callsBefore);
    });

    it('should cache fetched versions and not refetch the same id', () => {
        component.ngOnInit();
        const callsAfterInit = versionsLookupServiceSpy.getVersion.calls.count();
        component.onLeftVersionSelect(1);
        expect(versionsLookupServiceSpy.getVersion.calls.count()).toEqual(callsAfterInit);
    });

    it('should set whoisVersion from the lookup response', () => {
        component.ngOnInit();
        expect(versionsLookupServiceSpy.versionsLookup).toHaveBeenCalledWith('TEST', 'mntner', 'MHM-MNT');
    });
});
