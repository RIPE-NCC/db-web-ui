'use strict';

describe('webUpdates: CreateSelfMaintainedMaintainerController', function () {

    var $scope, $state, $stateParams, $httpBackend, WhoisResources, MessageStore, AlertService;
    var SOURCE = 'TEST';

    var RestService = {
        createObject: function(){
            return {
                then:function(s) {
                    s(CREATE_RESPONSE);
                }
            }
        },
        fetchUiSelectResources: function(){
            return {
                then:function(s) {
                    s();
                }
            }
        }
    };

    var userInfo = {
        'username':'test@ripe.net',
        'displayName':'Test User',
        'expiryDate':'[2015,7,7,14,58,3,244]',
        'uuid':'aaaa-bbbb-cccc-dddd',
        'active':'true'
    };

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _WhoisResources_, _MessageStore_, _AlertService_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            AlertService = _AlertService_;
            MessageStore = _MessageStore_;
            $httpBackend = _$httpBackend_;
            WhoisResources = _WhoisResources_;
            $state = _$state_;
            $stateParams = _$stateParams_;
            $stateParams.source = SOURCE;

            var UserInfoService = {
                getUserInfo: function() {
                    return userInfo;
                }
            };

            _$controller_('CreateSelfMaintainedMaintainerController', {
                $scope: $scope, $stateParams: $stateParams, UserInfoService: UserInfoService, RestService: RestService, MessageStore: MessageStore
            });

            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.flush();

        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should load the maintainer attributes', function () {

        //I want this to look ugly.
        var attributes = WhoisResources.wrapAttributes(
            WhoisResources.enrichAttributesWithMetaInfo('mntner',
                WhoisResources.getMandatoryAttributesOnObjectType('mntner')
            )
        );

        expect($scope.maintainerAttributes).toEqual(attributes);
    });

    it('should add admin-c to the maintainer attributes', function () {
        $scope.onAdminCAdded({key: 'some-admin-c'});

        $scope.maintainerAttributes = $scope.maintainerAttributes.removeNullAttributes();
        $scope.maintainerAttributes = WhoisResources.wrapAttributes($scope.maintainerAttributes);

        expect($scope.maintainerAttributes.getSingleAttributeOnName('admin-c').value).toEqual('some-admin-c');
    });

    it('should remove admin-c from the maintainer attributes', function () {

        $scope.maintainerAttributes.getSingleAttributeOnName('admin-c').value = 'first-admin';
        $scope.maintainerAttributes = $scope.maintainerAttributes.addAttributeAfterType({name: 'admin-c', value: 'some-admin-c'}, {name: 'admin-c'});

        $scope.onAdminCRemoved({key: 'first-admin'});
        $scope.maintainerAttributes = WhoisResources.wrapAttributes($scope.maintainerAttributes);

        expect($scope.maintainerAttributes.getSingleAttributeOnName('admin-c').value).toEqual('some-admin-c');
    });

    it('should set default upd-to info for the self maintained maintainer when submitting', function () {
        fillForm();

        var updTo = WhoisResources.wrapAttributes($scope.maintainerAttributes).getSingleAttributeOnName('upd-to');

        $scope.submit();
        $httpBackend.flush();

        expect(updTo.value).toEqual('test@ripe.net');
    });

    it('should set default auth info for the self maintained maintainer when submitting', function () {
        fillForm();

        var updTo = WhoisResources.wrapAttributes($scope.maintainerAttributes).getSingleAttributeOnName('auth');

        $scope.submit();
        $httpBackend.flush();

        expect(updTo.value).toEqual('SSO test@ripe.net');
    });

    it('should set mntner value to mnt-by for the self maintained maintainer when submitting', function () {
        fillForm();

        WhoisResources.wrapAttributes($scope.maintainerAttributes).setSingleAttributeOnName('mntner', 'SOME-MNT');
        var mntBy = WhoisResources.wrapAttributes($scope.maintainerAttributes).getSingleAttributeOnName('mnt-by');

        $scope.submit();
        $httpBackend.flush();

        expect(mntBy.value).toEqual('SOME-MNT');
    });

    it('should set source from the params when submitting', function () {
        fillForm();

        var updTo = WhoisResources.wrapAttributes($scope.maintainerAttributes).getSingleAttributeOnName('source');

        $scope.submit();
        $httpBackend.flush();

        expect(updTo.value).toEqual(SOURCE);
    });

    it('should create the maintainer', function () {
        fillForm();

        spyOn(RestService, 'createObject').and.callThrough();

        $scope.submit();

        $httpBackend.flush();

        var obj = WhoisResources.turnAttrsIntoWhoisObject($scope.maintainerAttributes);
        expect(RestService.createObject).toHaveBeenCalledWith(SOURCE, 'mntner', obj);
    });

    it('should remove null attributes before create the maintainer', function () {
        fillForm();

        $scope.maintainerAttributes = $scope.maintainerAttributes.addAttributeAfterType({name: 'admin-c'}, {name: 'admin-c'});
        $scope.maintainerAttributes = WhoisResources.enrichAttributesWithMetaInfo('mntner', $scope.maintainerAttributes);
        $scope.maintainerAttributes = WhoisResources.wrapAttributes($scope.maintainerAttributes);

        spyOn(RestService, 'createObject').and.callThrough();

        $scope.submit();

        $httpBackend.flush();

        var expectedAttributes = WhoisResources.wrapAttributes($scope.maintainerAttributes);
        expectedAttributes = expectedAttributes.removeNullAttributes();
        var obj = WhoisResources.turnAttrsIntoWhoisObject(expectedAttributes);
        expect(RestService.createObject).toHaveBeenCalledWith(SOURCE, 'mntner', obj);
    });

    it('should redirect to display page after creating a maintainer', function () {
        fillForm();

        spyOn(MessageStore, 'add');
        spyOn($state, 'transitionTo');

        $scope.submit();

        var whoisResources = WhoisResources.wrapWhoisResources(CREATE_RESPONSE);
        expect(MessageStore.add).toHaveBeenCalledWith('test-mnt', whoisResources);
        expect($state.transitionTo).toHaveBeenCalledWith('display', { source: SOURCE, objectType: 'mntner', name: 'test-mnt'});
    });

    it('should not post if invalid attributes', function () {

        $scope.maintainerAttributes = WhoisResources.wrapAttributes(
            WhoisResources.enrichAttributesWithMetaInfo('mntner',
                WhoisResources.getMandatoryAttributesOnObjectType('mntner')
            )
        );
        $scope.submit();

        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should display error if create the maintainer fails', function () {
        fillForm();
        spyOn(RestService, 'createObject').and.returnValue(
            {
                then: function(s, f) {
                    f(ERROR_RESPONSE);
            }
         });

        spyOn(AlertService, 'populateFieldSpecificErrors');
        spyOn(AlertService, 'showWhoisResourceErrors');
        $scope.submit();

        expect(AlertService.populateFieldSpecificErrors).toHaveBeenCalledWith('mntner', $scope.maintainerAttributes, ERROR_RESPONSE.data);
        expect(AlertService.showWhoisResourceErrors).toHaveBeenCalledWith('mntner', ERROR_RESPONSE.data);
    });

    function fillForm() {
        var wrapAttributes = WhoisResources.wrapAttributes($scope.maintainerAttributes);
        wrapAttributes.setSingleAttributeOnName('mntner', 'SOME-MNT');
        wrapAttributes.setSingleAttributeOnName('descr', 'uhuuuuuu');
        wrapAttributes.setSingleAttributeOnName('admin-c', 'SOME-ADM');
    }

});



