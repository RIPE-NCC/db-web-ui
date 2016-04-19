'use strict';

describe('webUpdates: CreateModifyController for organisation', function () {

    var $scope, $state, $stateParams, $httpBackend;
    var MessageStore;
    var WhoisResources;
    var MntnerService;
    var OrganisationHelper;
    var ModalService;
    var OBJECT_TYPE = 'organisation';
    var SOURCE = 'TEST';
    var NAME = 'ORG-UA300-RIPE';

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _MessageStore_, _WhoisResources_, _MntnerService_, _OrganisationHelper_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state =  _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            MessageStore = _MessageStore_;
            WhoisResources = _WhoisResources_;
            MntnerService = _MntnerService_;
            OrganisationHelper = _OrganisationHelper_;
            OrganisationHelper.updateAbuseC = function() {
            };

            ModalService = {
                openCreateRoleForAbuseCAttribute: function () {
                    return {
                        then: function (s) {
                            s(ROLE_OBJ);
                        }
                    }
                }
            };

            $stateParams.objectType = OBJECT_TYPE;
            $stateParams.source = SOURCE;
            $stateParams.name = NAME;

            _$controller_('CreateModifyController', {
                $scope: $scope, $state: $state, $stateParams: $stateParams, ModalService: ModalService
            });

            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.whenGET('api/user/mntners').respond([
                {key:'TEST-MNT', type: 'mntner', auth:['SSO'], mine:true},
                {key:'TESTSSO-MNT', type: 'mntner', auth:['MD5-PW','SSO'], mine:true}
            ]);

            $httpBackend.whenGET('api/whois/'+SOURCE+'/'+OBJECT_TYPE+'/'+NAME+'?unfiltered=true').respond(DEFAULT_RESPONSE);

            $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT').respond(
                function(method,url) {
                    return [200, [ {key:'TEST-MNT', type:'mntner', auth:['MD5-PW','SSO']} ], {}];
                });

            $httpBackend.flush();

        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should populate abuse-c with new role\'s nic-hdl', function () {
        $scope.attributes = OrganisationHelper.addAbuseC($scope.objectType, $scope.attributes);
        $scope.createRoleForAbuseCAttribute();

        expect($scope.attributes.getSingleAttributeOnName('abuse-c').value).toBe('SR11027-RIPE');
    });

    it('should populate $scope.roleForAbuseC', function () {
        $scope.attributes = OrganisationHelper.addAbuseC($scope.objectType, $scope.attributes);
        $scope.createRoleForAbuseCAttribute();

        expect($scope.roleForAbuseC).toBeDefined();
    });

    it('should use the helper to update role for abuse-c', function () {
        $scope.attributes = $scope.attributes.addAttributeAfterType({name: 'abuse-c', value: 'some abuse-c'}, {name: 'e-mail'});
        $scope.attributes = WhoisResources.wrapAttributes(
            WhoisResources.enrichAttributesWithMetaInfo($scope.objectType, $scope.attributes )
        );

        $httpBackend.whenPUT('api/whois/TEST/organisation/ORG-UA300-RIPE').respond(DEFAULT_RESPONSE); // I don' care about this call
        spyOn(OrganisationHelper, 'updateAbuseC');

        $scope.submit();
        $httpBackend.flush();

        expect(OrganisationHelper.updateAbuseC).toHaveBeenCalled();

    });


    var ROLE_OBJ = [ {
                        name : 'role',
                        value : 'some role'
                    }, {
                        name : 'address',
                        value : 'Singel 258'
                    }, {
                        name : 'e-mail',
                        value : 'fdsd@sdfsd.com'
                    }, {
                        name : 'abuse-mailbox',
                        value : 'fdsd@sdfsd.com'
                    }, {
                        name : 'nic-hdl',
                        value : 'SR11027-RIPE'
                    }, {
                        name : 'mnt-by',
                        value : 'MNT-THINK'
                    }, {
                        name : 'source',
                        value : 'TEST'
                    }];

    var DEFAULT_RESPONSE =
        function(method,url) {
            return [200,
                {
                    objects: {
                        object: [
                            {
                                'primary-key' : {attribute : [{name : 'organisation',value : 'ORG-UA300-RIPE'}]},
                                attributes: {
                                    attribute: [ {
                                        name : 'organisation',
                                        value : 'ORG-UA300-RIPE'
                                    }, {
                                        name : 'org-name',
                                        value : 'uhuuu'
                                    }, {
                                        name : 'org-type',
                                        value : 'OTHER'
                                    }, {
                                        name : 'address',
                                        value : 'Singel 258'
                                    }, {
                                        name : 'e-mail',
                                        value : 'uhuuuu@ripe.net'
                                    }, {
                                        name : 'mnt-ref',
                                        value : 'TEST-MNT'
                                    }, {
                                        name : 'mnt-by',
                                        value : 'TEST-MNT'
                                    }, {
                                        name : 'source',
                                        value: 'TEST'
                                    }
                                    ]
                                }
                            }
                        ]
                    }
                }, {}];
        };

});



