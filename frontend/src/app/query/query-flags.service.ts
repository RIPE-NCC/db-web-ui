import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import _ from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ObjectTypesEnum } from './object-types.enum';

export interface IQueryFlag {
    longFlag: string;
    shortFlag: string;
    description: string;
}

@Injectable({ providedIn: 'root' })
export class QueryFlagsService {
    private http = inject(HttpClient);

    public FLAGS: IQueryFlag[];
    public detectedQueryFlags: IQueryFlag[];

    loadFlags(): Observable<void> {
        return this.helpWhois().pipe(
            map((help) => {
                this.FLAGS = help;
            }),
        );
    }

    getFlagsFromTerm(inputTerm: string): string[] {
        const sanitizedString: string = this.addSpaceBehindFlagT(inputTerm);
        const allTerms = sanitizedString.split(' ');
        return allTerms.filter((term) => term.startsWith('-') && term.length > 1);
    }

    getFlags(flags: string[]): IQueryFlag[] {
        this.detectedQueryFlags = [];
        return this.findFlags(flags);
    }

    // exception -Tmntner or -rTmntner, case without space
    addSpaceBehindFlagT(inputTerm: string) {
        const regex = /(-\w*T)(\S+)/g; // Regex to capture any flag containing T followed by the whole word
        let match: RegExpExecArray | null;

        while ((match = regex.exec(inputTerm)) !== null) {
            const TIndex = match.index; // -T index
            const flag = match[1];
            const terms = match[2].split(','); // should cover mntner,person use case

            //Guarantee that the -T is used as a flag
            if (terms.some(QueryFlagsService.isObjectTypeSearchTerm)) {
                inputTerm = this.addSpaceAfterFlag(inputTerm, flag, TIndex);
            }
        }
        return inputTerm;
    }

    private static isObjectTypeSearchTerm(inputTerm: string): boolean {
        return Object.values(ObjectTypesEnum).includes(inputTerm as ObjectTypesEnum);
    }

    private addSpaceAfterFlag(input: string, flag: string, TIndex: number): string {
        return input.slice(0, TIndex + flag.length) + ' ' + input.slice(TIndex + flag.length);
    }

    private helpWhois(): Observable<IQueryFlag[]> {
        return this.http.get<IQueryFlag[]>(`api/metadata/help`);
    }

    private findFlags(flags: string[]): IQueryFlag[] {
        for (let flag of flags) {
            const queryFlag = this.findFlag(flag);
            if (!!queryFlag) {
                this.detectedQueryFlags.push(queryFlag);
            } else if (flag.length > 2 && flag.indexOf('--') !== 0) {
                // grouped flags "-i" = 2
                const groupedFlags: string[] = flag.split('');
                groupedFlags.shift();
                this.findFlags(groupedFlags.map((item) => `-${item}`));
            }
        }
        return _.uniqBy(this.detectedQueryFlags, 'description'); // remove duplicate flags
    }

    private findFlag(flag: string): IQueryFlag {
        return this.FLAGS.find((f) => f.longFlag === flag || f.shortFlag === flag);
    }
}
