import { NgClass, SlicePipe } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatTooltip } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AttributeMetadataService } from '../attribute/attribute-metadata.service';
import { MenuService } from '../menu/menu.service';
import { PropertiesService } from '../properties.service';
import { SessionInfoService } from '../sessioninfo/session-info.service';
import { LabelPipe } from '../shared/label.pipe';
import { IAttributeModel, IObjectVersionPreviewModel, IWhoisObjectModel } from '../shared/whois-response-type.model';
import { UserInfoService } from '../userinfo/user-info.service';
import { WhoisObjectVisualiser } from './whois-object-visualiser';

@Component({
    selector: 'whois-object-viewer',
    templateUrl: './whois-object-viewer.component.html',
    standalone: true,
    imports: [MatCheckbox, NgClass, MatTooltip, RouterLink, MatButton, SlicePipe, LabelPipe],
})
export class WhoisObjectViewerComponent implements OnChanges, OnDestroy {
    private userInfoService = inject(UserInfoService);
    private sessionInfoService = inject(SessionInfoService);
    private properties = inject(PropertiesService);
    activatedRoute = inject(ActivatedRoute);
    whoisObjectVisualiser = inject(WhoisObjectVisualiser);
    menuService = inject(MenuService);
    router = inject(Router);

    @Input()
    model: IWhoisObjectModel;
    @Input()
    linkable?: boolean;
    @Output()
    updateClicked? = new EventEmitter();

    nrLinesToShow: number;
    showMoreButton: boolean;
    showMoreInfo: boolean;
    objectPrimaryKey: string;
    pkLink: string;
    ripeStatLink: string;
    subscription: any;
    from?: string;
    searchText?: string;

    versions: IObjectVersionPreviewModel[];
    showRipeManagedAttrs = true;

    show = {
        loginLink: false,
        ripeManagedToggleControl: false,
        ripeStatButton: false,
        updateButton: false,
        viewVersionsButton: false,
    };

    private objLength: number;
    private readonly HAS_RIPE_STAT_LINK = ['aut-num', 'route', 'route6', 'inetnum', 'inet6num'];
    private readonly HAS_VIEW_VERSIONS_TYPE = ['mntner', 'aut-num', 'route', 'route6', 'inetnum', 'inet6num', 'organisation'];

    constructor() {
        this.subscription = this.sessionInfoService.expiredSession$.subscribe(
            (expired: boolean) => {
                this.setButtonText(!expired);
            },
            () => this.showLoginButton(),
        );
    }

    ngOnInit() {
        const route = this.activatedRoute.snapshot;
        this.from = route.url[0].path;
        this.searchText = route.queryParams.searchtext;
    }

    ngOnChanges() {
        AttributeMetadataService.splitAttrsCommentsFromValue(this.model.attributes.attribute);
        this.objLength = this.model.attributes.attribute.length;
        this.nrLinesToShow = this.objLength > 30 ? 25 : 30;
        this.showMoreButton = this.objLength > this.nrLinesToShow;
        this.showMoreInfo = true;
        this.objectPrimaryKey = this.model['primary-key'].attribute.map((attr) => attr.value).join('');
        this.pkLink = this.model['primary-key'].attribute[0].name;
        this.show.ripeStatButton = this.HAS_RIPE_STAT_LINK.indexOf(this.model.type.toLowerCase()) > -1;
        this.show.viewVersionsButton = this.HAS_VIEW_VERSIONS_TYPE.indexOf(this.model.type.toLowerCase()) > -1;
        if (this.show.ripeStatButton) {
            this.ripeStatLink = this.getRipeStatLink();
        }
        this.setButtonText(this.userInfoService.isLoggedIn());
        this.show.ripeManagedToggleControl = this.model.managed;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    clickShowMoreLines() {
        this.nrLinesToShow = this.objLength;
        this.showMoreButton = this.objLength > this.nrLinesToShow;
    }

    navigateToVersions() {
        const queryParams: any = {
            source: this.properties.SOURCE,
            type: this.model.type,
            key: this.objectPrimaryKey,
            from: this.from,
        };

        if (this.from === 'query') {
            queryParams.searchtext = this.searchText;
        }

        void this.router.navigate(['versions'], { queryParams });
    }

    getRipeStatLink(): string {
        const routeObject = this.model['primary-key'].attribute.find((attr) => {
            return attr.name === 'route' || attr.name === 'route6';
        });
        return routeObject ? routeObject.value : this.objectPrimaryKey;
    }

    emitUpdateClicked() {
        this.updateClicked.emit();
    }

    getPkLinksQueryParams() {
        return {
            source: this.model.source.id,
            key: this.objectPrimaryKey,
            type: this.model.type,
        };
    }

    getLocalLinksQueryParams(attr: IAttributeModel) {
        return {
            source: attr.value === 'DUMY-RIPE' ? this.properties.SOURCE : this.model.source.id,
            key: attr.value,
            type: attr['referenced-type'],
        };
    }

    trim(value: string) {
        console.log('before', value + '|');
        console.log('after', value.trim() + '|');
        return value?.trim();
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
}
