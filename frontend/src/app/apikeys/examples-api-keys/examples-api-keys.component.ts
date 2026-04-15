import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { Component, inject, Input, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { IUserInfoOrganisation, IUserInfoRegistration } from '../../dropdown/org-data-type.model';
import { PropertiesService } from '../../properties.service';

import { isKeyDisabled, isMemberOrg, KeyType } from '../utils';

export const DOCUMENT_TYPE = {
    XML: { name: 'XML', type: 'application/xml' },
    JSON: { name: 'JSON', type: 'application/json' },
    PLAIN_TEXT: { name: 'PLAIN TEXT', type: 'text/plain' },
};

@Component({
    selector: 'examples-api-keys',
    templateUrl: './examples-api-keys.component.html',
    styleUrl: './examples-api-keys.component.scss',
    standalone: true,
    imports: [MatFormField, FormsModule, MatOption, MatButton, MatSelect, CdkCopyToClipboard],
})
export class ExamplesApiKeysComponent implements OnChanges {
    dialog = inject(MatDialog);
    propertiesService = inject(PropertiesService);

    @Input()
    selectedOrg: IUserInfoOrganisation;

    keyTypes = Object.values(KeyType) as KeyType[];
    selectedKeyType: KeyType = KeyType.MAINTAINER;
    docFormatOptions: string[];
    readonly ipAnalyzerDocFormats = [DOCUMENT_TYPE.JSON, DOCUMENT_TYPE.PLAIN_TEXT];
    readonly myResourcesDocFormats = [DOCUMENT_TYPE.JSON, DOCUMENT_TYPE.XML];
    selectedDocType: string = 'JSON';

    docTypeForView: string;

    // KeyType.MAINTAINER
    readAnObject: string;
    createAnObject: string;
    updateAnObject: string;
    deleteAnObject: string;

    // KeyType.IP_ANALYSER
    ipv6Analyser: string;
    ipv4Analyser: string;

    // KeyType.MY_RESOURCES
    allResourcesMyResources: string;
    asnsMyResources: string;
    ipv4MyResources: string;
    ipv6MyResources: string;
    ipv4NAllocationMyResources: string;
    ipv4NAssignmentMyResources: string;
    ipv4NLegacyMyResources: string;
    ipv6NAllocationMyResources: string;
    ipv6NAssignmentMyResources: string;

    ngOnChanges(): void {
        if (!isMemberOrg(this.selectedOrg as IUserInfoRegistration)) {
            this.selectedKeyType = KeyType.MAINTAINER;
        }
        this.showExamples();
    }

    showExamples() {
        this.docFormatOptions = this.getDocFormatNames();
        if (!this.docFormatOptions.includes(this.selectedDocType)) {
            this.selectedDocType = this.docFormatOptions[0];
        }
        const keyOfDocumentType = Object.keys(DOCUMENT_TYPE).find((k) => DOCUMENT_TYPE[k].name === this.selectedDocType);
        this.docTypeForView = DOCUMENT_TYPE[keyOfDocumentType].type;

        switch (this.selectedKeyType) {
            case KeyType.MAINTAINER: {
                this.readAnObject = `curl -H \"Authorization: Basic <api-key>\" -H \"Accept: ${this.docTypeForView}\" \"${this.propertiesService.REST_API_RIPE_URL}/ripe/<object-type>/<primary-key>?unfiltered\"`;
                this.createAnObject = `curl -d @<file> -H \"Authorization: Basic <api-key>\" -H \"Content-type: ${this.docTypeForView}\" \"${this.propertiesService.REST_API_RIPE_URL}/ripe/<object-type>\"`;
                this.updateAnObject = `curl -X PUT -d @<file> -H \"Authorization: Basic <api-key>\" -H \"Content-type: ${this.docTypeForView}\" \"${this.propertiesService.REST_API_RIPE_URL}/ripe/<object-type>/<primary-key>\"`;
                this.deleteAnObject = `curl -X DELETE -d @file -H \"Authorization: Basic <api-key>\" -H \"Content-type: ${this.docTypeForView}\" \"${this.propertiesService.REST_API_RIPE_URL}/ripe/<object-type>/<primary-key>\"`;
                break;
            }
            case KeyType.IP_ANALYSER: {
                this.ipv6Analyser = `curl "${location.origin}/api/ipanalyser/v2/ipv6?org-id=${this.selectedOrg.orgObjectId}\" -H "Authorization: Basic <api-key>" -H "Accept: ${this.docTypeForView}"`;
                this.ipv4Analyser = `curl "${location.origin}/api/ipanalyser/v2/ipv4?org-id=${this.selectedOrg.orgObjectId}\" -H "Authorization: Basic <api-key>" -H "Accept: ${this.docTypeForView}"`;
                break;
            }
            case KeyType.MY_RESOURCES: {
                this.allResourcesMyResources = `curl "${location.origin}/api/myresources/v2/allresources?org-id=${this.selectedOrg.orgObjectId}\" -H "Authorization: Basic <api-key>" -H "Accept: ${this.docTypeForView}"`;
                this.asnsMyResources = `curl "${location.origin}/api/myresources/v2/asns?org-id=${this.selectedOrg.orgObjectId}\" -H "Authorization: Basic <api-key>" -H "Accept: ${this.docTypeForView}"`;
                this.ipv4MyResources = `curl "${location.origin}/api/myresources/v2/ipv4?org-id=${this.selectedOrg.orgObjectId}\" -H "Authorization: Basic <api-key>" -H "Accept: ${this.docTypeForView}"`;
                this.ipv6MyResources = `curl "${location.origin}/api/myresources/v2/ipv6?org-id=${this.selectedOrg.orgObjectId}\" -H "Authorization: Basic <api-key>" -H "Accept: ${this.docTypeForView}"`;
                this.ipv4NAllocationMyResources = `curl "${location.origin}/api/myresources/v2/ipv4/allocations?org-id=${this.selectedOrg.orgObjectId}\" -H "Authorization: Basic <api-key>" -H "Accept: ${this.docTypeForView}"`;
                this.ipv4NAssignmentMyResources = `curl "${location.origin}/api/myresources/v2/ipv4/assignments?org-id=${this.selectedOrg.orgObjectId}\" -H "Authorization: Basic <api-key>" -H "Accept: ${this.docTypeForView}"`;
                this.ipv4NLegacyMyResources = `curl "${location.origin}/api/myresources/v2/ipv4/erx?org-id=${this.selectedOrg.orgObjectId}\" -H "Authorization: Basic <api-key>" -H "Accept: ${this.docTypeForView}"`;
                this.ipv6NAllocationMyResources = `curl "${location.origin}/api/myresources/v2/ipv6/allocations?org-id=${this.selectedOrg.orgObjectId}\" -H "Authorization: Basic <api-key>" -H "Accept: ${this.docTypeForView}"`;
                this.ipv6NAssignmentMyResources = `curl "${location.origin}/api/myresources/v2/ipv6/assignments?org-id=${this.selectedOrg.orgObjectId}\" -H "Authorization: Basic <api-key>" -H "Accept: ${this.docTypeForView}"`;
                break;
            }
        }
    }

    getDocFormatNames = () => {
        switch (this.selectedKeyType) {
            case KeyType.MAINTAINER: {
                return Object.values(DOCUMENT_TYPE).map((d) => d.name);
            }
            case KeyType.IP_ANALYSER: {
                return Object.values(this.ipAnalyzerDocFormats).map((d) => d.name);
            }
            case KeyType.MY_RESOURCES: {
                return Object.values(this.myResourcesDocFormats).map((d) => d.name);
            }
        }
    };

    protected readonly KeyType = KeyType;
    protected readonly isKeyDisabled = isKeyDisabled;
}
