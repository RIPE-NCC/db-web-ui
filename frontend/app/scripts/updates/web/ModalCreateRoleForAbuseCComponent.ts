interface IModalCreateRoleForAbuceC {
    maintainers: any;
    passwords: any;
    source: any;
}

class ModalCreateRoleForAbuseCCotroller {

    public static $inject = [
        "WhoisResources",
        "RestService",
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
    public close: any;
    public dismiss: any;
    public resolve: IModalCreateRoleForAbuceC;

    constructor(private WhoisResources: any,
                private RestService: RestService,
                private MntnerService: any) {
    }

    public create() {
        let attributes = this.WhoisResources.wrapAndEnrichAttributes(
            "role",
            ModalCreateRoleForAbuseCCotroller.NEW_ROLE_TEMPLATE,
        );

        attributes.setSingleAttributeOnName("abuse-mailbox", this.email);
        attributes.setSingleAttributeOnName("e-mail", this.email);
        attributes.setSingleAttributeOnName("source", this.resolve.source);

        attributes = this.WhoisResources.wrapAttributes(attributes);
        this.resolve.maintainers.forEach((mnt: any) => {
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
            this.resolve.source,
            "role",
            this.WhoisResources.turnAttrsIntoWhoisObject(attributes),
            this.resolve.passwords)
            .then((response: any) => {
                const whoisResources = response;
                this.close({$value: whoisResources.getAttributes()});
            },
            (error: any) => {
                return this.dismiss(error);
            },
        );
    }

    public cancel() {
        this.dismiss();
    }

    public isEmailValid(): boolean {
        if (typeof this.email === "string") {
            return this.validateEmail(this.email);
        } else {
            return false;
        }
    }

    private validateEmail(email: string): boolean {
        return ModalCreateRoleForAbuseCCotroller.EMAIL_REGEX.test(email);
    }
}

angular.module("dbWebApp")
    .component("modalCreateRoleForAbuseC", {
        bindings: {
            close: "&",
            dismiss: "&",
            resolve: "=",
        },
        controller: ModalCreateRoleForAbuseCCotroller,
        templateUrl: "scripts/updates/web/modalCreateRoleForAbuseC.html",
    });
