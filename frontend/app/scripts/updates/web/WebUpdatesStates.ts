class WebUpdatesStatesProvider {
    public static $inject = ["$stateProvider", "$urlRouterProvider", "$urlMatcherFactoryProvider"];

    constructor(private $stateProvider: any,
                private $urlRouterProvider: any,
                private $urlMatcherFactory: any) {

        /*
         * A dedicated data-type "WhoisObjectName" is created for passing whois-object-names within urls.
         * This is to prevent that display and modify controller were started twice for objects with slash (route, inet6num).
         * This object-type is used within the configuration of the state-provider.
         */
        $urlMatcherFactory.type("WhoisObjectName", {
            decode: (val: string) => {
                return decodeURIComponent(val);
            },
            encode: (val: string) => {
                if (val.indexOf("%") === -1) {
                    return encodeURIComponent(val);
                }
                return val;
            },
            equals: (decodedA: string, decodedB: string) => {
                if (decodedA.indexOf(":") > -1 || decodedA.indexOf("/") > -1 || decodedA.indexOf(" ") > -1) {
                    decodedA = encodeURIComponent(decodedA);
                }
                if (decodedB.indexOf(":") > -1 || decodedB.indexOf("/") > -1 || decodedB.indexOf(" ") > -1) {
                    decodedB = encodeURIComponent(decodedB);
                }
                return decodedA === decodedB;
            },
            is: () => {
                return true;
            },
            name: "WhoisObjectName",
        });

        $urlRouterProvider.otherwise("webupdates/select");

        $stateProvider
            .state("webupdates", {
                abstract: true,
                template: "<div ui-view></div>",
                url: "/webupdates",
            })
            .state("myresources", {
                template: "<resources></resources>",
                url: "/myresources/overview?type&sponsored&ipanalyserRedirect",
            })
            .state("myresourcesdetail", {
                template: "<resource-details></resource-details>",
                url: "/myresources/detail/:objectType/{objectName:WhoisObjectName}/:sponsored",
            })
            .state("webupdates.domainobjectwizard", {
                template: "<domain-object-wizard></domain-object-wizard>",
                url: "/wizard/:source/:objectType",
            })
            .state("webupdates.displayDomainObjects", {
                template: "<display-domain-objects></display-domain-objects>",
                url: "/wizard/:source/:objectType/success",
            })
            .state("webupdates.select", {
                template: "<select-component></select-component>",
                url: "/select",
            })
            .state("webupdates.createPersonMntnerPair", {
                template: "<create-person-mntner-pair></create-person-mntner-pair>",
                url: "/create/person/self",
            })
            .state("webupdates.displayPersonMntnerPair", {
                template: "<display-person-mntner-pair-component></display-person-mntner-pair-component>",
                url: "/display/:source/person/:person/mntner/:mntner",
            })
            .state("webupdates.createSelfMnt", {
                template: "<create-self-maintained-maintainer-component></create-self-maintained-maintainer-component>",
                url: "/create/:source/mntner/self?admin",
            })
            .state("webupdates.create", {
                template: "<create-modify></create-modify>",
                url: "/create/:source/:objectType?noRedirect",
            })
            .state("webupdates.modify", {
                template: "<create-modify></create-modify>",
                url: "/modify/:source/:objectType/{name:WhoisObjectName}?noRedirect",
            })
            .state("webupdates.display", {
                template: "<display-component></display-component>",
                url: "/display/:source/:objectType/{name:WhoisObjectName}?method",
            })
            .state("webupdates.delete", {
                template: "<delete-component></delete-component>",
                url: "/delete/:source/:objectType/{name:WhoisObjectName}?onCancel",
            })
            .state("webupdates.forceDeleteSelect", {
                template: "<force-delete-select></force-delete-select>",
                url: "/forceDeleteSelect",
            })
            .state("webupdates.forceDelete", {
                template: "<force-delete></force-delete>",
                url: "/forceDelete/:source/:objectType/{name:WhoisObjectName}",
            })
            .state("lookup", {
                template: "<lookup-single></lookup-single>",
                url: "/lookup?source&key&type",
            })
            .state("query", {
                template: "<query></query>",
                url: "/query?searchtext&hierarchyFlag&inverse&types&bflag&dflag&rflag&source",
            })
            .state("syncupdates", {
                template: "<syncupdates></syncupdates>",
                url: "/syncupdates",
            })
            .state("fulltextsearch", {
                template: "<full-text-search></full-text-search>",
                url: "/fulltextsearch",
            });
    }
}

angular.module("webUpdates")
    .config(WebUpdatesStatesProvider);
