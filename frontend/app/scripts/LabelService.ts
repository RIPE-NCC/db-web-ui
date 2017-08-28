interface ILabelService {

    getLabel: (code: string) => string;
}

const LABELS = {
    "noContractText": "This resource is not covered by an agreement with the <a href='http://www.ripe.net'>RIPE NCC</a>",
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
