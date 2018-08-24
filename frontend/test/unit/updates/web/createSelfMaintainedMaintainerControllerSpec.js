/*global afterEach, beforeEach, describe, expect, inject, it, module, spyOn*/
'use strict';

describe('webUpdates: CreateSelfMaintainedMaintainerController', function () {

    var $state, $stateParams, $httpBackend, $log, WhoisResources, MessageStore, AlertService, UserInfoService;
    var SOURCE = 'RIPE';
    var $ctrl;

    var RestService = {
        createObject: function () {
            return {
                then: function (s) {
                    s(WhoisResources.wrapSuccess(CREATE_RESPONSE));
                }
            };
        },
        fetchUiSelectResources: function () {
            return {
                then: function (s) {
                    s();
                }
            };
        }
    };

    var userInfoData = {
        user: {
            'username': 'tdacruzper@ripe.net',
            'displayName': 'Test User',
            'expiryDate': '[2015,7,7,14,58,3,244]',
            'uuid': 'aaaa-bbbb-cccc-dddd',
            'active': 'true'
        }
    };

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$componentController_, _$state_, _$stateParams_, _$httpBackend_, _WhoisResources_, _MessageStore_, _AlertService_, _UserInfoService_) {

            AlertService = _AlertService_;
            MessageStore = _MessageStore_;
            $httpBackend = _$httpBackend_;
            WhoisResources = _WhoisResources_;
            UserInfoService = _UserInfoService_;
            $state = _$state_;
            $stateParams = _$stateParams_;
            $stateParams.source = SOURCE;

            UserInfoService.clear();

            $log = {
                debug: function () {
                    //console.log('info:'+msg);
                },
                info: function () {
                    //console.log('info:'+msg);
                },
                error: function () {
                    //console.log('error:'+msg);
                }
            };

            $ctrl = _$componentController_('createSelfMaintainedMaintainerComponent', {
                $stateParams: $stateParams,
                $log: $log,
                UserInfoService: UserInfoService,
                RestService: RestService,
                MessageStore: MessageStore
            });

            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.expectGET('api/whois-internal/api/user/info').respond(function () {
                return [200, userInfoData, {}];
            });

            $httpBackend.flush();

        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });


    it('should load the maintainer attributes', function () {

        expect($ctrl.maintainerAttributes.getSingleAttributeOnName('upd-to').value).toEqual('tdacruzper@ripe.net');
        expect($ctrl.maintainerAttributes.getSingleAttributeOnName('auth').value).toEqual('SSO tdacruzper@ripe.net');
        expect($ctrl.maintainerAttributes.getSingleAttributeOnName('source').value).toEqual('RIPE');

    });

    it('should add admin-c to the maintainer attributes', function () {
        $ctrl.onAdminCAdded({key: 'some-admin-c'});

        $ctrl.maintainerAttributes = $ctrl.maintainerAttributes.removeNullAttributes();
        $ctrl.maintainerAttributes = $ctrl.WhoisResources.wrapAttributes($ctrl.maintainerAttributes);

        expect($ctrl.maintainerAttributes.getSingleAttributeOnName('admin-c').value).toEqual('some-admin-c');
    });

    it('should remove admin-c from the maintainer attributes', function () {

        $ctrl.maintainerAttributes.getSingleAttributeOnName('admin-c').value = 'first-admin';
        $ctrl.maintainerAttributes = $ctrl.maintainerAttributes.addAttributeAfterType({
            name: 'admin-c',
            value: 'some-admin-c'
        }, {name: 'admin-c'});

        $ctrl.onAdminCRemoved({key: 'first-admin'});
        $ctrl.maintainerAttributes = WhoisResources.wrapAttributes($ctrl.maintainerAttributes);

        expect($ctrl.maintainerAttributes.getSingleAttributeOnName('admin-c').value).toEqual('some-admin-c');
    });

    it('should set default upd-to info for the self maintained maintainer when submitting', function () {
        fillForm();

        var updTo = $ctrl.WhoisResources.wrapAttributes($ctrl.maintainerAttributes).getSingleAttributeOnName('upd-to');

        $ctrl.submit();
        // $httpBackend.flush();

        expect(updTo.value).toEqual('tdacruzper@ripe.net');
    });

    it('should set default auth info for the self maintained maintainer when submitting', function () {
        fillForm();

        var updTo = $ctrl.WhoisResources.wrapAttributes($ctrl.maintainerAttributes).getSingleAttributeOnName('auth');

        $ctrl.submit();
        // $httpBackend.flush();

        expect(updTo.value).toEqual('SSO tdacruzper@ripe.net');
    });

    it('should set mntner value to mnt-by for the self maintained maintainer when submitting', function () {
        fillForm();

        $ctrl.WhoisResources.wrapAttributes($ctrl.maintainerAttributes).setSingleAttributeOnName('mntner', 'SOME-MNT');
        var mntBy = $ctrl.WhoisResources.wrapAttributes($ctrl.maintainerAttributes).getSingleAttributeOnName('mnt-by');

        $ctrl.submit();
        // $httpBackend.flush();

        expect(mntBy.value).toEqual('SOME-MNT');
    });

    it('should set source from the params when submitting', function () {
        fillForm();

        var updTo = $ctrl.WhoisResources.wrapAttributes($ctrl.maintainerAttributes).getSingleAttributeOnName('source');

        $ctrl.submit();
        // $httpBackend.flush();

        expect(updTo.value).toEqual(SOURCE);
    });

    it('should create the maintainer', function () {
        fillForm();

        spyOn($ctrl.RestService, 'createObject').and.callThrough();

        $ctrl.submit();

        // $httpBackend.flush();

        // var obj = $ctrl.WhoisResources.turnAttrsIntoWhoisObject($ctrl.maintainerAttributes);
        // expect($ctrl.RestService.createObject).toHaveBeenCalledWith(SOURCE, 'mntner', obj);
    });

    it('should redirect to display page after creating a maintainer', function () {
        fillForm();

        spyOn(MessageStore, 'add');
        spyOn($state, 'transitionTo');

        $ctrl.submit();

        var whoisResources = $ctrl.WhoisResources.wrapWhoisResources(CREATE_RESPONSE);
        expect(MessageStore.add).toHaveBeenCalledWith('test-mnt', whoisResources);
        expect($state.transitionTo).toHaveBeenCalledWith('webupdates.display', {
            source: SOURCE,
            objectType: 'mntner',
            name: 'test-mnt'
        });
    });

    it('should not post if invalid attributes', function () {

        $ctrl.maintainerAttributes = $ctrl.WhoisResources.wrapAttributes(
            $ctrl.WhoisResources.enrichAttributesWithMetaInfo('mntner',
                $ctrl.WhoisResources.getMandatoryAttributesOnObjectType('mntner')
            )
        );
        $ctrl.submit();

        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should display error if create the maintainer fails', function () {
        fillForm();
        spyOn($ctrl.RestService, 'createObject').and.returnValue(
            {
                then: function (s, f) {
                    f(ERROR_RESPONSE);
                }
            });

        spyOn($ctrl.AlertService, 'populateFieldSpecificErrors');
        spyOn($ctrl.AlertService, 'showWhoisResourceErrors');
        $ctrl.submit();

        expect($ctrl.AlertService.populateFieldSpecificErrors).toHaveBeenCalledWith('mntner', $ctrl.maintainerAttributes, ERROR_RESPONSE.data);
        expect($ctrl.AlertService.showWhoisResourceErrors).toHaveBeenCalledWith('mntner', ERROR_RESPONSE.data);
    });

    function fillForm() {
        var wrapAttributes = $ctrl.WhoisResources.wrapAttributes($ctrl.maintainerAttributes);
        wrapAttributes.setSingleAttributeOnName('mntner', 'SOME-MNT');
        wrapAttributes.setSingleAttributeOnName('descr', 'uhuuuuuu');
        wrapAttributes.setSingleAttributeOnName('admin-c', 'SOME-ADM');
    }
});

