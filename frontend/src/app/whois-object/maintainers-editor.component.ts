import {Component, EventEmitter, Input, Output} from "@angular/core";
import * as _ from "lodash";
import {AlertsService} from "../shared/alert/alerts.service";
import {AttributeMetadataService} from "../attribute/attribute-metadata.service";
import {JsUtilService} from "../core/js-utils.service";
import {RestService} from "../updates/rest.service";
import {MntnerService} from "../updates/mntner.service";
import {MessageStoreService} from "../updates/message-store.service";
import {CredentialsService} from "../shared/credentials.service";
import {IAttributeModel, IMntByModel, IWhoisObjectModel} from "../shared/whois-response-type.model";
import {IAuthParams, WebUpdatesCommonsService} from "../updates/web/web-updates-commons.service";
import {IMaintainers} from "../updates/web/create-modify.component";
import {ObjectUtilService} from "../updates/object-util.service";

@Component({
    selector: "maintainers-editor",
    templateUrl: "./maintainers-editor.component.html",
})
export class MaintainersEditorComponent {

    @Input("ng-model")
    public ngModel: IWhoisObjectModel;
    @Output("authentication-failed-clbk")
    public authenticationFailedClbk = new EventEmitter();
    @Output("update-mntners-clbk")
    public updateMntnersClbk: EventEmitter<any> = new EventEmitter<any>();

    // Parts of the model used in template
    public attributes: IAttributeModel[];
    public objectType: string;
    public objectName: string;

    // Underlying mntner model
    public mntners: IMaintainers;

    // Interface control
    public restCallInProgress = false;

    public message: {
        text: string;
        type: string;
    };
    public isMntHelpShown = false;

    private source: string;

    constructor(private alertService: AlertsService,
                private attributeMetadataService: AttributeMetadataService,
                private credentialsService: CredentialsService,
                private messageStore: MessageStoreService,
                private mntnerService: MntnerService,
                public restService: RestService,
                private webUpdatesCommonsService: WebUpdatesCommonsService,
                private jsUtilsService: JsUtilService) {
    }

    public ngOnInit() {
        this.source = this.ngModel.source.id;
        this.attributes = this.ngModel.attributes.attribute;
        this.objectType = this.attributes[0].name;
        this.objectName = this.attributes[0].value;

        this.mntners = {
            alternatives: [],
            object: [],
            objectOriginal: [],
            sso: [],
        };

        if (this.isModifyMode()) {
            this.initModifyMode();
        } else {
            this.initCreateMode();
        }
        this.updateMntnersClbk.emit(this.mntners);
    }

    public onMntnerAdded(item: IMntByModel): void {
        // enrich with new-flag
        this.mntners.object.push(item);
        this.mntners.object = this.mntnerService.enrichWithNewStatus(this.mntners.objectOriginal, this.mntners.object);

        this.mergeMaintainers(this.attributes, {name: "mnt-by", value: item.key});

        if (this.mntnerService.needsPasswordAuthentication(this.mntners.sso, this.mntners.objectOriginal,
                this.mntners.object)) {
            this.performAuthentication();
        }
        this.attributeMetadataService.enrich(this.objectType, this.attributes);
        this.ngModel.attributes.attribute = this.attributes;
        this.updateMntnersClbk.emit(this.mntners);
    }

    public onMntnerRemoved(item: IMntByModel): void {
        this.mntners.object.filter(mnt => mnt.key !== item.key);
        // don't remove if it's the last one -- just empty it
        const objectMntBys = this.attributes.filter((attr: IAttributeModel) => {
            return attr.name === "mnt-by";
        });
        if (objectMntBys.length > 1) {
            _.remove(this.attributes, (i: IAttributeModel) => {
                return i.name === "mnt-by" && i.value === item.key;
            });
        } else {
            objectMntBys[0].value = "";
        }
        this.attributeMetadataService.enrich(this.objectType, this.attributes);
        this.ngModel.attributes.attribute = this.attributes;
        this.updateMntnersClbk.emit(this.mntners);
    }

    public isLirObject() {
        return ObjectUtilService.isLirObject(this.attributes);
    }

