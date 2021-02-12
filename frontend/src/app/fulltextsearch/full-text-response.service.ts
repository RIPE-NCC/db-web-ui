import {Injectable} from "@angular/core";
import * as _ from "lodash";
import {ILstObj, IResultSummary, ISearchResponseModel} from "./types.model";
import {IVersion} from "../shared/whois-response-type.model";

@Injectable()
export class FullTextResponseService {

    public parseResponse(data: ISearchResponseModel) {
        const results = [];
        const hlMap = {};
        if (data.lsts.length < 2 || data.lsts[1].lst.name !== "highlighting") {
            console.error("Results have no highlighting information");
            return {details: [], summary: []};
        }

        if (!_.isUndefined(data.lsts[1].lst.lsts)) {
            for (const doc of data.lsts[1].lst.lsts) {
                if (!_.isUndefined(doc.lst.arrs)) {
                    hlMap[doc.lst.name] = doc.lst.arrs
                        .filter((arr) => arr.name !== "object-type")
                        .map((arr) => {
                            return {name: arr.arr.name, value: arr.arr.str.value};
                        });
                }
            }
        }
        if (!_.isUndefined(data.result.docs)) {
            for (const doc of data.result.docs) {
                const pk = this.getDocPk(doc.doc.strs);
                const attrMap = this.strsToAttributeMap(doc.doc.strs);
                const name = attrMap["object-type"];
                const value = attrMap[name];
                const lookupKey = attrMap["lookup-key"];
                // now find the highlighted results to show
                results.push({
                    hls: hlMap[pk],
                    lookupKey,
                    name,
                    value,
                });
            }
        }
        const resultSummaries: IResultSummary[] = [];
        // check we've got some facets for the summaries
        if (data.lsts.length > 2 &&
            data.lsts[2].lst.name === "facet_counts" &&
            data.lsts[2].lst.lsts[0].lst.name === "facet_fields" &&
            data.lsts[2].lst.lsts[0].lst.lsts &&
            data.lsts[2].lst.lsts[0].lst.lsts.length > 0) {
            const aggResultData = data.lsts[2].lst.lsts[0].lst.lsts[0].lst.ints;
            for (const doc of aggResultData) {
                resultSummaries.push({name: doc.int.name, value: parseInt(doc.int.value, 10)} as IResultSummary);
            }
        }
        return {details: results, summary: resultSummaries};
    }

    public getVersionFromResponse(response: ISearchResponseModel): IVersion {
        let version: IVersion;
        response.lsts.forEach((lst: ILstObj) => {
            if (lst.lst.name === "version") {
                version = {version: undefined, timestamp: undefined};
                lst.lst.strs.forEach(str => {
                    if (str.str.name === "version") {
                        version.version = str.str.value;
                    }
                    if (str.str.name === "timestamp") {
                        version.timestamp = str.str.value;
                    }
                });
            }
        });
        return version;
    }

    private getDocPk(strs: Array<{ str: { name: string; value: string } }>) {
        const pkAttr = strs.filter((str) => {
            return str.str.name === "primary-key";
        });
        return pkAttr[0].str.value;
    }

    private strsToAttributeMap(strs: any[]) {
        const attrMap = {};
        for (const str of strs) {
            attrMap[str.str.name] = str.str.value;
        }
        return attrMap;
    }
}
