class ModalCreateRoleForAbuseCController {

    public static $inject = [
        "$uibModalInstance",
        "WhoisResources",
        "RestService",
        "source",
        "maintainers",
        "passwords",
        "MntnerService",
    ];

    private static NEW_ROLE_TEMPLATE = [ {
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

    constructor(private $uibModalInstance: any,
                private WhoisResources: any,
                private RestService: RestService,
                private source: string,
                private maintainers: any,
                private passwords: any,
                private MntnerService: any) {
    }

    public create() {
        let attributes = this.WhoisResources.wrapAndEnrichAttributes(
            "role",
            ModalCreateRoleForAbuseCController.NEW_ROLE_TEMPLATE,
        );

        attributes.setSingleAttributeOnName("abuse-mailbox", this.email);
        attributes.setSingleAttributeOnName("e-mail", this.email);
        attributes.setSingleAttributeOnName("source", this.source);

        attributes = this.WhoisResources.wrapAttributes(attributes);
        this.maintainers.forEach((mnt: any) => {
            // remove mnt - for which on backend fail creating role
            if (typeof mnt.value === "string" && !this.MntnerService.isNccMntner(mnt.value)) {
                attributes = attributes.addAttributeAfterType({
                    name: "mnt-by",
                    value: mnt.value,
                }, {name: "mnt-by"});
                attributes = this.WhoisResources.wrapAttributes(attributes);
            }
        });

        attributes = this.WhoisResources.wrapAndEnrichAttributes("role", attributes.removeNullAttributes());
        const resp = this.RestService.createObject(
            this.source,
            "role",
            this.WhoisResources.turnAttrsIntoWhoisObject(attributes),
            this.passwords,
        ).then(
            (response: any) => {
                this.$uibModalInstance.close(response.getAttributes());
            },
            (error: any) => {
                return this.$uibModalInstance.dismiss(error);
            },
        );
    }

    public cancel() {
        this.$uibModalInstance.dismiss("cancel");
    }

    public isEmailValid(): boolean {
        if (typeof this.email === "string") {
            return this.validateEmail(this.email);
        } else {
            return false;
        }
    }

    private validateEmail(email: string): boolean {
        return ModalCreateRoleForAbuseCController.EMAIL_REGEX.test(email);
    }

}

angular.module("dbWebApp")
    .controller("ModalCreateRoleForAbuseCController", ModalCreateRoleForAbuseCController);
