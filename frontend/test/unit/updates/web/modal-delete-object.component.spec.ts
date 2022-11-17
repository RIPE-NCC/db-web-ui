import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';
import { CredentialsService } from '../../../../src/app/shared/credentials.service';
import { SharedModule } from '../../../../src/app/shared/shared.module';
import { ModalDeleteObjectComponent } from '../../../../src/app/updatesweb/modal-delete-object.component';
import { RestService } from '../../../../src/app/updatesweb/rest.service';
import { RpkiValidatorService } from '../../../../src/app/updatesweb/rpki-validator.service';

const objectType = 'mntner';
const name = 'TEST-MNT';
const source = 'RIPE';
const ON_CANCEL: string = 'modify';

let restServiceMock: any;
let rpkiValidatorServiceMock: any;
let httpMock: HttpTestingController;
let componentFixture: ComponentFixture<ModalDeleteObjectComponent>;
let modalDeleteObjectComponent: ModalDeleteObjectComponent;
let modalMock: any;
let routerMock: any;

describe('primitives of modalDeleteObject', () => {
    beforeEach(() => {
        modalMock = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);
        routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        restServiceMock = jasmine.createSpyObj('RestService', ['getReferences']);
        restServiceMock.getReferences.and.returnValue(of({ objectType: 'mntner', primaryKey: 'TEST-MNT' }));
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, FormsModule, SharedModule],
            declarations: [ModalDeleteObjectComponent],
            providers: [
                { provide: NgbActiveModal, useValue: modalMock },
                { provide: RestService, useValue: restServiceMock },
                RpkiValidatorService,
                { provide: Router, useValue: routerMock },
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        componentFixture = TestBed.createComponent(ModalDeleteObjectComponent);
        modalDeleteObjectComponent = componentFixture.componentInstance;
        modalDeleteObjectComponent.inputData = {
            name: name,
            objectType: objectType,
            onCancelPath: ON_CANCEL,
            source: source,
        };
        componentFixture.detectChanges();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should compare objects', () => {
        const ref = { objectType: 'mntner', primaryKey: 'TEST-MNT' };
        expect(modalDeleteObjectComponent.isEqualTo('mntner', 'TEST-MNT', ref)).toEqual(true);
        expect(modalDeleteObjectComponent.isEqualTo('person', 'TEST-MNT', ref)).toEqual(false);
        expect(modalDeleteObjectComponent.isEqualTo('mntner', 'TEST2-MNT', ref)).toEqual(false);
    });

    it('should compare objects with composite primary keys', () => {
        const ref = { objectType: 'route', primaryKey: '193.0.0.0/21AS3333' };
        expect(modalDeleteObjectComponent.isEqualTo('route', '193.0.0.0/21AS3333', ref)).toEqual(true);
        expect(modalDeleteObjectComponent.isEqualTo('person', '193.0.0.0/21AS3333', ref)).toEqual(false);
        expect(modalDeleteObjectComponent.isEqualTo('route', 'xyz', ref)).toEqual(false);
    });

    it('should be able to compose display url for object', () => {
        const ref = { objectType: 'mntner', primaryKey: 'TEST-MNT' };
        expect(modalDeleteObjectComponent.displayUrl(ref)).toEqual('webupdates/display/RIPE/mntner/TEST-MNT');
    });

    it('should be able to compose display url for object with slash', () => {
        const ref = { objectType: 'route', primaryKey: '193.0.0.0/21AS3333' };
        expect(modalDeleteObjectComponent.displayUrl(ref)).toEqual('webupdates/display/RIPE/route/193.0.0.0%2F21AS3333');
    });

    it('should allow deletion of unreferenced object: undefined refs', () => {
        const refs = { objectType: 'mntner', primaryKey: 'TEST-MNT' };
        expect(modalDeleteObjectComponent.isDeletable(refs)).toBeTruthy();
    });

    it('should allow deletion of unreferenced object: empty refs', () => {
        const empty: any[] = [];
        const refs = { objectType: 'route', primaryKey: '193.0.0.0/21AS3333', incoming: empty, outgoing: empty };
        expect(modalDeleteObjectComponent.isDeletable(refs)).toBeTruthy();
    });

    it('should allow deletion of self-referenced object', () => {
        const empty: any[] = [];
        const refs = {
            objectType: 'mntner',
            primaryKey: 'TEST-MNT',
            incoming: [{ objectType: 'mntner', primaryKey: 'TEST-MNT' }],
            outgoing: empty,
        };
        expect(modalDeleteObjectComponent.isDeletable(refs)).toBeTruthy();
    });

    it('should allow deletion of simple mntner-person pair', () => {
        expect(modalDeleteObjectComponent.isDeletable(REFS_FOR_TEST_MNT)).toBeTruthy();
    });

    it('should allow deletion of simple person-mntner pair', () => {
        expect(modalDeleteObjectComponent.isDeletable(REFS_FOR_TEST_PERSON)).toBeTruthy();
    });

    it('should not allow deletion of object with other incoming refs', () => {
        expect(modalDeleteObjectComponent.isDeletable(REFS_FOR_UNDELETEABLE_OBJECTS)).toBeFalse();
    });

    it('should detect that object has no () incoming refs', () => {
        expect(modalDeleteObjectComponent.hasNonSelfIncomingRefs('mntner', 'TEST-MNT', [])).toBeFalse();
    });

    it('should detect that object has no () incoming refs', () => {
        expect(modalDeleteObjectComponent.hasNonSelfIncomingRefs('mntner', 'TEST-MNT', [{ objectType: 'mntner', primaryKey: 'TEST-MNT' }])).toBeFalse();
    });

    it('should detect that object has incoming refs', () => {
        expect(modalDeleteObjectComponent.hasNonSelfIncomingRefs('mntner', 'TEST-MNT', REFS_FOR_TEST_MNT.incoming)).toBeTruthy();
    });
});

