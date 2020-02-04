import {Component, Inject, Input} from "@angular/core";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {WINDOW} from "../core/window.service";
import {IAttributeModel} from "../shared/whois-response-type.model";
import {PropertiesService} from "../properties.service";

@Component({
    selector: "modal-edit-attribute",
    templateUrl: "./modal-edit-attribute.component.html",
})
export class ModalEditAttributeComponent {

    @Input()
    public attr: IAttributeModel;

    private modalContactFields = ["phone", "fax-no", "e-mail"];

    private readonly ORG_DETAILS_URL: string;
    private readonly ACCOUNT_DETAILS_URL: string;

    constructor(private activeModal: NgbActiveModal,
                @Inject(WINDOW) private window: any,
                private properties: PropertiesService) {
        this.ORG_DETAILS_URL = properties.PORTAL_URL + "#/org-details-change";
        this.ACCOUNT_DETAILS_URL = properties.PORTAL_URL + "#/account-details";
    }

    public goToOrgNameEditor() {
        this.window.open(this.ORG_DETAILS_URL.concat("/organisation-details"), "_blank");
        this.activeModal.close();
    }

    public goToAccountOrgNameEditor() {
        this.window.open(this.ACCOUNT_DETAILS_URL.concat("#organisationDetails"), "_blank");
        this.activeModal.close();
    }

    public goToOrgaAddressEditor() {
        this.window.open(this.ORG_DETAILS_URL.concat("/organisation-details"), "_blank");
        this.activeModal.close();
    }

    public goToAccountAddressEditor() {
        this.window.open(this.ACCOUNT_DETAILS_URL.concat("#postalAddress"), "_blank");
        this.activeModal.close();
    }

    public goToAccountContactInfoEditor() {
        this.window.open(this.ACCOUNT_DETAILS_URL.concat("#contactInfo"), "_blank");
        this.activeModal.close();
    }

    public cancel() {
        this.activeModal.dismiss();
    }

    public isModalContactField(): boolean {
        return this.modalContactFields.indexOf(this.attr.name) > -1;
    }
}
