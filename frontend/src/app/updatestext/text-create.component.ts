import {Component, Inject, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable, of} from "rxjs";
import {catchError, map} from "rxjs/operators";
import * as _ from "lodash";
import {WINDOW} from "../core/window.service";
import {WhoisResourcesService} from "../shared/whois-resources.service";
import {WhoisMetaService} from "../shared/whois-meta.service";
import {RestService} from "../updatesweb/rest.service";
import {ErrorReporterService} from "../updatesweb/error-reporter.service";
import {IRpslObject, RpslService} from "./rpsl.service";
import {TextCommonsService} from "./text-commons.service";
import {MntnerService} from "../updatesweb/mntner.service";
import {PreferenceService} from "../updatesweb/preference.service";
import {MessageStoreService} from "../updatesweb/message-store.service";
import {AlertsService} from "../shared/alert/alerts.service";

export interface ITextObject {
    rpsl?: any;
    source: string;
    type: string;
    name?: string;
    objects?: any;
}
@Component({
    selector: "text-create",
    templateUrl: "./text-create.component.html",
})
export class TextCreateComponent implements OnInit {
    public restCallInProgress: boolean = false;
    public object: ITextObject = {
        source: "",
        type: "",
    };
    public mntners: any;
    public name: string;
    public override: string;
    public passwords: string[];

    constructor(@Inject(WINDOW) private window: any,
                public whoisResourcesService: WhoisResourcesService,
                public whoisMetaService: WhoisMetaService,
                public restService: RestService,
                public errorReporterService: ErrorReporterService,
                public messageStoreService: MessageStoreService,
                public rpslService: RpslService,
                public textCommonsService: TextCommonsService,
                public preferenceService: PreferenceService,
                public mntnerService: MntnerService,
                public alertsService: AlertsService,
                private activatedRoute: ActivatedRoute,
                private router: Router) {
    }

    public ngOnInit() {
        this.restCallInProgress = false;

        this.alertsService.clearAlertMessages();

        // extract parameters from the url
        const paramMap = this.activatedRoute.snapshot.paramMap;
        const queryParamMap = this.activatedRoute.snapshot.queryParamMap;
        this.object.source = paramMap.get("source");
        this.object.type = paramMap.get("objectType");
        if (queryParamMap.has("rpsl")) {
            this.object.rpsl = decodeURIComponent(queryParamMap.get("rpsl"));
        }
        const redirect = !queryParamMap.has("noRedirect");

        // maintainers associated with this SSO-account
        this.mntners = {};
        this.mntners.sso = [];

        console.debug("TextCreateComponent: Url params:" +
            " object.source:" + this.object.source +
            ", object.type:" + this.object.type +
            ", noRedirect:" + !redirect);

        if (this.preferenceService.isWebMode() && redirect) {
            this.switchToWebMode();
            return;
        }

        if (_.isUndefined(this.object.rpsl)) {
            this.prepopulateRpsl();
        }
    }

    public submit() {
        this.alertsService.clearAlertMessages();

        console.debug("rpsl:" + this.object.rpsl);

        // parse
        const objects = this.rpslService.fromRpsl(this.object.rpsl);
        if (objects.length > 1) {
            this.alertsService.setGlobalError("Only a single object is allowed");
            return;
        }
        this.passwords = objects[0].passwords;
        this.override = objects[0].override;
        const attributes = this.textCommonsService.uncapitalize(objects[0].attributes);
        console.debug("attributes:" + JSON.stringify(attributes));

        if (!this.textCommonsService.validate(this.object.type, attributes)) {
            return;
        }

        // if inet(6)num, find the parent and get some auth for that
        if (["inetnum", "inet6num"].indexOf(this.object.type) > -1) {
            const inetnumAttr = _.find(attributes, (attr: any) => {
                return this.object.type === attr.name && attr.value;
            });
            const sourceAttr = _.find(attributes, (attr: any) => {
                return "source" === attr.name && attr.value;
            });
            if (inetnumAttr && sourceAttr) {
                this.restCallInProgress = true;
                this.restService.fetchParentResource(inetnumAttr.name, inetnumAttr.value)
                    .then((result: any) => {
                        let parent;
                        if (result && result.objects && _.isArray(result.objects.object)) {
                            parent = result.objects.object[0];
                            if (parent.attributes && _.isArray(parent.attributes.attribute)) {
                                const parentObject = parent.attributes.attribute;
                                this.mntnerService.getAuthForObjectIfNeeded(parentObject, this.mntners.sso, "Modify", sourceAttr.value.trim(), inetnumAttr.name, this.name)
                                    .then(() => {
                                        this.doCreate(attributes, inetnumAttr.name);
                                    }, (error: any) => {
                                        this.restCallInProgress = false;
                                        console.error("MntnerService.getAuthForObjectIfNeeded rejected authorisation: ", error);
                                        this.alertsService.addGlobalError("Failed to authenticate parent resource");
                                    },
                                );
                            }
                        }
                    }, () => {
                        // if we cannot find a parent, do not show the auth popup
                        this.doCreate(attributes, inetnumAttr.name);
                    });
            }
        } else {
            this.textCommonsService.authenticate("Create", this.object.source, this.object.type, undefined, this.mntners.sso,
                attributes, this.passwords, this.override)
                .then((authenticated: any) => {
                    console.debug("Authenticated successfully:" + authenticated);
                    // combine all passwords
                    this.doCreate(attributes, this.object.type);
                }, (authenticated: any) => {
                    console.error("Authentication failure:" + authenticated);
                },
            );
        }
    }

