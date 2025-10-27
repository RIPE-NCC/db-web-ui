import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { IAttributeModel } from '../shared/whois-response-type.model';

export interface ISubstitution {
    code: string;
    sub: string;
}

declare function escape(s: string): string;

@Injectable({ providedIn: 'root' })
export class CharsetToolsService {
    private substitutions: ISubstitution[] = [
        { code: '\u2013', sub: '-' }, // em dash
        { code: '\u2014', sub: '-' }, // en dash
        { code: '\u00A0', sub: ' ' }, // nbsp
    ];

    public isLatin1(value: string): boolean {
        if (_.isUndefined(value) || _.isEmpty(value)) {
            return true;
        }
        // escape encodes extended ISO-8859-1 characters (UTF code points U+0080-U+00ff) as %xx (two-digit hex)
        // whereas it encodes UTF codepoints U+0100 and above as %uxxxx (%u followed by four-digit hex.)
        return !_.includes(escape(value), '%u');
    }

    // compare string against array of substitutable values and replace if found
    public replaceSubstitutables(value: string): string {
        let subbedValue = value;

        // if we have this unicode char in the string we always want to replace it
        _.forEach(this.substitutions, (sub) => {
            // g to replace all not just the first
            subbedValue = subbedValue.replace(new RegExp(sub.code, 'g'), this.replaceUnicodeG(sub));
        });
        return subbedValue;
    }

    public replaceUtf8(attribute: IAttributeModel): void {
        const subbed = this.replaceSubstitutables(attribute.value);
        attribute.value = this.replaceNonSubstitutables(subbed);
    }

    private replaceUnicodeG(sub: ISubstitution): string {
        console.debug('Found match for substitution: ' + sub.code + ' > ' + sub.sub);
        return sub.sub;
    }

    private replaceNonSubstitutables(value: string): string {
        return value.replace(/[\u0100-\ue007]/g, '?');
    }
}