describe('ModalDeleteObjectComponent undeletable object', () => {
    beforeEach(() => {
        modalMock = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);
        routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        restServiceMock = jasmine.createSpyObj('RestService', ['getReferences', 'deleteObject']);
        restServiceMock.deleteObject.and.returnValue(of({}).toPromise());
        restServiceMock.getReferences.and.returnValue(of(REFS_FOR_UNDELETEABLE_OBJECTS));
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, FormsModule, SharedModule],
            declarations: [ModalDeleteObjectComponent],
            providers: [
                { provide: NgbActiveModal, useValue: modalMock },
                { provide: RestService, useValue: restServiceMock },
                RpkiValidatorService,
                { provide: Router, useValue: routerMock },
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        componentFixture = TestBed.createComponent(ModalDeleteObjectComponent);
        modalDeleteObjectComponent = componentFixture.componentInstance;
        modalDeleteObjectComponent.inputData = {
            name: name,
            objectType: objectType,
            onCancelPath: ON_CANCEL,
            source: source,
        };
        componentFixture.detectChanges();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should query for last object revision references', () => {
        expect(restServiceMock.getReferences).toHaveBeenCalledWith(source, objectType, name, modalDeleteObjectComponent.MAX_REFS_TO_SHOW.toString());
    });

    it('should select referencesInfo if any', async () => {
        await componentFixture.whenStable();

        expect(modalDeleteObjectComponent.incomingReferences.length).toEqual(1);
        expect(modalDeleteObjectComponent.incomingReferences[0].objectType).toEqual('person');
        expect(modalDeleteObjectComponent.incomingReferences[0].primaryKey).toEqual('ME-RIPE');
    });

    it('should decide that object cannot be deleted ', async () => {
        await componentFixture.whenStable();
        expect(modalDeleteObjectComponent.canBeDeleted).toBeFalse();
    });

    it('should not call delete endpoint', async () => {
        modalDeleteObjectComponent.reason = 'some reason';

        restServiceMock.deleteObject.and.callThrough();

        modalDeleteObjectComponent.delete();
        await componentFixture.whenStable();

        expect(restServiceMock.deleteObject).not.toHaveBeenCalled();
    });

    it('should close the modal and return to modify when canceled', async () => {
        modalDeleteObjectComponent.inputData.onCancelPath = 'webupdates/modify';
        modalDeleteObjectComponent.cancel();
        expect(modalMock.dismiss).toHaveBeenCalled();
        expect(routerMock.navigate).toHaveBeenCalled();
        expect(routerMock.navigate).toHaveBeenCalledWith(['webupdates/modify', source, objectType, name]);
    });

    it('should close the modal and return to force delete when canceled', async () => {
        modalDeleteObjectComponent.inputData.onCancelPath = 'forceDelete';
        modalDeleteObjectComponent.cancel();
        expect(modalMock.dismiss).toHaveBeenCalled();
        expect(routerMock.navigate).toHaveBeenCalledWith(['forceDelete', source, objectType, name]);
    });
});

