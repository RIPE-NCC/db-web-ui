import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';
import { AttributeMetadataService } from '../attribute/attribute-metadata.service';
import { PropertiesService } from '../properties.service';
import { AlertsService } from '../shared/alert/alerts.service';
import { IAttributeModel, IWhoisObjectModel } from '../shared/whois-response-type.model';
import { MessageStoreService } from '../updatesweb/message-store.service';

@Component({
    selector: 'whois-object-editor',
    templateUrl: './whois-object-editor.component.html',
})
export class WhoisObjectEditorComponent implements OnInit {
    @Input()
    public model: IWhoisObjectModel;
    @Input()
    public disableSubmit?: boolean;
    @Input()
    public deletable?: boolean;

    public objectName: string;
    public objectType: string;
    public source: string;
    public missingMandatoryAttributes: string[] = [];

    public attributes: IAttributeModel[];

    @Output()
    public cancelClicked = new EventEmitter();
    @Output()
    public updateClicked: EventEmitter<IWhoisObjectModel> = new EventEmitter<IWhoisObjectModel>();
    @Output()
    public deleteClicked = new EventEmitter();

    private originalAttibutes: IAttributeModel[];

    constructor(
        private attributeMetadataService: AttributeMetadataService,
        private messageStoreService: MessageStoreService,
        private alertsService: AlertsService,
        private properties: PropertiesService,
    ) {}

    public ngOnInit() {
        // Assign to short-cut accessor.
        this.attributes = this.model.attributes.attribute;
        this.addCommentsToValueOfAtrributes(this.attributes);

        // the type is always the first attribute
        this.objectName = this.attributes[0].value;
        this.objectType = this.attributes[0].name;

        if (typeof this.model.source !== 'undefined') {
            this.source = this.model.source.id.toUpperCase();
        } else {
            this.source = this.properties.SOURCE;
            this.model.source = {
                id: this.source,
            };
        }
        const createdAttr = this.attributes.filter((attr: IAttributeModel) => {
            return attr.name.toLowerCase() === 'created';
        });
        if (createdAttr && createdAttr.length && createdAttr[0].value) {
            // make a copy of the object in case we need to restore
            this.originalAttibutes = _.cloneDeep(this.attributes);

            // decorate the object
            this.attributeMetadataService.enrich(this.objectType, this.attributes);

            // get the mandatory attributes for this object
            this.missingMandatoryAttributes = this.getMissingMandatoryAttributes();

            // save object for later diff in display-screen
            this.messageStoreService.add('DIFF', _.cloneDeep(this.attributes));
        } else {
            this.originalAttibutes = _.cloneDeep(this.attributes);
            this.attributeMetadataService.enrich(this.objectType, this.attributes);
            this.missingMandatoryAttributes = this.getMissingMandatoryAttributes();
        }
        if (this.missingMandatoryAttributes.length > 0) {
            this.alertsService.setGlobalWarning(`Missing mandatory attribute: ${this.missingMandatoryAttributes.join(', ')}`);
        }
    }

    public btnCancelClicked() {
        this.model.attributes.attribute = this.attributes = _.cloneDeep(this.originalAttibutes);
        this.cancelClicked.emit();
    }

    public btnSubmitClicked() {
        if (this.objectType !== 'domain' && this.objectType !== 'prefix') {
            this.removeEmptyAttributes();
        }
        this.updateClicked.emit(this.model);
    }

    public btnDeleteClicked() {
        this.deleteClicked.emit(this.model);
    }

    private removeEmptyAttributes() {
        // find indexes of empty attributes, highest index first
        const emptyAttrIndexes = this.attributes
            .map((attr: IAttributeModel, index: number) => {
                if (typeof attr.value !== 'string' || attr.value.trim().length === 0) {
                    return index;
                }
                return -1;
            })
            .filter((index: number) => {
                return index > 0;
            })
            .reverse();

        // remove the empty attributes
        for (const i of emptyAttrIndexes) {
            this.attributes.splice(i, 1);
        }
    }

    private addCommentsToValueOfAtrributes(attributes: IAttributeModel[]) {
        attributes.forEach((attr: IAttributeModel) => {
            if (attr.comment && attr.comment.trim().length > 0) {
                if (attr.value.trim().length === 0) {
                    attr.value += '# ' + attr.comment;
                } else {
                    attr.value += ' # ' + attr.comment;
                }
                attr.comment = undefined;
            }
        });
    }

    /**
     * TODO: port  this to MetadataService
     * @returns {[string,string,string,string,string]}
     */
    private getMissingMandatoryAttributes(): string[] {
        const attrCopy = _.cloneDeep(this.attributes);
        const shouldHave: IAttributeModel[] = this.attributeMetadataService.determineAttributesForNewObject(this.objectType);
        const missing: any[] = [];
        Object.keys(shouldHave).forEach((k: string) => {
            const found = _.findIndex(attrCopy, (item) => item.name === shouldHave[k].name);
            if (found > -1) {
                attrCopy.splice(found, 1);
            } else {
                missing.push(shouldHave[k].name);
            }
        });
        return missing;
    }
}
