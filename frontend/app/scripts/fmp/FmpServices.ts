angular.module("fmp")
    .factory("EmailLink", ($resource: any) => $resource("api/whois-internal/api/fmp-pub/emaillink/:hash.json", {hash: "@hash"}, {
        update: {method: "PUT"},
    }));
