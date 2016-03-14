'use strict';

angular.module('textUpdates')
    .service('TextCommons', ['$state', '$log', '$q', 'WhoisResources', 'CredentialsService', 'AlertService', 'MntnerService', 'ModalService',
        function ($state, $log, $q, WhoisResources, CredentialsService, AlertService, MntnerService, ModalService) {

            this.enrichWithDefaults = function (objectSource, objectType, attributes) {
                // This does only add value if attribute exist
                attributes.setSingleAttributeOnName('source', objectSource);
                attributes.setSingleAttributeOnName('nic-hdl', 'AUTO-1');
                attributes.setSingleAttributeOnName('organisation', 'AUTO-1');
                attributes.setSingleAttributeOnName('org-type', 'OTHER'); // other org-types only settable with override

                // Remove unneeded optional attrs
                attributes.removeAttributeWithName('created');
                attributes.removeAttributeWithName('last-modified');
                attributes.removeAttributeWithName('changed');
            }

            this.validate = function (objectType, attributes, errors) {
                var unknownAttrs = _.filter(attributes, function (attr) {
                    return _.isUndefined(WhoisResources.findMetaAttributeOnObjectTypeAndName(objectType, attr.name));
                });
                if (!_.isEmpty(unknownAttrs)) {
                    _.each(unknownAttrs, function (attr) {
                        var msg = attr.name + ': Unknown attribute';
                        if(_.isUndefined(errors)) {
                            AlertService.addGlobalError(msg);
                        } else {
                            errors.push({plainText:msg});
                        }
                    });
                    return;
                }

                var errorCount=0;
                var mandatoryAtrs = WhoisResources._getMetaAttributesOnObjectType(objectType, true);
                _.each(mandatoryAtrs, function(meta) {
                    if( _.any(attributes, function(attr) {
                        return attr.name === meta.name;
                    }) === false ) {
                        var msg = meta.name + ': ' + "Missing mandatory attribute";
                        if(_.isUndefined(errors)) {
                            AlertService.addGlobalError(msg);
                        } else {
                            errors.push({plainText:msg});
                        }
                        errorCount++;
                    }
                });

                var enrichedAttributes = WhoisResources.wrapAndEnrichAttributes(objectType, attributes);
                if (!enrichedAttributes.validate()) {
                    _.each(enrichedAttributes, function (item) {
                        if (item.$$error) {
                            // Note: keep it lower-case to be consistent with server-side error reports
                            var msg = item.name + ': ' + item.$$error;
                            if(_.isUndefined(errors)) {
                                AlertService.addGlobalError(msg);
                            } else {
                                errors.push({plainText:msg});
                            }
                        }
                    });
                    errorCount++;
                }
                return errorCount === 0;
            }

            this.authenticate = function (method, objectSource, objectType, objectName, ssoMaintainers, attributes, passwords, override) {
                var deferredObject = $q.defer();
                var needsAuth = false;

                if (!_.isUndefined(override)) {
                    // prefer override over passwords
                    _clear(passwords);
                } else {
                    if (_.isEmpty(passwords) && _.isUndefined(override)) {
                        // show password popup if needed
                        var objectMntners = _getObjectMntners(attributes);
                        if (MntnerService.needsPasswordAuthentication(ssoMaintainers, [], objectMntners)) {
                            needsAuth = true;

                            _performAuthentication(method, objectSource, objectType, objectName, ssoMaintainers, objectMntners).then(
                                function() {
                                    $log.debug( "Authentication succeeded");
                                    deferredObject.resolve(true);
                                }, function() {
                                    $log.debug( "Authentication failed");
                                    deferredObject.reject(false);
                                }
                            );
                        }
                    }
                }
                if( needsAuth === false) {
                    $log.debug( "No authentication needed");
                    deferredObject.resolve(true);
                }
                return deferredObject.promise;
            }

            function _clear(array) {
                while (array.length) {
                    array.pop();
                }
            }

            function _performAuthentication(method, objectSource, objectType, objectName, ssoMntners, objectMntners) {
                var deferredObject = $q.defer();

                var mntnersWithPasswords = MntnerService.getMntnersForPasswordAuthentication(ssoMntners, [], objectMntners);
                var mntnersWithoutPasswords = MntnerService.getMntnersNotEligibleForPasswordAuthentication(ssoMntners, [], objectMntners);
                ModalService.openAuthenticationModal(method, objectSource, objectType, objectName, mntnersWithPasswords, mntnersWithoutPasswords).then(
                    function (result) {
                        AlertService.clearErrors();

                        var authenticatedMntner = result.selectedItem;
                        if (_isMine(authenticatedMntner)) {
                            // has been successfully associated in authentication modal
                            ssoMntners.push(authenticatedMntner);

                        }
                        deferredObject.resolve(true);

                    }, function () {
                        deferredObject.reject(false);
                    }
                );

                return deferredObject.promise;
            }

            function _isMine(mntner) {
                if (!mntner.mine) {
                    return false;
                } else {
                    return mntner.mine;
                }
            }


            function _getObjectMntners(attributes) {
                return _.map(attributes.getAllAttributesWithValueOnName('mnt-by'), function (objMntner) {
                    // Notes:
                    // - RPSL attribute values can contain leading and traling spaces, so the must be trimmed
                    // - Assume maintainers have md5-password, so prevent unmodifyable error
                    return {type: 'mntner', key: _.trim(objMntner.value), auth: ['MD5-PW']};
                });
            }

            this.stripEmptyAttributes = function (attributes) {
                return attributes.removeNullAttributes();
            }

            this.navigateToDisplayPage = function (source, objectType, objectName, operation) {
                $state.transitionTo('webupdates.display', {
                    source: source,
                    objectType: objectType,
                    name: objectName,
                    method: operation
                });
            }

            this.navigateToDelete = function (objectSource, objectType, objectName, onCancel) {
                $state.transitionTo('webupdates.delete', {
                    source: objectSource,
                    objectType: objectType,
                    name: objectName,
                    onCancel: onCancel
                });
            };

            this.uncapitalize = function(attributes) {
                return WhoisResources.wrapAttributes(
                    _.map(attributes, function (attr) {
                        attr.name = attr.name.toLowerCase();
                        return attr;
                    })
                );
            }

            this.capitaliseMandatory = function(attributes) {
                _.each(attributes, function (attr) {
                    if (!_.isUndefined(attr.$$meta) && attr.$$meta.$$mandatory) {
                            attr.name = attr.name.toUpperCase();
                    }
                });
            }

            this.getPasswordsForRestCall = function(objectType) {
                var passwords = [];

                if (CredentialsService.hasCredentials()) {
                    passwords.push(CredentialsService.getCredentials().successfulPassword);
                }

                // For routes and aut-nums we always add the password for the RIPE-NCC-RPSL-MNT
                // This to allow creation for out-of-region objects, without explicitly asking for the RIPE-NCC-RPSL-MNT-pasword
                if (objectType === 'route' || objectType === 'route6' || objectType === 'aut-num') {
                    passwords.push('RPSL');
                }
                return passwords;
            }

        }]);
