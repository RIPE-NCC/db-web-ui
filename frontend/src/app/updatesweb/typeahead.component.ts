import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, mergeMap } from 'rxjs/operators';
import { IAttributeModel } from '../shared/whois-response-type.model';
import { CharsetToolsService } from './charset-tools.service';
import { RestService } from './rest.service';

// This component was created because of ngbTypeahead moving from version 9.0.2; cannot handle attribute as parameter in call autocompleteAttribute https://github.com/ng-bootstrap/ng-bootstrap/issues/4055
// TODO delete this component once create-modify.component start using attribute-renderer.component (if that is good solution at all)
@Component({
    selector: 'typeahead',
    template: `<input
        type="text"
        [attr.name]="attribute.name + '$' + idx"
        class="form-control"
        placeholder="{{ placeholder }}"
        autocomplete="off"
        [(ngModel)]="attribute.value"
        [required]="attribute.$$meta.$$mandatory"
        [disabled]="attribute.$$meta.$$disable"
        (blur)="blurEmit()"
        [ngbTypeahead]="autocompleteAttribute"
        [resultFormatter]="autocompleteAttributeRFormatter"
        [inputFormatter]="autocompleteAttributeIFormatter"
    />`,
})
export class TypeaheadComponent {
    @Input()
    attribute: IAttributeModel;
    @Input()
    idx: number;
    @Input()
    placeholder: string;
    @Output()
    blurEmitter = new EventEmitter();

    constructor(private restService: RestService, public charsetToolsService: CharsetToolsService) {}

    public autocompleteAttribute = (text$: Observable<string>) =>
        // value.key as value.readableName for value in referenceAutocomplete(attribute, $viewValue)
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            mergeMap((term) => this.referenceAutocomplete(term)),
            map((terms: any[]) => terms.map((term: any) => term)),
        );

    // for chosen item from list put key, otherwise is  value
    public autocompleteAttributeIFormatter = (result: any) => (result.key ? result.key : result);
    public autocompleteAttributeRFormatter = (result: any) => result.readableName;

    public blurEmit() {
        this.blurEmitter.emit(this.attribute);
    }

    public referenceAutocomplete(userInput: string): any {
        const attrName = this.attribute.name;
        const refs = this.attribute.$$meta.$$refs;
        const utf8Substituted = this.warnForNonSubstitutableUtf8(this.attribute, userInput);
        if (utf8Substituted && TypeaheadComponent.isServerLookupKey(refs)) {
            return this.restService.autocompleteAdvanced(of(userInput), refs).then(
                (resp: any): any => {
                    return this.addNiceAutocompleteName(this.filterBasedOnAttr(resp, attrName), attrName);
                },
                (): any => {
                    // autocomplete error
                    return [];
                },
            );
        } else {
            // No suggestions since nohandleSsoResponset a reference
            return [];
        }
    }

    private warnForNonSubstitutableUtf8(attribute: any, userInput: string) {
        if (!this.charsetToolsService.isLatin1(userInput)) {
            // see if any chars can be substituted
            const subbedValue = this.charsetToolsService.replaceSubstitutables(userInput);
            if (!this.charsetToolsService.isLatin1(subbedValue)) {
                attribute.$$error = "Input contains illegal characters. These will be converted to '?'";
                return false;
            } else {
                attribute.$$error = '';
                return true;
            }
        }
        return true;
    }

    private static isServerLookupKey(refs: any) {
        return !(_.isUndefined(refs) || refs.length === 0);
    }

    private addNiceAutocompleteName(items: any[], attrName: string) {
        return _.map(items, (item) => {
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
                name = _.isArray(item.descr) && item.descr.length ? [item['as-name'], separator, item.descr[0]].join('') : item['as-name'];
            } else if (_.isString(item['org-name'])) {
                name = item['org-name'];
            } else if (_.isArray(item.descr)) {
                name = item.descr.join('');
            } else if (_.isArray(item.owner)) {
                name = item.owner.join('');
            } else {
                separator = '';
            }
            item.readableName = TypeaheadComponent.escape(item.key + separator + name);
            return item;
        });
    }

    private filterBasedOnAttr(suggestions: string, attrName: string) {
        return _.filter(suggestions, (item) => {
            if (attrName === 'abuse-c') {
                return !_.isEmpty(item['abuse-mailbox']);
            }
            return true;
        });
    }

    private static escape(input: string) {
        return input.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}
