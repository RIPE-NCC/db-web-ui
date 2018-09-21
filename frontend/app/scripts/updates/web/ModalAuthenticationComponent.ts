interface IModalAuthentication {
    method: any;
    objectType: string;
    objectName: string;
    mntners: any;
    mntnersWithoutPassword: any;
    allowForcedDelete: any;
    isLirObject: any;
}

class ModalAuthenticationController {

    public static $inject = [
        "$log", "WhoisResources", "RestService", "UserInfoService", "CredentialsService",
        "Properties"];

    public close: any;
    public dismiss: any;
    public resolve: IModalAuthentication;

    public PORTAL_URL: string;
    public SOURCE: string;
    public selected: any;

    constructor(
        public $log: angular.ILogService,
        public WhoisResources: any, // extand IWhoisResponseModel
        public RestService: RestService,
        public UserInfoService: UserInfoService,
        public CredentialsService: CredentialsService,
        public properties: IProperties) {

            this.SOURCE = properties.SOURCE;
            this.PORTAL_URL = properties.PORTAL_URL;
    }

    public $onInit() {
        this.selected = {
            associate: true,
            item: this.resolve.mntners[0],
            message: undefined,
            password: "",
        };
        this.allowForceDelete();
    }

    public allowForceDelete() {
        if (this.resolve.method === "ForceDelete") {
            return false;
        }
        return this.resolve.allowForcedDelete;
    }

    public cancel() {
        this.dismiss();
    }

    public ok() {

            if (this.selected.password.length === 0 && this.selected.item) {
                this.selected.message = "Password for mntner: \'" + this.selected.item.key + "\'" + " too short";
                return;
            }

            if (!this.selected.item || !this.selected.item.key) {
                return;
            }
            this.RestService.authenticate(this.resolve.method, this.SOURCE, "mntner", this.selected.item.key, this.selected.password)
                .then((result: any) => {
                    const whoisResources = result;

                    if (whoisResources.isFiltered()) {
                        this.selected.message =
                            "You have not supplied the correct password for mntner: \'" + this.selected.item.key + "\'";
                        return;
                    }

                    this.CredentialsService.setCredentials(this.selected.item.key, this.selected.password);

                    this.UserInfoService.getUserOrgsAndRoles()
                        .then((userInfo) => {
                        const ssoUserName = userInfo.user.username;
                        if (this.selected.associate && ssoUserName) {

                            // append auth-md5 attribute
                            const attributes = this.WhoisResources.wrapAttributes(whoisResources.getAttributes()).addAttributeAfterType({
                                name: "auth",
                                value: "SSO " + ssoUserName,
                            }, {name: "auth"});

                            // do adjust the maintainer
                            this.RestService.associateSSOMntner(whoisResources.getSource(), "mntner", this.selected.item.key,
                                this.WhoisResources.turnAttrsIntoWhoisObject(attributes), this.selected.password)
                                .then((resp: any) => {
                                    this.selected.item.mine = true;
                                    this.selected.item.auth.push("SSO");
                                    this.CredentialsService.removeCredentials(); // because it"s now an sso mntner
                                    // report success back
                                    this.close({$value: {selectedItem: this.selected.item, response: resp}});

                                }, (error: any) => {
                                    this.$log.error("Association error:" + angular.toJson(error));
                                    // remove modal anyway
                                    this.close({$value: {selectedItem: this.selected.item}});
                                });
                        } else {
                            this.$log.debug("No need to associate");
                            // report success back
                            this.close({$value: {
                                    selectedItem: this.selected.item,
                                },
                            });
                        }
                    });
                }, (error: any) => {
                    this.$log.error("Authentication error:" + angular.toJson(error));

                    const whoisResources = this.WhoisResources.wrapWhoisResources(error.data);
                    if (!_.isUndefined(whoisResources)) {
                        this.selected.message = _.reduce(whoisResources.getGlobalErrors(), (total, msg) => {
                            return total + "\n" + msg;
                        });
                    } else {
                        this.selected.message =
                            "Error performing validation for mntner: \'" + this.selected.item.key + "\'";
                    }
                },
            );
        }
}

angular.module("webUpdates")
    .component("modalAuthentication", {
        bindings: {
            close: "&",
            dismiss: "&",
            resolve: "=",
        },
        controller: ModalAuthenticationController,
        templateUrl: "scripts/updates/web/modalAuthentication.html",
    });
