import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PropertiesService } from '../properties.service';
import { IAttributeModel } from '../shared/whois-response-type.model';

@Component({
    selector: 'modal-edit-attribute',
    templateUrl: './modal-edit-attribute.component.html',
    standalone: false,
})
export class ModalEditAttributeComponent {
    @Input()
    public attr: IAttributeModel;

    private modalContactFields = ['phone', 'fax-no', 'e-mail'];

    private readonly ORG_DETAILS_URL: string;
    private readonly ACCOUNT_DETAILS_URL: string;

    constructor(private activeModal: NgbActiveModal, private properties: PropertiesService) {
        this.ORG_DETAILS_URL = properties.PORTAL_URL + '#/org-details-change';
        this.ACCOUNT_DETAILS_URL = properties.PORTAL_URL + '#/account-details';
    }

    public goToOrgNameEditor() {
        window.open(this.ORG_DETAILS_URL.concat('/organisation-details'), '_blank');
        this.activeModal.close();
    }

    public goToAccountOrgNameEditor() {
        window.open(this.ACCOUNT_DETAILS_URL.concat('#organisationDetails'), '_blank');
        this.activeModal.close();
    }

    public goToOrgaAddressEditor() {
        window.open(this.ORG_DETAILS_URL.concat('/organisation-details'), '_blank');
        this.activeModal.close();
    }

    public goToAccountAddressEditor() {
        window.open(this.ACCOUNT_DETAILS_URL.concat('#postalAddress'), '_blank');
        this.activeModal.close();
    }

    public goToAccountContactInfoEditor() {
        window.open(this.ACCOUNT_DETAILS_URL.concat('#contactInfo'), '_blank');
        this.activeModal.close();
    }

    public cancel() {
        this.activeModal.dismiss();
    }

    public isModalContactField(): boolean {
        return this.modalContactFields.indexOf(this.attr.name) > -1;
    }
}
