'use strict';

/*
 import IHttpPromise = angular.IHttpPromise;

 const CONTEXT_PATH: string = "/db-web-ui";

 class OrgDropDownDataServiceImpl implements OrgDropDownDataService {

 static $inject = ['$log', '$http', '$q'];

 loadOrgs(callback: (x: Organisation[]) => void): void {
 let ls: IHttpPromise<{data: any}> = this.$http.get(CONTEXT_PATH + "/api/ba-apps/lirs");
 let os: IHttpPromise<{data: any}> = this.$http.get(CONTEXT_PATH + "/api/ba-apps/organisations");

 let combined: IHttpPromise<{data: any}[]> = this.$q.all([ls, os]);
 combined.then((o) => {
 let lirs: Lir[] = o[0].data.response.results;
 let lirOrgs: Organisation[] = lirs.map((lir) => {
 return {id: lir.orgId, name: lir.organisationName + " " + lir.regId} as Organisation;
 });
 let orgs: Organisation[] = lirOrgs.concat(o[1].data);
 callback(orgs);
 }).catch((e) => {
 console.error("Couldn't load organisations", e);
 });
 }

 constructor(private $log: angular.ILogService,
 private $http: ng.IHttpService,
 private $q: ng.IQService) {
 }
 }

 angular.module("dbWebApp").service("OrgDropDownDataService", OrgDropDownDataServiceImpl);

 */

describe('OrgDropDownDataService', function () {

    beforeEach(module('dbWebApp'));

    var $httpBackend;
    var service;

    beforeEach(inject(function (_OrgDropDownDataService_, _$httpBackend_) {
        $httpBackend = _$httpBackend_;
        service = _OrgDropDownDataService_;
    }));

    it('Populate IPv4 Resources', function () {
        $httpBackend.expectGET('/db-web-ui/api/ba-apps/lirs').respond(function () {
            return [200, {
                response: {
                    status: 200,
                    message: "OK",
                    pageNumber: 1,
                    pageSize: 1,
                    pageCount: 1,
                    startIndex: 1,
                    totalSize: 1,
                    links: [],
                    results: [
                        {
                            membershipId: 3629,
                            regId: "nl.surfnet",
                            organisationName: "SURFnet bv",
                            serviceLevel: "NORMAL",
                            orgId: "ORG-Sb3-RIPE",
                            billingPhase: 0
                        },
                        {
                            membershipId: 7347,
                            regId: "zz.example",
                            organisationName: "Internet Provider BV",
                            serviceLevel: "NORMAL",
                            orgId: "ORG-EIP1-RIPE",
                            billingPhase: 0
                        }
                    ]
                }
            }, {}];
        });

        service.loadOrgs(function (response) {
            // TODO: test response
        });
    });
});
