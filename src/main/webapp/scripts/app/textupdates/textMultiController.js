'use strict';

angular.module('textUpdates')
    .directive("autoHeight", function ($timeout) {
        return {
            restrict: 'A',
            link: function($scope, element) {
                if(element[0].scrollHeight < 5 ){
                    element[0].style.height = 5;
                } else {
                    element[0].style.height = (element[0].scrollHeight) + "px";
                }

                var resize = function() {
                    return element[0].style.height = "" + element[0].scrollHeight + "px";
                };

                element.on("blur keyup change", resize);
                $timeout(resize, 0);
            }
    }})
    .controller('TextMultiController', ['$scope', '$stateParams', '$state', '$resource', '$log', '$q',
        'WhoisResources', 'RestService', 'AlertService', 'ErrorReporterService',
        'RpslService', 'TextCommons',
        function ($scope, $stateParams, $state, $resource, $log, $q,
                  WhoisResources, RestService, AlertService, ErrorReporterService,
                  RpslService, TextCommons) {

            $scope.setTextMode = setTextMode;
            $scope.isTextMode = isTextMode;
            $scope.setWebMode = setWebMode;
            $scope.isWebMode = isWebMode;

            $scope.verify = verify;
            $scope.submit = submit;
            $scope.verifyAndSubmit = verifyAndSubmit;

            _initialisePage();

            function _initialisePage() {

                AlertService.clearErrors();

                $scope.setTextMode();

                // extract parameters from the url
                $scope.source = $stateParams.source;

                $scope.rpsl =
                    'person:        Eva Berkhout\n' +
                    '\n'+
                    'person:        Marc Grol\n' +
                    'address:       Singel, Amsterdam\n' +
                    'phone:         +316\n' +
                    'nic-hdl:       AUTO-1\n' +
                    'mnt-by:        GROLTEST1-MNT\n' +
                    'last-modified: 2015-11-30T18:16:38Z\n' +
                    'source:        RIPE\n' +
                    'password:Houtman28\n' +
                    '\n'+
                    'mntner:          AARDVARK-MNT\n' +
                    'descr:           Mntner for denis\n' +
                    'admin-c:         DW6465-RIPE\n' +
                    'tech-c:          DW-RIPE\n' +
                    'upd-to:          denis@ripe.net\n' +
                    'auth:            X509-1689\n' +
                    'notify:          ripedenis@yahoo.co.uk\n' +
                    'mnt-by:          AARDVARK-MNT\n' +
                    'source:          RIPE # Filtered\n' +
                    'mntner:          AARDVARK-MNT\n' +
                    'descr:           Mntner for denis\n' +
                    'admin-c:         DW6465-RIPE\n' +
                    'tech-c:          DW-RIPE\n' +
                    'upd-to:          denis@ripe.net\n' +
                    'auth:            SSO mgrol@ripe.net\n' +
                    'notify:          ripedenis@yahoo.co.uk\n' +
                    'mnt-by:          AARDVARK-MNT\n' +
                    'source:          RIPE # Filtered\n';

                $scope.objects = [];
                $scope.passwords = [];
                $scope.overrides = [];

                $log.debug('TextMultiController: Url params:' +
                    ' object.source:' + $scope.source);
            };

            function setWebMode() {
                $scope.textMode = false;
                $scope.objects = verify($scope.source, $scope.rpsl, $scope.passwords, $scope.overrides);
            }

            function isWebMode() {
                return $scope.textMode === false;
            }

            function setTextMode() {
                $scope.textMode = true;
            }

            function isTextMode() {
                return $scope.textMode === true;
            }

            function verify(source, rpsl, passwords, overrides) {

                var objects = [];

                $log.debug("rpsl:" + rpsl);

                // parse
                var passwords = [];
                var overrides = [];
                var objs = RpslService.fromRpslWithPasswords(rpsl, passwords, overrides);

                $log.debug("objects:" + JSON.stringify(objs));

                _.each(objs, function(attributes) {

                    var object  = {};
                    objects.push(object);
                    object.type = attributes[0].name;
                    object.attributes  = WhoisResources.wrapAndEnrichAttributes(object.type, attributes);
                    object.name = _getPkey(object.type, object.attributes);
                    object.rpsl = RpslService.toRpsl(object.attributes);
                    var lastModifiedAttr =_.find(object.attributes, function(item) {
                        return item.name === 'last-modified';
                    });
                    object.lastModified = _.isUndefined(lastModifiedAttr) ? '' : lastModifiedAttr.value;
                    _setStatus( object, undefined, 'Verifying' );
                    _determineOperation(source, object, passwords).then(
                        function (action) {
                            _setStatus( object, undefined, '-' );
                            object.action = action;
                            object.displayUrl =_asDisplayLink(source, object);
                            object.textupdatesUrl =_asTextUpdatesLink(source, object);
                        }
                    );
                });
                return objects;
            }

            function submit() {
                $scope.textMode = false;

                _.each($scope.objects, function(obj) {
                    _performAction($scope.source, obj);
                });

                $log.debug("submit:" + JSON.stringify($scope.objects));

                _.each($scope.objects, function(obj) {
                    _performAction($scope.source, obj);
                });
            }

            function verifyAndSubmit() {
                $scope.objects = $scope.verify($scope.source, $scope.rpsl, $scope.password, $scope.overrides);
                $scope.submit();
            }

            function _getPkey(objectType, attributes) {
                var  objectMeta = WhoisResources._getMetaAttributesOnObjectType(objectType, true);
                var pkeyAttrs = _.filter(objectMeta, function(item) {
                    return item.primaryKey === true;
                });

                var pkey = '';
                _.each(pkeyAttrs, function(pkeyAttr) {
                    var attr = attributes.getSingleAttributeOnName(pkeyAttr.name);
                    if(!_.isUndefined(attr) && !_.isEmpty(attr.name)) {
                        pkey = pkey.concat(attr.value);
                    }
                });
                return _.trim(pkey);
            }

            function _asDisplayLink(source, object) {
                if( object.action === 'Create') {
                    return '';
                } else {
                    return '/db-web-ui/#/webupdates/display/'+  source + '/' + object.type + '/' + object.name;
                }
            }

            function _asTextUpdatesLink(source, object) {
                var suffix = '';
                if( object.success !== true ) {
                    suffix = '&rpsl=' + encodeURIComponent(object.rpsl);
                }
                if( object.action === 'Modify' || object.success === true ) {
                    return '/db-web-ui/#/textupdates/modify/'+  source + '/' + object.type + '/' + object.name + '?noRedirect=true'+ suffix;
                } else {
                    return '/db-web-ui/#/textupdates/create/'+  source + '/' + object.type + '?noRedirect=true'+ suffix;
                }
            }

            function _determineOperation(source, object, passwords) {
                var deferredObject = $q.defer();

                if(_.isUndefined(object.name) || _.isEmpty(object.name) || _.trim(object.name) === 'AUTO-1') {
                    deferredObject.resolve('Create');
                } else {
                    RestService.fetchObject(source, object.type, object.name, passwords).then(
                        function (result) {
                            deferredObject.resolve('Modify');
                        },
                        function (error) {
                            deferredObject.resolve('Create');
                        }
                    );
                }
                return deferredObject.promise;
            }

            function _setStatus(object, status, statusName)  {
                object.success = status;
                object.status = statusName;
                if(_.isUndefined(status)  ) {
                    object.statusStyle = {color: 'blue'};
                } else if( status === false ) {
                    object.statusStyle = {color:'red'};
                } else if( status === true ) {
                    object.statusStyle = {color:'green'};
                }
            }

            function _performAction( source, object, passwords, overrides) {
                if( object.action === 'Create') {
                    _setStatus( object, undefined, 'Creating' );

                    RestService.createObject(source, object.type,
                        WhoisResources.turnAttrsIntoWhoisObject(object.attributes),
                        passwords, overrides, true).then(
                        function (result) {
                            _setStatus( object, true, 'Created successfully' );
                            var whoisResources = WhoisResources.wrapWhoisResources(result);
                            object.name = whoisResources.getPrimaryKey();
                            object.displayUrl =_asDisplayLink(source, object);
                            object.textupdatesUrl =_asTextUpdatesLink(source, object);
                            object.oldRpsl = _.clone(object.rpsl)
                            object.rpsl = RpslService.toRpsl(whoisResources.getAttributes());
                            object.infos = whoisResources.getAllInfos();

                        }, function (error) {
                            _setStatus( object, false, 'Error creating');

                            if (!_.isUndefined(error.data)) {
                                var whoisResources = WhoisResources.wrapWhoisResources(error.data);
                                var whoisResources = WhoisResources.wrapWhoisResources(error.data);
                                object.errors = whoisResources.getAllErrors();
                                object.warnings = whoisResources.getAllWarnings();
                                object.infos = whoisResources.getAllInfos();
                            }
                        }
                    );

                } else {
                    _setStatus( object, undefined, 'Modifying' );

                    RestService.modifyObject(source, object.type,object.name,
                        WhoisResources.turnAttrsIntoWhoisObject(object.attributes),
                        passwords, overrides, true).then(
                        function (result) {
                            _setStatus( object, true, 'Modified successfully' );
                            var whoisResources = WhoisResources.wrapWhoisResources(result);
                            object.oldRpsl = _.clone(object.rpsl)
                            object.rpsl = RpslService.toRpsl(whoisResources.getAttributes());
                            object.infos = whoisResources.getAllInfos();

                        }, function (error) {
                            _setStatus( object, false, 'Error modifying');

                            if (!_.isUndefined(error.data)) {
                                var whoisResources = WhoisResources.wrapWhoisResources(error.data);
                                object.errors = whoisResources.getAllErrors();
                                object.warnings = whoisResources.getAllWarnings();
                                object.infos = whoisResources.getAllInfos();
                            }
                        }
                    );

                }
            }

        }]);