    public isModifyWithSingleMntnerRemaining() {
        return this.isModifyMode() && this.mntners.object.length === 1;
    }

    /**
     * Callback from html to support typeahead selection
     *
     * @param query
     */
    public mntnerAutocomplete(query: string) {
        // need to typed characters
        this.restService.autocomplete("mnt-by", query, true, ["auth"])
            .then((data: IMntByModel[]) => {
                // mark new
                this.mntners.alternatives = this.mntnerService.stripNccMntners(this.mntnerService.enrichWithNewStatus(
                    this.mntners.objectOriginal, this.filterAutocompleteMntners(this.enrichWithMine(data))), true);
            },
        );
    }

    // hot-wire the mntnerService functions
    public hasMd5 = (mntner: IMntByModel) => this.mntnerService.hasMd5(mntner);
    public hasPgp = (mntner: IMntByModel) => this.mntnerService.hasPgp(mntner);
    public hasSSo = (mntner: IMntByModel) => this.mntnerService.hasSSo(mntner);
    public isRemovable = (mntnerKey: string) => this.mntnerService.isRemovable(mntnerKey);

    public showMntCloseButton(mntner: IMntByModel): boolean {
        return !this.isModifyWithSingleMntnerRemaining() && this.isRemovable(mntner.key) && !this.isLirObject()
    }

    public isClearable(): boolean {
        return this.mntners.object[0] ? this.showMntCloseButton(this.mntners.object[0]) : false;
    }

    private performAuthentication(): void {
        const authParams: IAuthParams = {
            failureClbk: () => this.navigateAway(),
            isLirObject: this.isLirObject(),
            maintainers: this.mntners,
            object: {
                name: this.objectName,
                source: this.source,
                type: this.objectType,
            },
            operation: this.isModifyMode() ? "Modify" : "Create",
            successClbk: () => this.onSuccessfulAuthentication(),
        };
        this.webUpdatesCommonsService.performAuthentication(authParams);
    }

    private navigateAway(): void {
        if (!this.isModifyMode()) {
            for (const mnt of this.mntners.object) {
                this.onMntnerRemoved(mnt);
            }
            this.mntners.object = [];
        }
        if (this.authenticationFailedClbk) {
            this.authenticationFailedClbk.emit();
        }
    }

    private onSuccessfulAuthentication(): void {
        console.debug("MaintainersEditorController.onSuccessfulAuthentication", arguments);
    }

    private handleSsoResponse(results: IMntByModel[]): void {
        this.restCallInProgress = false;
        this.mntners.sso = results;
        if (this.mntners.sso.length > 0) {
            this.mntners.objectOriginal = [];
            // populate ui-select box with sso-mntners
            this.mntners.object = _.cloneDeep(this.mntners.sso);
            // copy mntners to attributes (for later submit)
            const mntnerAttrs = this.mntners.sso.map((i: IMntByModel) => {
                return {
                    name: "mnt-by",
                    value: i.key,
                };
            });
            this.mergeMaintainers(this.attributes, mntnerAttrs);
            this.attributeMetadataService.enrich(this.objectType, this.attributes);
        }
    }

    private handleSsoResponseError(): void {
        this.restCallInProgress = false;
        this.message = {
            text: "Error fetching maintainers associated with this SSO account",
            type: "error",
        };
    }

    private mergeMaintainers(attrs: IAttributeModel[], maintainers: any): void {
        if (this.jsUtilsService.typeOf(attrs) !== "array") {
            throw new TypeError("attrs must be an array in mergeMaintainers");
        }
        let i;
        let lastIdxOfType = _.findLastIndex(attrs, (item) => {
            return item.name === "mnt-by";
        });
        if (lastIdxOfType < 0) {
            lastIdxOfType = attrs.length;
        } else if (!attrs[lastIdxOfType].value) {
            attrs.splice(lastIdxOfType, 1);
        }
        if (this.jsUtilsService.typeOf(maintainers) === "object") {
            attrs.splice(lastIdxOfType, 0, maintainers);
        } else {
            for (i = 0; i < maintainers.length; i++) {
                attrs.splice(lastIdxOfType + i, 0, maintainers[i]);
            }
        }
    }

