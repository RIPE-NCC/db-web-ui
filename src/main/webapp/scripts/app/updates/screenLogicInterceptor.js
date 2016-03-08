'use strict';

angular.module('updates')
    .service('ScreenLogicInterceptor', ['$log', 'WhoisResources',
        function ($log, WhoisResources) {

            // TODO: start
            // Move the following stuff from Create-modify-controller:
            // - add abuse-c attribute although optional
            // - convert error intop success for creation of pending route(6)
            // - strip nulls
            // - RPSL password for resources
            // - refresh after authenticating mntner
            // TODO end

            var globalInterceptor = {
                beforeEdit:
                    function (method, source, objectType, attributes, errors, warnings, infos) {
                        return _loadGenericDefaultValues(method, source, objectType, attributes, errors, warnings, infos);
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
                    afterSubmitError: undefined,
                    beforeAddAttribute:undefined
                },
                'as-set': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined,
                    beforeAddAttribute:undefined
                },
                'aut-num': {
                    beforeEdit: function (method, source, objectType, attributes, errors, warnings, infos) {
                        return _disableOrgWhenStatusIsAssignedPI(method, source, objectType, attributes, errors, warnings, infos);
                    },
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined,
                    beforeAddAttribute: undefined
                },
                domain: {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined,
                    beforeAddAttribute:undefined
                },
                'filter-set': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined,
                    beforeAddAttribute:undefined
                },
                inet6num: {
                    beforeEdit: function (method, source, objectType, attributes, errors, warnings, infos) {
                        return _disableOrgWhenStatusIsAssignedPI(method, source, objectType, attributes, errors, warnings, infos);
                    },
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined,
                    beforeAddAttribute: function (method, source, objectType, objectAttributes, addableAtributes) {
                        return _removeSponsoringOrgIfNeeded(method, source, objectType, objectAttributes, addableAtributes);
                    }
                },
                inetnum: {
                    beforeEdit: function (method, source, objectType, attributes, errors, warnings, infos) {
                        return _disableOrgWhenStatusIsAssignedPI(method, source, objectType, attributes, errors, warnings, infos);
                    },
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined,
                    beforeAddAttribute: function (method, source, objectType, objectAttributes, addableAtributes) {
                        return _removeSponsoringOrgIfNeeded(method, source, objectType, objectAttributes, addableAtributes);
                    }
                },
                'inet-rtr': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined,
                    beforeAddAttribute:undefined
                },
                'irt': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined,
                    beforeAddAttribute:undefined
                },
                'key-cert': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined,
                    beforeAddAttribute:undefined
                },
                mntner: {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined,
                    beforeAddAttribute:undefined
                },
                organisation: {
                    beforeEdit:
                        function (method, source, objectType, attributes, errors, warnings, infos) {
                            return _loadOrganisationDefaults(method, source, objectType, attributes, errors, warnings, infos);
                        },
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined,
                    beforeAddAttribute:undefined
                },
                'peering-set': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined,
                    beforeAddAttribute:undefined
                },
                person: {
                    beforeEdit:
                        function (method, source, objectType, attributes, errors, warnings, infos) {
                            return _loadPersonRoleDefaults(method, source, objectType, attributes, errors, warnings, infos);
                        },
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined,
                    beforeAddAttribute:undefined
                },
                poem: {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined,
                    beforeAddAttribute:undefined
                },
                'poetic-form': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined,
                    beforeAddAttribute:undefined
                },
                role: {
                    beforeEdit:
                        function (method, source, objectType, attributes, errors, warnings, infos) {
                            return _loadPersonRoleDefaults(method, source, objectType, attributes, errors, warnings, infos);
                        },
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined,
                    beforeAddAttribute:undefined
                },
                route: {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined,
                    beforeAddAttribute:undefined
                },
                route6: {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined,
                    beforeAddAttribute:undefined
                },
                'route-set': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined,
                    beforeAddAttribute:undefined
                },
                'rtr-set': {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined,
                    beforeAddAttribute:undefined
                }
            };

            function _loadPersonRoleDefaults(method, source, objectType, attributes, errors, warnings, infos) {
                if(method === 'Create') {
                    attributes.setSingleAttributeOnName('nic-hdl', 'AUTO-1')
                }
                attributes.getSingleAttributeOnName('nic-hdl').$$meta.$$disable = true;
                return attributes;
            }

            function _loadOrganisationDefaults(method, source, objectType, attributes, errors, warnings, infos) {
                if(method === 'Create') {
                    attributes.setSingleAttributeOnName('organisation', 'AUTO-1');
                    attributes.setSingleAttributeOnName('org-type', 'OTHER');
                }
                attributes.getSingleAttributeOnName('organisation').$$meta.$$disable = true;
                attributes.getSingleAttributeOnName('org-type').$$meta.$$disable = true;
                return attributes;
            }

            function _loadGenericDefaultValues(method, source, objectType, attributes, errors, warnings, infos) {
                if( method === 'Create') {
                    attributes.setSingleAttributeOnName('source', source);
                }
                attributes.getSingleAttributeOnName('source').$$meta.$$disable = true;
                return attributes;
            }

            // https://www.ripe.net/participate/policies/proposals/2012-08
            function _removeSponsoringOrgIfNeeded(method, source, objectType, objectAttributes, addableAttributes) {
                var statusAttr = objectAttributes.getSingleAttributeOnName('status');

                if(statusAttr && statusAttr.value != 'ASSIGNED PI' && statusAttr.value != 'ASSIGNED ANYCAST' && statusAttr.value != 'LEGACY') {
                    addableAttributes.removeAttributeWithName('sponsoring-org');
                }

                return addableAttributes;
            }

            function _disableOrgWhenStatusIsAssignedPI (method, source, objectType, attributes, errors, warnings, infos) {
                var statusAttr = attributes.getSingleAttributeOnName('status');

                if(statusAttr && statusAttr.value === 'ASSIGNED PI') {
                    var org = attributes.getSingleAttributeOnName('org');
                    if(org) {
                        org.$$meta.$$disable = true;
                    }
                }

                return attributes;
            }

            function _getInterceptorFunc(objectType, actionName) {
                if(_.isUndefined(objectInterceptors[objectType])) {
                    $log.error('Object-type ' + objectType+ ' not understood');
                    return undefined;
                }
                if (_.isUndefined(objectInterceptors[objectType][actionName])) {
                    $log.info('Interceptor-function ' + objectType+ '.' +actionName+ ' not found');
                    return undefined;
                }
                return objectInterceptors[objectType][actionName];
            }

            var logicInterceptor = {};

            logicInterceptor.beforeEdit = function (method, source, objectType, attributes, errors, warnings, infos) {
                var attrs = globalInterceptor.beforeEdit(method, source, objectType, attributes, errors, warnings, infos);
                var interceptorFunc = _getInterceptorFunc(objectType, 'beforeEdit');
                if (_.isUndefined(interceptorFunc)) {
                    return attrs;
                }
                return interceptorFunc(method, source, objectType, attrs, errors, warnings, infos);
            };

            logicInterceptor.afterEdit = function (method, source, objectType, attributes, errors, warnings, infos) {
                var attrs = globalInterceptor.beforeEdit(method, source, objectType, attributes, errors, warnings, infos);
                var interceptorFunc = _getInterceptorFunc(objectType, 'afterEdit');
                if (_.isUndefined(interceptorFunc)) {
                    return attrs;
                }
                return interceptorFunc(method, source, objectType, attts, errors, warnings, infos);
            };

            logicInterceptor.afterSubmitSuccess = function (method, source, objectType, responseAttributes, warnings, infos) {
                var interceptorFunc = _getInterceptorFunc(objectType, 'afterSubmitSuccess');
                if (_.isUndefined(interceptorFunc)) {
                    return false;
                }
                return interceptorFunc(method, source, objectType, responseAttributes, warnings, infos);
            };

            logicInterceptor.afterSubmitError = function (method, source, objectType, requestAttributes, status, responseAttributes, errors, warnings, infos) {
                var interceptorFunc = _getInterceptorFunc(objectType, 'afterSubmitError');
                if (_.isUndefined(interceptorFunc)) {
                    return false;
                }
                return interceptorFunc(method, source, objectType, requestAttributes, status, responseAttributes, errors, warnings, infos);
            };

            logicInterceptor.beforeAddAttribute = function (method, source, objectType, objectAttributes, addableAttributes) {
                var interceptorFunc = _getInterceptorFunc(objectType, 'beforeAddAttribute');
                if (_.isUndefined(interceptorFunc)) {
                    return false;
                }
                return interceptorFunc(method, source, objectType, objectAttributes, addableAttributes);
            };


            return logicInterceptor;
        }]);