    public cancel() {
        if (this.window.confirm("You still have unsaved changes.\n\nPress OK to continue, or Cancel to stay on the current page.")) {
            this.router.navigate(["webupdates/select"]);
        }
    }

    public switchToWebMode() {
        console.debug("Switching to web-mode");

        this.preferenceService.setWebMode();
        this.router.navigateByUrl(`webupdates/create/${this.object.source}/${this.object.type}?noRedirect`);
    }

    private prepopulateRpsl() {
        const attributesOnObjectType = this.whoisMetaService.getAllAttributesOnObjectType(this.object.type);
        if (_.isEmpty(attributesOnObjectType)) {
            console.error("Object type " + this.object.type + " was not found");
            this.router.navigate(["not-found"]);
            return;
        }

        this.enrichAttributes(this.whoisResourcesService.wrapAndEnrichAttributes(this.object.type, attributesOnObjectType));
    }

    private enrichAttributes(attributes: any) {
        this.textCommonsService.enrichWithDefaults(this.object.source, this.object.type, attributes);
        this.enrichAttributesWithSsoMntners(attributes)
            .then((attrs: any) => {
                this.textCommonsService.capitaliseMandatory(attrs);
                const obj: IRpslObject = {
                    attributes: attrs,
                    override: this.override,
                    passwords: this.passwords,
                };
                this.object.rpsl = this.rpslService.toRpsl(obj);
            },
        );

        return attributes;
    }

    private enrichAttributesWithSsoMntners(attributes: any) {
        this.restCallInProgress = true;
        return this.restService.fetchMntnersForSSOAccount()
            .pipe(map((ssoMntners: any) => {
                    this.restCallInProgress = false;
                    this.mntners.sso = ssoMntners;
                    return this.addSsoMntnersAsMntBy(attributes, ssoMntners);
                }),
                catchError((error: any, caught: Observable<any>) => {
                    this.restCallInProgress = false;
                    console.error("Error fetching mntners for SSO:" + JSON.stringify(error));
                    this.alertsService.setGlobalError("Error fetching maintainers associated with this SSO account");
                    return of(attributes);
                })).toPromise();
    }

    private addSsoMntnersAsMntBy(attributes: any, mntners: any) {
        // keep existing
        if (mntners.length === 0) {
            return attributes;
        }

        // merge mntners into json-attributes
        const mntnersAsAttrs = _.map(mntners, (item: any) => {
            return {name: "mnt-by", value: item.key};
        });
        const attrsWithMntners = this.whoisResourcesService.addAttrsSorted(attributes, "mnt-by", mntnersAsAttrs);

        // strip mnt-by without value from attributes
        return _.filter(attrsWithMntners, (item: any) => {
            return !(item.name === "mnt-by" && _.isUndefined(item.value));
        });
    }

    private doCreate(attributes: any, objectType: string) {
        const combinedPaswords = _.union(this.passwords, this.textCommonsService.getPasswordsForRestCall(objectType));
        attributes = this.textCommonsService.stripEmptyAttributes(attributes);
        // rest-POST to server
        this.restCallInProgress = true;
        this.restService.createObject(this.object.source, objectType, this.whoisResourcesService.turnAttrsIntoWhoisObject(attributes), combinedPaswords, this.override, true)
            .subscribe((whoisResources: any) => {
                this.restCallInProgress = false;
                const primaryKey = this.whoisResourcesService.getPrimaryKey(whoisResources);
                this.messageStoreService.add(primaryKey, whoisResources);
                this.textCommonsService.navigateToDisplayPage(this.object.source, objectType, primaryKey, "Create");
            }, (error: any) => {
                this.restCallInProgress = false;
                const whoisResources = error.data;
                this.alertsService.setAllErrors(whoisResources);
                const attributes = this.whoisResourcesService.getAttributes(whoisResources);
                if (!_.isEmpty(attributes)) {
                    this.errorReporterService.log("TextCreate", objectType, this.alertsService.alerts.errors, attributes);
                }
            },
        );
    }
}
