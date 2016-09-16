/*global angular, exports*/

exports.module = function (mockGet) {
    'use strict';
    angular.module('dbWebAppE2E', ['dbWebApp', 'ngMockE2E'])
        .run(function ($httpBackend, $log) {

            // prepare the mocks
            Object.keys(mockGet).forEach(
                function (key) {
                    $httpBackend.whenGET(key).respond(
                        mockGet[key].status || 200,
                        mockGet[key].data,
                        {'Content-type': 'application/json'}
                    );
                });
            $httpBackend.whenGET(/^api\//).respond(function (method, req) {
                $log.error('Error caused by missing mock', method, req);
                return [404, 'Missing mock'];
            });
            $httpBackend.whenGET(/.*/).passThrough();

        });
};
