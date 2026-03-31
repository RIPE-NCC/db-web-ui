import { Component, Input, inject } from '@angular/core';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { PropertiesService } from '../../properties.service';

@Component({
    selector: 'manage-resources',
    templateUrl: './manage-resources.component.html',
    styleUrl: './manage-resources.component.scss',
    standalone: true,
    imports: [MatAccordion, MatExpansionPanel, MatExpansionPanelTitle, MatExpansionPanelHeader],
})
export class ManageResourcesComponent {
    properties = inject(PropertiesService);

    @Input()
    public sponsoredMenu: boolean;
}
