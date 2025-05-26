import { Location } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { EMPTY, map, of } from 'rxjs';
import { PrefixService } from '../../../src/app/domainobject/prefix.service';
import { PropertiesService } from '../../../src/app/properties.service';
import { CredentialsService } from '../../../src/app/shared/credentials.service';
import { SharedModule } from '../../../src/app/shared/shared.module';
import { WhoisMetaService } from '../../../src/app/shared/whois-meta.service';
import { WhoisResourcesService } from '../../../src/app/shared/whois-resources.service';
import { IMntByModel } from '../../../src/app/shared/whois-response-type.model';
import { RpslService } from '../../../src/app/updatestext/rpsl.service';
import { TextCommonsService } from '../../../src/app/updatestext/text-commons.service';
import { TextModifyComponent } from '../../../src/app/updatestext/text-modify.component';
import { ErrorReporterService } from '../../../src/app/updatesweb/error-reporter.service';
import { MessageStoreService } from '../../../src/app/updatesweb/message-store.service';
import { MntnerService } from '../../../src/app/updatesweb/mntner.service';
import { RestService } from '../../../src/app/updatesweb/rest.service';
import { WhoisObjectTextEditorComponent } from '../../../src/app/whois-object/whois-object-text-editor.component';
import { routeJSON } from '../updatestext/mock-test-data';

