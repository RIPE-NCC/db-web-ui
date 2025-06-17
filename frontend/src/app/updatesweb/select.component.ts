import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PropertiesService } from '../properties.service';
import { WhoisMetaService } from '../shared/whois-meta.service';
import { UserInfoService } from '../userinfo/user-info.service';

interface ISelectedObjectType {
    objectType: string;
    source: string;
}

@Component({
    selector: 'select-component',
    templateUrl: './select.component.html',
    standalone: false,
})
export class SelectComponent implements OnInit {
    public selected: ISelectedObjectType;
    public objectTypes: string[];
    public loggedIn: boolean;

    constructor(
        private router: Router,
        public whoisMetaService: WhoisMetaService,
        public userInfoService: UserInfoService,
        public properties: PropertiesService,
    ) {
        this.userInfoService.userLoggedIn$.subscribe(() => {
            this.loggedIn = true;
        });
    }

    public ngOnInit() {
        this.objectTypes = this.filterObjectTypes(this.whoisMetaService.getObjectTypes());
        this.userInfoService.getUserOrgsAndRoles().subscribe({
            next: () => (this.loggedIn = true),
            error: () => {
                // do nothing
            },
        });
        this.selected = {
            objectType: 'role-mntnr',
            source: this.properties.SOURCE,
        };
    }

    public navigateToCreate() {
        if (this.selected.objectType === 'mntner') {
            void this.router.navigate(['webupdates/create', this.selected.source, 'mntner', 'self']);
        } else if (this.selected.objectType === 'domain') {
            void this.router.navigate(['webupdates/wizard', this.selected.source, 'domain']);
        } else if (this.selected.objectType === 'role-mntnr') {
            void this.router.navigate(['webupdates/create', this.selected.source, 'role', 'self']);
        } else {
            void this.router.navigate(['webupdates/create', this.selected.source, this.selected.objectType]);
        }
    }

    public filterObjectTypes(unfiltered: string[]): string[] {
        // only on PROD env should be filtered out option to create autnum and as-block
        //TODO duplicated in mntner.service - move it out to method to properties service
        if (!this.properties.isProdEnv() && this.properties.NO_PASSWORD_AUTH_POPUP) {
            return unfiltered.filter((item: string) => item !== 'poem' && item !== 'poetic-form');
        }
        return unfiltered.filter((item: string) => item !== 'as-block' && item !== 'poem' && item !== 'poetic-form' && item != 'aut-num');
    }
}