    private isModifyMode(): boolean {
        const createdAttr = _.find(this.attributes, (attr: IAttributeModel) => {
            return attr.name.toUpperCase() === "CREATED";
        });
        return createdAttr && typeof createdAttr.value === "string" && createdAttr.value.length > 0;
    }

    private initCreateMode() {
        this.restService.fetchMntnersForSSOAccount()
            .subscribe((results: IMntByModel[]) => {
                this.handleSsoResponse(results);
            }, () => {
                this.handleSsoResponseError();
            });
    }

    private initModifyMode() {
        this.restService.fetchMntnersForSSOAccount()
            .subscribe((ssoResult: IMntByModel[]) => {
                this.restCallInProgress = false;

                // store mntners for SSO account
                this.mntners.sso = ssoResult;
                console.debug("maintainers.sso:", this.mntners.sso);

                // this is where we must authenticate against
                this.mntners.objectOriginal = this.extractEnrichMntnersFromObject(this.attributes);

                // starting point for further editing
                this.mntners.object = this.extractEnrichMntnersFromObject(this.attributes);

                // fetch details of all selected maintainers concurrently
                this.restCallInProgress = true;
                this.restService.detailsForMntners(this.mntners.object)
                    .then((result: any) => {
                        this.restCallInProgress = false;

                        this.mntners.objectOriginal = _.flatten(result) as IMntByModel[];
                        console.debug("mntners-object-original:", this.mntners.objectOriginal);

                        // of course none of the initial ones are new
                        this.mntners.object = this.mntnerService.enrichWithNewStatus(this.mntners.objectOriginal,
                            _.flatten(result));
                        console.debug("mntners-object:", this.mntners.object);

                        if (this.mntnerService.needsPasswordAuthentication(
                                this.mntners.sso, this.mntners.objectOriginal, this.mntners.object)) {
                            this.performAuthentication();
                        }
                    }, (error: any) => {
                        this.restCallInProgress = false;
                        console.error("Error fetching sso-mntners details", error);
                        this.alertService.setGlobalError("Error fetching maintainer details");
                    });
                // now let's see if there are any read-only restrictions on these attributes. There is if any of
                // these are true:
                //
                // * this is an inet(6)num and it has a "sponsoring-org" attribute which refers to an LIR
                // * this is an inet(6)num and it has a "org" attribute which refers to an LIR
                // * this is an organisation with an "org-type: LIR" attribute and attribute.name is
                // address|fax|e-mail|phone
            }, (error: any) => {
                this.restCallInProgress = false;
                try {
                    const whoisResources = error.data;
                    // this.attributes = _wrapAndEnrichResources(this.objectType, error.data);
                    this.alertService.setErrors(whoisResources);
                } catch (e) {
                    console.error("Error fetching sso-mntners for SSO:", error);
                    this.alertService.setGlobalError("Error fetching maintainers associated with this SSO account");
                }
            });
    }

    private extractEnrichMntnersFromObject(attributes: IAttributeModel[]): IMntByModel[] {
        // get mntners from response
        const mntnersInObject = attributes.filter((i) => {
            return i.name === "mnt-by";
        });

        // determine if mntner is mine
        const selected: IMntByModel[] = mntnersInObject.map((mntnerAttr: IAttributeModel) => {
            let isMine = false;
            for (const mnt of this.mntners.sso) {
                if (mnt.key === mntnerAttr.value) {
                    isMine = true;
                    break;
                }
            }
            return {
                key: mntnerAttr.value,
                mine: isMine,
                type: "mntner",
            };
        }) as IMntByModel[];
        return selected;
    }

    private enrichWithMine(mntners: IMntByModel[]) {
        return mntners.map((mntner) => {
            // search in selected list
            mntner.mine = !!this.mntnerService.isMntnerOnlist(this.mntners.sso, mntner);
            return mntner;
        });
    }

    private filterAutocompleteMntners(mntners: IMntByModel[]) {
        return mntners.filter((mntner) => {
            return !this.mntnerService.isNccMntner(mntner.key)
                && !this.mntnerService.isMntnerOnlist(this.mntners.object, mntner);
        });
    }
}
