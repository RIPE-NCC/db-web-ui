import {ComponentFixture, TestBed} from "@angular/core/testing";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {FormsModule} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {SharedModule} from "../../../../src/app/shared/shared.module";
import {ModalEditAttributeComponent} from "../../../../src/app/updatesweb/modal-edit-attribute.component";
import {PropertiesService} from "../../../../src/app/properties.service";
import {WINDOW} from "../../../../src/app/core/window.service";

describe("ModalEditAttributeController", () => {

    let httpMock: HttpTestingController;
    let componentFixture: ComponentFixture<ModalEditAttributeComponent>;
    let modalEditAttributeComponent: ModalEditAttributeComponent;
    let propertiesService: PropertiesService;
    let modalMock: any;
    let windowMock: any;

    beforeEach(() => {
        windowMock = jasmine.createSpyObj("Window", ["open"]);
        modalMock = jasmine.createSpyObj("NgbActiveModal", ["close", "dismiss"]);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, FormsModule, SharedModule],
            declarations: [ModalEditAttributeComponent],
            providers: [
                {provide: NgbActiveModal, useValue: modalMock},
                PropertiesService,
                {provide: WINDOW, useValue: windowMock},
            ],
        });
        httpMock = TestBed.get(HttpTestingController);
        propertiesService = TestBed.get(PropertiesService);
        componentFixture = TestBed.createComponent(ModalEditAttributeComponent);
        modalEditAttributeComponent = componentFixture.componentInstance;
        modalEditAttributeComponent.attr = {
            name: "address",
        };
    });

    afterEach(() => httpMock.verify());

    it("should close the modal and open new tab with legal address details page", () => {
        modalEditAttributeComponent.attr = { name: "address" };
        componentFixture.detectChanges();

        expect(modalEditAttributeComponent.attr).toEqual({ name: "address" });
        modalEditAttributeComponent.goToOrgaAddressEditor();
        expect(windowMock.open).toHaveBeenCalledWith(`${propertiesService.PORTAL_URL}#/org-details-change/organisation-details`, "_blank");
        expect(modalMock.close).toHaveBeenCalled();

        modalEditAttributeComponent.goToAccountAddressEditor();
        expect(windowMock.open).toHaveBeenCalledWith(`${propertiesService.PORTAL_URL}#/account-details#postalAddress`, "_blank");
        expect(modalMock.close).toHaveBeenCalled();
    });

    it("should close the modal and open new tab with legal organisation details page", () => {
        modalEditAttributeComponent.attr = { name: "org-name" };
        componentFixture.detectChanges();

        expect(modalEditAttributeComponent.attr).toEqual({ name: "org-name" });
        modalEditAttributeComponent.goToOrgNameEditor();
        expect(windowMock.open).toHaveBeenCalledWith(`${propertiesService.PORTAL_URL}#/org-details-change/organisation-details`, "_blank");
        expect(modalMock.close).toHaveBeenCalled();


        modalEditAttributeComponent.goToAccountOrgNameEditor();
        expect(windowMock.open).toHaveBeenCalledWith(`${propertiesService.PORTAL_URL}#/account-details#organisationDetails`, "_blank");
        expect(modalMock.close).toHaveBeenCalled();
    });

    it("should close the modal and open new tab with account details page for editing phone", () => {
        modalEditAttributeComponent.attr = { name: "phone" };
        componentFixture.detectChanges();

        expect(modalEditAttributeComponent.attr).toEqual({ name: "phone" });
        modalEditAttributeComponent.goToAccountContactInfoEditor();
        expect(windowMock.open).toHaveBeenCalledWith(`${propertiesService.PORTAL_URL}#/account-details#contactInfo`, "_blank");
        expect(modalMock.close).toHaveBeenCalled();
    });

    it("should close the modal and open new tab with account details page for editing fax-no", () => {
        modalEditAttributeComponent.attr = { name: "fax-no" };
        componentFixture.detectChanges();

        expect(modalEditAttributeComponent.attr).toEqual({ name: "fax-no" });
        modalEditAttributeComponent.goToAccountContactInfoEditor();
        expect(windowMock.open).toHaveBeenCalledWith(`${propertiesService.PORTAL_URL}#/account-details#contactInfo`, "_blank");
        expect(modalMock.close).toHaveBeenCalled();
    });

    it("should close the modal and open new tab with account details page for editing email", () => {
        modalEditAttributeComponent.attr = { name: "e-mail" };
        componentFixture.detectChanges();

        expect(modalEditAttributeComponent.attr).toEqual({ name: "e-mail" });
        modalEditAttributeComponent.goToAccountContactInfoEditor();
        expect(windowMock.open).toHaveBeenCalledWith(`${propertiesService.PORTAL_URL}#/account-details#contactInfo`, "_blank");
        expect(modalMock.close).toHaveBeenCalled();
    });
});
