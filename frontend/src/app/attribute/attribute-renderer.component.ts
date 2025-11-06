import { NgClass, NgIf } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { NgOptionTemplateDirective, NgSelectComponent } from '@ng-select/ng-select';
import * as _ from 'lodash';
import { Observable, OperatorFunction, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, mergeMap } from 'rxjs/operators';
import { ObjectTypesEnum } from '../query/object-types.enum';
import { CredentialsService } from '../shared/credentials.service';
import { DescriptionSyntaxComponent } from '../shared/descriptionsyntax/description-syntax.component';
import { WhoisMetaService } from '../shared/whois-meta.service';
import { WhoisResourcesService } from '../shared/whois-resources.service';
import { IAttributeModel } from '../shared/whois-response-type.model';
import { CharsetToolsService } from '../updatesweb/charset-tools.service';
import { EnumService } from '../updatesweb/enum.service';
import { ModalAddAttributeComponent } from '../updatesweb/modal-add-attribute.component';
import { ModalCreateRoleForAbuseCComponent } from '../updatesweb/modal-create-role-for-abusec.component';
import { RestService } from '../updatesweb/rest.service';
import { AttributeMetadataService } from './attribute-metadata.service';
import { AttributeReverseZonesComponent } from './attribute-reverse-zones.component';

@Component({
    selector: 'attribute-renderer',
    templateUrl: './attribute-renderer.component.html',
    standalone: true,
    imports: [
        NgClass,
        NgIf,
        AttributeReverseZonesComponent,
        DescriptionSyntaxComponent,
        FormsModule,
        NgbTypeahead,
        NgSelectComponent,
        NgOptionTemplateDirective,
    ],
})
export class AttributeRendererComponent implements OnInit {
    private attributeMetadataService = inject(AttributeMetadataService);
    private whoisMetaService = inject(WhoisMetaService);
    private charsetToolsService = inject(CharsetToolsService);
    private restService = inject(RestService);
    private enumService = inject(EnumService);
    private modalService = inject(NgbModal);
    private credentialsService = inject(CredentialsService);
    private whoisResourcesService = inject(WhoisResourcesService);

    @Input()
    public attribute: IAttributeModel;
    @Input()
    public attributes: IAttributeModel[];
    @Input()
    private source: string;
    @Input()
    public objectType: string;
    @Input()
    public idx: string;

    public isStaticList: boolean;
    public isDinamicList: boolean;
    public staticList: any;

    public isHelpShown: boolean = false;
    private isMntHelpShown: boolean = false;
    private roleForAbuseC: any;
    public widgetReverseZone: boolean;

    /*
     * this variables we can see because they're bound by our directive: attributeRenderer
     *
     * objectType : string   -- Can be "organisation", "inetnum", whatever....
     * attributes : object[] -- The array of attributes which make up the object.
     * attribute  : object   -- The attribute which this controller is responsible for.
     */

    public ngOnInit() {
        this.isHelpShown = false;
        this.isMntHelpShown = false;
        if (!this.attribute.$$meta) {
            this.attribute.$$meta = {};
        }
        if (this.attribute.name === 'source') {
            this.attribute.value = this.source;
            this.attribute.$$meta.$$disable = true;
            this.attribute.$$invalid = false;
        }
        this.widgetReverseZone = this.attribute.name === 'reverse-zone';
        this.checkIsList();
    }

    public checkIsList() {
        const metadata = this.attributeMetadataService.getMetadata(this.objectType, this.attribute.name);
        this.isStaticList = metadata.staticList;
        this.isDinamicList = metadata.refs;
        if (this.isStaticList) {
            this.staticList = this.getStaticList();
        }
    }

    public duplicateAttribute(objectType: string, attributes: IAttributeModel[], attribute: IAttributeModel) {
        this.addAttr(attributes, attribute, attribute.name);
    }

    public displayAddAttributeDialog(objectType: string, attributes: IAttributeModel[], attribute: IAttributeModel) {
        const addableAttributes = [];
        const md = this.attributeMetadataService.getAllMetadata(objectType);
        for (const attributeName in md) {
            if (md.hasOwnProperty(attributeName)) {
                const metadata = this.attributeMetadataService.getMetadata(objectType, attributeName);

                if (
                    !this.isReadOnly(metadata, objectType, attributes) &&
                    this.canBeAdded(objectType, attributes, {
                        name: attributeName,
                        value: undefined,
                    })
                ) {
                    addableAttributes.push({ name: attributeName });
                }
            }
        }
        const modalRef = this.modalService.open(ModalAddAttributeComponent, { size: 'lg' });
        modalRef.componentInstance.items = addableAttributes;
        console.debug('openAddAttributeModal for items', addableAttributes);
        modalRef.closed.subscribe((selectedItem) => {
            console.debug('openAddAttributeModal completed with:', selectedItem);
            this.addAttr(attributes, attribute, selectedItem.name);
        });
        modalRef.dismissed.subscribe((dismissedResponse) => console.debug('openAddAttributeModal dismissed:', dismissedResponse));
    }

