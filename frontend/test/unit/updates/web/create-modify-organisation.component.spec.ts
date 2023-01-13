import { Location } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { CookieService } from 'ngx-cookie-service';
import { EMPTY, of } from 'rxjs';
import { AttributeMetadataService } from '../../../../src/app/attribute/attribute-metadata.service';
import { AttributeSharedService } from '../../../../src/app/attribute/attribute-shared.service';
import { CoreModule } from '../../../../src/app/core/core.module';
import { PrefixService } from '../../../../src/app/domainobject/prefix.service';
import { ResourceStatusService } from '../../../../src/app/myresources/resource-status.service';
import { PropertiesService } from '../../../../src/app/properties.service';
import { SharedModule } from '../../../../src/app/shared/shared.module';
import { WhoisMetaService } from '../../../../src/app/shared/whois-meta.service';
import { WhoisResourcesService } from '../../../../src/app/shared/whois-resources.service';
import { CharsetToolsService } from '../../../../src/app/updatesweb/charset-tools.service';
import { CreateModifyComponent } from '../../../../src/app/updatesweb/create-modify.component';
import { EnumService } from '../../../../src/app/updatesweb/enum.service';
import { ErrorReporterService } from '../../../../src/app/updatesweb/error-reporter.service';
import { LinkService } from '../../../../src/app/updatesweb/link.service';
import { MessageStoreService } from '../../../../src/app/updatesweb/message-store.service';
import { MntnerService } from '../../../../src/app/updatesweb/mntner.service';
import { OrganisationHelperService } from '../../../../src/app/updatesweb/organisation-helper.service';
import { PreferenceService } from '../../../../src/app/updatesweb/preference.service';
import { RestService } from '../../../../src/app/updatesweb/rest.service';
import { ScreenLogicInterceptorService } from '../../../../src/app/updatesweb/screen-logic-interceptor.service';
import { WebUpdatesCommonsService } from '../../../../src/app/updatesweb/web-updates-commons.service';

