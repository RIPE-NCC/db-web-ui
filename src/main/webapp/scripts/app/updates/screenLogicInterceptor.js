'use strict';

angular.module('updates')
    .service('ScreenLogicInterceptor', ['$log', 'WhoisResources',
        function ($log, WhoisResources) {

            // TODO: start
            // Move the following stuff from Create-modify-controller:
            // - defaults
            // - limit allowed values (like org-type: OTHER)
            // - add abuse-c attribute although optional
            // - disable read-only attributes
            // - convert error intop success for creation of pending route(6)
            // - strip nulls
            // - RPSL password for resources
            // - refresh after authenticating mntner
            // TODO end

            var globalInterceptor = {
                beforeEdit:
                    function (method, source, objectType, attributes, errors, warnings, infos) {
                        if( method === 'Create') {
                            attributes.setSingleAttributeOnName('source', source);
                        }
                        return attributes;
                    },
                afterEdit:
                    function(method, source, objectType, attributes, errors, warnings, infos) {
                        return attributes;
                    }
                // Currently we have no global afterSubmitSuccess and afterSubmitError callback
            };

            var objectInterceptors = {
                'as-block': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined
                },
                'as-set': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined
                },
                'aut-num': {
                    beforeEdit: function (method, source, objectType, attributes, errors, warnings, infos) {
                        return disableOrgWhenStatusIsAssignedPI(method, source, objectType, attributes, errors, warnings, infos);
                    },
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined
                },
                domain: {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined
                },
                'filter-set': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined
                },
                inet6num: {
                    beforeEdit: function (method, source, objectType, attributes, errors, warnings, infos) {
                        return disableOrgWhenStatusIsAssignedPI(method, source, objectType, attributes, errors, warnings, infos);
                    },
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined
                },
                inetnum: {
                    beforeEdit: function (method, source, objectType, attributes, errors, warnings, infos) {
                        return disableOrgWhenStatusIsAssignedPI(method, source, objectType, attributes, errors, warnings, infos);
                    },
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined
                },
                'inet-rtr': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined
                },
                'irt': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined
                },
                'key-cert': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined
                },
                mntner: {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined
                },
                organisation: {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined
                },
                'peering-set': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined
                },
                person: {
                    beforeEdit:
                        function (method, source, objectType, attributes, errors, warnings, infos) {
                            attributes.setSingleAttributeOnName('nic-hdl', 'AUTO-1');
                            return attributes;
                        },
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined
                },
                poem: {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined
                },
                'poetic-form': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined
                },
                role: {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined
                },
                route: {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined
                },
                route6: {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined
                },
                'route-set': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined
                },
                'rtr-set': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined
                }
            };

            function disableOrgWhenStatusIsAssignedPI (method, source, objectType, attributes, errors, warnings, infos) {
                var statusAttr = attributes.getSingleAttributeOnName('status');

                if(statusAttr && statusAttr.value === 'ASSIGNED PI') {
                    var org = attributes.getSingleAttributeOnName('org');
                    if(org) org.$$disable = true;
                }

                return attributes;
            }

            function _getBeforeEditFilter(objectType) {
                if(_.isUndefined(objectInterceptors[objectType])) {
                    $log.error('Object-type ' + objectType+ ' not understood');
                    return undefined;
                }
                if (_.isUndefined(objectInterceptors[objectType].beforeEdit)) {
                    $log.info('Interceptor-function  ' + objectType+ '.beforeEdit not found');
                    return undefined;
                }

                return objectInterceptors[objectType].beforeEdit;
            }

            function _getAfterEditFilter(objectType) {
                if(_.isUndefined(objectInterceptors[objectType])) {
                    $log.error('Object-type ' + objectType+ ' not understood');
                    return undefined;
                }
                if (_.isUndefined(objectInterceptors[objectType].afterEdit)) {
                    $log.info('Interceptor-function ' + objectType+ '.afterEdit not found');
                    return undefined;
                }
                return objectInterceptors[objectType].afterEdit;
            }

            function _getAfterSubmitSuccessFilter(objectType) {
                if(_.isUndefined(objectInterceptors[objectType])) {
                    $log.error('Object-type ' + objectType+ ' not understood');
                    return undefined;
                }
                if (_.isUndefined(objectInterceptors[objectType].afterSubmitSuccess)) {
                    $log.info('Interceptor-function ' + objectType+ '.afterSubmitSuccess not found');
                    return undefined;
                }
                return objectInterceptors[objectType].afterSubmitSuccess;
            }

            function _getAfterSubmitErrorFilter(objectType) {
                if(_.isUndefined(objectInterceptors[objectType])) {
                    $log.error('Object-type ' + objectType+ ' not understood');
                    return undefined;
                }
                if (_.isUndefined(objectInterceptors[objectType].afterSubmitError)) {
                    $log.info('Interceptor-function ' + objectType+ '.afterSubmitError not found');
                    return undefined;
                }
                return objectInterceptors[objectType].afterSubmitError;
            }

            var logicInterceptor = {};

            logicInterceptor.beforeEdit = function (method, source, objectType, attributes, errors, warnings, infos) {
                var attrs = globalInterceptor.beforeEdit(method, source, objectType, attributes, errors, warnings, infos);
                var interceptorFunc = _getBeforeEditFilter(objectType);
                if (_.isUndefined(interceptorFunc)) {
                    return attrs;
                }
                return interceptorFunc(method, source, objectType, attrs, errors, warnings, infos);
            };

            logicInterceptor.afterEdit = function (method, source, objectType, attributes, errors, warnings, infos) {
                var attrs = globalInterceptor.beforeEdit(method, source, objectType, attributes, errors, warnings, infos);
                var interceptorFunc = _getAfterEditFilter(objectType);
                if (_.isUndefined(interceptorFunc)) {
                    return attrs;
                }
                return interceptorFunc(method, source, objectType, attts, errors, warnings, infos);
            };

            logicInterceptor.afterSubmitSuccess = function (method, source, objectType, responseAttributes, warnings, infos) {
                var interceptorFunc = _getAfterSubmitSuccessFilter(objectType);
                if (_.isUndefined(interceptorFunc)) {
                    return false;
                }
                return interceptorFunc(method, source, objectType, responseAttributes, warnings, infos);
            };

            logicInterceptor.afterSubmitError = function (method, source, objectType, requestAttributes, status, responseAttributes, errors, warnings, infos) {
                var interceptorFunc = _getAfterSubmitErrorFilter(objectType);
                if (_.isUndefined(interceptorFunc)) {
                    return false;
                }
                return interceptorFunc(method, source, objectType, requestAttributes, status, responseAttributes, errors, warnings, infos);
            };

            return logicInterceptor;
        }]);
