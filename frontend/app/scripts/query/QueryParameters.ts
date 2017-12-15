const hierarchyFlagMap = {
    L: "all-less",
    M: "all-more",
    l: "one-less",
    m: "one-more",
    x: "exact",
};

class QueryParameters {

    public static convertMapOfBoolsToList(boolMap: { [key: string]: boolean }): string[] {
        return Object.keys(boolMap)
            .filter((key) => boolMap[key])
            .map((obj) => {
                return obj.replace(/_/g, "-").toLocaleLowerCase();
            });
    }

    public static shortHierarchyFlagToLong(f: string) {
        return hierarchyFlagMap[f] || "";
    }

    public static longHierarchyFlagToShort(f: string) {
        for (const shortFlag of Object.keys(hierarchyFlagMap)) {
            if (hierarchyFlagMap[shortFlag] === f) {
                return shortFlag;
            }
        }
        return "";
    }

    public queryText = "";
    public types: { [objectName: string]: boolean } = {};
    public inverse: { [attrName: string]: boolean } = {};
    public hierarchy = "";
    public reverseDomain = false;
    public doNotRetrieveRelatedObjects = false;
    public showFullObjectDetails = false;
    public source = "";

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

        const terms: string[] = this.queryText
            .split(/ +/)
            .map((item: string) => item.trim())
            .filter((item: string, idx: number) => item.length)
            .map((item: string, idx: number): string => {
                if (item.indexOf("--") === 0) {
                    // parse long option
                    const short = QueryParameters.longHierarchyFlagToShort(item.substr(2));
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
                        if (this.source === "GRS") {
                            warnings.push("Option: --resource is not supported in the web forms and will be ignored.");
                        }
                        // this.source = "GRS";
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
        return {
            errors,
            warnings,
        };
    }

    public asLocationSearchParams() {
        return {
            bflag: this.showFullObjectDetails,
            dflag: this.reverseDomain || undefined,
            hierarchyFlag: QueryParameters.shortHierarchyFlagToLong(this.hierarchy) || undefined,
            inverse: QueryParameters.convertMapOfBoolsToList(this.inverse).join(";") || undefined,
            rflag: this.doNotRetrieveRelatedObjects || undefined,
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

}
