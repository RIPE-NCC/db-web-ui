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
            this.router.navigate(['webupdates/create', this.selected.source, 'mntner', 'self']);
        } else if (this.selected.objectType === 'domain') {
            this.router.navigate(['webupdates/wizard', this.selected.source, 'domain']);
        } else if (this.selected.objectType === 'role-mntnr') {
            this.router.navigate(['webupdates/create', this.selected.source, 'role', 'self']);
        } else {
            this.router.navigate(['webupdates/create', this.selected.source, this.selected.objectType]);
        }
    }

    public filterObjectTypes(unfiltered: string[]): string[] {
        // in case there is mnt which allowed to create autnum in properties file, autnum shouldn't be filtered out
        if (Object.keys(this.properties.MNTNER_ALLOWED_TO_CREATE_AUTNUM).length > 0) {
            return unfiltered.filter((item: string) => item !== 'as-block' && item !== 'poem' && item !== 'poetic-form');
        }
        return unfiltered.filter((item: string) => item !== 'as-block' && item !== 'poem' && item !== 'poetic-form' && item != 'aut-num');
    }
}
