'use strict';

angular.module('dbWebApp')
    .service('LogicInterceptor', ['$log', 'WhoisResources',
        function ($log, WhoisResources) {

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
                // Currently we have no global afterSubmitError callback
            };

            var objectInterceptors = {
                'as-block': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitError: undefined
                },
                'as-set': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitError: undefined
                },
                'aut-num': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitError: undefined
                },
                domain: {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitError: undefined
                },
                'filter-set': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitError: undefined
                },
                inet6num: {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitError: undefined
                },
                inetnum: {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitError: undefined
                },
                'inet-rtr': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitError: undefined
                },
                'irt': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitError: undefined
                },
                'key-cert': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitError: undefined
                },
                mntner: {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitError: undefined
                },
                organisation: {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitError: undefined
                },
                'peering-set': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitError: undefined
                },
                person: {
                    beforeEdit:
                        function (method, source, objectType, attributes, errors, warnings, infos) {
                            attributes.setSingleAttributeOnName('nic-hdl', 'AUTO-1');
                            return attributes;
                        },
                    afterEdit: undefined,
                    afterSubmitError: undefined
                },
                poem: {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitError: undefined
                },
                'poetic-form': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitError: undefined
                },
                role: {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitError: undefined
                },
                route: {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitError: undefined
                },
                route6: {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitError: undefined
                },
                'route-set': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitError: undefined
                },
                'rtr-set': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitError: undefined
                }
            };

            function _getBeforeEditFilter(objectType) {
                if(_.isUndefined(objectInterceptors[objectType])) {
                    $log.error('Object-type ' + objectType+ ' not understood');
                    return undefined;
                }
                if (_.isUndefined(objectInterceptors[objectType].beforeEdit)) {
                    console.log('Interceptor-function  ' + objectType+ '.beforeEdit not found');
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
                    console.log('Interceptor-function ' + objectType+ '.afterEdit not found');
                    return undefined;
                }
                return objectInterceptors[objectType].afterEdit;
            }

            function _getAfterSubmitErrorFilter(objectType) {
                if(_.isUndefined(objectInterceptors[objectType])) {
                    $log.error('Object-type ' + objectType+ ' not understood');
                    return undefined;
                }
                if (_.isUndefined(objectInterceptors[objectType].afterSubmitError)) {
                    console.log('Interceptor-function ' + objectType+ '.afterSubmitError not found');
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

            logicInterceptor.afterSubmitError = function (method, source, objectType, status, requestAttributes, responseAttributes, errors, warnings, infos) {
                var interceptorFunc = _getAfterSubmitErrorFilter(objectType);
                if (_.isUndefined(interceptorFunc)) {
                    return attributes;
                }
                return interceptorFunc(method, source, objectType, requestAttributes, status, attributes, errors, warnings, infos);
            };

            return logicInterceptor;
        }]);
