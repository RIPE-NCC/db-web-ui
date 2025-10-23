import { NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { PropertiesService } from '../../properties.service';
import { AlertsService } from '../../shared/alert/alerts.service';

@Component({
    selector: 'force-delete-select',
    templateUrl: './force-delete-select.component.html',
    imports: [FormsModule, NgFor, MatButton],
})
export class ForceDeleteSelectComponent implements OnInit {
    public objectTypes: string[] = ['inetnum', 'inet6num', 'route', 'route6', 'domain'];
    public selected: any;

    constructor(private properties: PropertiesService, private alertsService: AlertsService, private router: Router) {}

    public ngOnInit() {
        this.alertsService.clearAlertMessages();
        this.selected = {
            name: undefined,
            objectType: this.objectTypes[0],
            source: this.properties.SOURCE,
        };
    }

    public navigateToForceDelete() {
        return this.router.navigateByUrl(`forceDelete/${this.selected.source}/${this.selected.objectType}/${encodeURIComponent(this.selected.name)}`);
    }

    public isFormValid(): boolean {
        return this.selected.name !== undefined && this.selected.name !== '';
    }
}
