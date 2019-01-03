class ModalEditAttributeController {

    public static $inject = ["$window", "Properties"];

    public close: any;
    public dismiss: any;
    public resolve: any;

    public attr: IAttributeModel;

    private modalContactFields = ["phone", "fax-no", "e-mail"];

    private readonly ORG_DETAILS_URL: string;
    private readonly ACCOUNT_DETAILS_URL: string;

    constructor(public $window: any,
                public properties: IProperties) {
        this.ORG_DETAILS_URL = properties.PORTAL_URL + "#/org-details-change";
        this.ACCOUNT_DETAILS_URL = properties.PORTAL_URL + "#/account-details";
    }

    public $onInit() {
        this.attr = this.resolve.attr;
    }

    public goToOrgNameEditor() {
        this.$window.open(this.ORG_DETAILS_URL.concat("/organisation-details"), "_blank");
        this.close();
    }

    public goToAccountOrgNameEditor() {
        this.$window.open(this.ACCOUNT_DETAILS_URL.concat("#organisationDetails"), "_blank");
        this.close();
    }

    public goToOrgaAddressEditor() {
        this.$window.open(this.ORG_DETAILS_URL.concat("/organisation-details"), "_blank");
        this.close();
    }

    public goToAccountAddressEditor() {
        this.$window.open(this.ACCOUNT_DETAILS_URL.concat("#postalAddress"), "_blank");
        this.close();
    }

    public goToAccountContactInfoEditor() {
        this.$window.open(this.ACCOUNT_DETAILS_URL.concat("#contactInfo"), "_blank");
        this.close();
    }

    public cancel() {
        this.dismiss();
    }

    public isModalContactField(): boolean {
        return this.modalContactFields.indexOf(this.attr.name) > -1;
    }
}

angular.module("webUpdates")
    .component("modalEditAttribute", {
        bindings: {
            close: "&",
            dismiss: "&",
            resolve: "=",
        },
        controller: ModalEditAttributeController,
        templateUrl: "scripts/updates/web/modalEditAttribute.html",
    });
