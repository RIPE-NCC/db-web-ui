declare const moment: any;

class ConfirmMaintainerController {
    public static $inject = ["$log", "$stateParams", "$state", "$location", "AlertService", "EmailLink"];

    public key: string = "";
    public email: any;
    public user: any;
    public hashOk: boolean = false;
    public localHash: any;

    constructor(private $log: angular.ILogService,
                public $stateParams: any,
                public $state: ng.ui.IStateService,
                public $location: angular.ILocationService,
                public AlertService: AlertService,
                public EmailLink: EmailLinkService) {

    }

    public $onInit() {

        this.AlertService.clearErrors();
        this.$log.info("ConfirmMaintainer starts");

        if (this.$stateParams.hash === undefined) {
            this.AlertService.setGlobalError("No hash passed along");
            return;
        }

        this.localHash = this.$stateParams.hash;

        this.EmailLink.get(this.localHash)
            .then((link: any) => {
                this.$log.info("Successfully fetched email-link:" + JSON.stringify(link.data));
                this.key = link.data.mntner;
                this.email = link.data.email;
                this.user = link.data.username;
                if (!link.data.hasOwnProperty("expiredDate") || moment(link.data.expiredDate, moment.ISO_8601).isBefore(moment())) {
                    this.AlertService.addGlobalWarning("Your link has expired");
                    return;
                }
                if (link.data.currentUserAlreadyManagesMntner === true) {
                    this.AlertService.addGlobalWarning(
                        `Your RIPE NCC Access account is already associated with this mntner. ` +
                        `You can modify this mntner <a href="${this.makeModificationUrl(this.key)}">here</a>.`);
                    return;
                }
                this.hashOk = true;
                this.AlertService.addGlobalInfo("You are logged in with the RIPE NCC Access account " + this.user);
            }, (error: any) => {
                let msg = "Error fetching email-link";
                if (!_.isObject(error.data)) {
                    msg = msg.concat(": " + error.data);
                }
                this.$log.error(msg);
                this.AlertService.setGlobalError(msg);
            });
    }

    public associate() {
        this.EmailLink.update(this.localHash)
            .then((resp) => {

            this.$log.error("Successfully associated email-link:" + resp);

            this.navigateToSsoAdded(this.key, this.user);

        }, (error: any) => {

            this.$log.error("Error associating email-link:" + JSON.stringify(error));

            if (error.status === 400 && !_.isUndefined(error.data) && error.data.match(/already contains SSO/).length === 1) {
                this.AlertService.setGlobalError(error.data);
            } else {
                this.AlertService.setGlobalError(
                `<p>An error occurred while adding the RIPE NCC Access account to the <span class="mntner">MNTNER</span> object.</p>` +
                `<p>No changes were made to the <span class="mntner">MNTNER</span> object ${this.key}.</p>` +
                `<p>If this error continues, please contact us at <a href="mailto:ripe-dbm@ripe.net">ripe-dbm@ripe.net</a> for assistance.</p>`);
            }
        });
    }

    public cancelAssociate() {
        this.AlertService.clearErrors();
        this.AlertService.addGlobalWarning(
        `<p>No changes were made to the <span class="mntner">MNTNER</span> object ${this.key}.</p>` +
                `<p>If you wish to add a different RIPE NCC Access account to your <strong>MNTNER</strong> object:` +
                `<ol>` +
                `<li>Sign out of RIPE NCC Access.</li>` +
                `<li>Sign back in to RIPE NCC Access with the account you wish to use.</li>` +
                `<li>Click on the link in the instruction email again.</li>` +
                `</ol>`);
    }

    public makeModificationUrl(key: string) {
        return "#/webupdates/modify/RIPE/mntner/" + key;
    }

    private navigateToSsoAdded(mntnerKey: string, user: any) {
        this.$state.transitionTo("fmp.ssoAdded", {
            mntnerKey,
            user,
        });
    }
}

angular.module("fmp")
    .component("confirmMaintainer", {
        controller: ConfirmMaintainerController,
        templateUrl: "./confirmMaintainer.html",
    });
