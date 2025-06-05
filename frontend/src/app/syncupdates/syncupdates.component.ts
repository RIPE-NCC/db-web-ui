import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PreferenceService } from '../updatesweb/preference.service';
import { ScreenLogicInterceptorService } from '../updatesweb/screen-logic-interceptor.service';
import { SyncupdatesService } from './syncupdates.service';

@Component({
    selector: 'syncupdates',
    templateUrl: './syncupdates.component.html',
    standalone: false,
})
export class SyncupdatesComponent {
    public rpslObject: string;
    public updateResponse: string;
    public errorMessages: string;

    public isUpdating: boolean = false;
    public haveNonLatin1: boolean;

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

    hasNonLatin1(): boolean {
        this.haveNonLatin1 = ScreenLogicInterceptorService.hasNonLatin1(this.rpslObject);
        return this.haveNonLatin1;
    }
}