    // Should show bell icon for abuse-c in case value is not specified and objectType is organisation
    public shouldShowBellIcon(attribute: IAttributeModel) {
        return attribute.name === 'abuse-c' && !attribute.value;
    }

    // Same like in createModify
    public createRoleForAbuseCAttribute() {
        const maintainers = this.attributes.filter((attr: any) => {
            if (attr.name === 'mnt-by') {
                return { name: 'mnt-by', value: attr.key };
            }
        });
        const inputData = {
            maintainers: maintainers,
            passwords: this.credentialsService.getPasswordsForRestCall(),
            source: this.source,
        };
        const modalRef = this.modalService.open(ModalCreateRoleForAbuseCComponent, { size: 'lg' });
        this.attribute.$$error = '';
        modalRef.componentInstance.inputData = inputData;
        modalRef.closed.subscribe((roleAttrs: any) => {
            this.roleForAbuseC = this.whoisResourcesService.wrapAndEnrichAttributes('role', roleAttrs);
            this.attribute.value = this.whoisResourcesService.getSingleAttributeOnName(this.roleForAbuseC, 'nic-hdl').value;
            this.attribute.$$success = 'Role object for abuse-c successfully created';
        });
        modalRef.dismissed.subscribe((error: any) => {
            if (error !== 'cancel') {
                // dismissing modal will hit this function with the string "cancel" in error arg
                this.attribute.$$error = 'The role object for the abuse-c attribute was not created';
            }
        });
    }

    public removeAttribute(objectType: string, attributes: IAttributeModel[], attribute: IAttributeModel) {
        if (this.canBeRemoved(objectType, attributes, attribute)) {
            const foundIdx = _.findIndex(attributes, (attr: IAttributeModel) => {
                return attr.name === attribute.name && attr.value === attribute.value;
            });
            if (foundIdx > -1) {
                attributes.splice(foundIdx, 1);
                this.attributeMetadataService.enrich(objectType, attributes);
            }
        }
    }

    public toggleHelp() {
        this.isHelpShown = !this.isHelpShown;
    }

    public getAttributeShortDescription(name: string) {
        return this.whoisMetaService.getAttributeShortDescription(this.objectType, name);
    }

    public canAddExtraAttributes(objectType: string) {
        return objectType.toUpperCase() !== 'PREFIX';
    }

    public canBeAdded(objectType: string, attributes: IAttributeModel[], attribute: IAttributeModel) {
        if (attribute.name === 'reverse-zone') {
            return false;
        }
        // count the attributes which match "attribute"
        const cardinality = this.attributeMetadataService.getCardinality(objectType, attribute.name);

        if (cardinality.maxOccurs < 0) {
            // undefined or -1 means no limit
            return true;
        }
        // count attributes which match by name
        const matches = _.filter(attributes, (attr: IAttributeModel) => {
            return attr.name === attribute.name;
        });
        return matches.length < cardinality.maxOccurs;
    }

    public canBeRemoved(objectType: string, attributes: IAttributeModel[], attribute: IAttributeModel) {
        const metadata = this.attributeMetadataService.getMetadata(objectType, attribute.name);

        if (this.isReadOnly(metadata, objectType, attributes)) {
            return false;
        }

        const cardinality = this.attributeMetadataService.getCardinality(objectType, attribute.name);
        // check if there's a limit
        if (cardinality.minOccurs < 1) {
            return true;
        }
        // count the attributes which match "attribute" name
        const matches = _.filter(attributes, (attr: IAttributeModel) => {
            return attr.name === attribute.name;
        });
        return matches.length > cardinality.minOccurs;
    }

    private addAttr(attributes: IAttributeModel[], attribute: IAttributeModel, attributeName: string) {
        let foundIdx = -1;
        if (attribute.$$id) {
            foundIdx = _.findIndex(attributes, (attr: IAttributeModel) => {
                return attribute.$$id === attr.$$id;
            });
        }
        // if id wasn't found, find match on name/value.
        if (foundIdx < 0) {
            foundIdx = _.findIndex(attributes, (attr: IAttributeModel) => {
                return attr.name === attribute.name && attr.value === attribute.value;
            });
        }
        if (foundIdx > -1) {
            attributes.splice(foundIdx + 1, 0, { name: attributeName, value: undefined });
            this.attributeMetadataService.enrich(this.objectType, attributes);
        }
    }

