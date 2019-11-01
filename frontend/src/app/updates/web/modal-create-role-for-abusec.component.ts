import {Component, Input} from "@angular/core";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {WhoisResourcesService} from "../../shared/whois-resources.service";
import {RestService} from "../rest.service";
import {MntnerService} from "../mntner.service";
import {IAttributeModel} from "../../shared/whois-response-type.model";

interface IModalCreateRoleForAbuceC {
    maintainers: any;
    passwords: any;
    source: any;
}

@Component({
    selector: "modal-create-role-for-abusec",
    templateUrl: "./modal-create-role-for-abusec.component.html",
})
export class ModalCreateRoleForAbuseCComponent {

    private static NEW_ROLE_TEMPLATE: IAttributeModel[] = [ {
        name : "role",
        value : "Abuse contact role object",
    }, {
        name : "address",
        value : "----",
    }, {
        name : "e-mail",
    }, {
        name : "abuse-mailbox",
    }, {
        name : "nic-hdl",
        value : "AUTO-1",
    }, {
        name : "mnt-by",
    }, {
        name : "source",
    }];

    private static EMAIL_REGEX =
        /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

    public email: string;
    @Input()
    public inputData: IModalCreateRoleForAbuceC;

    constructor(private activeModal: NgbActiveModal,
                private whoisResourcesService: WhoisResourcesService,
                private restService: RestService,
                private mntnerService: MntnerService) {
    }

    public create() {
        let attributes = this.whoisResourcesService.wrapAndEnrichAttributes(
            "role",
            ModalCreateRoleForAbuseCComponent.NEW_ROLE_TEMPLATE,
        );

        attributes.setSingleAttributeOnName("abuse-mailbox", this.email);
        attributes.setSingleAttributeOnName("e-mail", this.email);
        attributes.setSingleAttributeOnName("source", this.inputData.source);

        attributes = this.whoisResourcesService.wrapAttributes(attributes);
        this.inputData.maintainers.forEach((mnt: any) => {
            // remove mnt - for which on backend fail creating role
            if (typeof mnt.value === "string" && !this.mntnerService.isNccMntner(mnt.value)) {
                attributes = attributes.addAttributeAfterType({
                    name: "mnt-by",
                    value: mnt.value,
                }, {name: "mnt-by"});
                attributes = this.whoisResourcesService.wrapAttributes(attributes);
            }
        });

        attributes = this.whoisResourcesService.wrapAndEnrichAttributes("role", attributes.removeNullAttributes());
        const resp = this.restService.createObject(this.inputData.source, "role",
                        this.whoisResourcesService.turnAttrsIntoWhoisObject(attributes), this.inputData.passwords)
            .subscribe((response: any) => {
                const whoisResources = response;
                this.activeModal.close(whoisResources.getAttributes());
            },
            (error: any) => {
                return this.activeModal.dismiss(error);
            },
        );
    }

    public cancel() {
        this.activeModal.dismiss();
    }

    public isEmailValid(): boolean {
        if (typeof this.email === "string") {
            return this.validateEmail(this.email);
        } else {
            return false;
        }
    }

    private validateEmail(email: string): boolean {
        return ModalCreateRoleForAbuseCComponent.EMAIL_REGEX.test(email);
    }
}
