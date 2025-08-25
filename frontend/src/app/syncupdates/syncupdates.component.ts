import { Component } from '@angular/core';
import { AlertsService } from '../shared/alert/alerts.service';
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

    constructor(private syncupdatesService: SyncupdatesService, private alertService: AlertsService) {}

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
                this.isUpdating = false;
                this.errorMessages = error;
                this.alertService.addGlobalError(error);
            },
            complete: () => (this.isUpdating = false),
        });
    }

    hasNonLatin1(): boolean {
        this.haveNonLatin1 = ScreenLogicInterceptorService.hasNonLatin1(this.rpslObject);
        return this.haveNonLatin1;
    }
}
