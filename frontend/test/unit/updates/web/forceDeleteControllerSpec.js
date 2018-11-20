/*global afterEach, beforeEach, describe, expect, inject, it, module, spyOn*/
'use strict';

var logger = {
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

describe('webUpdates: ForceDeleteController', function () {
    var $ctrl, $state, $stateParams, $httpBackend;
    var WhoisResources;
    var CredentialsService;
    var WebUpdatesCommonsService;

    var $componentController;

    var INETNUM = '111 - 255';
    var SOURCE = 'RIPE';

    var createForceDeleteController;

    var objectToDisplay;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$componentController_, _$state_, _$stateParams_, _$httpBackend_, _WhoisResources_, _CredentialsService_, _WebUpdatesCommonsService_) {

            $state = _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            $componentController = _$componentController_;
            WhoisResources = _WhoisResources_;
            CredentialsService = _CredentialsService_;
            WebUpdatesCommonsService = _WebUpdatesCommonsService_;



            objectToDisplay = WhoisResources.wrapWhoisResources(
                {
                    objects: {
                        object: [
                            {
                                'primary-key': {attribute: [{name: 'inetnum', value: INETNUM}]},
                                attributes: {
                                    attribute: [
                                        {name: 'inetnum', value: INETNUM},
                                        {name: 'mnt-by', value: 'TEST-MNT'},
                                        {name: 'descr', value: 'description'},
                                        {name: 'source', value: 'RIPE'}
                                    ]
                                }
                            }
                        ]
                    }

                });

            createForceDeleteController = function () {

                $httpBackend.expectGET('api/whois/RIPE/inetnum/111%20-%20255?unfiltered=true').respond(
                    function () {
                        return [200, objectToDisplay, {}];
                    });

                $httpBackend.whenGET('api/user/mntners').respond([
                    {key: 'TESTSSO-MNT', type: 'mntner', auth: ['SSO'], mine: true}
                ]);

                $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TESTSSO-MNT').respond(
                    function () {
                        return [200, [{key: 'TESTSSO-MNT', type: 'mntner', auth: ['MD5-PW', 'SSO']}], {}];
                    });

                $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT').respond(
                    function () {
                        return [200, [{key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
                    });

                $httpBackend.expectDELETE('api/whois/RIPE/inetnum/111%20-%20255?dry-run=true&reason=dry-run').respond(
                    function () {
                        return [200, {
                            errormessages: {
                                errormessage: [{
                                    severity: 'Error',
                                    text: 'Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s',
                                    args: [
                                        {value: 'inetnum'}, {value: '194.219.52.240 - 194.219.52.243'},
                                        {value: 'mnt-by'}, {value: 'TESTSSO-MNT'}
                                    ]
                                }, {
                                    severity: 'Error',
                                    text: 'Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s',
                                    args: [
                                        {value: 'inetnum'}, {value: '194.219.0.0 - 194.219.255.255'},
                                        {value: 'mnt-lower'}, {value: 'TEST1-MNT'}
                                    ]
                                }, {
                                    severity: 'Error',
                                    text: 'Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s',
                                    args: [{value: 'inetnum'}, {value: '194.219.0.0 - 194.219.255.255'},
                                        {value: 'mnt-by'}, {value: 'RIPE-NCC-HM-MNT, TEST2-MNT'}
                                    ]
                                }, {
                                    severity: 'Info',
                                    text: 'Dry-run performed, no changes to the database have been made'
                                }]
                            }
                        }, {}];
                    });

                CredentialsService.setCredentials('TEST-MNT', '@123');

                $stateParams.source = SOURCE;
                $stateParams.objectType = 'inetnum';
                $stateParams.name = '111%20-%20255';

                $ctrl = _$componentController_('forceDelete', {
                    $state: $state, $stateParams: $stateParams, $log: logger, WebUpdatesCommonsService: WebUpdatesCommonsService
                });

                $httpBackend.flush();
            };

        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should get objectType, source and name from url', function () {

        createForceDeleteController();

        expect($ctrl.object.type).toBe('inetnum');
        expect($ctrl.object.source).toBe(SOURCE);
        expect($ctrl.object.name).toBe(INETNUM);
    });

    it('should populate the ui with attributes', function () {
        createForceDeleteController();

        expect($ctrl.object.attributes.getSingleAttributeOnName('inetnum').value).toBe(INETNUM);
        expect($ctrl.object.attributes.getSingleAttributeOnName('descr').value).toEqual('description');
        expect($ctrl.object.attributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);
    });

    it('should transition to display state if cancel is pressed', function () {
        createForceDeleteController();
        spyOn($ctrl.$state, 'transitionTo');

        $ctrl.cancel();

        expect($ctrl.$state.transitionTo).toHaveBeenCalledWith('webupdates.display', {
            source: SOURCE,
            objectType: 'inetnum',
            name: INETNUM,
            method: undefined
        });
    });

    it('should have errors on wrong type', function () {

        $stateParams.source = SOURCE;
        $stateParams.objectType = 'mntner';
        $stateParams.name = 'TPOLYCHNIA-MNT';

        $ctrl = $componentController('forceDelete', {
            $state: $state, $stateParams: $stateParams
        });

        expect($ctrl.AlertService.getErrors()[0].plainText)
            .toBe('Only inetnum, inet6num, route, route6, domain object types are force-deletable');
    });


    it('should show error on missing object key', function () {

        $stateParams.source = SOURCE;
        $stateParams.objectType = 'inetnum';
        $stateParams.name = undefined;

        $ctrl = $componentController('forceDelete', {
            $state: $state, $stateParams: $stateParams
        });

        expect($ctrl.AlertService.getErrors()[0].plainText).toBe('Object key is missing');
    });

    it('should show error on missing source', function () {

        $stateParams.source = undefined;
        $stateParams.objectType = 'inetnum';
        $stateParams.name = 'asdf';

        $ctrl = $componentController('forceDelete', {
            $state: $state, $stateParams: $stateParams
        });

        expect($ctrl.AlertService.getErrors()[0].plainText).toBe('Source is missing');
    });


    it('should go to delete controler on reclaim', function () {
        spyOn(WebUpdatesCommonsService, "navigateToDelete");
        createForceDeleteController();

        $ctrl.forceDelete();

        $httpBackend.whenGET(/.*.html/).respond(200);

        expect(WebUpdatesCommonsService.navigateToDelete).toHaveBeenCalledWith(SOURCE, 'inetnum', '111 - 255', 'webupdates.forceDelete');
    });

});

