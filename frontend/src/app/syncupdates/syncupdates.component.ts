import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PreferenceService } from '../updatesweb/preference.service';
import { SyncupdatesService } from './syncupdates.service';

@Component({
    selector: 'syncupdates',
    templateUrl: './syncupdates.component.html',
})
export class SyncupdatesComponent {
    public rpslObject: string;
    public updateResponse: string;
    public errorMessages: string;

    public isUpdating: boolean = false;

    constructor(private router: Router, private preferenceService: PreferenceService, private syncupdatesService: SyncupdatesService) {}

    public update() {
        if (!this.rpslObject) {
            return;
        }
        this.isUpdating = true;
        this.syncupdatesService.update(this.rpslObject).subscribe({
            next: (response: any) => {
                this.updateResponse = response;
                document.querySelector(`#anchorScroll`).scrollIntoView();
            },
            error: (error: any) => {
                this.errorMessages = error;
            },
            complete: () => (this.isUpdating = false),
        });
    }
}
