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

            this.authenticate = function (objectSource, objectType, ssoMaintainers, attributes, passwords, overrides) {
                var deferredObject = $q.defer();
                var needsAuth = false;

                if (overrides.length > 0) {
                    // prefer override over passwords
                    _clear(passwords);
                } else {
                    if (_.isEmpty(passwords) && _.isEmpty(overrides)) {
                        // show password popup if needed
                        var objectMntners = _getObjectMntners(attributes);
                        if (MntnerService.needsPasswordAuthentication(ssoMaintainers, [], objectMntners)) {
                            _performAuthentication(objectSource, objectType, ssoMaintainers, objectMntners);
                            needsAuth = true;
                            deferredObject.reject(false);
                        }
                    }
                    // combine all passwords
                    _.union(passwords, _getPasswordsForRestCall(objectType));
                }
                if( needsAuth === false) {
                    deferredObject.resolve(true);
                }
                return deferredObject.promise;
            }

            function _clear(array) {
                while (array.length) {
                    array.pop();
                }
            }

            function _performAuthentication(objectSource, objectType, ssoMntners, objectMntners) {
                var mntnersWithPasswords = MntnerService.getMntnersForPasswordAuthentication(ssoMntners, [], objectMntners);
                ModalService.openAuthenticationModal(objectSource, mntnersWithPasswords).then(
                    function (result) {
                        AlertService.clearErrors();

                        var authenticatedMntner = result.selectedItem;
                        if (_isMine(authenticatedMntner)) {
                            // has been successfully associated in authentication modal
                            ssoMntners.push(authenticatedMntner);

                        }

                    }, function () {
                        $state.transitionTo('textupdates.create', {
                            source: objectSource,
                            objectType: objectType
                        });
                    }
                );
            }

            function _isMine(mntner) {
                if (!mntner.mine) {
                    return false;
                } else {
                    return mntner.mine;
                }
            }

            function _getPasswordsForRestCall(objectType) {
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

            function _getObjectMntners(attributes) {
                return _.map(attributes.getAllAttributesWithValueOnName('mnt-by'), function (objMntner) {
                    // Notes:
                    // - RPSL attribute values can contain leading and traling spaces, so the must be trimmed
                    // - Assume maintainers have md5-password, so prevent unmodifyable error
                    return {type: 'mntner', key: _.trim(objMntner.value), auth: ['MD5-PW']};
                });
            }

            this.stripEmptyAttributes = function (attributes) {
                return _.filter(attributes, function (attr) {
                    return !_.isUndefined(attr.value);
                });
            }

            this.navigateToDisplayPage = function (source, objectType, objectName, operation) {
                $state.transitionTo('webupdates.display', {
                    source: source,
                    objectType: objectType,
                    name: objectName,
                    method: operation
                });
            }



        }]);
