import { NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { AlertsService } from '../shared/alert/alerts.service';
import { AutoFocusDirective } from '../shared/autofocus.directive';
import { SubmittingAgreementComponent } from '../shared/submitting-agreement.component';
import { ScreenLogicInterceptorService } from '../updatesweb/screen-logic-interceptor.service';
import { SyncupdatesService } from './syncupdates.service';

@Component({
    selector: 'syncupdates',
    templateUrl: './syncupdates.component.html',
    imports: [NgIf, FormsModule, AutoFocusDirective, SubmittingAgreementComponent, MatButton],
})
export class SyncupdatesComponent {
    private syncupdatesService = inject(SyncupdatesService);
    private alertService = inject(AlertsService);

    public rpslObject: string;
    public updateResponse: string;

    public isUpdating: boolean = false;
    public haveNonLatin1: boolean;

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
