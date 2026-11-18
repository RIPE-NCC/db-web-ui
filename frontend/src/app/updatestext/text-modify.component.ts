import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { IWhoisResponseModel } from 'src/app/shared/whois-response-type.model';
import { PropertiesService } from '../properties.service';
import { AlertsService } from '../shared/alert/alerts.service';
import { WhoisResourcesService } from '../shared/whois-resources.service';
import { ErrorReporterService } from '../updatesweb/error-reporter.service';
import { MessageStoreService } from '../updatesweb/message-store.service';
import { PreferenceService } from '../updatesweb/preference.service';
import { WhoisObjectTextEditorComponent } from '../whois-object/whois-object-text-editor.component';
import { TextCommonsService } from './text-commons.service';
import { ITextObject } from './text-create.component';

@Component({
    selector: 'text-modify',
    templateUrl: './text-modify.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatButton, WhoisObjectTextEditorComponent],
})
export class TextModifyComponent implements OnInit {
    private whoisResourcesService = inject(WhoisResourcesService);
    private errorReporterService = inject(ErrorReporterService);
    private messageStoreService = inject(MessageStoreService);
    private textCommonsService = inject(TextCommonsService);
    private preferenceService = inject(PreferenceService);
    alertsServices = inject(AlertsService);
    private activatedRoute = inject(ActivatedRoute);
    private router = inject(Router);
    private properties = inject(PropertiesService);

    restCallInProgress: boolean = false;
    noRedirect: boolean = false;
    object: ITextObject = {
        source: '',
        type: '',
    };
    name: string;
    override: string;

    ngOnInit() {
        // extract parameters from the url
        const paramMap = this.activatedRoute.snapshot.paramMap;
        const queryParamMap = this.activatedRoute.snapshot.queryParamMap;
        this.object.source = paramMap.get('source') ?? this.properties.SOURCE;
        this.object.type = paramMap.get('objectType');
        this.object.name = decodeURIComponent(paramMap.get('objectName'));

        const redirect = !queryParamMap.has('noRedirect');

        console.debug(
            'TextModifyController: Url params:' +
                ' object.source:' +
                this.object.source +
                ', object.type:' +
                this.object.type +
                ', object.name:' +
                this.object.name +
                ', noRedirect:' +
                this.noRedirect,
        );

        if (this.preferenceService.isWebMode() && redirect) {
            this.switchToWebMode();
            return;
        }
    }

    submit(response: IWhoisResponseModel) {
        if (response?.errormessages) {
            this.restCallInProgress = false;

            const whoisResources = response;
            this.alertsServices.setAllErrors(whoisResources);
            const attributes = this.whoisResourcesService.getAttributes(whoisResources);
            if (attributes.length !== 0) {
                this.errorReporterService.log('TextModify', this.object.type, this.alertsServices.alerts.errors, attributes);
            }
        } else {
            this.restCallInProgress = false;
            const primaryKey = this.whoisResourcesService.getPrimaryKey(response);
            this.messageStoreService.add(primaryKey, response);
            this.navigateToDisplayPage(this.object.source, this.object.type, primaryKey, 'Modify');
        }
    }

    switchToWebMode() {
        console.debug('Switching to web-mode');

        this.preferenceService.setWebMode();
        void this.router.navigateByUrl(`webupdates/modify/${this.object.source}/${this.object.type}/${encodeURIComponent(this.object.name)}?noRedirect`);
    }

    cancel() {
        this.navigateToDisplayPage(this.object.source, this.object.type, this.object.name, undefined);
    }

    deleteObject() {
        this.textCommonsService.navigateToDelete(this.object.source, this.object.type, this.object.name, 'textupdates/modify');
    }

    private navigateToDisplayPage(source: string, objectType: string, objectName: string, operation: any) {
        if (operation) {
            void this.router.navigateByUrl(`webupdates/display/${source}/${objectType}/${encodeURIComponent(objectName)}?method=${operation}`);
        } else {
            // operation create or modify was canceled
            void this.router.navigateByUrl(`webupdates/display/${source}/${objectType}/${encodeURIComponent(objectName)}`);
        }
    }
}
