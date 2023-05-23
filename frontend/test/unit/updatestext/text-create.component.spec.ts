import { Location } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, ParamMap, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { EMPTY, of } from 'rxjs';
import { PrefixService } from '../../../src/app/domainobject/prefix.service';
import { PropertiesService } from '../../../src/app/properties.service';
import { CredentialsService } from '../../../src/app/shared/credentials.service';
import { SharedModule } from '../../../src/app/shared/shared.module';
import { WhoisMetaService } from '../../../src/app/shared/whois-meta.service';
import { WhoisResourcesService } from '../../../src/app/shared/whois-resources.service';
import { RpslService } from '../../../src/app/updatestext/rpsl.service';
import { TextCommonsService } from '../../../src/app/updatestext/text-commons.service';
import { TextCreateComponent } from '../../../src/app/updatestext/text-create.component';
import { ErrorReporterService } from '../../../src/app/updatesweb/error-reporter.service';
import { MessageStoreService } from '../../../src/app/updatesweb/message-store.service';
import { MntnerService } from '../../../src/app/updatesweb/mntner.service';
import { PreferenceService } from '../../../src/app/updatesweb/preference.service';
import { RestService } from '../../../src/app/updatesweb/rest.service';

describe('TextCreateComponent', () => {
    const SOURCE = 'RIPE';
    let httpMock: HttpTestingController;
    let componentFixture: ComponentFixture<TextCreateComponent>;
    let paramMapMock: ParamMap;
    let queryParamMock: ParamMap;
    let preferencesServiceMock: any;
    let routerMock: any;
    let modalMock: any;

    let textCreateComponent: TextCreateComponent;

    afterAll(() => {
        TestBed.resetTestingModule();
    });

    beforeEach(() => {
        paramMapMock = convertToParamMap({});
        queryParamMock = convertToParamMap({});
        preferencesServiceMock = jasmine.createSpyObj('PreferenceService', ['isTextMode', 'setTextMode', 'isWebMode', 'setWebMode']);
        routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        modalMock = jasmine.createSpyObj('NgbModal', ['open']);
        modalMock.open.and.returnValue({ componentInstance: {}, closed: of({}), dismissed: EMPTY });
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, FormsModule, SharedModule],
            declarations: [TextCreateComponent],
            providers: [
                { provide: PreferenceService, useValue: preferencesServiceMock },
                WhoisResourcesService,
                WhoisMetaService,
                RestService,
                ErrorReporterService,
                MessageStoreService,
                RpslService,
                MntnerService,
                TextCommonsService,
                CredentialsService,
                PrefixService,
                PropertiesService,
                { provide: Location, useValue: { path: () => '' } },
                { provide: NgbModal, useValue: modalMock },
                { provide: Router, useValue: routerMock },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: paramMapMock,
                            queryParamMap: queryParamMock,
                        },
                    },
                },
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        componentFixture = TestBed.createComponent(TextCreateComponent);
        textCreateComponent = componentFixture.componentInstance;
    });

    afterEach(() => {
        httpMock.verify();
    });

    const createParams = (source: string, objectType: string, noRedirect: boolean, rpsl: string) => {
        const paramMapSpy = spyOn(paramMapMock, 'get');
        const queryParamHasSpy = spyOn(queryParamMock, 'has');
        const queryParamGetSpy = spyOn(queryParamMock, 'get');

        paramMapSpy.withArgs('source').and.returnValue(source);
        paramMapSpy.withArgs('objectType').and.returnValue(objectType);
        queryParamHasSpy.withArgs('noRedirect').and.returnValue(noRedirect);
        if (rpsl) {
            queryParamHasSpy.withArgs('rpsl').and.returnValue(true);
            queryParamGetSpy.withArgs('rpsl').and.returnValue(rpsl);
        } else {
            queryParamHasSpy.withArgs('rpsl').and.returnValue(false);
        }
    };

    it('should get parameters from url', () => {
        createParams(SOURCE, 'inetnum', true, null);

        componentFixture.detectChanges();

        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([]);
        expect(textCreateComponent.object.source).toBe(SOURCE);
        expect(textCreateComponent.object.type).toBe('inetnum');
    });

    it('should get rpsl from url-parameter', () => {
        createParams(SOURCE, 'inetnum', true, 'inetnum:1inetnum:2\n');

        componentFixture.detectChanges();

        expect(textCreateComponent.object.source).toBe(SOURCE);
        expect(textCreateComponent.object.type).toBe('inetnum');
        expect(textCreateComponent.object.rpsl).toBe('inetnum:1inetnum:2\n');
    });

    it('should redirect to webupdates when web-preference is set', () => {
        createParams(SOURCE, 'inetnum', false, null);
        preferencesServiceMock.isWebMode.and.returnValue(true);

        componentFixture.detectChanges();

        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/create/RIPE/inetnum?noRedirect`);
    });

    it('should not redirect to webupdates when web-preference is set and no-redirect is true', () => {
        createParams(SOURCE, 'inetnum', true, null);
        preferencesServiceMock.isWebMode.and.returnValue(true);

        componentFixture.detectChanges();

        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([]);
    });

    it('should populate an empty person rpsl, mandatory attrs uppercase and optional lowercase', async () => {
        createParams(SOURCE, 'person', true, null);

        componentFixture.detectChanges();

        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([]);
        await componentFixture.whenStable();
        expect(textCreateComponent.object.rpsl).toEqual(
            'PERSON:        \n' +
                'ADDRESS:       \n' +
                'PHONE:         \n' +
                'fax-no:        \n' +
                'e-mail:        \n' +
                'org:           \n' +
                'NIC-HDL:       AUTO-1\n' +
                'remarks:       \n' +
                'notify:        \n' +
                'MNT-BY:        \n' +
                'mnt-ref:       \n' +
                'SOURCE:        RIPE\n',
        );
    });

    it('should fetch and populate sso mntners', async () => {
        createParams(SOURCE, 'inetnum', true, null);

        componentFixture.detectChanges();

        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([{ key: 'TEST-MNT', type: 'mntner', auth: ['SSO'], mine: true }]);
        await componentFixture.whenStable();
        expect(textCreateComponent.object.rpsl).toEqual(
            'INETNUM:       \n' +
                'NETNAME:       \n' +
                'descr:         \n' +
                'COUNTRY:       \n' +
                'geofeed:       \n' +
                'geoloc:        \n' +
                'language:      \n' +
                'org:           \n' +
                'sponsoring-org:\n' +
                'ADMIN-C:       \n' +
                'TECH-C:        \n' +
                'abuse-c:       \n' +
                'STATUS:        \n' +
                'remarks:       \n' +
                'notify:        \n' +
                'MNT-BY:        TEST-MNT\n' +
                'mnt-lower:     \n' +
                'mnt-domains:   \n' +
                'mnt-routes:    \n' +
                'mnt-irt:       \n' +
                'SOURCE:        RIPE\n',
        );

        expect(textCreateComponent.alertsService.alerts.errors.length).toEqual(0);
    });

    it('should handle empty sso mntners', async () => {
        createParams(SOURCE, 'inetnum', true, null);

        componentFixture.detectChanges();

        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([]);
        await componentFixture.whenStable();
        expect(textCreateComponent.object.rpsl).toEqual(
            'INETNUM:       \n' +
                'NETNAME:       \n' +
                'descr:         \n' +
                'COUNTRY:       \n' +
                'geofeed:       \n' +
                'geoloc:        \n' +
                'language:      \n' +
                'org:           \n' +
                'sponsoring-org:\n' +
                'ADMIN-C:       \n' +
                'TECH-C:        \n' +
                'abuse-c:       \n' +
                'STATUS:        \n' +
                'remarks:       \n' +
                'notify:        \n' +
                'MNT-BY:        \n' +
                'mnt-lower:     \n' +
                'mnt-domains:   \n' +
                'mnt-routes:    \n' +
                'mnt-irt:       \n' +
                'SOURCE:        RIPE\n',
        );
        expect(textCreateComponent.alertsService.alerts.errors.length).toEqual(0);
    });

    // TODO fix
    /*
    it("should handle 404 error while fetching sso mntners", () => {
        doCreateController("inetnum");

        $httpBackend.whenGET("api/user/mntners").respond(404);
        $httpBackend.flush();

        expect($state.current.name).toBe("notFound");
    });
    */

    it('should handle error while fetching sso mntners', async () => {
        createParams(SOURCE, 'inetnum', true, null);

        componentFixture.detectChanges();

        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([], { status: 400, statusText: 'error' });
        await componentFixture.whenStable();
        expect(textCreateComponent.object.rpsl).toEqual(
            'INETNUM:       \n' +
                'NETNAME:       \n' +
                'descr:         \n' +
                'COUNTRY:       \n' +
                'geofeed:       \n' +
                'geoloc:        \n' +
                'language:      \n' +
                'org:           \n' +
                'sponsoring-org:\n' +
                'ADMIN-C:       \n' +
                'TECH-C:        \n' +
                'abuse-c:       \n' +
                'STATUS:        \n' +
                'remarks:       \n' +
                'notify:        \n' +
                'MNT-BY:        \n' +
                'mnt-lower:     \n' +
                'mnt-domains:   \n' +
                'mnt-routes:    \n' +
                'mnt-irt:       \n' +
                'SOURCE:        RIPE\n',
        );

        expect(textCreateComponent.alertsService.alerts.errors.length).toEqual(1);
        expect(textCreateComponent.alertsService.alerts.errors).toEqual([{ plainText: 'Error fetching maintainers associated with this SSO account' }]);
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
        expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should report an error when mandatory field is missing', async () => {
        createParams(SOURCE, 'person', true, null);
        componentFixture.detectChanges();

        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([{ key: 'TESTSSO-MNT', type: 'mntner', auth: ['SSO'], mine: true }]);
        await componentFixture.whenStable();
        textCreateComponent.submit();
        await componentFixture.whenStable();

        expect(textCreateComponent.alertsService.alerts.errors).toEqual([
            { plainText: 'person: Mandatory attribute not set' },
            { plainText: 'address: Mandatory attribute not set' },
            { plainText: 'phone: Mandatory attribute not set' },
        ]);

        expect(modalMock.open).not.toHaveBeenCalled();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
        expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should report an error when multiple objects are passed in', async () => {
        createParams(SOURCE, 'person', true, null);

        componentFixture.detectChanges();

        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([{ key: 'TESTSSO-MNT', type: 'mntner', auth: ['SSO'], mine: true }]);
        await componentFixture.whenStable();

        textCreateComponent.object.rpsl = person_correct + 'person: Tester X\n' + '\n' + 'person:Tester Y\n';

        textCreateComponent.submit();
        await componentFixture.whenStable();

        expect(textCreateComponent.alertsService.alerts.errors).toEqual([{ plainText: 'Only a single object is allowed' }]);

        expect(modalMock.open).not.toHaveBeenCalled();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
        expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should report an error when unknown attribute is encountered', async () => {
        createParams(SOURCE, 'person', true, null);
        componentFixture.detectChanges();

        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([{ key: 'TEST-MNT', type: 'mntner', auth: ['SSO'], mine: true }]);

        await componentFixture.whenStable();
        textCreateComponent.object.rpsl = person_correct + 'wrong:xyz';
        textCreateComponent.submit();
        await componentFixture.whenStable();

        expect(textCreateComponent.alertsService.alerts.errors).toEqual([{ plainText: 'wrong: Unknown attribute' }]);

        expect(modalMock.open).not.toHaveBeenCalled();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
        expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    const person_correct =
        'person:        Tester X\n' +
        'address:       Singel, Amsterdam\n' +
        'phone:         +316\n' +
        'nic-hdl:       AUTO-1\n' +
        'mnt-by:        grol129-mnt\n' +
        'mnt-by:        TEST-MNT\n' +
        'source:        RIPE\n';

    it('should present password popup upon submit when no sso mnt-by is used', async () => {
        createParams(SOURCE, 'person', true, null);
        componentFixture.detectChanges();

        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([{ key: 'TESTSSO-MNT', type: 'mntner', auth: ['SSO'], mine: true }]);
        await componentFixture.whenStable();
        textCreateComponent.object.rpsl = person_correct;
        textCreateComponent.submit();
        await componentFixture.whenStable();

        expect(modalMock.open).toHaveBeenCalled();
    });

    it('should navigate to display after successful submit', async () => {
        createParams(SOURCE, 'person', true, null);
        componentFixture.detectChanges();

        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([
            { key: 'TEST-MNT', type: 'mntner', auth: ['SSO'], mine: true },
            { key: 'GROL129-MNT', type: 'mntner', auth: ['SSO'], mine: true },
        ]);

        await componentFixture.whenStable();
        textCreateComponent.object.rpsl = person_correct;
        textCreateComponent.submit();
        await componentFixture.whenStable();

        httpMock.expectOne({ method: 'POST', url: 'api/whois/RIPE/person?unformatted=true' }).flush({
            objects: {
                object: [
                    {
                        'primary-key': { attribute: [{ name: 'nic-hdl', value: 'TX01-RIPE' }] },
                        attributes: {
                            attribute: [
                                { name: 'person', value: 'Tester X' },
                                { name: 'address', value: 'Singel, Amsterdam' },
                                { name: 'phone', value: '+316' },
                                { name: 'nic-hdl', value: 'TX01-RIPE' },
                                { name: 'mnt-by', value: 'TEST-MNT' },
                                { name: 'source', value: 'RIPE' },
                            ],
                        },
                    },
                ],
            },
        });

        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/display/RIPE/person/TX01-RIPE?method=Create`);
        expect(modalMock.open).not.toHaveBeenCalled();
    });

    it('should extract password from rpsl', async () => {
        createParams(SOURCE, 'person', true, null);
        componentFixture.detectChanges();

        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([{ key: 'TEST-MNT', type: 'mntner', auth: ['SSO'], mine: true }]);

        await componentFixture.whenStable();
        textCreateComponent.object.rpsl = person_correct + 'password:secret\n';
        textCreateComponent.submit();
        await componentFixture.whenStable();

        httpMock.expectOne({ method: 'POST', url: 'api/whois/RIPE/person?password=secret&unformatted=true' }).flush({
            objects: {
                object: [
                    {
                        'primary-key': { attribute: [{ name: 'person', value: 'TX01-RIPE' }] },
                        attributes: {
                            attribute: [
                                { name: 'person', value: 'Tester X' },
                                { name: 'address', value: 'Singel, Amsterdam' },
                                { name: 'phone', value: '+316' },
                                { name: 'nic-hdl', value: 'TX01-RIPE' },
                                { name: 'mnt-by', value: 'TEST-MNT' },
                                { name: 'source', value: 'RIPE' },
                            ],
                        },
                    },
                ],
            },
        });

        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/display/RIPE/person/TX01-RIPE?method=Create`);
        expect(modalMock.open).not.toHaveBeenCalled();
    });

    it('should extract override from rpsl and ignore password', async () => {
        createParams(SOURCE, 'person', true, null);
        componentFixture.detectChanges();

        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([{ key: 'TEST-MNT', type: 'mntner', auth: ['SSO'], mine: true }]);

        await componentFixture.whenStable();
        textCreateComponent.object.rpsl = person_correct + 'override:me,secret,because\n' + 'password:secret';
        textCreateComponent.submit();
        await componentFixture.whenStable();

        httpMock
            .expectOne({
                method: 'POST',
                url: 'api/whois/RIPE/person?override=me%2Csecret%2Cbecause&unformatted=true',
            })
            .flush({
                objects: {
                    object: [
                        {
                            'primary-key': { attribute: [{ name: 'person', value: 'TX01-RIPE' }] },
                            attributes: {
                                attribute: [
                                    { name: 'person', value: 'Tester X' },
                                    { name: 'address', value: 'Singel, Amsterdam' },
                                    { name: 'phone', value: '+316' },
                                    { name: 'nic-hdl', value: 'TX01-RIPE' },
                                    { name: 'mnt-by', value: 'TEST-MNT' },
                                    { name: 'source', value: 'RIPE' },
                                ],
                            },
                        },
                    ],
                },
            });
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/display/RIPE/person/TX01-RIPE?method=Create`);
        expect(modalMock.open).not.toHaveBeenCalled();
    });

    it('should show errors after submit failure ', async () => {
        createParams(SOURCE, 'person', true, null);
        componentFixture.detectChanges();

        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([
            { key: 'TEST-MNT', type: 'mntner', auth: ['SSO'], mine: true },
            { key: 'GROL129-MNT', type: 'mntner', auth: ['SSO'], mine: true },
        ]);

        await componentFixture.whenStable();
        textCreateComponent.object.rpsl = person_correct;
        textCreateComponent.submit();
        await componentFixture.whenStable();

        httpMock.expectOne({ method: 'POST', url: 'api/whois/RIPE/person?unformatted=true' }).flush(
            {
                objects: {
                    object: [
                        {
                            'primary-key': { attribute: [{ name: 'person', value: 'TX01-RIPE' }] },
                            attributes: {
                                attribute: [
                                    { name: 'person', value: 'Tester X' },
                                    { name: 'address', value: 'Singel, Amsterdam' },
                                    { name: 'phone', value: '+316' },
                                    { name: 'nic-hdl', value: 'TX01-RIPE' },
                                    { name: 'mnt-by', value: 'TEST-MNT' },
                                    { name: 'source', value: 'RIPE' },
                                ],
                            },
                        },
                    ],
                },
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
                        {
                            severity: 'Error',
                            attribute: {
                                name: 'person',
                                value: 'Tester X',
                            },
                            text: '"%s" is not valid for this object type',
                            args: [{ value: 'Tester X' }],
                        },
                    ],
                },
            },
            { statusText: 'bad request', status: 400 },
        );

        expect(textCreateComponent.alertsService.alerts.errors.length).toEqual(2);
        const plaintextErrors = _.map(textCreateComponent.alertsService.alerts.errors, (item) => ({ plainText: item.plainText }));
        expect(plaintextErrors).toEqual([
            { plainText: 'Unrecognized source: INVALID_SOURCE' },
            { plainText: 'person: "Tester X" is not valid for this object type' },
        ]);

        expect(textCreateComponent.alertsService.alerts.warnings.length).toEqual(1);
        const plaintextWarnings = _.map(textCreateComponent.alertsService.alerts.warnings, (item) => ({ plainText: item.plainText }));
        expect(plaintextWarnings).toEqual([{ plainText: 'Not authenticated' }]);

        expect(textCreateComponent.object.rpsl).toEqual(person_correct);
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
        expect(routerMock.navigate).not.toHaveBeenCalled();
        expect(modalMock.open).not.toHaveBeenCalled();
    });
});
