'use strict';

describe('webUpdates: ModalDeleteObjectController', function () {

    var $scope, $state, modalInstance, RestService, WhoisResources;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _WhoisResources_) {

            $state = _$state_;
            WhoisResources = _WhoisResources_;
            RestService =  {
                deleteObject: function() {
                    return { then: function(f) { f();} }; // pretend to be a promise
                },
                getReferences: function() {
                    return { then: function(f) { f({data:OBJECT_REFERENCES_RESPONSE});} }; // pretend to be a promise
                },
                getVersions: function () {
                    return { then: function(f) { f({data:OBJECT_VERSIONS_RESPONSE});} }; // pretend to be a promise
                }
            };

            spyOn(RestService, 'getVersions').and.callThrough();
            spyOn(RestService, 'getReferences').and.callThrough();

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            modalInstance = {
                close: jasmine.createSpy('modalInstance.close'),
                dismiss: jasmine.createSpy('modalInstance.dismiss')
            };

            $scope.objectType = 'MNT';
            $scope.name = 'TEST-MNT';
            $scope.source = 'RIPE';

            _$controller_('ModalDeleteObjectController', {
                $scope: $scope, $state:$state, $modalInstance: modalInstance, RestService:RestService, source:$scope.source, objectType:$scope.objectType, name:$scope.name
            });

        });
    });

    it('should query for object versions', function() {

        expect(RestService.getVersions).toHaveBeenCalledWith($scope.source, $scope.objectType, $scope.name);
    });

    it('should query for last object revision references', function() {

        var revision = _.last(OBJECT_VERSIONS_RESPONSE.versions).revision;
        expect(RestService.getReferences).toHaveBeenCalledWith($scope.source, $scope.objectType, $scope.name, revision);
    });

    it('should select references if any', function() {

        expect($scope.references).toEqual(OBJECT_REFERENCES_RESPONSE.object.incoming);
    });

    it('should call delete endpoint', function() {
        $scope.reason = 'some reason';

        spyOn(RestService, 'deleteObject').and.callThrough();

        $scope.delete();

        expect(RestService.deleteObject).toHaveBeenCalledWith($scope.source, $scope.objectType, $scope.name, $scope.reason);
    });

    it('should close modal after delete object', function() {
        spyOn(RestService, 'deleteObject').and.callThrough();

        $scope.delete();

        expect(modalInstance.close).toHaveBeenCalled();
    });

    it('should dismiss modal after error deleting object', function() {
        spyOn(RestService, 'deleteObject').and.returnValue({then: function(a, b) { b({data:'error'}); }});

        $scope.delete();

        expect(modalInstance.dismiss).toHaveBeenCalledWith('error');
    });

    it('should redirect to succes delete page after delete object', function() {
        spyOn($state, 'transitionTo');

        $scope.delete();

        expect($state.transitionTo).toHaveBeenCalledWith('deleted', {source:$scope.source, objectType:$scope.objectType, name:$scope.name});
    });

    it('should close the modal and return error when canceled', function () {
        $scope.cancel();
        expect(modalInstance.close).toHaveBeenCalled();
    });

});


var OBJECT_VERSIONS_RESPONSE = {'versions':[ {
    'type' : 'AUT-NUM',
    'pkey' : 'AS3333',
    'revision' : 1,
    'from' : '2002-08-13T14:58:13+02:00',
    'to' : '2003-01-20T14:08:30+01:00',
    'link' : {
        'type' : 'locator',
        'href' : 'https://int.db.ripe.net/rnd/ripe/AUT-NUM/AS3333/versions/1'
    }
}, {
    'type': 'AUT-NUM',
    'pkey': 'AS3333',
    'revision': 2,
    'from': '2003-01-20T14:08:30+01:00',
    'to': '2003-01-20T14:43:13+01:00',
    'link': {
        'type': 'locator',
        'href': 'https://int.db.ripe.net/rnd/ripe/AUT-NUM/AS3333/versions/2'
    }
}],
    'terms-and-conditions' : {
        'type' : 'locator',
        'href' : 'http://www.ripe.net/db/support/db-terms-conditions.pdf'
    }
};

var OBJECT_REFERENCES_RESPONSE = {"object" : {
    "attributes" : {
        "attribute" : [ {
            "name" : "aut-num",
            "value" : "AS3333"
            }, {
            "name" : "source",
            "value" : "RIPE",
            "comment" : "Filtered"
        }]
    }
},
    "version" : {
        "type" : "AUT-NUM",
        "pkey" : "AS3333",
        "revision" : 1,
        "from" : "2003-03-17T11:34:38+01:00",
        "to" : "2003-04-25T17:39:17+02:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/AUT-NUM/AS3333/versions/5"
        }
    },
    "incoming" : [ {
        "type" : "ROUTE",
        "pkey" : "192.16.202.0/24AS3333",
        "revision" : 1,
        "from" : "2002-06-06T17:01:52+02:00",
        "to" : "2003-12-01T16:17:24+01:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROUTE/192.16.202.0/24AS3333/versions/1"
        }
    }, {
        "type" : "ROUTE",
        "pkey" : "193.0.0.0/21AS3333",
        "revision" : 1,
        "from" : "2001-09-22T11:33:24+02:00",
        "to" : "2008-09-10T13:31:33+02:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROUTE/193.0.0.0/21AS3333/versions/1"
        }
    } ],
    "outgoing" : [ {
        "type" : "ROLE",
        "pkey" : "OPS4-RIPE",
        "revision" : 2,
        "from" : "2003-04-12T08:25:25+02:00",
        "to" : "2003-05-22T13:20:02+02:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROLE/OPS4-RIPE/versions/2"
        }
    }, {
        "type" : "ROLE",
        "pkey" : "OPS4-RIPE",
        "revision" : 1,
        "from" : "2002-09-16T12:35:19+02:00",
        "to" : "2003-04-12T08:25:25+02:00",
        "link" : {
            "type" : "locator",
            "href" : "https://int.db.ripe.net/rnd/ripe/ROLE/OPS4-RIPE/versions/1"
        }
    } ],
    "terms-and-conditions" : {
        "type" : "locator",
        "href" : "http://www.ripe.net/db/support/db-terms-conditions.pdf"
    }
};