var CREATE_RESPONSE = {
    'link': {
        'type': 'locator',
        'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner'
    },
    'objects': {
        'object': [{
            'type': 'mntner',
            'link': {
                'type': 'locator',
                'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/jsdhgkjsd-mnt'
            },
            'source': {
                'id': 'ripe'
            },
            'primary-key': {
                'attribute': [{
                    'name': 'mntner',
                    'value': 'test-mnt'
                }]
            },
            'attributes': {
                'attribute': [{
                    'name': 'mntner',
                    'value': 'jsdhgkjsd-mnt'
                }, {
                    'name': 'descr',
                    'value': 'jjjj'
                }, {
                    'link': {
                        'type': 'locator',
                        'href': 'http://rest-prepdev.db.ripe.net/ripe/person/DW-RIPE'
                    },
                    'name': 'admin-c',
                    'value': 'DW-RIPE',
                    'referenced-type': 'person'
                }, {
                    'name': 'upd-to',
                    'value': 'tdacruzper@ripe.net'
                }, {
                    'name': 'auth',
                    'value': 'SSO tdacruzper@ripe.net'
                }, {
                    'link': {
                        'type': 'locator',
                        'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/jsdhgkjsd-mnt'
                    },
                    'name': 'mnt-by',
                    'value': 'jsdhgkjsd-mnt',
                    'referenced-type': 'mntner'
                }, {
                    'name': 'created',
                    'value': '2015-08-12T11:56:29Z'
                }, {
                    'name': 'last-modified',
                    'value': '2015-08-12T11:56:29Z'
                }, {
                    'name': 'source',
                    'value': 'RIPE'
                }]
            }
        }]
    },
    'terms-and-conditions': {
        'type': 'locator',
        'href': 'http://www.ripe.net/db/support/db-terms-conditions.pdf'
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