describe('WhoisObjectTextEditorComponent', () => {
    const SOURCE = 'RIPE';
    const OBJECT_NAME = 'TST08-RIPE';
    const OBJECT_TYPE = 'person';
    let httpMock: HttpTestingController;
    let componentFixture: ComponentFixture<WhoisObjectTextEditorComponent>;
    let modalMock: any;
    let credentialsServiceMock: any;
    let whoisObjectTextEditorComponent: WhoisObjectTextEditorComponent;

    const testPersonRpsl =
        'person:test person\n' +
        'address:Amsterdam\n' +
        'phone:+316\n' +
        'nic-hdl:TST08-RIPE\n' +
        'mnt-by:TEST-MNT\n' +
        'last-modified: 2012-02-27T10:11:12Z\n' +
        'source:RIPE\n';

    const testPersonRpslScreen =
        'person:test person\n' + 'address:Amsterdam\n' + 'phone:+316\n' + 'nic-hdl:TST08-RIPE\n' + 'mnt-by:TEST-MNT\n' + 'source:RIPE\n';

    const testPersonRpslMissingPhone =
        'person:test person\n' + 'address:Amsterdam\n' + 'phone:\n' + 'nic-hdl:TST08-RIPE\n' + 'mnt-by:TEST-MNT\n' + 'source:RIPE\n';

    const testPersonObject = {
        objects: {
            object: [
                {
                    'primary-key': { attribute: [{ name: 'nic-hdl', value: 'TST08-RIPE' }] },
                    attributes: {
                        attribute: [
                            { name: 'person', value: 'test person' },
                            { name: 'address', value: 'Amsterdam' },
                            { name: 'phone', value: '+316' },
                            { name: 'nic-hdl', value: 'TST08-RIPE' },
                            { name: 'mnt-by', value: 'TEST-MNT' },
                            { name: 'source', value: 'RIPE' },
                        ],
                    },
                },
            ],
        },
    };

    const mntrMock: IMntByModel[] = [
        {
            key: 'TEST-MNT',
            type: 'mntner',
            auth: ['SSO'],
            mine: true,
        },
    ];

    afterAll(() => {
        TestBed.resetTestingModule();
    });

    beforeEach(() => {
        modalMock = jasmine.createSpyObj('NgbModal', ['open']);
        modalMock.open.and.returnValue({ componentInstance: {}, closed: EMPTY, dismissed: EMPTY });
        credentialsServiceMock = jasmine.createSpyObj('CredentialsService', ['hasCredentials', 'getCredentials', 'getPasswordsForRestCall']);
        TestBed.configureTestingModule({
            declarations: [TextModifyComponent],
            imports: [FormsModule, SharedModule],
            providers: [
                WhoisResourcesService,
                WhoisMetaService,
                RestService,
                ErrorReporterService,
                MessageStoreService,
                RpslService,
                MntnerService,
                TextCommonsService,
                { provide: CredentialsService, useValue: credentialsServiceMock },
                PrefixService,
                PropertiesService,
                { provide: NgbModal, useValue: modalMock },
                { provide: Location, useValue: { path: () => '' } },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        componentFixture = TestBed.createComponent(WhoisObjectTextEditorComponent);
        whoisObjectTextEditorComponent = componentFixture.componentInstance;
    });

    afterEach(() => {
        httpMock.verify();
    });

    const createInputParams = (objectType?: string, objectName?: string, noRedirect?: boolean, rpsl?: string) => {
        whoisObjectTextEditorComponent.source = SOURCE;
        whoisObjectTextEditorComponent.type = objectType ? objectType : OBJECT_TYPE;
        whoisObjectTextEditorComponent.objectName = objectName ? objectName : OBJECT_NAME;
        if (rpsl) {
            whoisObjectTextEditorComponent.rpsl = rpsl;
        }
    };

    it('should populate fetched person object in rpsl area', async () => {
        createInputParams();
        componentFixture.detectChanges();

        httpMock
            .expectOne({
                method: 'GET',
                url: 'api/whois/RIPE/person/TST08-RIPE?unfiltered=true&unformatted=true',
            })
            .flush(testPersonObject);
        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush(mntrMock);

        await componentFixture.whenStable();
        expect(whoisObjectTextEditorComponent.rpsl).toEqual(testPersonRpslScreen);
    });

    it('should report an error when mandatory field is missing', async () => {
        spyOn(whoisObjectTextEditorComponent.alertsServices, 'addGlobalError');
        createInputParams();
        componentFixture.detectChanges();

        httpMock
            .expectOne({
                method: 'GET',
                url: 'api/whois/RIPE/person/TST08-RIPE?unfiltered=true&unformatted=true',
            })
            .flush(testPersonObject);
        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush(mntrMock);

        await componentFixture.whenStable();

        whoisObjectTextEditorComponent.rpsl = testPersonRpslMissingPhone;
        whoisObjectTextEditorComponent.submit();
        await componentFixture.whenStable();

        expect(whoisObjectTextEditorComponent.alertsServices.addGlobalError).toHaveBeenCalledWith('phone: Mandatory attribute not set');
    });

    it('should extract password from rpsl', async () => {
        spyOn(whoisObjectTextEditorComponent.submitEvent, 'emit');
        createInputParams();
        componentFixture.detectChanges();

        httpMock
            .expectOne({
                method: 'GET',
                url: 'api/whois/RIPE/person/TST08-RIPE?unfiltered=true&unformatted=true',
            })
            .flush(testPersonObject);
        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([]);

        await componentFixture.whenStable();
        credentialsServiceMock.hasCredentials.and.returnValue(true);
        whoisObjectTextEditorComponent.rpsl = testPersonRpsl + 'password:secret2\n';
        expect(modalMock.open).toHaveBeenCalled();
        credentialsServiceMock.getCredentials.and.returnValue({ mntner: 'TEST-MNT', successfulPassword: 'secret' });
        credentialsServiceMock.getPasswordsForRestCall.and.returnValue(['secret']);
        whoisObjectTextEditorComponent.submit();
        await componentFixture.whenStable();

        const req1 = httpMock.expectOne({
            method: 'PUT',
            url: 'api/whois/RIPE/person/TST08-RIPE?password=secret2&password=secret&unformatted=true',
        });
        req1.flush(testPersonObject);
        await componentFixture.whenStable();
        expect(whoisObjectTextEditorComponent.submitEvent.emit).toHaveBeenCalledWith(testPersonObject);
    });

    it('should emit delete event after pressing delete button', async () => {
        spyOn(whoisObjectTextEditorComponent.deleteEvent, 'emit');
        createInputParams('route', '12.235.32.0/19AS1680');
        componentFixture.detectChanges();

        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush(mntrMock);
        httpMock
            .expectOne({
                method: 'GET',
                url: 'api/whois/RIPE/route/12.235.32.0%2F19AS1680?unfiltered=true&unformatted=true',
            })
            .flush(routeJSON);
        await componentFixture.whenStable();

        whoisObjectTextEditorComponent.deleteObject();

        expect(whoisObjectTextEditorComponent.deleteEvent.emit).toHaveBeenCalled();
    });

    it('should report a fetch failure', async () => {
        createInputParams();
        componentFixture.detectChanges();

        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush(mntrMock);
        httpMock
            .expectOne({
                method: 'GET',
                url: 'api/whois/RIPE/person/TST08-RIPE?unfiltered=true&unformatted=true',
            })
            .flush(
                {
                    errormessages: {
                        errormessage: [
                            {
                                severity: 'Error',
                                text: 'ERROR:101: no entries found\n\nNo entries found in source %s.\n',
                                args: [{ value: 'RIPE' }],
                            },
                        ],
                    },
                },
                { status: 400, statusText: 'bad request' },
            );

        await componentFixture.whenStable();

        const plaintextErrors = _.map(whoisObjectTextEditorComponent.alertsServices.alerts.errors, (item) => ({ plainText: item.plainText }));
        expect(plaintextErrors).toEqual([{ plainText: 'ERROR:101: no entries found\n\nNo entries found in source RIPE.\n' }]);
    });

    it('should give warning if fetching SSO mntners fails', async () => {
        createInputParams();
        componentFixture.detectChanges();

        httpMock
            .expectOne({
                method: 'GET',
                url: 'api/whois/RIPE/person/TST08-RIPE?unfiltered=true&unformatted=true',
            })
            .flush(testPersonObject);
        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([], { statusText: '503', status: 503 });

        await componentFixture.whenStable();

        expect(whoisObjectTextEditorComponent.alertsServices.alerts.errors.length).toEqual(1);
        const plaintextErrors = _.map(whoisObjectTextEditorComponent.alertsServices.alerts.errors, (item) => ({ plainText: item.plainText }));
        expect(plaintextErrors).toEqual([{ plainText: 'Error fetching maintainers associated with this SSO account' }]);
    });

    it('should present password popup when trying to modify object with no sso mnt-by ', async () => {
        createInputParams();
        componentFixture.detectChanges();

        httpMock
            .expectOne({
                method: 'GET',
                url: 'api/whois/RIPE/person/TST08-RIPE?unfiltered=true&unformatted=true',
            })
            .flush(testPersonObject);
        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([
            {
                key: 'TESTSSO-MNT',
                type: 'mntner',
                auth: ['SSO'],
                mine: true,
            },
        ]);
        await componentFixture.whenStable();

        whoisObjectTextEditorComponent.rpsl = testPersonRpsl;
        expect(modalMock.open).toHaveBeenCalled();
    });

    it('should re-fetch maintainer after authentication', async () => {
        modalMock.open.and.returnValue({
            componentInstance: {},
            closed: of({}).pipe(
                map(() => {
                    // after the modal is closed we set the mock to return authenticated user
                    credentialsServiceMock.hasCredentials.and.returnValue(true);
                    credentialsServiceMock.getCredentials.and.returnValue([
                        {
                            mntner: 'TEST-MNT',
                            successfulPassword: 'secret',
                        },
                    ]);
                    credentialsServiceMock.getPasswordsForRestCall.and.returnValue(['secret']);
                    return { $value: { selectedItem: { key: 'TEST-MNT', name: 'mntner', mine: true } } };
                }),
            ),
            dismissed: EMPTY,
        });

        createInputParams('mntner', 'TEST-MNT');
        componentFixture.detectChanges();

        httpMock
            .expectOne({
                method: 'GET',
                url: 'api/whois/RIPE/mntner/TEST-MNT?unfiltered=true&unformatted=true',
            })
            .flush({
                objects: {
                    object: [
                        {
                            'primary-key': { attribute: [{ name: 'mntner', value: 'TEST-MNT' }] },
                            attributes: {
                                attribute: [
                                    { name: 'mntner', value: 'TEST-MNT' },
                                    { name: 'descr', value: '.' },
                                    { name: 'admin-c', value: 'TST08-RIPE' },
                                    { name: 'upd-to', value: 'email@email.com' },
                                    { name: 'auth', value: 'MD5-PW first fetch' },
                                    { name: 'mnt-by', value: 'TEST-MNT' },
                                    { name: 'source', value: 'RIPE' },
                                ],
                            },
                        },
                    ],
                },
            });

        httpMock.expectOne({ method: 'GET', url: 'api/user/mntners' }).flush([
            {
                key: 'TESTSSO-MNT',
                type: 'mntner',
                auth: ['SSO'],
                mine: true,
            },
        ]);

        await componentFixture.whenStable();

        httpMock
            .expectOne({
                method: 'GET',
                url: 'api/whois/RIPE/mntner/TEST-MNT?password=secret&unfiltered=true&unformatted=true',
            })
            .flush({
                objects: {
                    object: [
                        {
                            'primary-key': { attribute: [{ name: 'mntner', value: 'TEST-MNT' }] },
                            attributes: {
                                attribute: [
                                    { name: 'mntner', value: 'TEST-MNT' },
                                    { name: 'descr', value: '.' },
                                    { name: 'admin-c', value: 'TST08-RIPE' },
                                    { name: 'upd-to', value: 'email@email.com' },
                                    { name: 'auth', value: 'MD5-PW authenticated refetch' },
                                    { name: 'mnt-by', value: 'TEST-MNT' },
                                    { name: 'source', value: 'RIPE' },
                                ],
                            },
                        },
                    ],
                },
            });

        await componentFixture.whenStable();

        expect(modalMock.open).toHaveBeenCalled();
        expect(whoisObjectTextEditorComponent.rpsl).toEqual(
            'mntner:TEST-MNT\n' +
                'descr:.\n' +
                'admin-c:TST08-RIPE\n' +
                'upd-to:email@email.com\n' +
                'auth:MD5-PW authenticated refetch\n' +
                'mnt-by:TEST-MNT\n' +
                'source:RIPE\n',
        );
    });
});
