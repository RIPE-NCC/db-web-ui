import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { of } from 'rxjs';
import { PrefixService } from '../../../../src/app/domainobject/prefix.service';
import { PropertiesService } from '../../../../src/app/properties.service';
import { AlertsService } from '../../../../src/app/shared/alert/alerts.service';
import { CredentialsService } from '../../../../src/app/shared/credentials.service';
import { SharedModule } from '../../../../src/app/shared/shared.module';
import { WhoisMetaService } from '../../../../src/app/shared/whois-meta.service';
import { WhoisResourcesService } from '../../../../src/app/shared/whois-resources.service';
import { IAttributeModel } from '../../../../src/app/shared/whois-response-type.model';
import { DisplayComponent } from '../../../../src/app/updatesweb/display.component';
import { MessageStoreService } from '../../../../src/app/updatesweb/message-store.service';
import { MntnerService } from '../../../../src/app/updatesweb/mntner.service';
import { RestService } from '../../../../src/app/updatesweb/rest.service';
import { WebUpdatesCommonsService } from '../../../../src/app/updatesweb/web-updates-commons.service';
import { UserInfoService } from '../../../../src/app/userinfo/user-info.service';

describe('DisplayComponent', () => {
    let httpMock: HttpTestingController;
    let component: DisplayComponent;
    let fixture: ComponentFixture<DisplayComponent>;
    let objectToDisplay: any;
    let routerMock: any;
    let messageStoreServiceMock: any;

    const OBJECT_TYPE = 'as-block';
    const SOURCE = 'RIPE';
    const OBJECT_NAME = 'MY-AS-BLOCK';
    const MNTNER = 'TEST-MNT';

    beforeEach(() => {
        routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        messageStoreServiceMock = jasmine.createSpyObj('MessageStoreService', ['get']);
        TestBed.configureTestingModule({
            imports: [SharedModule, DisplayComponent],
            providers: [
                CredentialsService,
                { provide: MessageStoreService, useValue: messageStoreServiceMock },
                WhoisResourcesService,
                MntnerService,
                WhoisMetaService,
                RestService,
                AlertsService,
                UserInfoService,
                CookieService,
                WebUpdatesCommonsService,
                PrefixService,
                PropertiesService,
                { provide: Router, useValue: routerMock },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ source: SOURCE, objectType: OBJECT_TYPE, objectName: OBJECT_NAME }),
                        queryParams: of({}),
                    },
                },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(DisplayComponent);
        component = fixture.componentInstance;
        objectToDisplay = component.whoisResourcesService.validateWhoisResources({
            objects: {
                object: [
                    {
                        'primary-key': { attribute: [{ name: 'as-block', value: OBJECT_NAME }] },
                        attributes: {
                            attribute: [
                                { name: 'as-block', value: OBJECT_NAME },
                                { name: 'mnt-by', value: MNTNER },
                                { name: 'source', value: SOURCE },
                            ],
                        },
                    },
                ],
            },
        });
    });

    afterEach(() => {
        httpMock.verify();
    });

    const expectUserInfo = (withFlush: boolean) => {
        const request = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/user/info' });
        if (withFlush) {
            request.flush({
                user: {
                    username: 'TSTADMINC-RIPE',
                    displayName: 'Test User',
                    expiryDate: [2015, 9, 9, 14, 9, 27, 863],
                    uuid: 'aaaa-bbbb-cccc-dddd',
                    active: true,
                },
            });
        }
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get source from url', async () => {
        messageStoreServiceMock.get.and.returnValue(objectToDisplay);
        fixture.detectChanges();

        expectUserInfo(true);
        expect(component.objectSource).toBe(SOURCE);
    });

    it('should get objectType from url', () => {
        messageStoreServiceMock.get.and.returnValue(objectToDisplay);
        fixture.detectChanges();

        expectUserInfo(true);
        expect(component.objectType).toBe(OBJECT_TYPE);
    });

    it('should get objectName from url', () => {
        messageStoreServiceMock.get.and.returnValue(objectToDisplay);

        fixture.detectChanges();

        expectUserInfo(true);
        expect(component.objectName).toBe(OBJECT_NAME);
    });

    it('should detect logged in', async () => {
        messageStoreServiceMock.get.and.returnValue(objectToDisplay);

        fixture.detectChanges();

        expectUserInfo(true);
        await fixture.whenStable();
        expect(component.loggedIn).toBeTruthy();
    });

    it('should populate the ui from message-store', () => {
        messageStoreServiceMock.get.and.returnValue(objectToDisplay);
        fixture.detectChanges();

        expectUserInfo(true);

        expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'as-block').value).toBe(OBJECT_NAME);
        expect(WhoisResourcesService.getAllAttributesOnName(component.attributes, 'mnt-by')[0].value).toEqual(MNTNER);
        expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'source').value).toEqual(SOURCE);

        // FIXME ?
        // expect(routerMock.navigate).toHaveBeenCalledWith(["webupdates/select"]);
        // expect($state.current.name).toBe("webupdates.select");
    });

    it('should populate the ui from rest ok', () => {
        // no objects in message store
        fixture.detectChanges();

        expectUserInfo(false);

        httpMock
            .expectOne({
                method: 'GET',
                url: 'api/whois/RIPE/as-block/MY-AS-BLOCK?unfiltered=true',
            })
            .flush(objectToDisplay);

        expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'as-block').value).toBe(OBJECT_NAME);
        expect(WhoisResourcesService.getAllAttributesOnName(component.attributes, 'mnt-by')[0].value).toEqual(MNTNER);
        expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'source').value).toEqual(SOURCE);

        // FIXME ?
        // expect($state.current.name).toBe("webupdates.select");
        // expect(routerMock.navigate).toHaveBeenCalledWith(["webupdates/select"]);
    });

    it('should populate the ui from rest failure', () => {
        // no objects in message store
        fixture.detectChanges();

        expectUserInfo(false);

        httpMock.expectOne({ method: 'GET', url: 'api/whois/RIPE/as-block/MY-AS-BLOCK?unfiltered=true' }).flush(
            {
                errormessages: {
                    errormessage: [
                        {
                            severity: 'Error',
                            text: 'Unrecognized source: %s',
                            args: [{ value: 'INVALID_SOURCE' }],
                        },
                        {
                            severity: 'Warning',
                            text: 'Not authenticated',
                        },
                    ],
                },
            },
            { status: 403, statusText: 'error' },
        );

        expect(component.alertsService.alerts.errors[0].plainText).toEqual('Unrecognized source: INVALID_SOURCE');
        expect(component.alertsService.alerts.warnings[0].plainText).toEqual('Not authenticated');

        // FIXME ?
        // expect($state.current.name).toBe("webupdates.select");
        // expect(routerMock.navigate).toHaveBeenCalledWith(["webupdates/select"]);
    });

    it('should navigate to select screen', () => {
        messageStoreServiceMock.get.and.returnValue(objectToDisplay);
        fixture.detectChanges();

        expectUserInfo(true);

        component.navigateToSelect();
        expect(routerMock.navigate).toHaveBeenCalledWith(['webupdates/select']);
    });

    it('should navigate to modify screen', () => {
        messageStoreServiceMock.get.and.returnValue(objectToDisplay);
        fixture.detectChanges();

        expectUserInfo(true);

        component.navigateToModify();
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/modify/${SOURCE}/${OBJECT_TYPE}/${OBJECT_NAME}`);
    });
});

describe('DisplayComponent with object containing slash', () => {
    let httpMock: HttpTestingController;
    let component: DisplayComponent;
    let fixture: ComponentFixture<DisplayComponent>;
    let objectToDisplay: any;
    let routerMock: any;
    let messageStoreServiceMock: any;

    const SOURCE = 'RIPE';
    const OBJECT_TYPE = 'route';
    const OBJECT_NAME = '212.235.32.0/19AS1680';
    const MNTNER = 'TEST-MNT';

    beforeEach(() => {
        routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        messageStoreServiceMock = jasmine.createSpyObj('MessageStoreService', ['get']);
        TestBed.configureTestingModule({
            imports: [SharedModule, DisplayComponent],
            providers: [
                CredentialsService,
                { provide: MessageStoreService, useValue: messageStoreServiceMock },
                WhoisResourcesService,
                MntnerService,
                WhoisMetaService,
                RestService,
                AlertsService,
                UserInfoService,
                CookieService,
                WebUpdatesCommonsService,
                PrefixService,
                PropertiesService,
                { provide: Router, useValue: routerMock },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ source: SOURCE, objectType: OBJECT_TYPE, objectName: OBJECT_NAME }),
                        queryParams: of({}),
                    },
                },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(DisplayComponent);
        component = fixture.componentInstance;
        objectToDisplay = component.whoisResourcesService.validateWhoisResources({
            objects: {
                object: [
                    {
                        'primary-key': { attribute: [{ name: 'as-block', value: OBJECT_NAME }] },
                        attributes: {
                            attribute: [
                                { name: 'route', value: OBJECT_NAME },
                                { name: 'mnt-by', value: MNTNER },
                                { name: 'source', value: SOURCE },
                            ],
                        },
                    },
                ],
            },
        });
    });

    afterEach(() => {
        httpMock.verify();
    });

    const expectUserInfo = (withFlush: boolean) => {
        const request = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/user/info' });
        if (withFlush) {
            request.flush({
                user: {
                    username: 'TSTADMINC-RIPE',
                    displayName: 'Test User',
                    uuid: 'aaaa-bbbb-cccc-dddd',
                    active: true,
                },
            });
        }
    };

    it('should populate the ui from rest ok', () => {
        // no objects in message store
        fixture.detectChanges();

        expectUserInfo(false);

        httpMock
            .expectOne({
                method: 'GET',
                url: 'api/whois/RIPE/route/212.235.32.0%2F19AS1680?unfiltered=true',
            })
            .flush(objectToDisplay);

        expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'route').value).toBe(OBJECT_NAME);
        expect(WhoisResourcesService.getAllAttributesOnName(component.attributes, 'mnt-by')[0].value).toEqual(MNTNER);
        expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'source').value).toEqual(SOURCE);
    });

    it('should navigate to modify', () => {
        // no objects in message store
        fixture.detectChanges();

        expectUserInfo(false);

        httpMock
            .expectOne({
                method: 'GET',
                url: 'api/whois/RIPE/route/212.235.32.0%2F19AS1680?unfiltered=true',
            })
            .flush(objectToDisplay);

        component.navigateToModify();

        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/modify/${SOURCE}/${OBJECT_TYPE}/${encodeURIComponent(OBJECT_NAME)}`);
    });

    it('should navigate to select', () => {
        // no objects in message store
        fixture.detectChanges();

        expectUserInfo(false);

        httpMock
            .expectOne({
                method: 'GET',
                url: 'api/whois/RIPE/route/212.235.32.0%2F19AS1680?unfiltered=true',
            })
            .flush(objectToDisplay);

        component.navigateToSelect();
        expect(routerMock.navigate).toHaveBeenCalledWith(['webupdates/select']);
    });
});

