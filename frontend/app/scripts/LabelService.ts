interface ILabelService {
    getLabel: (code: string) => string;
}

class LabelService implements ILabelService {

    public static $inject = [
        "Labels"
    ];

    constructor(private Labels: { [key: string]: string }) {
    }

    public getLabel(key: string): string {
        const translated = this.Labels[key];
        if (translated) {
            return translated;
        }
        throw new TypeError("No such label key: " + key);
    }
}

angular
    .module("dbWebApp")
    .service("LabelService", LabelService);
