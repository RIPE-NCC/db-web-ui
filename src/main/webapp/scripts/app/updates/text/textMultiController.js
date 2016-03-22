'use strict';

angular.module('textUpdates')
    .controller('TextMultiController', ['$scope', '$stateParams', '$state', '$resource', '$log', '$q',
        'WhoisResources', 'RestService', 'AlertService', 'ErrorReporterService',
        'RpslService', 'TextCommons', 'SerialExecutor', 'AutoKeyLogic',
        function ($scope, $stateParams, $state, $resource, $log, $q,
                  WhoisResources, RestService, AlertService, ErrorReporterService,
                  RpslService, TextCommons, SerialExecutor, AutoKeyLogic) {

            $scope.setTextMode = setTextMode;
            $scope.isTextMode = isTextMode;
            $scope.setWebMode = setWebMode;
            $scope.isWebMode = isWebMode;
            $scope.submit = submit;
            $scope.didAllActionsComplete = didAllActionsComplete;
            $scope.didAllActionsSucceed = didAllActionsSucceed;
            $scope.startFresh = startFresh;
            $scope.onRpslTyped = onRpslTyped;

            _initialisePage();

            function _initialisePage() {
                $scope.actionsPending = 0;

                AlertService.clearErrors();

                // extract parameters from the url
                $scope.objects = {};
                $scope.objects.source = $stateParams.source;
                $scope.objects.rpsl = '';

                $log.debug('TextMultiController: Url params:' +
                    ' object.source:' + $scope.objects.source);

                // start in text-mode
                $scope.setTextMode();
            };

            function setWebMode() {
                AlertService.clearErrors();

                $log.info('TextMultiController.setWebMode: source' + $scope.objects.source + ', rpsl:'+ $scope.objects.rpsl);

                if( !_hasValidRpsl()) {
                    AlertService.setGlobalError('No valid RPSL found');
                    return;
                }

                var parsedObjs = RpslService.fromRpsl($scope.objects.rpsl);
                if( parsedObjs.length === 0 ) {
                    AlertService.setGlobalError('No valid RPSL object(s) found');
                    return;
                }

                $log.debug('parsed rpsl:' + JSON.stringify(parsedObjs));
                $scope.textMode = false;
                $scope.objects.objects = _verify($scope.objects.source, $scope.objects.rpsl, parsedObjs);
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

            function _verify(source, rpsl, parsedObjs) {
                var objects = [];
                AutoKeyLogic.clear();
                _initializeActionCounter(parsedObjs);

                _.each(parsedObjs, function(parsedObj) {

                    // create a new object and add it to the array right away
                    var object  = {
                        passwords: parsedObj.passwords,
                        override: parsedObj.override,
                        deleteReason: parsedObj.deleteReason,
                        errors: [],
                        showDiff:false
                    };
                    objects.push(object);

                    var attrs = TextCommons.uncapitalize(parsedObj.attributes);

                    // assume nam of first attribute is type indicator
                    object.type = _determineObjectType(attrs);

                    // back to rpsl
                    object.rpsl = RpslService.toRpsl(parsedObj);

                    $log.info('object:' + JSON.stringify(object));

                    // validate
                    if (!TextCommons.validate(object.type, attrs, object.errors)) {
                        $log.info('validation error:' + JSON.stringify( object.errors));
                        _setStatus(object, false, 'Invalid syntax');
                        _markActionCompleted(object, 'syntax error');
                    } else {
                        // determine primary key pf object
                        object.attributes = WhoisResources.wrapAndEnrichAttributes(object.type, attrs);
                        object.name = _getPkey(object.type, object.attributes);

                        // find out if this object has AUTO-keys
                        AutoKeyLogic.identifyAutoKeys(object.type, attrs );

                        // start fetching to determine if exists
                        _setStatus(object, undefined, 'Fetching');
                        object.exists = undefined;
                        _doesExist(source, object, object.passwords, object.override).then(
                            function (exists) {
                                if( exists === true ) {
                                    object.exists = true;
                                    _setStatus(object, undefined, 'Object exists');
                                    object.displayUrl = _asDisplayLink(source, object);
                                } else {
                                    object.exists = false;
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

            function _determineObjectType( attributes ) {
                return attributes[0].name;
            }

            function _doesExist(source, object, passwords, override) {
                var deferredObject = $q.defer();

                if(_.isUndefined(object.name) || _.isEmpty(object.name) || _.startsWith(_.trim(object.name), 'AUTO-')) {
                    $log.info( "Need need to perform fetch to check if exists");
                    deferredObject.resolve(false);
                } else {
                    $log.info( "Perform fetch to check if exists");
                    // TODO fetch with override
                    RestService.fetchObject(source, object.type, object.name, passwords, true).then(
                        function (result) {
                            $log.debug('Successfully fetched object ' + object.name );
                            // store original value to make diff-view later
                            object.rpslOriginal = RpslService.toRpsl({attributes:result.getAttributes()});
                            deferredObject.resolve(true);
                        },
                        function (error) {
                            $log.debug('Error fetching object ' + object.name + ', http-status:' + error.status);
                            object.rpslOriginal = undefined;
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

                // Execute any by one so that AUT0-keys can be resolved
                SerialExecutor.execute($scope.objects.objects, _submitSingle);
            }

            function _submitSingle( object ) {
                var deferredObject = $q.defer();

                if( object.success === true ) {
                    deferredObject.resolve(object);
                    _markActionCompleted(object, _determineAction(object) + ' already performed', undefined);
                } else {
                    _setStatus(object, undefined, 'Start ' + _determineAction(object));
                    _performAction($scope.objects.source, object).then(
                        function (whoisResources) {
                            object.name = whoisResources.getPrimaryKey();
                            object.attributes = whoisResources.getAttributes();
                            var obj = {
                                attributes: object.attributes,
                                passwords: object.passwords,
                                override: object.override,
                                deleteReason: object.deleteReason,
                            };
                            object.rpsl = RpslService.toRpsl(obj);
                            if (object.deleted !== true) {
                                object.displayUrl = _asDisplayLink($scope.objects.source, object);
                            }
                            object.textupdatesUrl = undefined;
                            object.errors = [];
                            object.warnings = whoisResources.getAllWarnings();
                            object.infos = whoisResources.getAllInfos();

                            _markActionCompleted(object, _determineAction(object) + ' success', _rewriteRpsl);

                            deferredObject.resolve(object);
                        },
                        function (whoisResources) {
                            if( !_.isUndefined(whoisResources)) {
                                object.errors = whoisResources.getAllErrors();
                                object.warnings = whoisResources.getAllWarnings();
                                object.infos = whoisResources.getAllInfos();
                            }

                            _markActionCompleted(object, _determineAction(object) + ' failed', _rewriteRpsl);

                            deferredObject.reject(object);
                        }
                    );
                }

                return deferredObject.promise;
            }

            function _performAction( source, object) {
                var deferredObject = $q.defer();

                if( object.errors.length > 0 ) {
                    $log.debug('Skip performing action '+_determineAction(object) + '-' + object.type + '-' + object.name + ' since has errors');
                    deferredObject.reject(undefined);
                } else {
                    $log.debug('Start performing action '+ _determineAction(object) + '-' + object.type + '-' + object.name );

                    // replace auto-key with real generated key
                    AutoKeyLogic.substituteAutoKeys( object.attributes);

                    // find attrs with an auto key
                    var autoAttrs = AutoKeyLogic.getAutoKeys(object.attributes);

                    // might have changed due to auto-key
                    var oldName = _.trim(object.name);
                    object.name = _.trim( _getPkey(object.type, object.attributes));
                    if(_.startsWith(oldName, 'AUTO-') && !_.startsWith(object.name, 'AUTO-')) {
                        object.exists = true;
                    }

                    if (!_.isUndefined(object.deleteReason) ) {
                        // TODO: add support for delete override

                        RestService.deleteObject(source, object.type, object.name, object.deleteReason, false,
                            object.passwords, false).then(
                            function (result) {
                                object.deleted = true;
                                object.exists = false;
                                _setStatus(object, true, 'Delete success' );

                                deferredObject.resolve(result);
                            },
                            function (error) {
                                _setStatus(object, false, 'Delete error' );

                                if(!_.isEmpty(error.data.getAttributes())) {
                                    ErrorReporterService.log('MultiDelete', object.type, AlertService.getErrors(), error.data.getAttributes());
                                }
                                deferredObject.reject(error.data);
                            }
                        );
                    } else if (object.exists === false) {

                        RestService.createObject(source, object.type,
                            WhoisResources.turnAttrsIntoWhoisObject(object.attributes),
                            object.passwords, object.override, true).then(
                            function (result) {

                                // next time perform a modify
                                object.exists = true;
                                _setStatus(object, true, 'Create success' );

                                // Associate generated value for auto-key so that next object with auto- can be substituted
                                _.each(autoAttrs, function(attr) {
                                    AutoKeyLogic.registerAutoKeyValue(attr, result.getAttributes());
                                });
                                deferredObject.resolve(result);
                            },
                            function (error) {
                                _setStatus(object, false, 'Create error' );

                                if(!_.isEmpty(error.data.getAttributes())) {
                                    ErrorReporterService.log('MultiCreate', object.type, AlertService.getErrors(), error.data.getAttributes());
                                }
                                deferredObject.reject(error.data);
                            }
                        );

                    } else {
                        RestService.modifyObject(source, object.type, object.name,
                            WhoisResources.turnAttrsIntoWhoisObject(object.attributes),
                            object.passwords, object.override, true).then(
                            function (result) {
                                _setStatus(object, true, 'Modify success' );
                                object.showDiff = true;

                                deferredObject.resolve(result);
                            },
                            function (error) {
                                _setStatus(object, false, 'Modify error' );

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

            function _rewriteRpsl() {
                $log.debug( "Rewriting RPSL");

                $scope.objects.rpsl = '';
                _.each($scope.objects.objects, function(object) {
                    $scope.objects.rpsl += ('\n'+ object.rpsl );
                });
            }

            function _setStatus(object, isSuccess, statusMsg) {
                object.success = isSuccess;
                object.status = statusMsg;
                if (_.isUndefined(object.success)) {
                    object.statusStyle = 'text-info';
                } else if (object.success === false) {
                    object.statusStyle = 'text-error';
                } else if (object.success === true) {
                    object.statusStyle = 'text-success';
                }
                object.action = _determineAction(object)
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
                if( object.exists === true) {
                    return '/db-web-ui/#/textupdates/modify/'+  source + '/' + object.type + '/' + object.name + suffix;
                } else {
                    return '/db-web-ui/#/textupdates/create/'+  source + '/' + object.type + suffix;
                }
            }

            function _determineAction( obj ) {
                return !_.isUndefined(obj.deleteReason) ? 'delete' : obj.exists === true ? 'modify' : 'create';
            }

            function _initializeActionCounter(objects) {
                $scope.actionsPending = objects.length;
                $log.debug('_initializeActionCounter:'+$scope.actionsPending);
            }

            function _markActionCompleted(object, action, callback) {
                $scope.actionsPending--;
                $log.debug('mark ' +  _determineAction(object) + '-' + object.type + '-' + object.name +
                    ' action completed for ' + _determineAction(object) + ': '+ $scope.actionsPending);
                if( $scope.actionsPending === 0 ) {
                    if (!_.isUndefined(callback) && _.isFunction(callback)) {
                        callback();
                    }
                }
            }

            function didAllActionsComplete() {
                return $scope.actionsPending === 0;
            }

            function didAllActionsSucceed() {
                var successes = _.filter($scope.objects.objects, function(obj) {
                    return obj.success === true;
                });

                return successes.length === $scope.objects.objects.length;
            }

            function startFresh() {
                 _initialisePage();
            }

            function onRpslTyped() {
                $log.debug('Typed RPSL:'+$scope.objects.rpsl);
            }

            function _hasValidRpsl() {
                // RPSL contains at least a colon
                return !_.isUndefined($scope.objects.rpsl) && $scope.objects.rpsl.indexOf(':') >= 0;
            }

        }]);
