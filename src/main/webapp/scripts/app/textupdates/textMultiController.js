'use strict';

angular.module('textUpdates')
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

                // extract parameters from the url
                $scope.objects = {};
                $scope.objects.source = $stateParams.source;
                $scope.objects.passwords = [];
                $scope.objects.overrides = [];
                $scope.objects.rpsl = '';

                // start with text-area
                $scope.setTextMode();

                $log.debug('TextMultiController: Url params:' +
                    ' object.source:' + $scope.objects.source);

            };

            function setWebMode() {
                AlertService.clearErrors();

                $scope.textMode = false;
                $scope.objects.objects = verify($scope.objects.source, $scope.objects.rpsl, $scope.objects.passwords, $scope.objects.overrides);
            }

            function isWebMode() {
                return $scope.textMode === false;
            }

            function setTextMode() {
                $scope.textMode = true;
                $scope.objects.objects = [];
            }

            function isTextMode() {
                return $scope.textMode === true;
            }

            function verify(source, rpsl, passwords, overrides) {

                var objects = [];

                $log.debug("rpsl:" + rpsl);

                var objs = RpslService.fromRpslWithPasswords(rpsl, passwords, overrides);
                $log.debug("objects:" + JSON.stringify(objs));

                _.each(objs, function(attributes) {

                    var object  = {};
                    objects.push(object);
                    // assume first attribute is type indicator
                    object.type = attributes[0].name;
                    object.rpsl = RpslService.toRpsl(attributes);
                    object.errors = [];
                    if (!TextCommons.validate(object.type, attributes, object.errors)) {
                        _setStatus(object, false, 'Invalid syntax');
                    } else {
                        object.attributes  = WhoisResources.wrapAndEnrichAttributes(object.type, attributes);
                        object.name = _getPkey(object.type, object.attributes);
                        _setStatus(object, undefined, 'Fetching');
                        _determineOperation(source, object, passwords).then(
                            function (action) {
                                _setStatus(object, undefined, '-');
                                object.action = action;
                                if( object.action === 'Modify' ) {
                                    object.displayUrl = _asDisplayLink(source, object);
                                } else {
                                    object.displayUrl = undefined;
                                }
                                object.textupdatesUrl = _asTextUpdatesLink(source, object);
                            }
                        );
                    }
                });
                return objects;
            }

            function submit() {
                AlertService.clearErrors();

                $scope.textMode = false;

                $log.debug("submit:" + JSON.stringify($scope.objects.objects));

                _.each($scope.objects.objects, function(obj) {
                    _performAction($scope.objects.source, obj, $scope.objects.passwords, $scope.objects.overrides);
                });
            }

            function verifyAndSubmit() {
                AlertService.clearErrors();

                $scope.objects.objects = $scope.verify($scope.objects.source, $scope.objects.rpsl,
                    $scope.objects.passwords, $scope.objects.overrides);
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
                return '/db-web-ui/#/webupdates/display/'+  source + '/' + object.type + '/' + object.name;
            }

            function _asTextUpdatesLink(source, object) {
                var suffix = '';
                if( object.success !== true ) {
                    suffix = '&rpsl=' + encodeURIComponent(object.rpsl);
                }
                if( object.action === 'Modify') {
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

                            if (_.isUndefined(error.data.errormessages)) {
                                object.errors = {plainText: 'Response '+ error.status +' not understood'};
                            } else {
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

                            if (_.isUndefined(error.data.errormessages)) {
                                object.errors = {plainText: 'Response '+ error.status +' not understood'};
                            } else {
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
