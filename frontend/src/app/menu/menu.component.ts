import { Location } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IUserInfoOrganisation } from '../dropdown/org-data-type.model';
import { OrgDropDownSharedService } from '../dropdown/org-drop-down-shared.service';
import { FeedbackSupportDialogComponent } from '../feedbacksupport/feedback-support-dialog.component';
import { PropertiesService } from '../properties.service';
import { UserInfoService } from '../userinfo/user-info.service';
import { MenuService } from './menu.service';

@Component({
    selector: 'swe-menu',
    template: `
        <app-nav-bar *ngIf="isUserLogged" (app-nav-bar-select)="onNavBarSelected($event)" [menu]="menu" [open]="open" [active]="activeItem"></app-nav-bar>
        <app-nav-bar *ngIf="!isUserLogged" (app-nav-bar-select)="onNavBarSelected($event)" [menu]="menu" [open]="open" [active]="activeItem"></app-nav-bar>
    `,
    standalone: false,
})
export class MenuComponent implements OnInit, OnDestroy {
    @Input()
    public open: boolean;
    public menu: string;
    public activeItem: string = 'create'; // id from menu.json
    public activeUrl: string; // browser url - location path
    public isUserLogged = false; // to rerender menu - so API Key menu item could be shown as selected - web component expand parent(s) of active item only at initial render
    private readonly navigationEnd: Subscription;

    constructor(
        public properties: PropertiesService,
        public orgDropDownSharedService: OrgDropDownSharedService,
        private menuService: MenuService,
        public dialog: MatDialog,
        private location: Location,
        private router: Router,
        private userInfoService: UserInfoService,
    ) {
        // mainly because switching between My Resources and Sponsored Resources
        const event = this.router.events.pipe(filter((evt) => evt instanceof NavigationEnd)) as Observable<NavigationEnd>;
        this.navigationEnd = event.subscribe((evt) => {
            this.activeUrl = evt.url;
            this.setActiveMenuItem();
        });
        orgDropDownSharedService.selectedOrgChanged$.subscribe((selected: IUserInfoOrganisation) => {
            if (!selected || !selected.roles || selected.roles.length < 1) {
                return;
            }
            this.menu = JSON.stringify(this.menuService.createMenu(selected.roles));
        });
        this.userInfoService.userLoggedIn$.subscribe(() => {
            this.menu = JSON.stringify(this.menuService.createMenu(['unauthorised', 'LOGGED']));
            this.isUserLogged = true;
        });
    }

    ngOnInit() {
        this.activeUrl = this.location.path();
        this.setActiveMenuItem();

        this.menu = JSON.stringify(this.menuService.createMenu(['unauthorised']));
    }

    public ngOnDestroy() {
        if (this.navigationEnd) {
            this.navigationEnd.unsubscribe();
        }
    }

    onNavBarSelected = (event: any) => {
        if (event?.detail?.selected?.url) {
            const url = event.detail.selected.url;
            if (event.detail.selected.id === 'feedback') {
                const dialogRef = this.dialog.open(FeedbackSupportDialogComponent, { panelClass: 'feedback-support-panel' });
                dialogRef.afterOpened().subscribe(() => {
                    // this is needed to re-trigger render on angular after is closed and activeItem will change
                    this.activeItem = 'feedback';
                });
                dialogRef.afterClosed().subscribe(() => {
                    this.setActiveMenuItem();
                });
            } else if (url.startsWith('http')) {
                window.location.href = url;
            } else {
                if (event.detail.selected.id === 'sponsored') {
                    void this.router.navigate([url], { queryParams: { sponsored: true } });
                } else if (event.detail.selected.id === 'docs') {
                    window.open(url, '_blank');
                } else {
                    void this.router.navigate([url]);
                }
            }
        }
    };

    private setActiveMenuItem() {
        if (this.activeUrl.indexOf('/wizard') > -1 || this.activeUrl.indexOf('/select') > -1 || this.activeUrl.indexOf('/create') > -1) {
            this.activeItem = 'create';
        } else if (this.activeUrl.indexOf('/query') > -1 || this.activeUrl.indexOf('/lookup') > -1) {
            this.activeItem = 'query';
        } else if (this.activeUrl.indexOf('/myresources') > -1) {
            this.activeItem = this.activeUrl.indexOf('sponsored') === -1 || this.activeUrl.indexOf('sponsored=false') > -1 ? 'myresources' : 'sponsored';
        } else if (this.activeUrl.indexOf('/api-keys') > -1) {
            this.activeItem = 'api_keys';
        } else {
            this.activeItem = this.activeUrl.substring(this.activeUrl.lastIndexOf('/') + 1);
        }
    }
}