    public valueTypeAheadChanged(objectType: string, attribute: IAttributeModel) {
        attribute.value = attribute.value.key ? attribute.value.key : attribute.value;
        this.attributeMetadataService.enrich(objectType, this.attributes);
    }

    public valueChanged(objectType: string, attributes: IAttributeModel[]) {
        this.attributeMetadataService.enrich(objectType, attributes);
    }

    autocompleteList: OperatorFunction<string, readonly string[]> = (userInput$: Observable<string>) => {
        const metadata = this.attributeMetadataService.getMetadata(this.objectType, this.attribute.name);
        if (metadata.refs) {
            return userInput$.pipe(
                debounceTime(200),
                distinctUntilChanged(),
                mergeMap((term) => this.refsAutocomplete(this.attribute, term, metadata.refs)),
                map((terms: any[]) => terms.map((term: any) => term)),
            );
        }
        return of([]);
    };

    // for chosen item from list put key, otherwise is value
    public autocompleteAttributeIFormatter = (result: any) => (result.key ? result.key : result);
    public autocompleteAttributeRFormatter = (result: any) => result.readableName;

    public displayEnumValue(item: any) {
        if (item.key === item.value) {
            return item.key;
        }
        return item.value + ' [' + item.key.toUpperCase() + ']';
    }

    private getStaticList() {
        const metadata = this.attributeMetadataService.getMetadata(this.objectType, this.attribute.name);
        if (this.attribute.name === 'status') {
            if (this.attribute.value !== 'ALLOCATED PA' && this.attribute.value !== 'ALLOCATED-ASSIGNED PA') {
                this.attribute.$$meta.$$disable = true;
            }
            if (this.objectType === ObjectTypesEnum.INETNUM && this.attribute.value === 'ALLOCATED PA') {
                return [{ key: 'ALLOCATED-ASSIGNED PA', value: 'ALLOCATED-ASSIGNED PA' }];
            }
        }
        if (metadata.staticList) {
            return this.enumService.get(this.objectType, this.attribute.name, this.attribute.value);
        }

        return [];
    }

    private refsAutocomplete(attribute: IAttributeModel, userInput: any, refs: any) {
        const utf8Substituted = this.warnForNonSubstitutableUtf8(attribute, userInput);
        if (utf8Substituted && this.isServerLookupKey(refs)) {
            return this.restService.autocompleteAdvanced(of(userInput), refs).pipe(
                map((resp) => this.addNiceAutocompleteName(this.filterBasedOnAttr(resp, attribute.name), attribute.name)),
                catchError(() => of([])),
            );
        } else {
            // No suggestions since not a reference
            return of([]);
        }
    }

    private isServerLookupKey(refs: any) {
        return !(_.isUndefined(refs) || refs.length === 0);
    }

    private warnForNonSubstitutableUtf8(attribute: IAttributeModel, userInput: any) {
        if (!this.charsetToolsService.isLatin1(userInput)) {
            // see if any chars can be substituted
            const subbedValue = this.charsetToolsService.replaceSubstitutables(userInput);
            if (!this.charsetToolsService.isLatin1(subbedValue)) {
                attribute.$$error = 'Input contains illegal characters. These will be converted to "?"';
                return false;
            } else {
                attribute.$$error = '';
                return true;
            }
        }
        return true;
    }

    private filterBasedOnAttr(suggestions: any, attrName: string) {
        return _.filter(suggestions, (item: any) => {
            if (attrName === 'abuse-c') {
                return !_.isEmpty(item['abuse-mailbox']);
            }
            return true;
        });
    }

    private addNiceAutocompleteName(items: any, attrName: string) {
        return _.map(items, (item: any) => {
            let name = '';
            let separator = ' / ';
            if (item.type === 'person') {
                name = item.person;
            } else if (item.type === 'role') {
                name = item.role;
                if (attrName === 'abuse-c' && typeof item['abuse-mailbox'] === 'string') {
                    name = name.concat(separator + item['abuse-mailbox']);
                }
            } else if (item.type === 'aut-num') {
                // When we're using an as-name then we'll need 1st descr as well (pivotal#116279723)
                if (_.isArray(item.descr) && item.descr.length) {
                    name = [item['as-name'], separator, item.descr[0]].join('');
                } else {
                    name = item['as-name'];
                }
            } else if (typeof item['org-name'] === 'string') {
                name = item['org-name'];
            } else if (_.isArray(item.descr)) {
                name = item.descr.join('');
            } else if (_.isArray(item.owner)) {
                name = item.owner.join('');
            } else {
                separator = '';
            }
            item.readableName = (item.key + separator + name).replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return item;
        });
    }

    private isReadOnly(metadata: any, objectType: string, attributes: IAttributeModel[]) {
        return typeof metadata.readOnly === 'function' ? metadata.readOnly(objectType, attributes) : metadata.readOnly;
    }
}
