import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import {of} from "rxjs";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {WhoisResourcesService} from "../../../../app/ng/shared/whois-resources.service";
import {RestService} from "../../../../app/ng/updates/rest.service";
import {CredentialsService} from "../../../../app/ng/shared/credentials.service";
import {ModalCreateRoleForAbuseCComponent} from "../../../../app/ng/updates/web/modal-create-role-for-abusec.component";
import {MntnerService} from "../../../../app/ng/updates/mntner.service";
import {PrefixService} from "../../../../app/ng/domainobject/prefix.service";
import {WhoisMetaService} from "../../../../app/ng/shared/whois-meta.service";

describe("ModalCreateRoleForAbuseCComponent", () => {

    const source = "RIPE";
    const maintainers = [{type:"mntner", key:"a-mnt", auth:["MD5-PW"]}, ({type:"mntner", key:"RIPE-NCC-HM-MNT"})];

    let httpMock: HttpTestingController;
    let componentFixture: ComponentFixture<ModalCreateRoleForAbuseCComponent>;
    let modalCreateRoleForAbuseCComponent: ModalCreateRoleForAbuseCComponent;
    let modalMock: any;
    let restServiceMock: any;

    beforeEach(() => {
        modalMock = jasmine.createSpyObj("NgbActiveModal", ["close", "dismiss"]);
        const routerMock = jasmine.createSpyObj("Router", ["navigate", "navigateByUrl"]);
        restServiceMock = jasmine.createSpyObj("RestService", ["createObject"]);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, FormsModule],
            declarations: [ModalCreateRoleForAbuseCComponent],
            providers: [
                {provide: NgbActiveModal, useValue: modalMock},
                WhoisResourcesService,
                MntnerService,
                WhoisMetaService,
                CredentialsService,
                PrefixService,
                {provide: RestService, useValue: restServiceMock},
                {provide: Router, useValue: routerMock},
            ],
        });
        httpMock = TestBed.get(HttpTestingController);
        componentFixture = TestBed.createComponent(ModalCreateRoleForAbuseCComponent);
        modalCreateRoleForAbuseCComponent = componentFixture.componentInstance;
        modalCreateRoleForAbuseCComponent.inputData = {
            maintainers: maintainers,
            passwords: "password",
            source: source,
        };
        componentFixture.detectChanges();

    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should create role with abuse-mailbox and close", () => {
        restServiceMock.createObject.and.returnValue(of({getAttributes: () => {}}));

        modalCreateRoleForAbuseCComponent.email = "m@ripe.net";
        modalCreateRoleForAbuseCComponent.create();

        expect(restServiceMock.createObject.calls.mostRecent().args[2].objects.object[0].attributes.attribute)
            .toContain(jasmine.objectContaining({
                name: "abuse-mailbox",
                value: "m@ripe.net"
        }));
        expect(modalMock.close).toHaveBeenCalled();
    });

    it("should remove mnt-by: RIPE-NCC-HM-MNT from creating role", () => {
        restServiceMock.createObject.and.returnValue(of({getAttributes: () => {}}));

        modalCreateRoleForAbuseCComponent.email = "m@ripe.net";
        modalCreateRoleForAbuseCComponent.create();

        expect(restServiceMock.createObject.calls.mostRecent().args[2].objects.object[0].attributes.attribute)
            .not.toContain(jasmine.objectContaining({
                name: "mnt-by",
                value: "RIPE-NCC-HM-MNT"
        }));
        expect(modalMock.close).toHaveBeenCalled();
    });

    it("should validate as valid email", () => {
        modalCreateRoleForAbuseCComponent.email = "m@ripe.net";
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(true);
    });

    it("should validate as invalid email", () => {
        modalCreateRoleForAbuseCComponent.email = "@ripe.net";
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(false);
        modalCreateRoleForAbuseCComponent.email = ".@ripe.net";
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(false);
        modalCreateRoleForAbuseCComponent.email = "a b@ripe.net";
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(false);
        modalCreateRoleForAbuseCComponent.email = "a@b@ripe.net";
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(false);
        modalCreateRoleForAbuseCComponent.email = "ab@ripe";
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(false);
        modalCreateRoleForAbuseCComponent.email = "a..b@ripe.web";
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(false);
        modalCreateRoleForAbuseCComponent.email = ".bc@ripe.web";
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(false);
        modalCreateRoleForAbuseCComponent.email = "ab.@ripe.web";
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(false);
        modalCreateRoleForAbuseCComponent.email = "ab@ripe..web";
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(false);
        modalCreateRoleForAbuseCComponent.email = "ab.ripe.web";
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(false);
        modalCreateRoleForAbuseCComponent.email = "";
        expect(modalCreateRoleForAbuseCComponent.isEmailValid()).toEqual(false);
    });

    it("should cancel", () => {
        modalCreateRoleForAbuseCComponent.cancel();
        expect(modalMock.dismiss).toHaveBeenCalled();
    });
});

