import { Injectable } from '@angular/core';
import includes from 'lodash/includes';
import { WhoisMetaService } from '../shared/whois-meta.service';
import { HierarchyFlagsService } from './hierarchy-flags.service';
import { QueryFlagsService } from './query-flags.service';
import { IQueryState } from './query.component';

export interface ITemplateTerm {
    templateType: string; // any from allowedTemplateQueries
    objectType: string;
}

export interface IQueryParameters {
    queryText: string;
    queriedTemplateObject?: ITemplateTerm;
    types: { [objectName: string]: boolean };
    inverse: { [attrName: string]: boolean };
    hierarchy: string;
    reverseDomain: boolean;
    doNotRetrieveRelatedObjects: boolean;
    showFullObjectDetails: boolean;
    // TODO Replace source with Set type asap IE allow it
    source: string;
    noGrouping?: boolean;
    otherFlags?: string[];
}

const templateQueries = ['-t', '--template'];
const verboseQueries = ['-v', '--verbose'];
const allowedTemplateQueries = templateQueries.concat(verboseQueries);

@Injectable()
export class QueryParametersService {
    constructor(private metaService: WhoisMetaService, private queryFlagsService: QueryFlagsService) {}

    public validate(queryParams: IQueryParameters): { errors: string[]; warnings: string[] } {
        if (!queryParams.queryText.trim()) {
            return;
        }

        if (QueryParametersService.isQueriedTemplate(queryParams.queryText)) {
            return this.validateQueriedTemplate(queryParams);
        } else {
            return this.validateQuery(queryParams);
        }
    }

    public asLocationSearchParams(queryParams: IQueryParameters): IQueryState {
        return {
            bflag: queryParams.showFullObjectDetails.toString(),
            dflag: queryParams.reverseDomain.toString() || undefined,
            hierarchyFlag: HierarchyFlagsService.shortHierarchyFlagToLong(queryParams.hierarchy) || undefined,
            inverse: QueryParametersService.convertMapOfBoolsToList(queryParams.inverse).join(';') || undefined,
            rflag: queryParams.doNotRetrieveRelatedObjects.toString() || undefined,
            searchtext: (queryParams.queryText && queryParams.queryText.trim()) || '',
            source: queryParams.source,
            types: QueryParametersService.convertMapOfBoolsToList(queryParams.types).join(';') || undefined,
        };
    }

    public static convertMapOfBoolsToList(boolMap: { [key: string]: boolean }): string[] {
        return Object.keys(boolMap)
            .filter((key) => boolMap[key])
            .map((obj) => {
                return obj.replace(/_/g, '-').toLocaleLowerCase();
            });
    }

    public static inverseAsList(queryParams: IQueryParameters): string[] {
        return QueryParametersService.convertMapOfBoolsToList(queryParams.inverse);
    }

    public static isQueriedTemplate(queryText: string): boolean {
        const terms: string[] = queryText.split(/ +/);
        return terms.some((term: string) => includes(allowedTemplateQueries, term));
    }

    private validateQueriedTemplate(queryParams: IQueryParameters): { errors: string[]; warnings: string[] } {
        const warnings: string[] = [];
        const errors: string[] = [];
        const terms: string[] = queryParams.queryText.split(/ +/);
        const templateTerms: ITemplateTerm[] = [];
        let countTemplateQueries: number = 0;
        let countVerboseQueries: number = 0;
        terms.forEach((term: string, index: number) => {
            if (allowedTemplateQueries.indexOf(term) > -1) {
                includes(templateQueries, term) ? countTemplateQueries++ : countVerboseQueries++;
                templateTerms.push({ templateType: terms[index], objectType: terms[index + 1] });
            }
        });
        const validTemplateTypes = templateTerms.filter((objectType: ITemplateTerm) => this.metaService.isExistingObjectTypes(objectType.objectType));
        queryParams.queryText = '';
        if (templateTerms.length === 1 && !templateTerms[0].objectType) {
            errors.push('Invalid option supplied.');
        } else if (validTemplateTypes.length === 0) {
            errors.push(`Unknown object type "${templateTerms[0].objectType}".`);
        } else {
            if (
                (includes(templateQueries, validTemplateTypes[0].templateType) && countTemplateQueries > 1) ||
                (includes(verboseQueries, validTemplateTypes[0].templateType) && countVerboseQueries > 1)
            ) {
                warnings.push(`The flag "${validTemplateTypes[0].templateType}" cannot be used multiple times.`);
            }
            queryParams.queriedTemplateObject = validTemplateTypes[0];
            queryParams.queryText = validTemplateTypes[0].templateType + ' ' + validTemplateTypes[0].objectType;
        }
        return { errors, warnings };
    }

