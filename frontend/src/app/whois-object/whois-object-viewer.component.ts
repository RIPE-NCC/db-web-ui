import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import * as _ from 'lodash';
import { AttributeMetadataService } from '../attribute/attribute-metadata.service';
import { PropertiesService } from '../properties.service';
import { SessionInfoService } from '../sessioninfo/session-info.service';
import { WhoisMetaService } from '../shared/whois-meta.service';
import { IAttributeModel, IWhoisObjectModel } from '../shared/whois-response-type.model';
import { UserInfoService } from '../userinfo/user-info.service';

@Component({
    selector: 'whois-object-viewer',
    templateUrl: './whois-object-viewer.component.html',
    standalone: false,
})
export class WhoisObjectViewerComponent implements OnChanges, OnDestroy {
    @Input()
    public model: IWhoisObjectModel;
    @Input()
    public linkable?: boolean;
    @Output()
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
        updateButton: false,
    };

    private objLength: number;
    private readonly MAX_ATTR_NAME_MASK = '                ';
    private readonly HAS_RIPE_STAT_LINK = ['aut-num', 'route', 'route6', 'inetnum', 'inet6num'];

    constructor(
        private userInfoService: UserInfoService,
        private sessionInfoService: SessionInfoService,
        private properties: PropertiesService,
        private whoisMetaService: WhoisMetaService,
    ) {
        this.subscription = this.sessionInfoService.expiredSession$.subscribe(
            (expired: boolean) => {
                this.setButtonText(!expired);
            },
            () => this.showLoginButton(),
        );
    }

    public ngOnChanges() {
        AttributeMetadataService.splitAttrsCommentsFromValue(this.model.attributes.attribute);
        this.objLength = this.model.attributes.attribute.length;
        this.nrLinesToShow = this.objLength > 30 ? 25 : 30;
        this.showMoreButton = this.objLength > this.nrLinesToShow;
        this.showMoreInfo = true;
        this.objectPrimaryKey = this.model['primary-key'].attribute.map((attr) => attr.value).join('');
        this.pkLink = this.model['primary-key'].attribute[0].name;
        this.show.ripeStatButton = this.HAS_RIPE_STAT_LINK.indexOf(this.model.type.toLowerCase()) > -1;
        if (this.show.ripeStatButton) {
            this.ripeStatLink = this.getRipeStatLink();
        }
        this.setButtonText(this.userInfoService.isLogedIn());
        this.show.ripeManagedToggleControl = this.model.managed;
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
        const routeObject = _.find(this.model['primary-key'].attribute, (attr) => {
            return attr.name === 'route' || attr.name === 'route6';
        });
        return routeObject ? routeObject.value : this.objectPrimaryKey;
    }

    public emitUpdateClicked() {
        this.updateClicked.emit();
    }

    public getPkLinksQueryParams() {
        return {
            source: this.model.source.id,
            key: this.objectPrimaryKey,
            type: this.model.type,
        };
    }

    public getLocalLinksQueryParams(attr: IAttributeModel) {
        return {
            source: attr.value === 'DUMY-RIPE' ? this.properties.SOURCE : this.model.source.id,
            key: attr.value,
            type: attr['referenced-type'],
        };
    }

    public getDescription(attributeName: string) {
        return this.whoisMetaService.getAttributeShortDescription(this.model.type, attributeName);
    }

    private setButtonText(isLoggedIn: boolean) {
        isLoggedIn ? this.showUpdateButton() : this.showLoginButton();
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
        const source = this.model.source.id.toLowerCase();
        return source.indexOf('grs') > -1;
    }

    private isPlaceholderObjects(): boolean {
        return this.model.attributes.attribute.filter((attr) => attr.name === 'netname' && attr.value === 'NON-RIPE-NCC-MANAGED-ADDRESS-BLOCK').length > 0;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
