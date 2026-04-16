import { Component, inject, Input } from '@angular/core';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { RouterLink } from '@angular/router';
import { KeyType } from '../../apikeys/utils';
import { PropertiesService } from '../../properties.service';

@Component({
    selector: 'apikeys-dropdown',
    templateUrl: './apikeys-dropdown.component.html',
    styleUrl: './apikeys-dropdown.component.scss',
    standalone: true,
    imports: [MatAccordion, MatExpansionPanel, MatExpansionPanelTitle, MatExpansionPanelHeader, RouterLink],
})
export class ApikeysDropdownComponent {
    @Input()
    apiKeyType: keyof typeof KeyType;

    linkToManageApiKeysInAccess: string;

    constructor() {
        const propertiesService = inject(PropertiesService);
        this.linkToManageApiKeysInAccess = propertiesService.LINK_TO_MANAGE_APIKEYS_IN_ACCESS;
    }

    protected readonly KeyType = KeyType;
}
