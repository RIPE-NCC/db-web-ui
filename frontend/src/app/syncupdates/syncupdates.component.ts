import { HttpErrorResponse } from '@angular/common/http';
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
            error: (error: HttpErrorResponse) => {
                this.isUpdating = false;
                switch (error.status) {
                    case 504:
                        this.alertService.addGlobalError('Timeout performing Syncupdates request');
                        break;
                    case 500:
                        this.alertService.addGlobalError('Internal Server Error performing Syncupdates request');
                        break;
                    default:
                        this.alertService.addGlobalError('There was an error performing Syncupdates request');
                        break;
                }
            },
            complete: () => (this.isUpdating = false),
        });
    }

    hasNonLatin1(): boolean {
        this.haveNonLatin1 = ScreenLogicInterceptorService.hasNonLatin1(this.rpslObject);
        return this.haveNonLatin1;
    }
}
