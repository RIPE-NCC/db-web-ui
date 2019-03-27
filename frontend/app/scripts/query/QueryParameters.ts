interface ITemplateTerm {
    templateType: string; // any from allowedTemplateQueries
    objectType: string;
}

const templateQueries = ["-t", "--template"];
const verboseQueries = ["-v", "--verbose"];
const allowedTemplateQueries = templateQueries.concat(verboseQueries);
const hierarchyFlagMap = {
    L: "all-less",
    M: "all-more",
    l: "one-less",
    m: "one-more",
    x: "exact",
};

class QueryParameters {

    public static $inject = ["WhoisMetaService"];

    public static convertMapOfBoolsToList(boolMap: { [key: string]: boolean }): string[] {
        return Object.keys(boolMap)
            .filter((key) => boolMap[key])
            .map((obj) => {
                return obj.replace(/_/g, "-").toLocaleLowerCase();
            });
    }

    public queryText = "";
    public queriedTemplateObject: ITemplateTerm; // Exits only when is queried template or verbose

    public types: { [objectName: string]: boolean } = {};
    public inverse: { [attrName: string]: boolean } = {};
    public hierarchy = "";
    public reverseDomain = false;
    public doNotRetrieveRelatedObjects = false;
    public showFullObjectDetails = false;
    public source = "";

    constructor(private metaService: WhoisMetaService) {
    }

    public shortHierarchyFlagToLong(f: string) {
        return hierarchyFlagMap[f] || "";
    }

    public longHierarchyFlagToShort(f: string) {
        for (const shortFlag of Object.keys(hierarchyFlagMap)) {
            if (hierarchyFlagMap[shortFlag] === f) {
                return shortFlag;
            }
        }
        return "";
    }

