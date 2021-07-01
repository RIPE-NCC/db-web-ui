import {Component, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import * as moment from "moment";
import * as _ from "lodash";
import {EmailLinkService} from "./email-link.services";
import {AlertsComponent} from "../shared/alert/alerts.component";

@Component({
    selector: "confirm-maintainer",
    templateUrl: "./confirm-maintainer.component.html",
})
export class ConfirmMaintainerComponent {

    public key: string = "";
    public email: any;
    public user: any;
    public hashOk: boolean = false;
    public localHash: any;

    @ViewChild(AlertsComponent, {static: true})
    public alertsComponent: AlertsComponent;

    constructor(private emailLinkService: EmailLinkService,
                public activatedRoute: ActivatedRoute,
                public router: Router) {
    }

    public ngOnInit() {

        this.alertsComponent.clearAlertMessages();
        console.info("ConfirmMaintainer starts");
        const queryParams = this.activatedRoute.snapshot.queryParams;
        if (!queryParams.hash) {
            this.alertsComponent.setGlobalError("No hash passed along");
            return;
        }

        this.localHash = queryParams.hash;
        this.emailLinkService.get(this.localHash)
            .subscribe((link: any) => {
                console.info("Successfully fetched email-link:" + JSON.stringify(link));
                this.key = link.mntner;
                this.email = link.email;
                this.user = link.username;
                if (!link.hasOwnProperty("expiredDate") || moment.utc(link.expiredDate, moment.ISO_8601).isBefore(moment.utc())) {
                    this.alertsComponent.addGlobalWarning("Your link has expired");
                    return;
                }
                if (link.currentUserAlreadyManagesMntner === true) {
                    this.alertsComponent.addGlobalWarning(
                        `Your RIPE NCC Access account is already associated with this mntner. ` +
                        `You can modify this mntner <a href="${this.makeModificationUrl(this.key)}">here</a>.`);
                    return;
                }
                this.hashOk = true;
                this.alertsComponent.addGlobalInfo("You are logged in with the RIPE NCC Access account " + this.user);
            }, (error: any) => {
                let msg = "Error fetching email-link";
                if (!_.isObject(error.data)) {
                    msg = msg.concat(": " + error.data);
                }
                console.error(msg);
                this.alertsComponent.setGlobalError(msg);
            });
    }

    public associate() {
        this.emailLinkService.update(this.localHash)
            .subscribe((resp) => {

            console.error("Successfully associated email-link:" + resp);

            this.navigateToSsoAdded(this.key, this.user);

        }, (error: any) => {

            console.error("Error associating email-link:" + JSON.stringify(error));

            if (error.status === 400 && !_.isUndefined(error.data) && error.data.match(/already contains SSO/).length === 1) {
                this.alertsComponent.setGlobalError(error.data);
            } else {
                this.alertsComponent.setGlobalError(
                `<p>An error occurred while adding the RIPE NCC Access account to the <span class="mntner">MNTNER</span> object.</p>` +
                `<p>No changes were made to the <span class="mntner">MNTNER</span> object ${this.key}.</p>` +
                `<p>If this error continues, please contact us at <a href="mailto:ripe-dbm@ripe.net">ripe-dbm@ripe.net</a> for assistance.</p>`);
            }
        });
    }

    public cancelAssociate() {
        this.alertsComponent.clearAlertMessages();
        this.alertsComponent.addGlobalWarning(
        `<p>No changes were made to the <span class="mntner">MNTNER</span> object ${this.key}.</p>` +
                `<p>If you wish to add a different RIPE NCC Access account to your <strong>MNTNER</strong> object:` +
                `<ol>` +
                `<li>Sign out of RIPE NCC Access.</li>` +
                `<li>Sign back in to RIPE NCC Access with the account you wish to use.</li>` +
                `<li>Click on the link in the instruction email again.</li>` +
                `</ol>`);
    }

    public makeModificationUrl(key: string) {
        return `webupdates/modify/RIPE/mntner/${key}`;
    }

    private navigateToSsoAdded(mntnerKey: string, user: any) {
        this.router.navigate(["fmp/ssoAdded", mntnerKey, user]);
    }
}