var CREATE_RESPONSE = {
    'link' : {
    'type' : 'locator',
        'href' : 'http://rest-prepdev.db.ripe.net/ripe/mntner'
    },
    'objects' : {
    'object' : [ {
        'type' : 'mntner',
        'link' : {
            'type' : 'locator',
            'href' : 'http://rest-prepdev.db.ripe.net/ripe/mntner/jsdhgkjsd-mnt'
        },
        'source' : {
            'id' : 'ripe'
        },
        'primary-key' : {
            'attribute' : [ {
                'name' : 'mntner',
                'value' : 'test-mnt'
            } ]
        },
        'attributes' : {
            'attribute' : [ {
                'name' : 'mntner',
                'value' : 'jsdhgkjsd-mnt'
            }, {
                'name' : 'descr',
                'value' : 'jjjj'
            }, {
                'link' : {
                    'type' : 'locator',
                    'href' : 'http://rest-prepdev.db.ripe.net/ripe/person/DW-RIPE'
                },
                'name' : 'admin-c',
                'value' : 'DW-RIPE',
                'referenced-type' : 'person'
            }, {
                'name' : 'upd-to',
                'value' : 'tdacruzper@ripe.net'
            }, {
                'name' : 'auth',
                'value' : 'SSO tdacruzper@ripe.net'
            }, {
                'link' : {
                    'type' : 'locator',
                    'href' : 'http://rest-prepdev.db.ripe.net/ripe/mntner/jsdhgkjsd-mnt'
                },
                'name' : 'mnt-by',
                'value' : 'jsdhgkjsd-mnt',
                'referenced-type' : 'mntner'
            }, {
                'name' : 'created',
                'value' : '2015-08-12T11:56:29Z'
            }, {
                'name' : 'last-modified',
                'value' : '2015-08-12T11:56:29Z'
            }, {
                'name' : 'source',
                'value' : 'RIPE'
            } ]
        }
    } ]
},
 'terms-and-conditions' : {
    'type' : 'locator',
        'href' : 'http://www.ripe.net/db/support/db-terms-conditions.pdf'
    }
};

var ERROR_RESPONSE = {
    data: {
        'link': {
            'type': 'locator',
            'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner'
        },
        'objects': {
            'object': [{
                'type': 'mntner',
                'link': {
                    'type': 'locator',
                    'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/sdfsdf'
                },
                'source': {
                    'id': 'ripe'
                },
                'primary-key': {
                    'attribute': [{
                        'name': 'mntner',
                        'value': 'sdfsdf'
                    }]
                },
                'attributes': {
                    'attribute': [{
                        'name': 'mntner',
                        'value': 'sdfsdf'
                    }, {
                        'name': 'descr',
                        'value': 'sdfsdf'
                    }, {
                        'name': 'admin-c',
                        'value': 'sdfds-ripe'
                    }, {
                        'name': 'upd-to',
                        'value': 'tdacruzper@ripe.net'
                    }, {
                        'name': 'auth',
                        'value': 'SSO tdacruzper@ripe.net'
                    }, {
                        'link': {
                            'type': 'locator',
                            'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/sdfsdf'
                        },
                        'name': 'mnt-by',
                        'value': 'sdfsdf',
                        'referenced-type': 'mntner'
                    }, {
                        'name': 'source',
                        'value': 'RIPE'
                    }]
                }
            }]
        },
        'errormessages': {
            'errormessage': [{
                'severity': 'Error',
                'attribute': {
                    'name': 'admin-c',
                    'value': 'sdfds-ripe'
                },
                'text': 'Syntax error in %s',
                'args': [{
                    'value': 'sdfds-ripe'
                }]
            }]
        },
        'terms-and-conditions': {
            'type': 'locator',
            'href': 'http://www.ripe.net/db/support/db-terms-conditions.pdf'
        }
    }
};