describe('CreateModifyComponent for organisation', () => {
    let httpMock: HttpTestingController;
    let fixture: ComponentFixture<CreateModifyComponent>;
    let component: CreateModifyComponent;
    let modalMock: any;
    const OBJECT_TYPE = 'organisation';
    const SOURCE = 'RIPE';
    const NAME = 'ORG-UA300-RIPE';

    beforeEach(async () => {
        modalMock = jasmine.createSpyObj('NgbModal', ['open']);
        modalMock.open.and.returnValue({ componentInstance: {}, closed: of(ROLE_OBJ) });
        const routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        TestBed.configureTestingModule({
            imports: [SharedModule, CoreModule, NgSelectModule, HttpClientTestingModule],
            declarations: [CreateModifyComponent],
            providers: [
                PrefixService,
                ResourceStatusService,
                WebUpdatesCommonsService,
                PropertiesService,
                OrganisationHelperService,
                AttributeSharedService,
                AttributeMetadataService,
                WhoisResourcesService,
                WhoisMetaService,
                RestService,
                MessageStoreService,
                MntnerService,
                ErrorReporterService,
                LinkService,
                PreferenceService,
                CookieService,
                EnumService,
                CharsetToolsService,
                ScreenLogicInterceptorService,
                { provide: Location, useValue: { path: () => '' } },
                { provide: Router, useValue: routerMock },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: {
                                source: SOURCE,
                                objectType: OBJECT_TYPE,
                                objectName: NAME,
                                get: (param: string) => component.activatedRoute.snapshot.paramMap[param],
                                has: (param: string) => !!component.activatedRoute.snapshot.paramMap[param],
                            },
                            queryParamMap: { has: (param: string) => !!component.activatedRoute.snapshot.queryParamMap[param] },
                        },
                    },
                },
                { provide: NgbModal, useValue: modalMock },
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(CreateModifyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        httpMock.expectOne({ method: 'GET', url: `api/whois/${SOURCE}/${OBJECT_TYPE}/${NAME}?unfiltered=true` }).flush(DEFAULT_RESPONSE);
        await fixture.whenStable();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should populate abuse-c with new role's nic-hdl", async () => {
        component.attributes = component.organisationHelperService.addAbuseC(component.objectType, component.attributes);
        modalMock.open.and.returnValue({ componentInstance: {}, closed: of(ROLE_OBJ), dismissed: EMPTY });
        const attrAbuseC = component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'abuse-c');
        component.createRoleForAbuseCAttribute(attrAbuseC);
        await fixture.whenStable();
        expect(component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'abuse-c').value).toBe('SR11027-RIPE');
    });

    it('should populate component.roleForAbuseC', async () => {
        component.attributes = component.organisationHelperService.addAbuseC(component.objectType, component.attributes);
        modalMock.open.and.returnValue({ componentInstance: {}, closed: of(ROLE_OBJ), dismissed: EMPTY });
        const attrAbuseC = component.whoisResourcesService.getSingleAttributeOnName(component.attributes, 'abuse-c');
        component.createRoleForAbuseCAttribute(attrAbuseC);
        await fixture.whenStable();
        expect(component.roleForAbuseC).toBeDefined();
    });

    it('should use the helper to update role for abuse-c', async () => {
        component.attributes = component.whoisResourcesService.addAttributeAfterType(
            component.attributes,
            { name: 'abuse-c', value: 'some abuse-c' },
            { name: 'e-mail' },
        );
        component.attributes = component.whoisResourcesService.validateAttributes(
            component.whoisMetaService.enrichAttributesWithMetaInfo(component.objectType, component.attributes),
        );
        await fixture.whenStable();
        spyOn(component.organisationHelperService, 'updateAbuseC');
        component.submit();
        httpMock.expectOne({ method: 'PUT', url: 'api/whois/RIPE/organisation/ORG-UA300-RIPE' }).flush(DEFAULT_RESPONSE);
        fixture.detectChanges();
        expect(component.organisationHelperService.updateAbuseC).toHaveBeenCalled();
    });

    it('should display global error if update the organisation fails', async () => {
        component.attributes = component.whoisResourcesService.addAttributeAfterType(
            component.attributes,
            { name: 'abuse-c', value: 'some abuse-c' },
            { name: 'e-mail' },
        );
        component.attributes = component.whoisResourcesService.validateAttributes(
            component.whoisMetaService.enrichAttributesWithMetaInfo(component.objectType, component.attributes),
        );
        await fixture.whenStable();
        component.submit();
        httpMock
            .expectOne({ method: 'PUT', url: 'api/whois/RIPE/organisation/ORG-UA300-RIPE' })
            .flush(ERROR_RESPONSE, { status: 400, statusText: 'Bad request' });
        fixture.detectChanges();
        await fixture.whenStable();
        expect(component.alertsService.alerts.errors).toHaveSize(1);
        expect(component.alertsService.alerts.errors[0].plainText).toEqual('Update of organisation failed, please see below for more details');
    });

    const ROLE_OBJ = [
        {
            name: 'role',
            value: 'some role',
        },
        {
            name: 'address',
            value: 'Singel 258',
        },
        {
            name: 'e-mail',
            value: 'fdsd@sdfsd.com',
        },
        {
            name: 'abuse-mailbox',
            value: 'fdsd@sdfsd.com',
        },
        {
            name: 'nic-hdl',
            value: 'SR11027-RIPE',
        },
        {
            name: 'mnt-by',
            value: 'MNT-THINK',
        },
        {
            name: 'source',
            value: 'RIPE',
        },
    ];

    const DEFAULT_RESPONSE = {
        objects: {
            object: [
                {
                    'primary-key': { attribute: [{ name: 'organisation', value: 'ORG-UA300-RIPE' }] },
                    attributes: {
                        attribute: [
                            {
                                name: 'organisation',
                                value: 'ORG-UA300-RIPE',
                            },
                            {
                                name: 'org-name',
                                value: 'uhuuu',
                            },
                            {
                                name: 'org-type',
                                value: 'OTHER',
                            },
                            {
                                name: 'address',
                                value: 'Singel 258',
                            },
                            {
                                name: 'e-mail',
                                value: 'uhuuuu@ripe.net',
                            },
                            {
                                name: 'mnt-ref',
                                value: 'TEST-MNT',
                            },
                            {
                                name: 'mnt-by',
                                value: 'TEST-MNT',
                            },
                            {
                                name: 'source',
                                value: 'RIPE',
                            },
                        ],
                    },
                },
            ],
        },
    };

    const ERROR_RESPONSE = {
        link: {
            type: 'locator',
            href: 'http://sussex.prepdev.ripe.net:1080/RIPE/organisation',
        },
        objects: {
            object: [
                {
                    type: 'organisation',
                    link: {
                        type: 'locator',
                        href: 'https://rest-prepdev.db.ripe.net/ripe/organisation/AUTO-1',
                    },
                    source: {
                        id: 'ripe',
                    },
                    'primary-key': {
                        attribute: [
                            {
                                name: 'organisation',
                                value: 'AUTO-1',
                            },
                        ],
                    },
                    attributes: {
                        attribute: [
                            {
                                name: 'organisation',
                                value: 'AUTO-1',
                            },
                            {
                                name: 'org-name',
                                value: 'ORG-UA300-RIPE',
                            },
                            {
                                name: 'org-type',
                                value: 'OTHER',
                            },
                            {
                                name: 'address',
                                value: 'utrecht',
                            },
                            {
                                name: 'e-mail',
                                value: 'none',
                            },
                            {
                                link: {
                                    type: 'locator',
                                    href: 'https://rest-prepdev.db.ripe.net/ripe/role/BLOK1-RIPE',
                                },
                                name: 'abuse-c',
                                value: 'BLOK1-RIPE',
                                'referenced-type': 'role',
                            },
                            {
                                link: {
                                    type: 'locator',
                                    href: 'https://rest-prepdev.db.ripe.net/ripe/mntner/BL-MNT',
                                },
                                name: 'mnt-ref',
                                value: 'BL-MNT',
                                'referenced-type': 'mntner',
                            },
                            {
                                link: {
                                    type: 'locator',
                                    href: 'https://rest-prepdev.db.ripe.net/ripe/mntner/IVANAS-MNT',
                                },
                                name: 'mnt-by',
                                value: 'IVANAS-MNT',
                                'referenced-type': 'mntner',
                            },
                            {
                                link: {
                                    type: 'locator',
                                    href: 'https://rest-prepdev.db.ripe.net/ripe/mntner/TPOLYCHNIA4-MNT',
                                },
                                name: 'mnt-by',
                                value: 'TPOLYCHNIA4-MNT',
                                'referenced-type': 'mntner',
                            },
                            {
                                link: {
                                    type: 'locator',
                                    href: 'https://rest-prepdev.db.ripe.net/ripe/mntner/SHW-MNT',
                                },
                                name: 'mnt-by',
                                value: 'SHW-MNT',
                                'referenced-type': 'mntner',
                            },
                            {
                                link: {
                                    type: 'locator',
                                    href: 'https://rest-prepdev.db.ripe.net/ripe/mntner/SHWIVA-MNT',
                                },
                                name: 'mnt-by',
                                value: 'SHWIVA-MNT',
                                'referenced-type': 'mntner',
                            },
                            {
                                name: 'source',
                                value: 'RIPE',
                            },
                        ],
                    },
                },
            ],
        },
        errormessages: {
            errormessage: [
                {
                    severity: 'Error',
                    attribute: {
                        name: 'e-mail',
                        value: '         none',
                    },
                    text: 'Syntax error in %s',
                    args: [
                        {
                            value: 'none',
                        },
                    ],
                },
            ],
        },
        'terms-and-conditions': {
            type: 'locator',
            href: 'https://apps.db.ripe.net/db-web-ui/legal#terms-and-conditions',
        },
    };
});
