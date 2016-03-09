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
            $scope.submit = submit;
            $scope.didAllActionsComplete = didAllActionsComplete;
            $scope.autoKeyMap = {};

            _initialisePage();

            function _initialisePage() {
                $scope.actionsPending = 0;

                AlertService.clearErrors();

                // extract parameters from the url
                $scope.objects = {};
                $scope.objects.source = $stateParams.source;
                $scope.objects.passwords = [];
                $scope.objects.overrides = [];
                $scope.objects.rpsl = '';

                $log.debug('TextMultiController: Url params:' +
                    ' object.source:' + $scope.objects.source);

                // start in text-mode
                $scope.setTextMode();
            };

            function setWebMode() {
                AlertService.clearErrors();

                $scope.textMode = false;
                $scope.objects.objects = _verify($scope.objects.source, $scope.objects.rpsl, $scope.objects.passwords, $scope.objects.overrides);
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

            function _verify(source, rpsl, passwords, overrides) {

                var objects = [];

                $log.debug("rpsl:" + rpsl);

                var objs = RpslService.fromRpslWithPasswords(rpsl, passwords, overrides);
                $log.debug("objects:" + JSON.stringify(objs));

                _initializeActionCounter(objs);
                _.each(objs, function(attributes) {
                    // create a new object and add it to the array right away
                    var object  = {};
                    object.errors = [];
                    objects.push(object);

                    attributes = TextCommons.uncapitalize(attributes);

                    // assume first attribute is type indicator
                    object.type = attributes[0].name;

                    // parse
                    object.rpsl = RpslService.toRpsl(attributes);

                    // validate
                    if (!TextCommons.validate(object.type, attributes, object.errors)) {
                        _setStatus(object, false, 'Invalid syntax');
                        _markActionCompleted(object, 'syntax error');
                    } else {

                        // determine primary key pf object
                        object.attributes = WhoisResources.wrapAndEnrichAttributes(object.type, attributes);
                        object.name = _getPkey(object.type, object.attributes);

                        _setStatus(object, undefined, 'Fetching');
                        _doesExist(source, object, passwords).then(
                            function (exists) {
                                if( exists === true ) {
                                    object.action = 'Modify';
                                    _setStatus(object, undefined, 'Object exists');
                                    object.displayUrl = _asDisplayLink(source, object);
                                } else {
                                    object.action = 'Create';
                                    _setStatus(object, undefined, 'Object does not yet exist');
                                    object.displayUrl = undefined;
                                }
                                object.textupdatesUrl = _asTextUpdatesLink(source, object);
                                _markActionCompleted(object, 'fetch');
                            },
                            function(errors) {
                                _setStatus(object, false, 'Error fetching');
                                _markActionCompleted(object, 'fetch');
                                object.errors = errors;
                            }
                        );
                    }
                });
                return objects;
            }

            function _doesExist(source, object, passwords) {
                var deferredObject = $q.defer();

                if(_.isUndefined(object.name) || _.isEmpty(object.name) || _.startsWith(_.trim(object.name), 'AUTO-')) {
                    deferredObject.resolve('Create');
                } else {
                    RestService.fetchObject(source, object.type, object.name, passwords, true).then(
                        function (result) {
                            $log.debug('Successfully fetched object ' + object.name );
                            deferredObject.resolve(true);
                        },
                        function (error) {
                            $log.debug('Error fetching object ' + object.name + ', http-status:' + error.status);
                            if (error.status === 404) {
                                deferredObject.resolve(false);
                            } else {
                                deferredObject.reject( error.data.getAllErrors());
                            }
                        }
                    );
                }
                return deferredObject.promise;
            }

            function submit() {
                AlertService.clearErrors();

                $log.debug("submit:" + JSON.stringify($scope.objects.objects));

                _initializeActionCounter($scope.objects.objects);
                _.each($scope.objects.objects, function(object) {

                    _setStatus(object, undefined, 'Start ' + object.action );
                    _performAction($scope.objects.source, object, $scope.objects.passwords, $scope.objects.overrides).then(
                        function(whoisResources) {
                            object.name = whoisResources.getPrimaryKey();
                            object.oldRpsl = _.clone(object.rpsl)
                            object.rpsl = RpslService.toRpsl(whoisResources.getAttributes());
                            object.displayUrl = _asDisplayLink($scope.objects.source, object);
                            object.textupdatesUrl = undefined;
                            object.errors = [];
                            object.warnings = whoisResources.getAllWarnings();
                            object.infos = whoisResources.getAllInfos();

                            _setStatus(object, true, object.action + ' success');
                            _markActionCompleted(object, object.action + ' success', _rewriteRpsl);
                        },
                        function(whoisResources) {
                            object.errors = whoisResources.getAllErrors();
                            object.warnings = whoisResources.getAllWarnings();
                            object.infos = whoisResources.getAllInfos();

                            _setStatus(object, false, object.action + ' error');
                            _markActionCompleted(object, object.action + ' failed', _rewriteRpsl);

                        }
                    );
                });
            }

            function _rewriteRpsl() {
                $log.debug( "Rewriting RPSL");

                $scope.objects.rpsl = '';
                _.each($scope.objects.objects, function(object) {
                    $scope.objects.rpsl += ('\n'+ object.rpsl );
                });
                _.each($scope.objects.passwords, function(password) {
                    $scope.objects.rpsl += ('password:'+ password + '\n');
                });
                _.each($scope.objects.overrides, function(override) {
                    $scope.objects.rpsl += ('override:'+ override + '\n');
                });
            }

            function _performAction( source, object, passwords, overrides) {
                var deferredObject = $q.defer();

                if( object.errors.length > 0 ) {
                    $log.debug('Skip performing action '+ object.action + '-' + object.type + '-' + object.name + ' since has errors');
                } else {
                    $log.debug('Start performing action '+ object.action + '-' + object.type + '-' + object.name );

                    if (object.action === 'Create') {
                        RestService.createObject(source, object.type,
                            WhoisResources.turnAttrsIntoWhoisObject(object.attributes),
                            passwords, overrides, true).then(
                            function (result) {
                                deferredObject.resolve(result);
                            },
                            function (error) {
                                if(!_.isEmpty(error.data.getAttributes())) {
                                    ErrorReporterService.log('MultiCreate', object.type, AlertService.getErrors(), error.data.getAttributes());
                                }
                                deferredObject.reject(error.data);
                            }
                        );

                    } else {
                        RestService.modifyObject(source, object.type, object.name,
                            WhoisResources.turnAttrsIntoWhoisObject(object.attributes),
                            passwords, overrides, true).then(
                            function (result) {
                                deferredObject.resolve(result);
                            },
                            function (error) {
                                if(!_.isEmpty(error.data.getAttributes())) {
                                    ErrorReporterService.log('MultiModify', object.type, AlertService.getErrors(), error.data.getAttributes());
                                }
                                deferredObject.reject(error.data);
                            }
                        );
                    }
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
                if(_.isUndefined(object.name) ) {
                    return undefined;
                }
                return '/db-web-ui/#/webupdates/display/'+  source + '/' + object.type + '/' + object.name;
            }

            function _asTextUpdatesLink(source, object) {
                var suffix = '?noRedirect=true';
                if( object.success !== true ) {
                    suffix = suffix.concat( '&rpsl=' + encodeURIComponent(object.rpsl));
                }
                if( object.action === 'Modify') {
                    return '/db-web-ui/#/textupdates/modify/'+  source + '/' + object.type + '/' + object.name + suffix;
                } else {
                    return '/db-web-ui/#/textupdates/create/'+  source + '/' + object.type + suffix;
                }
            }


            function _initializeActionCounter(objects) {
                $scope.actionsPending = objects.length;
                $log.debug('_initializeActionCounter:'+$scope.actionsPending);
            }

            function _markActionCompleted(object, action, callback) {
                $scope.actionsPending--;
                $log.debug('mark ' +  object.action + '-' + object.type + '-' + object.name + ' action completed for ' + action + ': '+ $scope.actionsPending);
                if( $scope.actionsPending === 0 ) {
                    if (!_.isUndefined(callback) && _.isFunction(callback)) {
                        callback();
                    }
                }
            }

            function didAllActionsComplete() {
                return $scope.actionsPending === 0;
            }

        }]);
