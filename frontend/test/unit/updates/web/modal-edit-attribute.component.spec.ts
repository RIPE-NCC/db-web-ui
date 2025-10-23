import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PropertiesService } from '../../../../src/app/properties.service';
import { SharedModule } from '../../../../src/app/shared/shared.module';
import { ModalEditAttributeComponent } from '../../../../src/app/updatesweb/modal-edit-attribute.component';

describe('ModalEditAttributeController', () => {
    let httpMock: HttpTestingController;
    let componentFixture: ComponentFixture<ModalEditAttributeComponent>;
    let modalEditAttributeComponent: ModalEditAttributeComponent;
    let propertiesService: PropertiesService;
    let modalMock: any;

    beforeEach(() => {
        modalMock = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);
        TestBed.configureTestingModule({
            imports: [FormsModule, SharedModule, ModalEditAttributeComponent],
            providers: [
                { provide: NgbActiveModal, useValue: modalMock },
                PropertiesService,
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        propertiesService = TestBed.inject(PropertiesService);
        componentFixture = TestBed.createComponent(ModalEditAttributeComponent);
        modalEditAttributeComponent = componentFixture.componentInstance;
        modalEditAttributeComponent.attr = {
            name: 'address',
        };
    });

    afterEach(() => httpMock.verify());

    it('should close the modal and open new tab with legal address details page', () => {
        spyOn(window, 'open');
        modalEditAttributeComponent.attr = { name: 'address' };
        componentFixture.detectChanges();

        expect(modalEditAttributeComponent.attr).toEqual({ name: 'address' });
        modalEditAttributeComponent.goToOrgaAddressEditor();
        expect(window.open).toHaveBeenCalledWith(`${propertiesService.PORTAL_URL}#/org-details-change/organisation-details`, '_blank');
        expect(modalMock.close).toHaveBeenCalled();

        modalEditAttributeComponent.goToAccountAddressEditor();
        expect(window.open).toHaveBeenCalledWith(`${propertiesService.PORTAL_URL}#/account-details#postalAddress`, '_blank');
        expect(modalMock.close).toHaveBeenCalled();
    });

    it('should close the modal and open new tab with legal organisation details page', () => {
        spyOn(window, 'open');
        modalEditAttributeComponent.attr = { name: 'org-name' };
        componentFixture.detectChanges();

        expect(modalEditAttributeComponent.attr).toEqual({ name: 'org-name' });
        modalEditAttributeComponent.goToOrgNameEditor();
        expect(window.open).toHaveBeenCalledWith(`${propertiesService.PORTAL_URL}#/org-details-change/organisation-details`, '_blank');
        expect(modalMock.close).toHaveBeenCalled();

        modalEditAttributeComponent.goToAccountOrgNameEditor();
        expect(window.open).toHaveBeenCalledWith(`${propertiesService.PORTAL_URL}#/account-details#organisationDetails`, '_blank');
        expect(modalMock.close).toHaveBeenCalled();
    });

    it('should close the modal and open new tab with account details page for editing phone', () => {
        spyOn(window, 'open');
        modalEditAttributeComponent.attr = { name: 'phone' };
        componentFixture.detectChanges();

        expect(modalEditAttributeComponent.attr).toEqual({ name: 'phone' });
        modalEditAttributeComponent.goToAccountContactInfoEditor();
        expect(window.open).toHaveBeenCalledWith(`${propertiesService.PORTAL_URL}#/account-details#contactInfo`, '_blank');
        expect(modalMock.close).toHaveBeenCalled();
    });

    it('should close the modal and open new tab with account details page for editing fax-no', () => {
        spyOn(window, 'open');
        modalEditAttributeComponent.attr = { name: 'fax-no' };
        componentFixture.detectChanges();

        expect(modalEditAttributeComponent.attr).toEqual({ name: 'fax-no' });
        modalEditAttributeComponent.goToAccountContactInfoEditor();
        expect(window.open).toHaveBeenCalledWith(`${propertiesService.PORTAL_URL}#/account-details#contactInfo`, '_blank');
        expect(modalMock.close).toHaveBeenCalled();
    });

    it('should close the modal and open new tab with account details page for editing email', () => {
        spyOn(window, 'open');
        modalEditAttributeComponent.attr = { name: 'e-mail' };
        componentFixture.detectChanges();

        expect(modalEditAttributeComponent.attr).toEqual({ name: 'e-mail' });
        modalEditAttributeComponent.goToAccountContactInfoEditor();
        expect(window.open).toHaveBeenCalledWith(`${propertiesService.PORTAL_URL}#/account-details#contactInfo`, '_blank');
        expect(modalMock.close).toHaveBeenCalled();
    });
});
