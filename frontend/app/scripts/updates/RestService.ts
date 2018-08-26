class RestService {

    public static $inject = ["$resource", "$q", "$http", "$templateCache", "$log", "$state", "WhoisResources"];
    public timeoutA: any;
    public timeoutAA: any;

    constructor(private $resource: any,
                private $q: ng.IQService,
                private $http: ng.IHttpService,
                private $templateCache: any,
                private $log: ng.ILogService,
                private $state: ng.ui.IStateService,
                private WhoisResources: any) {}

    public fetchParentResource(objectType: string, qs: string) {
        // e.g. https://rest.db.ripe.net/search?flags=lr&type-filter=inetnum&query-string=193.0.4.0%20-%20193.0.4.255
        if (["inetnum", "inet6num", "aut-num"].indexOf(objectType) < 0) {
            this.$log.error("Only aut-num, inetnum and inet6num supported");
            return;
        }
        return this.$resource("api/whois/search", {
            "flags": "lr",
            "ignore404": true,
            "query-string": qs,
            "type-filter": objectType,
        });
    }

    public fetchResource(objectType: string, qs: string) {
        if (["inetnum", "inet6num", "aut-num"].indexOf(objectType) < 0) {
            this.$log.error("Only aut-num, inetnum and inet6num supported");
            return;
        }
        return this.$resource("api/whois/search", {
            "flags": "r",
            "ignore404": true,
            "query-string": qs,
            "type-filter": objectType,
        });
    }

    public fetchUiSelectResources() {
        return this.$q.all([
            // workaround to cope with order of loading problem
            this.$http.get("selectize/match-multiple.tpl.html", {cache: this.$templateCache}),
            this.$http.get("selectize/select-multiple.tpl.html", {cache: this.$templateCache}),
        ]);
    }

    public getReferences(source: string, objectType: string, name: string, limit: any) {
        const deferredObject = this.$q.defer();

        this.$resource("api/references/:source/:objectType/:name", {
            limit,
            name: encodeURIComponent(name), // NOTE: we perform double encoding of forward slash (%2F ->%252F) to make spring MVC happy
            objectType,
            source: source.toUpperCase(),
        }).get().$promise.then((result: any) => {
            this.$log.debug("getReferences success:" + angular.toJson(result));
            deferredObject.resolve(result);
        }, (error: any) => {
            this.$log.debug("getReferences error:" + angular.toJson(error));
            deferredObject.reject(error);
        });
        return deferredObject.promise;
    }

    public fetchMntnersForSSOAccount() {
        const deferredObject = this.$q.defer();

        this.$resource("api/user/mntners")
            .query().$promise.then((result: any) => {
            this.$log.debug("fetchMntnersForSSOAccount success:" + angular.toJson(result));
            deferredObject.resolve(result);
        }, (error: any) => {
            this.$log.error("fetchMntnersForSSOAccount error:" + angular.toJson(error));
            deferredObject.reject(error);
        });
        return deferredObject.promise;
    }

    public detailsForMntners(mntners: any) {
        const promises = _.map(mntners, (item: any) => {
            return this._singleMntnerDetails(item);
        });
        return this.$q.all(promises);
    }

    public autocomplete(attrName: string, query: any, extended: any, attrsToBeReturned: any) {
        const deferredObject = this.$q.defer();

        const debounce = () => {
            if (_.isUndefined(query) || query.length < 2) {
                deferredObject.resolve([]);
            } else {
                this.$resource("api/whois/autocomplete", {
                    attribute: attrsToBeReturned,
                    extended,
                    field: attrName,
                    query,
                }).query().$promise.then((result: any) => {
                    this.$log.debug("autocomplete success:" + angular.toJson(result));
                    deferredObject.resolve(result);
                }, (error: any) => {
                    this.$log.error("autocomplete error:" + angular.toJson(error));
                    deferredObject.reject(error);
                });
            }
        };

        if (this.timeoutA) {
            clearTimeout(this.timeoutA);
        }
        this.timeoutA = setTimeout(debounce, 600);
        return deferredObject.promise;
    }

    public autocompleteAdvanced(query: any, targetObjectTypes: any) {
        const deferredObject = this.$q.defer();
        const debounce = () => {
            if (_.isUndefined(query) || query.length < 2) {
                deferredObject.resolve([]);
            } else {
                const attrsToFilterOn = this.WhoisResources.getFilterableAttrsForObjectTypes(targetObjectTypes);
                const attrsToReturn = this.WhoisResources.getViewableAttrsForObjectTypes(targetObjectTypes); // ["person", "role", "org-name", "abuse-mailbox"];

                this.$resource("api/whois/autocomplete", {
                    from: targetObjectTypes,
                    like: query,
                    select: attrsToReturn,
                    where: attrsToFilterOn,
                }).query().$promise.then((result: any) => {
                    this.$log.debug("autocompleteAdvanced success:" + angular.toJson(result));
                    deferredObject.resolve(result);
                }, (error: any) => {
                    this.$log.error("autocompleteAdvanced error:" + angular.toJson(error));
                    deferredObject.reject(error);
                });
            }
        };

        if (this.timeoutAA) {
            clearTimeout(this.timeoutAA);
        }
        this.timeoutAA = setTimeout(debounce, 600);
        return deferredObject.promise;
    }

    public authenticate(method: any, source: string, objectType: string, objectName: string, passwords: string) {
        const deferredObject = this.$q.defer();
        if (!source) {
            throw new TypeError("restService.authenticate source must have a value");
        }
        this.$resource("api/whois/:source/:objectType/:objectName", {
            objectName: decodeURIComponent(objectName), // prevent double encoding of forward slash (%2f ->%252F)
            objectType,
            password: "@password",
            source: source.toUpperCase(),
            unfiltered: true,
        }).get({
            password: passwords,
        }).$promise.then((result: any) => {
            this.$log.debug("authenticate success:" + angular.toJson(result));
            deferredObject.resolve(this.WhoisResources.wrapSuccess(result));
        }, (error: any) => {
            this.$log.error("authenticate error:" + angular.toJson(error));
            deferredObject.reject(this.WhoisResources.wrapError(error));
        });

        return deferredObject.promise;
    }

    public fetchObject(source: string, objectType: string, objectName: string, passwords?: string, unformatted?: any) {
        const deferredObject = this.$q.defer();

        this.$resource("api/whois/:source/:objectType/:name", {
            name: decodeURIComponent(objectName), // prevent double encoding of forward slash (%2f ->%252F)
            objectType,
            password: "@password",
            source: source.toUpperCase(),
            unfiltered: true,
            unformatted,
        }).get({
            password: passwords,
        }).$promise.then((result: any) => {
            this.$log.debug("fetchObject success:" + angular.toJson(result));
            const primaryKey = this.WhoisResources.wrapSuccess(result).getPrimaryKey();
            if (_.isEqual(objectName, primaryKey)) {
                deferredObject.resolve(this.WhoisResources.wrapSuccess(result));
            } else {
                this.$state.transitionTo("webupdates.modify", {
                    name: primaryKey,
                    objectType,
                    source,
                });
            }
        }, (error: any) => {
            this.$log.error("fetchObject error:" + angular.toJson(error));
            deferredObject.reject(this.WhoisResources.wrapError(error));
        });

        return deferredObject.promise;
    }

    public createObject(source: string, objectType: string, attributes: any, passwords: string, overrides?: any, unformatted?: any) {
        const deferredObject = this.$q.defer();

        this.$resource("api/whois/:source/:objectType", {
            objectType,
            override: "@override",
            password: "@password",
            source: source.toUpperCase(),
            unformatted: "@unformatted",
        }).save({
            override: overrides,
            password: passwords,
            unformatted,
        }, attributes).$promise.then((result: any) => {
            this.$log.debug("createObject success:" + angular.toJson(result));
            deferredObject.resolve(this.WhoisResources.wrapSuccess(result));
        }, (error: any) => {
            if (!error) {
                throw new TypeError("Unknown error createObject");
            } else {
                this.$log.error("createObject error:" + angular.toJson(error));
                deferredObject.reject(this.WhoisResources.wrapError(error));
            }
        });

        return deferredObject.promise;
    }

    public modifyObject(source: string, objectType: string, objectName: any, attributes: any, passwords: string[], overrides?: any, unformatted?: any) {
        const deferredObject = this.$q.defer();

        /*
         * A url-parameter starting with an "@" has special meaning in angular.
         * Since passwords can start with a "@", we need to take special precautions.
         * The following "@password"-trick  seems to work.
         * TODO This needs more testing.
         */
        this.$resource("api/whois/:source/:objectType/:name", {
            name: decodeURIComponent(objectName), // prevent double encoding of forward slash (%2f ->%252F)
            objectType,
            override: "@override",
            password: "@password",
            source: source.toUpperCase(),
            unformatted: "@unformatted",
        }, {
            update: {method: "PUT"},
        }).update({
            override: overrides,
            password: passwords,
            unformatted,
        }, attributes).$promise.then((result: any) => {
            this.$log.debug("modifyObject success:" + angular.toJson(result));
            deferredObject.resolve(this.WhoisResources.wrapSuccess(result));
        }, (error: any) => {
            this.$log.error("modifyObject error:" + angular.toJson(error));
            deferredObject.reject(this.WhoisResources.wrapError(error));
        });

        return deferredObject.promise;
    }

    public associateSSOMntner(source: string, objectType: string, objectName: string, whoisResources: any, passwords: string) {
        const deferredObject = this.$q.defer();

        const req = {
            data: whoisResources,
            headers: {
                "Content-Type": "application/json",
            },
            method: "PUT",
            url: ["api/whois/", source, "/", objectType, "/", objectName, "?password=", encodeURIComponent(passwords)].join(""),
        };

        this.$http(req).then((result: any) => {
            this.$log.debug("associateSSOMntner success:" + angular.toJson(result));
            deferredObject.resolve(this.WhoisResources.wrapSuccess(result));
        }, (error: any) => {
            this.$log.error("associateSSOMntner error:" + angular.toJson(error));
            deferredObject.reject(this.WhoisResources.wrapError(error));
        });

        return deferredObject.promise;
    }

    public deleteObject(source: string, objectType: string, name: string, reason: string, withReferences: any, passwords: string, dryRun: any) {
        const deferredObject = this.$q.defer();

        const service = withReferences ? "references" : "whois";

        this.$resource("api/" + service + "/:source/:objectType/:name", {
            "dry-run": !!dryRun,
            name, // Note: double encoding not needed for delete
            objectType,
            "password": "@password",
            source,
        }).delete({
            password: passwords,
            reason,
        }).$promise.then((result: any) => {
            this.$log.debug("deleteObject success:" + angular.toJson(result));
            deferredObject.resolve(this.WhoisResources.wrapSuccess(result));
        }, (error: any) => {
            this.$log.error("deleteObject error:" + angular.toJson(error));
            deferredObject.reject(this.WhoisResources.wrapError(error));
        });

        return deferredObject.promise;
    }

    public createPersonMntner(source: string, multipleWhoisObjects: any) {
        const deferredObject = this.$q.defer();

        this.$resource("api/references/:source", {
            source: source.toUpperCase(),
        }).save(multipleWhoisObjects).$promise
            .then((result: any) => {
                this.$log.debug("createPersonMntner success:" + angular.toJson(result));
                deferredObject.resolve(result);
            }, (error: any) => {
                this.$log.error("createPersonMntner error:" + angular.toJson(error));
                deferredObject.reject(this.WhoisResources.wrapError(error));
            });

        return deferredObject.promise;
    }

    private _singleMntnerDetails(mntner: IMntByModel) {
        const deferredObject = this.$q.defer();

        this.$resource("api/whois/autocomplete", {
            attribute: "auth",
            extended: true,
            field: "mntner",
            query: mntner.key,
        }).query().$promise.then((result: any) => {
            let found = _.find(result, (item: IMntByModel) => {
                return item.key === mntner.key;
            });
            if (_.isUndefined(found)) {
                // TODO: the  autocomplete service just returns 10 matching records. The exact match might not be part of this set.
                // So if this happens, perform best guess and just enrich the existing mntner with md5.
                mntner.auth = ["MD5-PW"];
                found = mntner;
            } else {
                found.mine = mntner.mine;
            }

            this.$log.debug("_singleMntnerDetails success:" + angular.toJson(found));
            deferredObject.resolve(found);
        }, (error: any) => {
            this.$log.error("_singleMntnerDetails error:" + angular.toJson(error));
            deferredObject.reject(error);
        });

        return deferredObject.promise;
    }

}

angular.module("updates").service("RestService", RestService);
