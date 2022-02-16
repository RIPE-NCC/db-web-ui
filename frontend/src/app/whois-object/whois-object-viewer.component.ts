import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output} from "@angular/core";
import * as _ from "lodash";
import {IAttributeModel, IWhoisObjectModel} from "../shared/whois-response-type.model";
import {UserInfoService} from "../userinfo/user-info.service";
import {PropertiesService} from "../properties.service";
import {AttributeMetadataService} from "../attribute/attribute-metadata.service";

@Component({
    selector: "whois-object-viewer",
    templateUrl: "./whois-object-viewer.component.html",
})
export class WhoisObjectViewerComponent implements OnChanges, OnDestroy {

    @Input("ng-model")
    public ngModel: IWhoisObjectModel;
    @Input("linkable")
    public linkable?: boolean;
    @Output("update-clicked")
    public updateClicked? = new EventEmitter();

    public nrLinesToShow: number;
    public showMoreButton: boolean;
    public showMoreInfo: boolean;
    public objectPrimaryKey: string;
    public pkLink: string;
    public ripeStatLink: string;
    public subscription: any;

    public showRipeManagedAttrs = true;

    public show = {
        loginLink: false,
        ripeManagedToggleControl: false,
        ripeStatButton: false,
        updateButton: false
    };

    private objLength: number;
    private readonly MAX_ATTR_NAME_MASK = "                ";
    private readonly HAS_RIPE_STAT_LINK = [
        "aut-num",
        "route",
        "route6",
        "inetnum",
        "inet6num",
    ];

    constructor(private userInfoService: UserInfoService,
                private properties: PropertiesService) {
        this.subscription = this.userInfoService.userLoggedIn$
            .subscribe(() => {
                this.showUpdateButton();
            }, () => this.showLoginButton());
    }

    public ngOnChanges() {
        AttributeMetadataService.splitAttrsCommentsFromValue(this.ngModel.attributes.attribute);
        this.objLength = this.ngModel.attributes.attribute.length;
        this.nrLinesToShow = this.objLength > 30 ? 25 : 30;
        this.showMoreButton = this.objLength > this.nrLinesToShow;
        this.showMoreInfo = true;
        this.objectPrimaryKey = this.ngModel["primary-key"].attribute.map((attr) => attr.value).join("");
        this.pkLink = this.ngModel["primary-key"].attribute[0].name;
        this.show.ripeStatButton = this.HAS_RIPE_STAT_LINK.indexOf(this.ngModel.type.toLowerCase()) > -1;
        if (this.show.ripeStatButton) {
            this.ripeStatLink = this.getRipeStatLink();
        }
        this.userInfoService.isLogedIn() ? this.showUpdateButton() : this.showLoginButton();
        this.show.ripeManagedToggleControl = this.ngModel.managed;
    }

    public clickShowMoreLines() {
        this.nrLinesToShow = this.objLength;
        this.showMoreButton = this.objLength > this.nrLinesToShow;
    }

    public padding(attr: IAttributeModel): string {
        const numLeftPads = attr.name.length - this.MAX_ATTR_NAME_MASK.length;
        return this.MAX_ATTR_NAME_MASK.slice(numLeftPads);
    }

    public getRipeStatLink(): string {
        const routeObject = _.find(this.ngModel["primary-key"].attribute, (attr) => {
            return attr.name === "route" || attr.name === "route6";
        });
        return routeObject ? routeObject.value : this.objectPrimaryKey;
    }

    public emitUpdateClicked() {
        this.updateClicked.emit();
    }

    public getPkLinksQueryParams() {
        return {
            source: this.ngModel.source.id,
            key: this.objectPrimaryKey,
            type: this.ngModel.type
        };
    }

    public getLocalLinksQueryParams(attr: IAttributeModel) {
        return {
            source: attr.value === "DUMY-RIPE" ? this.properties.SOURCE : this.ngModel.source.id,
            key: attr.value,
            type: attr["referenced-type"]
        };
    }

    private showLoginButton() {
        this.show.updateButton = false;
        this.show.loginLink = !this.isSourceGRS();
    }

    private showUpdateButton() {
        this.show.updateButton = !this.isSourceGRS() && !this.isPlaceholderObjects();
        this.show.loginLink = false;
    }

    private isSourceGRS(): boolean {
        const source = this.ngModel.source.id.toLowerCase();
        return source.indexOf("grs") > -1;
    }

    private isPlaceholderObjects(): boolean {
        return this.ngModel.attributes.attribute
            .filter(attr => attr.name === "netname" && attr.value === "NON-RIPE-NCC-MANAGED-ADDRESS-BLOCK")
            .length > 0;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
