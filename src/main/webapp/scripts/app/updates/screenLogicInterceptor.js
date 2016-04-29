'use strict';

angular.module('updates')
    .service('ScreenLogicInterceptor', ['$log', 'WhoisResources', 'OrganisationHelper', 'MessageStore', 'MntnerService', 'LinkService',
        function ($log, WhoisResources, OrganisationHelper, MessageStore, MntnerService, LinkService) {

            // TODO: start
            // Move the following stuff from Create-modify-controller:
            // - strip nulls
            // - RPSL password for resources
            // TODO end

            var globalInterceptor = {
                beforeEdit:
                    function (method, source, objectType, attributes, errors, warnings, infos) {
                        return _loadGenericDefaultValues(method, source, objectType, attributes, errors, warnings, infos);
                    },
                afterEdit:
                    function(method, source, objectType, attributes, errors, warnings, infos) {
                        return attributes;
                    },
                beforeAddAttribute: function (method, source, objectType, objectAttributes, addableAttributes) {
                    return addableAttributes;
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
                        //_disableRipeMntnrAttributes(method, source, objectType, attributes, errors, warnings, infos);
                        _disableStatusIfModifying(method, source, objectType, attributes, errors, warnings, infos);
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
                        _disableStatusIfModifying(method, source, objectType, attributes, errors, warnings, infos);
                        _disableRipeMntnrAttributes(method, source, objectType, attributes, errors, warnings, infos);
                        return _disableOrgWhenStatusIsAssignedPI(method, source, objectType, attributes, errors, warnings, infos);
                    },
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined,
                    beforeAddAttribute: function (method, source, objectType, objectAttributes, addableAttributes) {
                        return _removeSponsoringOrgIfNeeded(method, source, objectType, objectAttributes, addableAttributes);
                    }
                },
                inetnum: {
                    beforeEdit: function (method, source, objectType, attributes, errors, warnings, infos) {
                        _disableStatusIfModifying(method, source, objectType, attributes, errors, warnings, infos);
                        _disableRipeMntnrAttributes(method, source, objectType, attributes, errors, warnings, infos);
                        return _disableOrgWhenStatusIsAssignedPI(method, source, objectType, attributes, errors, warnings, infos);
                    },
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError: undefined,
                    beforeAddAttribute: function (method, source, objectType, objectAttributes, addableAttributes) {
                        return _removeSponsoringOrgIfNeeded(method, source, objectType, objectAttributes, addableAttributes);
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
                            _disableReadyOnlyFieldsIfModifying(method, source, objectType, attributes, errors, warnings, infos);
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
                    afterSubmitError:
                        function(method, source, objectType, status, whoisResources, errors, warnings, infos) {
                            return _handlePendingAuthenticationError(method, source, objectType, status, whoisResources, errors, warnings, infos);
                        },
                    beforeAddAttribute:undefined
                },
                route6: {
                    beforeEdit: undefined,
                    afterEdit: undefined,
                    afterSubmitSuccess: undefined,
                    afterSubmitError:
                        function(method, source, objectType, status, whoisResources, errors, warnings, infos) {
                            return _handlePendingAuthenticationError(method, source, objectType, status, whoisResources, errors, warnings, infos);
                        },
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
                return attributes;
            }

            function _disableReadyOnlyFieldsIfModifying(method, source, objectType, attributes, errors, warnings, infos) {
                var orgType = attributes.getSingleAttributeOnName('org-type');
                orgType.$$meta.$$disable = true;

                if(method === 'Modify' && orgType.value === 'LIR') {
                    _.forEach(attributes.getAllAttributesOnName('mnt-by'), function (mnt) {
                        mnt.$$meta.$$disable = true;
                    });
                }
            }

            function _loadOrganisationDefaults(method, source, objectType, attributes, errors, warnings, infos) {
                if(method === 'Create') {
                    if (!OrganisationHelper.containsAbuseC(attributes)) {
                        attributes = OrganisationHelper.addAbuseC(objectType, attributes);
                    }
                    attributes.setSingleAttributeOnName('organisation', 'AUTO-1');
                    attributes.setSingleAttributeOnName('org-type', 'OTHER');
                }

                if(method === 'Modify' && !OrganisationHelper.containsAbuseC(attributes)) {
                    attributes = OrganisationHelper.addAbuseC(objectType, attributes);
                    attributes.getSingleAttributeOnName('abuse-c').$$meta.$$missing = true;
                    warnings.push('<p>There is currently no abuse contact set up for your organisation, which is required under ' +
                        '<a href="https://www.ripe.net/manage-ips-and-asns/resource-management/abuse-c-information" target="_blank">policy 2011-06</a>.</p>'+
                        '<p>Please specify the abuse-c attribute below.</p>');
                }

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

                if(statusAttr && !_.isEmpty(statusAttr.value) && statusAttr.value != 'ASSIGNED PI' && statusAttr.value != 'ASSIGNED ANYCAST' && statusAttr.value != 'LEGACY') {
                    addableAttributes.removeAttributeWithName('sponsoring-org');
                }

                return addableAttributes;
            }

            function _disableStatusIfModifying(method, source, objectType, attributes, errors, warnings, infos) {
                if (method === 'Modify') {
                    attributes.getSingleAttributeOnName('status').$$meta.$$disable = true;
                }
            }

            function _disableRipeMntnrAttributes(method, source, objectType, attributes, errors, warnings, infos) {
                // if any of the maintainers is a ripe maintainer then some attributes are read-only
                if (_.findIndex(attributes.getAllAttributesOnName('mnt-by'), function (mntBy) {
                        return MntnerService.isNccMntner(mntBy.value);
                    }) < 0) { // findIndex returns -1 if not found
                    return;
                }
                var attr;
                attr = attributes.getSingleAttributeOnName('sponsoring-org');
                if (attr) {
                    attr.$$meta.$$disable = true;
                }
                attr = attributes.getSingleAttributeOnName('org');
                if (attr) {
                    attr.$$meta.$$disable = true;
                }
            }

            function _disableOrgWhenStatusIsAssignedPI (method, source, objectType, attributes, errors, warnings, infos) {
                var statusAttr = attributes.getSingleAttributeOnName('status');
                if (statusAttr && statusAttr.value === 'ASSIGNED PI') {
                    var org = attributes.getSingleAttributeOnName('org');
                    if (org) {
                        org.$$meta.$$disable = true;
                    }
                }
                return attributes;
            }

            function _handlePendingAuthenticationError(method, source, objectType, status, whoisResources, errors, warnings, infos) {
                if (_isPendingAuthenticationError(status, whoisResources)) {

                    MessageStore.add(whoisResources.getPrimaryKey(), _composePendingResponse(whoisResources, source));
                    return true;

                }
                return false;
            }

            function _isPendingAuthenticationError(httpStatus, whoisResources) {
                var status = false;
                if (httpStatus === 400) {
                    status = _.any(whoisResources.errormessages.errormessage,
                        function (item) {
                            return item.severity === 'Warning' && item.text === 'This update has only passed one of the two required hierarchical authorisations';
                        }
                    );
                }
                $log.info('_isPendingAuthenticationError:' + status);
                return status;
            }

            function _composePendingResponse(resp, source) {
                var found = _.find(resp.errormessages.errormessage, function (item) {
                    return item.severity === 'Error' && item.text === 'Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s';
                });

                if (!_.isUndefined(found) && found.args.length >= 4) {
                    var obstructingType = found.args[0].value;
                    var obstructingName = found.args[1].value;
                    var mntnersToConfirm = found.args[3].value;

                    var obstructingObjectLink = LinkService.getLink(source, obstructingType, obstructingName);
                    var mntnersToConfirmLinks = LinkService.filterAndCreateTextWithLinksForMntners(source, mntnersToConfirm);

                    var moreInfoUrl = 'https://www.ripe.net/manage-ips-and-asns/db/support/managing-route-objects-in-the-irr#2--creating-route-objects-referring-to-resources-you-do-not-manage';
                    var moreInfoLink = '<a target="_blank" href="' + moreInfoUrl + '">Click here for more information</a>.';

                    var pendngMsg = 'Your object is still pending authorisation by a maintainer of the ' +
                        '<strong>' + obstructingType + '</strong> object ' + obstructingObjectLink + '. ' +
                        'Please ask them to confirm, by submitting the same object as outlined below ' +
                        'using syncupdates or mail updates, and authenticate it using the maintainer ' +
                        mntnersToConfirmLinks + '. ' + moreInfoLink;

                    // Keep existing message and overwrite existing errors
                    resp.errormessages.errormessage = [{'severity': 'Info', 'text': pendngMsg}];
                }
                // otherwise keep existing response

                return resp;
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

            logicInterceptor.afterSubmitError = function (method, source, objectType, status, whoisResources, errors, warnings, infos) {
                var interceptorFunc = _getInterceptorFunc(objectType, 'afterSubmitError');
                if (_.isUndefined(interceptorFunc)) {
                    return false;
                }
                return interceptorFunc(method, source, objectType, status, whoisResources, errors, warnings, infos);
            };

            logicInterceptor.beforeAddAttribute = function (method, source, objectType, objectAttributes, addableAttributes) {
                var addableAttrs = globalInterceptor.beforeAddAttribute(method, source, objectType, objectAttributes, addableAttributes);
                var interceptorFunc = _getInterceptorFunc(objectType, 'beforeAddAttribute');
                if (_.isUndefined(interceptorFunc)) {
                    return addableAttrs;
                }
                return interceptorFunc(method, source, objectType, objectAttributes, addableAttrs);
            };


            return logicInterceptor;
        }]);