describe('DisplayComponent for RIPE-NONAUTH aut-num object', () => {
    let httpMock: HttpTestingController;
    let component: DisplayComponent;
    let fixture: ComponentFixture<DisplayComponent>;
    let objectToDisplay: any;
    let routerMock: any;
    let modalMock: any;
    let messageStoreServiceMock: any;

    const SOURCE = 'RIPE-NONAUTH';
    const OBJECT_TYPE = 'aut-num';
    const OBJECT_NAME = 'AS9777';
    const MNTNER = 'TEST-MNT';
    const ADMINC = 'TSTADMINC-RIPE';

    beforeEach(() => {
        routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        messageStoreServiceMock = jasmine.createSpyObj('MessageStoreService', ['get']);
        TestBed.configureTestingModule({
            imports: [SharedModule, DisplayComponent],
            providers: [
                CredentialsService,
                { provide: MessageStoreService, useValue: messageStoreServiceMock },
                WhoisResourcesService,
                MntnerService,
                WhoisMetaService,
                RestService,
                AlertsService,
                UserInfoService,
                CookieService,
                WebUpdatesCommonsService,
                PrefixService,
                PropertiesService,
                { provide: Router, useValue: routerMock },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ source: SOURCE, objectType: OBJECT_TYPE, objectName: OBJECT_NAME }),
                        queryParams: of({}),
                    },
                },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(DisplayComponent);
        component = fixture.componentInstance;
        objectToDisplay = component.whoisResourcesService.validateWhoisResources({
            objects: {
                object: [
                    {
                        'primary-key': { attribute: [{ name: OBJECT_TYPE, value: OBJECT_NAME }] },
                        attributes: {
                            attribute: [
                                { name: 'aut-num', value: OBJECT_NAME },
                                {
                                    name: 'mnt-by',
                                    value: MNTNER,
                                    'referenced-type': 'mntner',
                                    link: {
                                        href: 'http://rest-prepdev.db.ripe.net/ripe/mnt-by/TEST-MNT',
                                        type: 'locator',
                                    },
                                },
                                {
                                    name: 'admin-c',
                                    value: ADMINC,
                                    'referenced-type': 'person',
                                    link: {
                                        href: 'http://rest-prepdev.db.ripe.net/ripe/person/TSTADMINC-RIPE',
                                        type: 'locator',
                                    },
                                },
                                { name: 'source', value: SOURCE },
                            ],
                        },
                    },
                ],
            },
        });
    });

    afterEach(() => {
        httpMock.verify();
    });

    const expectUserInfo = (withFlush: boolean) => {
        const request = httpMock.expectOne({ method: 'GET', url: 'api/whois-internal/api/user/info' });
        if (withFlush) {
            request.flush({
                user: {
                    username: 'TSTADMINC-RIPE',
                    displayName: 'Test User',
                    uuid: 'aaaa-bbbb-cccc-dddd',
                    active: true,
                },
            });
        }
    };

    it('should add href to attributes with link', () => {
        // no objects in message store
        fixture.detectChanges();

        expectUserInfo(false);

        httpMock.expectOne({ method: 'GET', url: 'api/whois/RIPE-NONAUTH/aut-num/AS9777?unfiltered=true' }).flush(objectToDisplay);

        expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'aut-num').value).toBe(OBJECT_NAME);
        expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'mnt-by').value).toEqual(MNTNER);
        const attrMnt: IAttributeModel = component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'mnt-by');
        expect(attrMnt.link.href).toEqual('webupdates/display/RIPE/mntner/TEST-MNT');
        expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'admin-c').value).toBe(ADMINC);
        expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'admin-c').link.href).toBe(
            'webupdates/display/RIPE/person/TSTADMINC-RIPE',
        );
        expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'source').value).toEqual(SOURCE);
    });
});