    private validateQuery(queryParams: IQueryParameters): { errors: string[]; warnings: string[] } {
        const warnings: string[] = [];
        const errors: string[] = [];

        let invOptionPos: number = -1;
        let typeOptionPos: number = -1;
        let sourcesPos: number = -1;
        let hierarchyFlagsInQueryCount: number = 0; // Count hierarchyFlags in query text

        const parseFlag = (flag: string, flagWithoutDash: string, idx: number) => {
            this.queryFlagsService.getFlags([flag]).subscribe((queryFlags) => {
                // if not supported flag
                if (queryFlags.length <= 0) {
                    errors.push(`ERROR:111: unsupported flag ${flag}.`);
                    return;
                }
                switch (flagWithoutDash) {
                    case 'l':
                    case 'L':
                    case 'm':
                    case 'M':
                    case 'x': {
                        queryParams.hierarchy = flagWithoutDash;
                        hierarchyFlagsInQueryCount++;
                        break;
                    }
                    case 'one-less':
                    case 'all-less':
                    case 'one-more':
                    case 'all-more':
                    case 'exact': {
                        queryParams.hierarchy = HierarchyFlagsService.longHierarchyFlagToShort(flagWithoutDash);
                        hierarchyFlagsInQueryCount++;
                        break;
                    }
                    case 'resource':
                    case 'a':
                    case 'all-sources': {
                        queryParams.source = 'GRS';
                        break;
                    }
                    case 's':
                    case 'sources': {
                        sourcesPos = idx + 1;
                        break;
                    }
                    case 'r':
                    case 'no-referenced': {
                        queryParams.doNotRetrieveRelatedObjects = true;
                        break;
                    }
                    case 'd':
                    case 'reverse-domain': {
                        queryParams.reverseDomain = true;
                        break;
                    }
                    case 'B':
                    case 'no-filtering': {
                        queryParams.showFullObjectDetails = true;
                        break;
                    }
                    case 'i':
                    case 'inverse': {
                        invOptionPos = idx + 1;
                        break;
                    }
                    case 'T':
                    case 'select-types': {
                        if (typeOptionPos > -1) {
                            errors.push('Error parsing object type');
                        }
                        typeOptionPos = idx + 1;
                        break;
                    }
                    case 'G':
                    case 'no-grouping': {
                        queryParams.noGrouping = true;
                        break;
                    }
                    default: {
                        if (!queryParams.otherFlags) {
                            queryParams.otherFlags = [];
                        }
                        queryParams.otherFlags.push(flagWithoutDash);
                        break;
                    }
                }
            });
        };

        const sanitizedString = this.queryFlagsService.addSpaceBehindFlagT(queryParams.queryText);
        const terms: string[] = sanitizedString
            .split(/ +/)
            .map((item: string) => item.trim())
            .filter((item: string) => item.length)
            .map((item: string, idx: number): string => {
                if (item.startsWith('--')) {
                    const flagWithoutDash = item.substring(2);
                    parseFlag(item, flagWithoutDash, idx);
                } else if (item.startsWith('-') && item.length > 1) {
                    const flagsWithoutDash = item.substring(1);
                    for (let i = 0; i < flagsWithoutDash.length; i++) {
                        parseFlag(`-${flagsWithoutDash[i]}`, flagsWithoutDash[i], idx);
                    }
                } else {
                    // either it's an source, an inverse or a type or the search term
                    if (idx === invOptionPos) {
                        // inverse option spec
                        const invs = item
                            .split(';')
                            .map((term) => term.trim())
                            .filter((term) => term.length);
                        invs.forEach((inv) => {
                            const mapKey = inv.toUpperCase().replace(/-/g, '_');
                            queryParams.inverse[mapKey] = true;
                        });
                        invOptionPos = -1;
                    } else if (idx === sourcesPos) {
                        queryParams.source = item;
                        sourcesPos = -1;
                    } else if (idx === typeOptionPos) {
                        this.setType(item, queryParams);
                        typeOptionPos = -1;
                    } else {
                        return item;
                    }
                }
                if (invOptionPos > -1) {
                    if (invOptionPos === typeOptionPos) {
                        // error: expecting inverse and types in the same position
                        errors.push('Parse error. Inverse and type flags cannot be used together');
                    } else if (idx > invOptionPos) {
                        errors.push('Option: --inverse requires an argument');
                    }
                }
                if (invOptionPos > -1 && idx > invOptionPos) {
                    errors.push('Option: --select-types requires an argument');
                }
                return '';
            });
        if (invOptionPos !== -1) {
            errors.push('Inverse flag specified without value');
        }
        if (typeOptionPos !== -1) {
            errors.push('Object type flag specified without value');
        }
        if (sourcesPos !== -1) {
            errors.push('Source specified without value');
        }
        if ((queryParams.queryText.indexOf('-s') > -1 || queryParams.queryText.indexOf('--sources') > -1) && queryParams.queryText.indexOf('--resource') > -1) {
            errors.push(`The flags "--resource" and "-s, --sources" cannot be used together.`);
        }
        if (hierarchyFlagsInQueryCount > 1) {
            errors.push(`ERROR:901: duplicate IP flags passed. More than one IP flag (-l, -L, -m, -M or -x) passed to the server.`);
        }
        queryParams.queryText = terms
            .filter((term) => term.length)
            .join(' ')
            .trim();
        if (!queryParams.queryText) {
            errors.push('No search term provided');
        }
        return { errors, warnings };
    }

    private setType(item: string, queryParams: IQueryParameters) {
        const types: string[] = item
            .split(/[;|,]/)
            .map((term) => term.trim())
            .filter((term) => term.length);
        types.forEach((type) => {
            const mapKey = type.toUpperCase().replace(/-/g, '_');
            queryParams.types[mapKey] = true;
        });
    }
}
