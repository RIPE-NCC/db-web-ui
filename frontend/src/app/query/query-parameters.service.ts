import { Injectable } from '@angular/core';
import * as _ from 'lodash';
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
const hierarchyFlagMap = {
    L: 'all-less',
    M: 'all-more',
    l: 'one-less',
    m: 'one-more',
    x: 'exact',
};

@Injectable()
export class QueryParametersService {
    public inverseLookupIsFirstChoice: boolean;

    constructor(private metaService: WhoisMetaService, private queryFlagsService: QueryFlagsService) {}

    public isInverseLookupFirstChoice(queryParams: IQueryParameters) {
        if (QueryParametersService.inverseAsList(queryParams).length > 0 && QueryParametersService.typesAsList(queryParams).length === 0) {
            this.inverseLookupIsFirstChoice = true;
        } else if (QueryParametersService.inverseAsList(queryParams).length === 0) {
            this.inverseLookupIsFirstChoice = false;
        }
    }

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

    public static typesAsList(queryParams: IQueryParameters): string[] {
        return QueryParametersService.convertMapOfBoolsToList(queryParams.types);
    }

    public static inverseAsList(queryParams: IQueryParameters): string[] {
        return QueryParametersService.convertMapOfBoolsToList(queryParams.inverse);
    }

    public static isQueriedTemplate(queryText: string): boolean {
        const terms: string[] = queryText.split(/ +/);
        return terms.some((term: string) => _.includes(allowedTemplateQueries, term));
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
                _.includes(templateQueries, term) ? countTemplateQueries++ : countVerboseQueries++;
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
                (_.includes(templateQueries, validTemplateTypes[0].templateType) && countTemplateQueries > 1) ||
                (_.includes(verboseQueries, validTemplateTypes[0].templateType) && countVerboseQueries > 1)
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

        let invOptionPos = -1;
        let typeOptionPos = -1;
        let sourcesPos = -1;
        let supportedFlag = false;
        let addedHierarchyWarning = false; // Only shown once
        const isSupportedFlag = (flag: string) => {
            this.queryFlagsService.getFlags([flag]).subscribe((queryFlags) => {
                supportedFlag = queryFlags.length > 0;
            });
        };
        const terms: string[] = queryParams.queryText
            .split(/ +/)
            .map((item: string) => item.trim())
            .filter((item: string) => item.length)
            .map((item: string, idx: number): string => {
                if (item.indexOf('--') === 0) {
                    isSupportedFlag(item);
                    // parse long option
                    const short = HierarchyFlagsService.longHierarchyFlagToShort(item.substr(2));
                    if (short) {
                        if (!queryParams.hierarchy) {
                            queryParams.hierarchy = short;
                        } else if (queryParams.hierarchy !== short) {
                            if (!addedHierarchyWarning) {
                                addedHierarchyWarning = true;
                                errors.push(`ERROR:901: duplicate IP flags passed. More than one IP flag (-l, -L, -m, -M or -x) passed to the server.`);
                            }
                        }
                    } else if (item === '--resource' || item === '--all-sources') {
                        queryParams.source = 'GRS';
                    } else if (item === '--sources') {
                        sourcesPos = idx + 1;
                    } else if (item === '--no-referenced') {
                        queryParams.doNotRetrieveRelatedObjects = true;
                    } else if (item === '--reverse-domain') {
                        queryParams.reverseDomain = true;
                    } else if (item === '--no-filtering') {
                        queryParams.showFullObjectDetails = true;
                    } else if (item === '--inverse') {
                        invOptionPos = idx + 1;
                    } else if (item === '--select-types') {
                        if (typeOptionPos > -1) {
                            errors.push('Error parsing object type');
                        }
                        typeOptionPos = idx + 1;
                    } else if (item === '--no-grouping') {
                        queryParams.noGrouping = true;
                    } else if (!supportedFlag) {
                        errors.push(`ERROR:111: unsupported flag ${item}.`);
                    } else {
                        if (!queryParams.otherFlags) {
                            queryParams.otherFlags = [];
                        }
                        queryParams.otherFlags.push(item.substring(2));
                    }
                } else if (item.indexOf('-') === 0 && item.length > 1) {
                    const opts = item.substring(1);
                    for (let i = 0; i < opts.length; i++) {
                        isSupportedFlag(`-${opts[i]}`);
                        // parse short options
                        if (hierarchyFlagMap[opts[i]]) {
                            if (!queryParams.hierarchy) {
                                queryParams.hierarchy = opts[i];
                            } else if (queryParams.hierarchy !== opts[i]) {
                                if (!addedHierarchyWarning) {
                                    addedHierarchyWarning = true;
                                    errors.push(`ERROR:901: duplicate IP flags passed. More than one IP flag (-l, -L, -m, -M or -x) passed to the server.`);
                                }
                            }
                        } else if (opts[i] === 'r') {
                            queryParams.doNotRetrieveRelatedObjects = true;
                        } else if (opts[i] === 'd') {
                            queryParams.reverseDomain = true;
                        } else if (opts[i] === 'B') {
                            queryParams.showFullObjectDetails = true;
                        } else if (opts[i] === 'i') {
                            invOptionPos = idx + 1;
                        } else if (opts[i] === 'T') {
                            // -Tmntner, case without space
                            if (i + 1 < opts.length) {
                                this.setType(opts.substring(1), queryParams);
                                break;
                            } else {
                                typeOptionPos = idx + 1;
                            }
                        } else if (opts[i] === 's') {
                            sourcesPos = idx + 1;
                        } else if (opts[i] === 'a') {
                            queryParams.source = 'GRS';
                        } else if (opts[i] === 'G') {
                            queryParams.noGrouping = true;
                        } else if (!supportedFlag) {
                            errors.push(`ERROR:111: unsupported flag -${opts[i]}.`);
                        }
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
        const types = item
            .split(/[;|,]/)
            .map((term) => term.trim())
            .filter((term) => term.length);
        types.forEach((type) => {
            const mapKey = type.toUpperCase().replace(/-/g, '_');
            queryParams.types[mapKey] = true;
        });
    }
}
