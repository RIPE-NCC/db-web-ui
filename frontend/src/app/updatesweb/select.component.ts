import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { PropertiesService } from '../properties.service';
import { DropdownComponent } from '../shared/dropdown/dropdown.component';
import { DropdownOption } from '../shared/dropdown/types';
import { WhoisMetaService } from '../shared/whois-meta.service';
import { UserInfoService } from '../userinfo/user-info.service';

interface ISelectedObjectType {
    objectType: string;
    source: string;
}

@Component({
    selector: 'select-component',
    templateUrl: './select.component.html',
    styleUrl: 'select.component.scss',
    standalone: true,
    imports: [FormsModule, MatButton, DropdownComponent],
})
export class SelectComponent implements OnInit {
    private router = inject(Router);
    whoisMetaService = inject(WhoisMetaService);
    userInfoService = inject(UserInfoService);
    properties = inject(PropertiesService);

    public selected: ISelectedObjectType;
    public objectTypes: DropdownOption[];
    public loggedIn: boolean;

    constructor() {
        this.userInfoService.userLoggedIn$.subscribe(() => {
            this.loggedIn = true;
        });
    }

    ngOnInit() {
        this.objectTypes = this.mapTypesToOptions(this.filterObjectTypes(this.whoisMetaService.getObjectTypes()));
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

    navigateToCreate() {
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

    filterObjectTypes(unfiltered: string[]): string[] {
        // only on PROD env should be filtered out option to create autnum and as-block
        if (this.properties.isEnableNonAuthUpdates()) {
            return unfiltered.filter((item: string) => item !== 'poem' && item !== 'poetic-form');
        }
        return unfiltered.filter((item: string) => item !== 'as-block' && item !== 'poem' && item !== 'poetic-form' && item != 'aut-num');
    }

    mapTypesToOptions(types: string[]): DropdownOption[] {
        return [
            {
                label: 'role and maintainer pair',
                value: 'role-mntnr',
            },

            ...types.map((type) => ({
                label: type,
                value: type,
            })),
        ];
    }
}
