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

    public queryText: string;
    public types: { [objectName: string]: boolean };
    public inverse: { [attrName: string]: boolean };
    public hierarchy: string;
    public reverseDomain: boolean;
    public doNotRetrieveRelatedObjects: boolean;
    public showFullObjectDetails: boolean;
    public source: string;

    public asLocationSearchParams() {
        return {
            bflag: this.showFullObjectDetails || undefined,
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
