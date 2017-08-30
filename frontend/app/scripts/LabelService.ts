interface ILabelService {

    getLabel: (code: string) => string;
}

const LABELS = {
    "noContractText": "This resource is not covered by an agreement with the RIPE NCC. <a href='https://www.ripe.net/manage-ips-and-asns/legacy-resources/ripe-ncc-services-to-legacy-internet-resource-holders#i-am-a-legacy-internet-resource-holder-and-i-want-to-' target='_blank'>Find out more</a>",
    "otherSponsorText": "Sponsored by another LIR"
};

class LabelService implements ILabelService {

    public getLabel(key: string): string {
        const translated = LABELS[key];
        if (translated) {
            return translated;
        }
        throw new TypeError("No such label key");
    }
}


angular
    .module("dbWebApp")
    .service("LabelService", LabelService);
