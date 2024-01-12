import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ISearchResponseModel } from './types.model';

@Injectable()
export class FullTextSearchService {
    private static sanitizeString(str: string): string {
        return str.replace(/([+&|!(){}[\]^"~*?:-])/g, '\\$1');
    }

    constructor(private http: HttpClient) {}

    public doSearch(
        query: string,
        start: number,
        advanced: boolean,
        advancedMode: string,
        searchObjects: string[],
        searchAttributes: string[],
    ): Observable<ISearchResponseModel> {
        if (typeof query === 'string') {
            const params: HttpParams = new HttpParams()
                .set('facet', String(true))
                .set('format', 'xml')
                .set('hl', String(true))
                .set('q', advanced ? this.createQuery(query, advancedMode, searchObjects, searchAttributes) : this.createQuery(query, 'all', [], []))
                .set('start', String(start))
                .set('wt', 'json');
            return this.http.get<ISearchResponseModel>('api/rest/fulltextsearch/select', { params });
        }
    }

    private createQuery(query: string, advancedMode: string, searchObjects: string[], searchAttributes: string[]): string {
        query = FullTextSearchService.sanitizeString(query);
        // Main query input control
        const qmain: string[] = [];
        const splits: string[] = query.split(' ');
        const escapedSplits: string[] = FullTextSearchService.wrapInQuotationMarks(splits);
        if (splits.length > 1) {
            switch (advancedMode) {
                case 'all':
                    qmain.push(escapedSplits.join(' AND '));
                    break;
                case 'any':
                    qmain.push(escapedSplits.join(' OR '));
                    break;
                case 'exact':
                    qmain.unshift('"');
                    qmain.push(splits.join(' '));
                    qmain.push('"');
                    break;
                default:
                    break;
            }
        } else {
            qmain.push(escapedSplits.join(' '));
        }
        qmain.unshift('(');
        qmain.push(')');

        const qadv: string[] = [];
        // Now the advanced controls
        if (searchObjects.length) {
            qadv.push(' AND (');
            for (let i = 0; i < searchObjects.length; i++) {
                if (i > 0) {
                    qadv.push(' OR ');
                }
                qadv.push('object-type:');
                qadv.push(searchObjects[i]);
            }
            qadv.push(')');
            if (searchAttributes.length) {
                const qattr: string[] = [];
                qattr.push('(');
                for (let j = 0; j < searchAttributes.length; j++) {
                    if (j > 0) {
                        qattr.push(' OR ');
                    }
                    qattr.push(searchAttributes[j]);
                    qattr.push(':');
                    qattr.push(qmain.join(''));
                }
                qattr.push(')');
                return qattr.join('') + qadv.join('');
            }
        }
        return qmain.join('') + qadv.join('');
    }

    private static wrapInQuotationMarks(query: string[]): string[] {
        return query.map((word) => `"${word}"`);
    }
}
