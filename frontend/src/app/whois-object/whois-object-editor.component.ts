import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import * as _ from "lodash";
import {MessageStoreService} from "../updates/message-store.service";
import {AttributeMetadataService} from "../attribute/attribute-metadata.service";
import {IAttributeModel, IWhoisObjectModel} from "../shared/whois-response-type.model";
import {PropertiesService} from "../properties.service";

@Component({
    selector: "whois-object-editor",
    templateUrl: "./whois-object-editor.component.html",
})
export class WhoisObjectEditorComponent implements OnInit {

    @Input("ng-model")
    public ngModel: IWhoisObjectModel;
    @Input("on-resource-page")
    public onResourcePage?: boolean;

    public objectName: string;
    public objectType: string;
    public source: string;
    public missingMandatoryAttributes: string[] = [];

    public attributes: IAttributeModel[];

    @Output("cancel-clicked")
    public cancelClicked = new EventEmitter();
    @Output("update-clicked")
    public updateClicked: EventEmitter<IWhoisObjectModel> = new EventEmitter<IWhoisObjectModel>();

    private originalAttibutes: IAttributeModel[];

    constructor(private attributeMetadataService: AttributeMetadataService,
                private messageStoreService: MessageStoreService,
                private properties: PropertiesService) {
    }

    public ngOnInit() {
        // Assign to short-cut accessor.
        this.attributes = this.ngModel.attributes.attribute;
        this.addCommentsToValueOfAtrributes(this.attributes);

        // the type is always the first attribute
        this.objectName = this.attributes[0].value;
        this.objectType = this.attributes[0].name;

        if (typeof this.ngModel.source !== "undefined") {
            this.source = this.ngModel.source.id.toUpperCase();
        } else {
            this.source = this.properties.SOURCE;
            this.ngModel.source = {
                id: this.source,
            };
        }
        const createdAttr = this.attributes.filter((attr: IAttributeModel) => {
            return attr.name.toLowerCase() === "created";
        });
        if (createdAttr && createdAttr.length && createdAttr[0].value) {
            // make a copy of the object in case we need to restore
            this.originalAttibutes = _.cloneDeep(this.attributes);

            // decorate the object
            this.attributeMetadataService.enrich(this.objectType, this.attributes);

            // get the mandatory attributes for this object
            this.missingMandatoryAttributes = this.getMissingMandatoryAttributes();

            // save object for later diff in display-screen
            this.messageStoreService.add("DIFF", _.cloneDeep(this.attributes));
        } else {
            this.originalAttibutes = _.cloneDeep(this.attributes);
            this.attributeMetadataService.enrich(this.objectType, this.attributes);
            this.missingMandatoryAttributes = this.getMissingMandatoryAttributes();
        }
    }

    public btnCancelClicked() {
        this.ngModel.attributes.attribute = this.attributes = _.cloneDeep(this.originalAttibutes);
        this.cancelClicked.emit();
    }

    public btnSubmitClicked() {
        if (this.objectType !== "domain" && this.objectType !== "prefix") {
            this.removeEmptyAttributes();
        }
        this.updateClicked.emit(this.ngModel);
    }

    private removeEmptyAttributes() {
        // find indexes of empty attributes, highest index first
        const emptyAttrIndexes = this.attributes.map((attr: IAttributeModel, index: number) => {
            if (typeof(attr.value) !== "string" || attr.value.trim().length === 0) {
                return index;
            }
            return -1;
        }).filter((index: number) => {
            return index > 0;
        }).reverse();

        // remove the empty attributes
        for (const i of emptyAttrIndexes) {
            this.attributes.splice(i, 1);
        }
    }

    private addCommentsToValueOfAtrributes(attributes: IAttributeModel[]) {
        attributes.map((attr: IAttributeModel) => {
            if (attr.comment && attr.comment.trim().length > 0) {
                if (attr.value.trim().length === 0) {
                    attr.value += "# " + attr.comment;
                } else {
                    attr.value += " # " + attr.comment;
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
            const found = _.findIndex(attrCopy, (item) => (item.name === shouldHave[k].name));
            if (found > -1) {
                attrCopy.splice(found, 1);
            } else {
                missing.push(shouldHave[k].name);
            }
        });
        return missing;
    }
}
