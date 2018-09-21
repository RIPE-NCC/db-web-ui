interface IApiKey {
    provider: string;
    consumers: string[];
    value: string;
}
interface IApiKeyMap {
    [key: string]: IApiKey;
}

class AutoKeyLogicService {

    public static $inject = ["$log"];

    public autoKeyMap: IApiKeyMap = {};

    constructor(private $log: angular.ILogService) {}

    public log(msg: string) {
        this.$log.info(msg + ":" + JSON.stringify(this.autoKeyMap));
    }

    public identifyAutoKeys(objectType: string, attrs: IAttributeModel[]) {
        _.each(attrs, (attr: IAttributeModel) => {
            const trimmedValue: string = _.trim(attr.value);
            if (_.startsWith(trimmedValue, "AUTO-")) {
                const key = objectType + "." + _.trim(attr.name);
                const autoMeta = this.autoKeyMap[trimmedValue];
                if (_.isUndefined(autoMeta)) {
                    this.autoKeyMap[trimmedValue] = {provider: key, consumers: [], value: undefined};
                    this.$log.debug("Identified new auto-key provider " + trimmedValue + "->" + JSON.stringify(this.autoKeyMap[trimmedValue]));
                } else {
                    autoMeta.consumers.push(key);
                    this.$log.debug("Identified existing auto-key consumer " + trimmedValue + "->" + JSON.stringify(autoMeta));
                }
            }
        });
    }

    public get() {
        return this.autoKeyMap;
    }

    public clear() {
        this.autoKeyMap = {};
    }

    public registerAutoKeyValue(autoAttr: IAttributeModel, afterCreateAttrs: IAttributeModel[]) {
        const trimmedValue = _.trim(autoAttr.value);

        _.each(afterCreateAttrs, (after) => {
            if (autoAttr.name === after.name) {
                const autoMeta = this.autoKeyMap[trimmedValue];
                if (!_.isUndefined(autoMeta)) {
                    autoMeta.value = after.value;
                    this.$log.debug("Register " + autoAttr.name + " with auto-key " + autoAttr.value + " to " + autoMeta.value);
                } else {
                    this.$log.debug("Auto key " + autoAttr.value + " not found in " + JSON.stringify(this.autoKeyMap));
                }
            }
        });
    }

    public substituteAutoKeys(attrs: IAttributeModel[]): IAttributeModel[] {
        _.each(attrs, (attr: IAttributeModel) => {
            const trimmedValue = _.trim(attr.value);
            if (_.startsWith(trimmedValue, "AUTO-")) {
                const autoMeta = this.autoKeyMap[trimmedValue];
                if (!_.isUndefined(autoMeta) && !_.isUndefined(autoMeta.value)) {
                    this.$log.debug("Substituting " + trimmedValue + " with " + autoMeta.value);
                    attr.value = autoMeta.value;
                }
            }
        });
        return attrs;
    }

    public getAutoKeys(attributes: IAttributeModel[]): IAttributeModel[] {
        const attrs = _.filter(attributes, (attr: IAttributeModel) => {
            return _.startsWith(_.trim(attr.value), "AUTO-");
        });
        return attrs;
    }
}

angular.module("textUpdates")
    .service("AutoKeyLogicService", AutoKeyLogicService);