describe('webUpdates: ForceDeleteController should be able to handle escape objected with slash', function () {

    var $ctrl, $state, $stateParams, $httpBackend;
    var ModalService;
    var SOURCE = 'RIPE';
    var OBJECT_TYPE = 'route';
    var NAME = '12.235.32.0%2f19AS1680';
    var $q;
    var do_create_controller;

    beforeEach(function () {

        module('webUpdates');

        inject(function (_$componentController_, _$state_, _$stateParams_, _$httpBackend_, _$q_, _ModalService_) {

            $state = _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            ModalService = _ModalService_;
            $q = _$q_;

            do_create_controller = function () {

                $stateParams.objectType = OBJECT_TYPE;
                $stateParams.source = SOURCE;
                $stateParams.name = NAME;

                $ctrl = _$componentController_('forceDelete', {
                    $state: $state, $stateParams: $stateParams, $log: logger
                });

                $httpBackend.whenGET(/.*.html/).respond(200);
            };

        });
    });

    it('should get parameters from url', function () {

        do_create_controller();

        $httpBackend.whenGET('api/user/mntners').respond([
            {key: 'TESTSSO-MNT', type: 'mntner', auth: ['SSO'], mine: true}
        ]);

        $httpBackend.whenGET('api/whois/RIPE/route/12.235.32.0%2F19AS1680?unfiltered=true').respond(
            function () {
                return [200, objectToDisplay, {}];
            });

        $httpBackend.expectDELETE('api/whois/RIPE/route/12.235.32.0%2F19AS1680?dry-run=true&reason=dry-run').respond(
            function () {
                return [403, dryRunDeleteFailure, {}];
            });

        $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT').respond(
            function () {
                return [200, [{key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
            });

        $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST1-MNT').respond(
            function () {
                return [200, [{key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
            });
        $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST2-MNT').respond(
            function () {
                return [200, [{key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
            });


        $httpBackend.flush();

        expect($ctrl.object.source).toBe(SOURCE);
        expect($ctrl.object.type).toBe('route');
        expect($ctrl.object.name).toBe('12.235.32.0/19AS1680');
    });

    it('should present auth popup', function () {

        spyOn(ModalService, 'openAuthenticationModal').and.callFake(function () {
            return $q.defer().promise;
        });

        do_create_controller();

        $httpBackend.whenGET('api/user/mntners').respond([
            {key: 'TESTSSO-MNT', type: 'mntner', auth: ['SSO'], mine: true}
        ]);

        $httpBackend.whenGET('api/forceDelete/RIPE/route/12.235.32.0%252F19AS1680').respond([
            {key: 'TEST-MNT', type: 'mntner', mine: false},
            {key: 'TEST2-MNT', type: 'mntner', mine: false},
            {key: 'TEST3-MNT', type: 'mntner', mine: false}
        ]);

        $httpBackend.whenGET('api/whois/RIPE/route/12.235.32.0%2F19AS1680?unfiltered=true').respond(
            function () {
                return [200, objectToDisplay, {}];
            });

        $httpBackend.expectDELETE('api/whois/RIPE/route/12.235.32.0%2F19AS1680?dry-run=true&reason=dry-run').respond(
            function () {
                return [403, dryRunDeleteFailure, {}];
            });

        $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT').respond(
            function () {
                return [200, [{key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
            });
        $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST1-MNT').respond(
            function () {
                return [200, [{key: 'TEST1-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
            });
        $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST2-MNT').respond(
            function () {
                return [200, [{key: 'TEST2-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
            });

        $httpBackend.flush();

        $ctrl.forceDelete();

        expect(ModalService.openAuthenticationModal).toHaveBeenCalled();

    });

    var objectToDisplay = {
        objects: {
            object: [
                {
                    'primary-key': {attribute: [{name: 'route', value: '12.235.32.0/19AS1680'}]},
                    attributes: {
                        attribute: [
                            {name: 'route', value: '12.235.32.0/19AS1680'},
                            {name: 'mnt-by', value: 'TEST-MNT'},
                            {name: 'source', value: 'RIPE'}
                        ]
                    }
                }
            ]
        }

    };

    var dryRunDeleteFailure = {
        errormessages: {
            errormessage: [
                {
                    severity: 'Error',
                    text: 'Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s',
                    args: [
                        {value: 'inetnum'}, {value: '194.219.52.240 - 194.219.52.243'},
                        {value: 'mnt-by'}, {value: 'TEST-MNT'}
                    ]
                },
                {
                    severity: 'Error',
                    text: 'Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s',
                    args: [
                        {value: 'inetnum'}, {value: '194.219.0.0 - 194.219.255.255'},
                        {value: 'mnt-lower'}, {value: 'TEST1-MNT'}
                    ]
                },
                {
                    severity: 'Error',
                    text: 'Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s',
                    args: [{value: 'inetnum'}, {value: '194.219.0.0 - 194.219.255.255'},
                        {value: 'mnt-by'}, {value: 'RIPE-NCC-HM-MNT, TEST2-MNT'}
                    ]
                },
                {
                    severity: 'Info',
                    text: 'Dry-run performed, no changes to the database have been made'
                }
            ]
        }

    };


});


