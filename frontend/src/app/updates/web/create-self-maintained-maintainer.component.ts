import {Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import * as _ from "lodash";
import {RestService} from "../rest.service";
import {WhoisResourcesService} from "../../shared/whois-resources.service";
import {WhoisMetaService} from "../../shared/whois-meta.service";
import {AlertsService} from "../../shared/alert/alerts.service";
import {UserInfoService} from "../../userinfo/user-info.service";
import {MessageStoreService} from "../message-store.service";
import {ErrorReporterService} from "../error-reporter.service";
import {LinkService} from "../link.service";
import {IAttributeModel} from "../../shared/whois-response-type.model";

@Component({
    selector: "create-self-maintained-maintainer",
    templateUrl: "./create-self-maintained-maintainer.component.html",
})
export class CreateSelfMaintainedMaintainerComponent {
    public submitInProgress: boolean = false;
    public adminC: any;
    // public uiSelectTemplateReady: any;
    public maintainerAttributes: any;
    public objectType: string;
    public source: string;
    public isAdminCHelpShown: boolean;
    public showAttrsHelp: [];
    private readonly MNT_TYPE: string = "mntner";

    constructor(public whoisResourcesService: WhoisResourcesService,
                public whoisMetaService: WhoisMetaService,
                public alertService: AlertsService,
                private userInfoService: UserInfoService,
                private restService: RestService,
                public messageStoreService: MessageStoreService,
                private errorReporterService: ErrorReporterService,
                private linkService: LinkService,
                public activatedRoute: ActivatedRoute,
                public router: Router) {
    }

    public ngOnInit() {
        this.alertService.clearErrors();

        this.adminC = {
            alternatives: [],
            object: [],
        };

        this.maintainerAttributes = this.whoisResourcesService.wrapAndEnrichAttributes(this.MNT_TYPE, this.whoisMetaService.getMandatoryAttributesOnObjectType(this.MNT_TYPE));

        const paramMap = this.activatedRoute.snapshot.paramMap;
        this.source = paramMap.get("source");
        this.maintainerAttributes = this.whoisResourcesService.setSingleAttributeOnName(this.maintainerAttributes,"source", this.source);

        this.showAttrsHelp = this.maintainerAttributes.map((attr: IAttributeModel) => ({[attr.name]: true}));

        const queryParamMap = this.activatedRoute.snapshot.queryParamMap;
        if (queryParamMap.has("admin")) {
            const item = {type: "person", key: queryParamMap.get("admin")};
            this.adminC.object.push(item);
            this.onAdminCAdded(item);
        }

        // kick off ajax-call to fetch email address of logged-in user
        this.userInfoService.getUserOrgsAndRoles()
            .subscribe((result: any) => {
                this.maintainerAttributes = this.whoisResourcesService.setSingleAttributeOnName(this.maintainerAttributes,"upd-to", result.user.username);
                this.maintainerAttributes = this.whoisResourcesService.setSingleAttributeOnName(this.maintainerAttributes,"auth", "SSO " + result.user.username);
            }, () => {
                this.alertService.setGlobalError("Error fetching SSO information");
            },
        );
    }

    public submit() {
        this.populateMissingAttributes();

        console.info("submit attrs:" + JSON.stringify(this.maintainerAttributes));

        this.whoisResourcesService.clearErrors(this.maintainerAttributes);
        if (!this.whoisResourcesService.validate(this.maintainerAttributes)) {
            this.errorReporterService.log("Create", this.MNT_TYPE, this.alertService.getErrors(), this.maintainerAttributes);
        } else {
            this.createObject();
        }
    }

    public isFormValid() {
        this.populateMissingAttributes();
        return this.whoisResourcesService.validateWithoutSettingErrors(this.maintainerAttributes);
    }

    public cancel() {
        if (window.confirm("You still have unsaved changes.\n\nPress OK to continue, or Cancel to stay on the current page.")) {
            this.router.navigate(["webupdates/select"]);
        }
    }

    public fieldVisited(attr: any) {
        this.restService.autocomplete(attr.name, attr.value, true, [])
            .then((data: any) => {
                if (_.some(data, (item: any) => {
                    return item.type === attr.name && item.key.toLowerCase() === attr.value.toLowerCase();
                })) {
                    attr.$$error = attr.name + " " + this.linkService.getModifyLink(this.source, attr.name, attr.value) + " already exists";
                } else {
                    attr.$$error = "";
                }
            },
        );
    }

    public adminCAutocomplete(query: any) {
        this.restService.autocomplete("admin-c", query, true, ["person", "role"])
            .then((data: any) => {
                console.debug("autocomplete success:" + JSON.stringify(data));
                // mark new
                this.adminC.alternatives = this.stripAlreadySelected(data);
            }, (error: any) => {
                console.error("autocomplete error:" + JSON.stringify(error));
            },
        );
    }

    public hasAdminC() {
        return this.adminC.object.length > 0;
    }

    public onAdminCAdded(item: any) {
        console.debug("onAdminCAdded:" + JSON.stringify(item));
        this.maintainerAttributes = this.whoisResourcesService.addAttributeAfterType(this.maintainerAttributes, {name: "admin-c", value: item.key}, {name: "admin-c"});
        this.maintainerAttributes = this.whoisMetaService.enrichAttributesWithMetaInfo(this.MNT_TYPE, this.maintainerAttributes);
        this.maintainerAttributes = this.whoisResourcesService.validateAttributes(this.maintainerAttributes);
    }

    public onAdminCRemoved(item: any) {
        console.debug("onAdminCRemoved:" + JSON.stringify(item));
        _.remove(this.maintainerAttributes, (i: any) => {
            return i.name === "admin-c" && i.value === item.key;
        });
    }

    public setVisibilityAttrsHelp(attributeName: string) {
        this.showAttrsHelp[attributeName] = !this.showAttrsHelp[attributeName]
    }

    private createObject() {
        this.maintainerAttributes = this.whoisResourcesService.removeNullAttributes(this.maintainerAttributes);

        const obj = this.whoisResourcesService.turnAttrsIntoWhoisObject(this.maintainerAttributes);

        this.submitInProgress = true;
        this.restService.createObject(this.source, this.MNT_TYPE, obj, null)
            .subscribe((resp: any) => {
                    this.submitInProgress = false;

                    const primaryKey = this.whoisResourcesService.getPrimaryKey(resp);
                    this.messageStoreService.add(primaryKey, resp);
                    this.router.navigateByUrl(`webupdates/display/${this.source}/${this.MNT_TYPE}/${primaryKey}`);
                }, (error: any) => {
                    this.submitInProgress = false;

                    this.alertService.populateFieldSpecificErrors(this.MNT_TYPE, this.maintainerAttributes, error.data);
                    this.alertService.showWhoisResourceErrors(this.MNT_TYPE, error.data);
                    this.errorReporterService.log("Create", this.MNT_TYPE, this.alertService.getErrors(), this.maintainerAttributes);
                },
            );
    }

    private populateMissingAttributes() {
        this.maintainerAttributes = this.whoisResourcesService.validateAttributes(this.maintainerAttributes);

        const mntner = this.whoisResourcesService.getSingleAttributeOnName(this.maintainerAttributes, this.MNT_TYPE);
        this.whoisResourcesService.setSingleAttributeOnName(this.maintainerAttributes,"mnt-by", mntner.value);
    }

    private stripAlreadySelected(adminC: any) {
        return _.filter(adminC, (aC: any) => {
            return !this.adminC.object !== aC;
        });
    }
}