describe('ModalDeleteObjectComponent deleteable object ', () => {
    let credentialsServiceMock: any;

    beforeEach(() => {
        modalMock = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);
        routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        restServiceMock = jasmine.createSpyObj('RestService', ['getReferences', 'deleteObject']);
        restServiceMock.deleteObject.and.returnValue(of({}));
        restServiceMock.getReferences.and.returnValue(of(REFS_FOR_TEST_MNT));
        rpkiValidatorServiceMock = jasmine.createSpyObj('RpkiValidatorService', ['hasRoa']);
        credentialsServiceMock = jasmine.createSpyObj('CredentialsService', ['hasCredentials', 'getCredentials']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, FormsModule, SharedModule],
            declarations: [ModalDeleteObjectComponent],
            providers: [
                { provide: NgbActiveModal, useValue: modalMock },
                { provide: RestService, useValue: restServiceMock },
                { provide: RpkiValidatorService, useValue: rpkiValidatorServiceMock },
                { provide: CredentialsService, useValue: credentialsServiceMock },
                { provide: Router, useValue: routerMock },
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        componentFixture = TestBed.createComponent(ModalDeleteObjectComponent);
        modalDeleteObjectComponent = componentFixture.componentInstance;
        modalDeleteObjectComponent.inputData = {
            name: name,
            objectType: objectType,
            onCancelPath: ON_CANCEL,
            source: source,
        };
        componentFixture.detectChanges();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should query for last object revision references', () => {
        expect(restServiceMock.getReferences).toHaveBeenCalledWith(source, objectType, name, modalDeleteObjectComponent.MAX_REFS_TO_SHOW.toString());
    });

    it('should select referencesInfo if any', async () => {
        await componentFixture.whenStable();

        expect(modalDeleteObjectComponent.incomingReferences.length).toEqual(2);
        expect(modalDeleteObjectComponent.incomingReferences[0].objectType).toEqual('mntner');
        expect(modalDeleteObjectComponent.incomingReferences[0].primaryKey).toEqual('TEST-MNT');
        expect(modalDeleteObjectComponent.incomingReferences[1].objectType).toEqual('person');
        expect(modalDeleteObjectComponent.incomingReferences[1].primaryKey).toEqual('ME-RIPE');
    });

    it('should decide that object can be deleted ', async () => {
        await componentFixture.whenStable();
        expect(modalDeleteObjectComponent.canBeDeleted).toBeTruthy();
    });

    it('should call delete endpoint without password and close modal', async () => {
        await componentFixture.whenStable();

        modalDeleteObjectComponent.reason = 'some reason';

        modalDeleteObjectComponent.delete();

        expect(restServiceMock.deleteObject).toHaveBeenCalledWith(source, objectType, name, modalDeleteObjectComponent.reason, true, undefined);
        expect(modalMock.close).toHaveBeenCalled();
    });

    it('should call delete endpoint with password and close modal', async () => {
        await componentFixture.whenStable();

        modalDeleteObjectComponent.reason = 'some reason';

        credentialsServiceMock.hasCredentials.and.returnValue(true);
        credentialsServiceMock.getCredentials.and.returnValue({ mntner: 'TEST-MNT', successfulPassword: 'secret' });

        modalDeleteObjectComponent.delete();

        expect(restServiceMock.deleteObject).toHaveBeenCalledWith(source, objectType, name, modalDeleteObjectComponent.reason, true, 'secret');
        expect(modalMock.close).toHaveBeenCalled();
    });

    it('should dismiss modal after error deleting object', async () => {
        await componentFixture.whenStable();

        restServiceMock.deleteObject.and.returnValue(throwError(() => ({ data: 'error' })));
        modalDeleteObjectComponent.delete();

        expect(modalMock.dismiss).toHaveBeenCalledWith({ data: 'error' });
    });

    it('should redirect to success delete page after delete object', async () => {
        await componentFixture.whenStable();

        restServiceMock.deleteObject.and.returnValue(of({ data: 'error' }));

        modalDeleteObjectComponent.delete();

        expect(modalMock.close).toHaveBeenCalled();
    });

    it('should show info message that roa exist for route object', async () => {
        await componentFixture.whenStable();
        modalDeleteObjectComponent.inputData = {
            name: '192.194.0.0/16AS1759',
            objectType: 'route',
            onCancelPath: ON_CANCEL,
            source: source,
        };
        rpkiValidatorServiceMock.hasRoa.and.returnValue(
            of({
                validated_route: {
                    route: {
                        origin_asn: 'AS1759',
                        prefix: '192.194.0.0/16',
                    },
                    validity: {
                        state: 'valid',
                        description: 'At least one VRP Matches the Route Prefix',
                        VRPs: {
                            matched: [
                                {
                                    asn: 'AS1759',
                                    prefix: '192.194.0.0/16',
                                    max_length: '24',
                                },
                            ],
                            unmatched_as: [],
                            unmatched_length: [],
                        },
                    },
                },
                generatedTime: '2022-05-10T10:21:34Z',
            }),
        );
        modalDeleteObjectComponent.ngOnInit();
        expect(modalDeleteObjectComponent.showRoaMsg).toBeTruthy();
    });

    it("shouldn't show info message when roa doesn't exist for route object", async () => {
        await componentFixture.whenStable();
        modalDeleteObjectComponent.inputData = {
            name: '194.38.21.0/24AS48693',
            objectType: 'route',
            onCancelPath: ON_CANCEL,
            source: source,
        };
        rpkiValidatorServiceMock.hasRoa.and.returnValue(
            of({
                validated_route: {
                    route: {
                        origin_asn: 'AS48693',
                        prefix: '194.38.21.0/24',
                    },
                    validity: {
                        state: 'not-found',
                        description: 'No VRP Covers the Route Prefix',
                        VRPs: {
                            matched: [],
                            unmatched_as: [],
                            unmatched_length: [],
                        },
                    },
                },
                generatedTime: '2022-05-10T10:23:19Z',
            }),
        );
        modalDeleteObjectComponent.ngOnInit();
        expect(modalDeleteObjectComponent.showRoaMsg).toBeFalsy();
    });
});

