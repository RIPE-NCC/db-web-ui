import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ISearchResponseModel } from './types.model';

@Injectable({ providedIn: 'root' })
export class FullTextSearchService {
    private http = inject(HttpClient);

    public doSearch(
        query: string,
        start: number,
        advanced: boolean,
        advancedMode: string,
        searchObjects: string[],
        searchAttributes: string[],
    ): Observable<ISearchResponseModel> {
        const q = advanced
            ? FullTextSearchService.createQuery(query, advancedMode, searchObjects, searchAttributes)
            : FullTextSearchService.createQuery(query, 'all', [], []);

        const params = new HttpParams().set('facet', 'true').set('format', 'xml').set('hl', 'true').set('q', q).set('start', String(start)).set('wt', 'json');
        return this.http.get<ISearchResponseModel>('api/rest/fulltextsearch/select', { params });
    }

    private static createQuery(query: string, mode: string, searchObjects: string[], searchAttributes: string[]): string {
        const mainQuery = `(${this.buildMainQuery(query, mode)})`;

        if (!searchObjects.length) {
            return mainQuery;
        }

        const termQuery = searchAttributes.length ? this.orGroup(searchAttributes.map((attr) => `${attr}:${mainQuery}`)) : mainQuery;

        const objectFilter = this.orGroup(searchObjects.map((type) => `object-type:${type}`));

        return `${termQuery} AND ${objectFilter}`;
    }

    /** Split the term into individual terms depending on the mode*/
    private static buildMainQuery(query: string, mode: string): string {
        const words = query
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map((word) => this.sanitizeString(word));

        const escapedWords = words.map((word) => `"${word}"`); //Avoid <img> situations

        switch (mode) {
            case 'all':
                return escapedWords.join(' AND ');
            case 'any':
                return escapedWords.join(' OR ');
            case 'exact':
                return `"${words.join(' ')}"`;
        }
    }

    /** Sanitiser so users input can't break the query. */
    private static sanitizeString(text: string): string {
        return text.replace(/[\\+\-!():^[\]"{}~*?|&\/]/g, '\\$&');
    }

    private static orGroup(parts: string[]): string {
        return `(${parts.join(' OR ')})`;
    }
}
