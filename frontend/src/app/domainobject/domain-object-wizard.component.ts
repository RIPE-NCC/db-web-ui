import {Component, Inject, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";
import {WINDOW} from "../core/window.service";
import {JsUtilService} from "../core/js-utils.service";
import {RestService} from "../updatesweb/rest.service";
import {AttributeMetadataService} from "../attribute/attribute-metadata.service";
import {WhoisResourcesService} from "../shared/whois-resources.service";
import {MntnerService} from "../updatesweb/mntner.service";
import {CredentialsService} from "../shared/credentials.service";
import {MessageStoreService} from "../updatesweb/message-store.service";
import {ErrorReporterService} from "../updatesweb/error-reporter.service";
import {PrefixService} from "./prefix.service";
import {ModalDomainObjectSplashComponent} from "./modal-domain-object-splash.component";
import {ModalDomainCreationWaitComponent} from "./modal-domain-creation-wait.component";
import {AttributeSharedService} from "../attribute/attribute-shared.service";
import {IAuthParams, WebUpdatesCommonsService} from "../updatesweb/web-updates-commons.service";
import {IMaintainers} from "../updatesweb/create-modify.component";
import {IAttributeModel} from "../shared/whois-response-type.model";
import {AlertsComponent} from "../shared/alert/alerts.component";

interface IDomainObject {
    attributes: {
        attribute: any;
    };
    source: {
        id: string;
    };
}

@Component({
    selector: "domain-object-wizard",
    templateUrl: "./domain-object-wizard.component.html",
})
export class DomainObjectWizardComponent implements OnInit, OnDestroy {

    public objectType: string;
    //TODO check if make sense to convert to IWhoisObjectModel
    public domainObject: IDomainObject;
    public attributes: IAttributeModel[];
    public source: string;
    public name: string;
    public operation: any;

    /*
     * Initial scope vars
     */
    public maintainers: IMaintainers = {
        alternatives: [],
        object: [],
        objectOriginal: [],
        sso: [],
    };
    public restCallInProgress: boolean = false;
    public alreadySubmited: boolean = false;
    public subscription: any;
    public subscriptionDomaiPrefix: any;

    @ViewChild(AlertsComponent, {static: true})
    public alertsComponent: AlertsComponent;

    constructor(@Inject(WINDOW) private window: any,
                private jsUtils: JsUtilService,
                private modalService: NgbModal,
                private restService: RestService,
                private attributeMetadataService: AttributeMetadataService,
                private attributeSharedService: AttributeSharedService,
                private whoisResourcesServices: WhoisResourcesService,
                private mntnerService: MntnerService,
                private webUpdatesCommonsService: WebUpdatesCommonsService,
                private credentialsService: CredentialsService,
                private messageStoreService: MessageStoreService,
                private prefixService: PrefixService,
                private errorReporterService: ErrorReporterService,
                private location: Location,
                public activatedRoute: ActivatedRoute,
                private router: Router) {

        this.subscription = attributeSharedService.attributeStateChanged$
            .subscribe(() => {
                attributeMetadataService.enrich(this.objectType, this.attributes);
            });
        this.subscriptionDomaiPrefix = attributeSharedService.domainPrefixOk$
            .subscribe((prefixValue: string) => {
                this.onValidPrefix(prefixValue);
            });
    }

    public ngOnInit() {
        // show splash screen
        this.openModalDomainSplash();
        const paramMap = this.activatedRoute.snapshot.paramMap;
        this.objectType = paramMap.get("objectType") === "domain" ? "prefix" : paramMap.get("objectType");

        this.domainObject = {
            attributes: {
                attribute: this.attributeMetadataService.determineAttributesForNewObject(this.objectType),
            },
            source: {
                id: paramMap.get("source"),
            },
        };

        this.attributes = this.domainObject.attributes.attribute;
        this.source = paramMap.get("source");
        /*
         * Main
         */
        this.restCallInProgress = true;

        // should be the only thing to do, one day...
        this.attributeMetadataService.enrich(this.attributes[0].name, this.attributes);
    }

    public ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.subscriptionDomaiPrefix) {
            this.subscriptionDomaiPrefix.unsubscribe();
        }
    }

    private openModalDomainSplash(): void {
        const modalRef = this.modalService.open(ModalDomainObjectSplashComponent);
        modalRef.result
            .then(result => {
                modalRef.close();
            }, dismiss => {
                modalRef.close();
                this.router.navigate(["webupdates/select"]);
            });
    }

    /*
     * Local functions
     */
    public onValidPrefix = (prefixValue: any) => {
        const revZonesAttr = _.find(this.attributes, (attr: any) => {
            return attr.name === "reverse-zone";
        });
        revZonesAttr.value = this.prefixService.getReverseDnsZones(prefixValue);

        this.mntnerService.getMntsToAuthenticateUsingParent(prefixValue, (mntners: any) => {

            const mySsos = _.map(this.maintainers.sso, "key");

            // NB don't use the stupid enrichWithSso call cz it's lame
            const enriched = _.map(mntners, (mntnerAttr: any) => {
                return {
                    key: mntnerAttr.value,
                    mine: _.includes(mySsos, mntnerAttr.value),
                    type: "mntner",
                };
            });
            this.restService.detailsForMntners(enriched).then((enrichedMntners: any) => {
                this.maintainers.objectOriginal = enrichedMntners;
                this.restService.fetchMntnersForSSOAccount()
                    .subscribe((results: any) => {
                        this.maintainers.sso = results;
                        if (this.mntnerService.needsPasswordAuthentication(this.maintainers.sso, this.maintainers.objectOriginal, this.maintainers.object)) {
                            this.performAuthentication(this.maintainers);
                        }
                    }, () => {
                        this.alertsComponent.addGlobalError("Error fetching maintainers associated with this SSO account");
                    });
            });
        });
    };

    public updateMaintainers(maintainers: IMaintainers) {
        this.maintainers = maintainers;
    }

    public containsInvalidValues() {
        return this.attributes.findIndex(attr => attr.$$invalid) > -1;
    }

    public submitButtonClicked() {

        if (this.containsInvalidValues()) {
            return;
        }

        if (this.mntnerService.needsPasswordAuthentication(this.maintainers.sso, this.maintainers.objectOriginal, this.maintainers.object)) {
            this.performAuthentication(this.maintainers);
            return;
        }

        const flattenedAttributes = this.flattenStructure(this.attributes);
        const passwords = this.credentialsService.getPasswordsForRestCall(this.objectType);

        this.restCallInProgress = true;
        this.alreadySubmited = true;

        // close the alert message
        this.alertsComponent.clearAlertMessages();

        const data = {
            attributes: flattenedAttributes,
            passwords,
            type: this.objectType,
        };

        this.restService.createDomainObject(data, this.source)
            .subscribe((response: any) => {
                const modalRef = this.modalService.open(ModalDomainCreationWaitComponent);
                modalRef.componentInstance.resolve = {
                    attributes: data.attributes,
                    source: this.source,
                };
                modalRef.result.then(response => {
                    if (response.status === 200) {
                        this.alreadySubmited = false;
                        return this.showCreatedDomains(response);
                    }
                    modalRef.close();
                }, failResponse => {
                    modalRef.close();
                    this.alreadySubmited = false;
                    return this.createDomainsFailed(failResponse);
                });
                }
            );
    }

    public cancel() {
        if (this.window.confirm("You still have unsaved changes.\n\nPress OK to continue, or Cancel to stay on the current page.")) {
            this.router.navigate(["webupdates/select"]);
        }
    }

    private flattenStructure(attributes: any) {
        const flattenedAttributes: any[] = [];
        _.forEach(attributes, (attr: any) => {
            if (this.jsUtils.typeOf(attr.value) === "array") {
                _.forEach(attr.value, (atr: any) => {
                    flattenedAttributes.push({name: atr.name, value: atr.value || ""});
                });
            } else {
                flattenedAttributes.push({name: attr.name, value: attr.value || ""});
            }
        });
        return flattenedAttributes;
    }

    private performAuthentication(maintainers: IMaintainers) {
        const authParams: IAuthParams = {
            isLirObject: false,
            maintainers,
            object: {
                name: this.name,
                source: this.source,
                type: this.objectType,
            },
            operation: this.operation,
        };
        this.webUpdatesCommonsService.performAuthentication(authParams);
    }

    private showCreatedDomains(resp: any) {
        this.restCallInProgress = false;
        this.alertsComponent.clearAlertMessages();
        const prefix = _.find(this.attributes, (attr: any) => {
            return attr.name === "prefix";
        });
        this.attributeMetadataService.resetDomainLookups(prefix.value);
        this.messageStoreService.add("result", {prefix: prefix.value, whoisResources: resp.body});

        return this.router.navigateByUrl(`webupdates/wizard/${this.source}/${this.objectType}/success`);
    }

    private createDomainsFailed(response: any) {
        this.restCallInProgress = false;
        this.alertsComponent.addErrors(response.error);
        if (!_.isEmpty(this.alertsComponent.getErrors())) {
            this.errorReporterService.log("DomainWizard", "domain", this.alertsComponent.getErrors());
        }
        document.querySelector("#domainerrors").scrollIntoView();
    }
}