describe('ModalDeleteObjectComponent loading references failures ', () => {
    beforeEach(() => {
        modalMock = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);
        routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        restServiceMock = jasmine.createSpyObj('RestService', ['getReferences']);
        restServiceMock.getReferences.and.returnValue(throwError(() => ({ data: 'error' })));
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, FormsModule, SharedModule],
            declarations: [ModalDeleteObjectComponent],
            providers: [
                { provide: NgbActiveModal, useValue: modalMock },
                { provide: RestService, useValue: restServiceMock },
                RpkiValidatorService,
                { provide: Router, useValue: routerMock },
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        componentFixture = TestBed.createComponent(ModalDeleteObjectComponent);
        modalDeleteObjectComponent = componentFixture.componentInstance;
        modalDeleteObjectComponent.inputData = {
            name: name,
            objectType: objectType,
            onCancelPath: ON_CANCEL,
            source: source,
        };
        componentFixture.detectChanges();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should dismiss modal after error getting object references', async () => {
        await componentFixture.whenStable();

        expect(modalMock.dismiss).toHaveBeenCalledWith('error');
    });
});

const REFS_FOR_UNDELETEABLE_OBJECTS = {
    primaryKey: 'TEST-MNT',
    objectType: 'mntner',
    incoming: [
        {
            primaryKey: 'ME-RIPE',
            objectType: 'person',
            incoming: [
                {
                    primaryKey: 'TEST-MNT',
                    objectType: 'mntner',
                },
                {
                    primaryKey: 'OWNER-MNT',
                    objectType: 'mntner',
                },
            ],
            // @ts-ignore
            outgoing: [],
        },
    ],
    // @ts-ignore
    outgoing: [],
};

const REFS_FOR_TEST_MNT = {
    primaryKey: 'TEST-MNT',
    objectType: 'mntner',
    incoming: [
        {
            primaryKey: 'TEST-MNT',
            objectType: 'mntner',
        },
        {
            primaryKey: 'ME-RIPE',
            objectType: 'person',
            incoming: [
                {
                    primaryKey: 'TEST-MNT',
                    objectType: 'mntner',
                },
            ],
            // @ts-ignore
            outgoing: [],
        },
    ],
    // @ts-ignore
    outgoing: [],
};

const REFS_FOR_TEST_PERSON = {
    primaryKey: 'ME-RIPE',
    objectType: 'person',
    incoming: [
        {
            primaryKey: 'TEST-MNT',
            objectType: 'mntner',
            incoming: [
                {
                    primaryKey: 'ME-RIPE',
                    objectType: 'person',
                },
            ],
            // @ts-ignore
            outgoing: [],
        },
    ],
    // @ts-ignore
    outgoing: [],
};