    public validate(): { errors: string[], warnings: string[] } {
        if (!this.queryText.trim()) {
            return;
        }
        const warnings: string[] = [];
        const errors: string[] = [];

        let invOptionPos = -1;
        let typeOptionPos = -1;
        let addedInvalidOptionWarning = false; // Only shown once
        let addedHierarchyWarning = false; // Only shown once
        if (this.isQueriedTemplate()) {
            const terms: string[] = this.queryText.split(/ +/);
            const templateTerms: ITemplateTerm[] = [];
            let countTemplateQueries: number = 0;
            let countVerboseQueries: number = 0;
            terms.map((term: string, index: number) => {
                if (allowedTemplateQueries.indexOf(term) > -1) {
                    _.include(templateQueries, term) ? countTemplateQueries++ : countVerboseQueries++;
                    templateTerms.push({templateType: terms[index], objectType: terms[index + 1]});
                }
            });
            const validTemplateTypes = templateTerms.filter((objectType: ITemplateTerm) => this.metaService.isExistingObjectTypes(objectType.objectType));
            this.queryText = "";
            if (templateTerms.length === 1 && !templateTerms[0].objectType) {
                errors.push("Invalid option supplied.");
            } else if (validTemplateTypes.length === 0) {
                errors.push(`Unknown object type "${templateTerms[0].objectType}".`);
            } else {
                if ((_.include(templateQueries, validTemplateTypes[0].templateType) && countTemplateQueries > 1)
                || (_.include(verboseQueries, validTemplateTypes[0].templateType) && countVerboseQueries > 1)) {
                    warnings.push(`The flag "${validTemplateTypes[0].templateType}" cannot be used multiple times.`);
                }
                this.queriedTemplateObject = validTemplateTypes[0];
                this.queryText = validTemplateTypes[0].templateType + " " + validTemplateTypes[0].objectType;
            }
        } else {
            const terms: string[] = this.queryText
                .split(/ +/)
                .map((item: string) => item.trim())
                .filter((item: string, idx: number) => item.length)
                .map((item: string, idx: number): string => {
                    if (item.indexOf("--") === 0) {
                        // parse long option
                        const short = this.longHierarchyFlagToShort(item.substr(2));
                        if (short) {
                            if (!this.hierarchy) {
                                this.hierarchy = short;
                            } else if (this.hierarchy !== short) {
                                if (!addedHierarchyWarning) {
                                    addedHierarchyWarning = true;
                                    errors.push("ERROR:901: duplicate IP flags passed<br><br>" +
                                        "More than one IP flag (-l, -L, -m, -M or -x) passed to the server.");
                                }
                            }
                        } else if (item === "--resource") {
                            this.source = "GRS";
                        } else if (item === "--no-referenced") {
                            this.doNotRetrieveRelatedObjects = true;
                        } else if (item === "--reverse-domain") {
                            this.reverseDomain = true;
                        } else if (item === "--no-filtering") {
                            this.showFullObjectDetails = true;
                        } else if (item === "--inverse") {
                            invOptionPos = idx + 1;
                        } else if (item === "--select-types") {
                            if (typeOptionPos > -1) {
                                errors.push("Error parsing object type");
                            }
                            typeOptionPos = idx + 1;
                        } else if (!addedInvalidOptionWarning) {
                            addedInvalidOptionWarning = true;
                            errors.push("Invalid option: " + item + "<br>" +
                                "ERROR:111: invalid option supplied<br>" +
                                "Use help query to see the valid options.");
                        }
                    } else if (item.indexOf("-") === 0 && item.length > 1) {
                        const opts = item.substring(1);
                        for (let i = opts.length - 1; i >= 0; i--) {
                            // parse short options
                            if (hierarchyFlagMap[opts[i]]) {
                                if (!this.hierarchy) {
                                    this.hierarchy = opts[i];
                                } else if (this.hierarchy !== opts[i]) {
                                    if (!addedHierarchyWarning) {
                                        addedHierarchyWarning = true;
                                        errors.push("ERROR:901: duplicate IP flags passed<br><br>" +
                                            "More than one IP flag (-l, -L, -m, -M or -x) passed to the server.");
                                    }
                                }
                            } else if (opts[i] === "r") {
                                this.doNotRetrieveRelatedObjects = true;
                            } else if (opts[i] === "d") {
                                this.reverseDomain = true;
                            } else if (opts[i] === "B") {
                                this.showFullObjectDetails = true;
                            } else if (opts[i] === "i") {
                                invOptionPos = idx + 1;
                            } else if (opts[i] === "T") {
                                typeOptionPos = idx + 1;
                            } else if (!addedInvalidOptionWarning) {
                                addedInvalidOptionWarning = true;
                                errors.push("ERROR:111: invalid option supplied<br>" +
                                    "Use help query to see the valid options.");
                            }
                        }
                    } else {
                        // either it's an inverse or a type or the search term
                        if (idx === invOptionPos) {
                            // inverse option spec
                            const invs = item.split(";")
                                .map((term) => term.trim())
                                .filter((term) => term.length);
                            invs.forEach((inv) => {
                                const mapKey = inv.toUpperCase().replace(/-/g, "_");
                                this.inverse[mapKey] = true;
                            });
                            invOptionPos = -1;
                        } else if (idx === typeOptionPos) {
                            const types = item.split(";")
                                .map((term) => term.trim())
                                .filter((term) => term.length);
                            types.forEach((type) => {
                                const mapKey = type.toUpperCase().replace(/-/g, "_");
                                this.types[mapKey] = true;
                            });
                            typeOptionPos = -1;
                        } else {
                            return item;
                        }
                    }
                    if (invOptionPos > -1) {
                        if (invOptionPos === typeOptionPos) {
                            // error: expecting inverse and types in the same position
                            errors.push("Parse error. Inverse and type flags cannot be used together");
                        } else if (idx > invOptionPos) {
                            errors.push("Option: --inverse requires an argument");
                        }
                    }
                    if (invOptionPos > -1 && idx > invOptionPos) {
                        errors.push("Option: --select-types requires an argument");
                    }
                    return "";
                });
            if (invOptionPos !== -1) {
                errors.push("Inverse flag specified without value");
            }
            if (typeOptionPos !== -1) {
                errors.push("Object type flag specified without value");
            }
            this.queryText = terms.filter((term) => term.length).join(" ").trim();
            if (!this.queryText) {
                errors.push("No search term provided");
            }
        }
        return {
            errors,
            warnings,
        };
    }

    public asLocationSearchParams(): IQueryState {
        return {
            bflag: this.showFullObjectDetails.toString(),
            dflag: this.reverseDomain.toString() || undefined,
            hierarchyFlag: this.shortHierarchyFlagToLong(this.hierarchy) || undefined,
            inverse: QueryParameters.convertMapOfBoolsToList(this.inverse).join(";") || undefined,
            rflag: this.doNotRetrieveRelatedObjects.toString() || undefined,
            searchtext: this.queryText && this.queryText.trim() || "",
            source: this.source,
            types: QueryParameters.convertMapOfBoolsToList(this.types).join(";") || undefined,
        };
    }

    public typesAsList(): string[] {
        return QueryParameters.convertMapOfBoolsToList(this.types);
    }

    public inverseAsList(): string[] {
        return QueryParameters.convertMapOfBoolsToList(this.inverse);
    }

    public isQueriedTemplate(): boolean {
        const terms: string[] = this.queryText.split(/ +/);
        return terms.some((term: string) => _.includes(allowedTemplateQueries, term));
    }

}

angular
    .module("dbWebApp")
    .service("QueryParameters", QueryParameters);
