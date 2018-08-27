/*global angular*/

(function () {
    'use strict';

    angular.module('webUpdates').service('WebUpdatesCommons', ['$state', '$log', 'WhoisResources', 'CredentialsService', 'AlertService', 'MntnerService', 'ModalService',

        function ($state, $log, WhoisResources, CredentialsService, AlertService, MntnerService, ModalService) {

            var webUpdatesCommons = {};

            webUpdatesCommons.performAuthentication = function (authParams) {
                $log.debug('Perform authentication', authParams.maintainers);
                var mntnersWithPasswords = MntnerService.getMntnersForPasswordAuthentication(authParams.maintainers.sso, authParams.maintainers.objectOriginal, authParams.maintainers.object);
                var mntnersWithoutPasswords = MntnerService.getMntnersNotEligibleForPasswordAuthentication(authParams.maintainers.sso, authParams.maintainers.objectOriginal, authParams.maintainers.object);
                // see: https://www.pivotaltracker.com/n/projects/769061
                var allowForcedDelete = !_.find(authParams.maintainers.object, function (o) {
                    return MntnerService.isNccMntner(o.key);
                });
                ModalService.openAuthenticationModal(null, authParams.object, mntnersWithPasswords, mntnersWithoutPasswords, allowForcedDelete, authParams.isLirObject).then(
                    function (result) {
                        AlertService.clearErrors();
                        var selectedMntner = result.selectedItem;
                        $log.debug('selected mntner:' + angular.toJson(selectedMntner));
                        var associationResp = result.response;
                        $log.debug('associationResp:' + angular.toJson(associationResp));
                        if (MntnerService.isMine(selectedMntner)) {
                            // has been successfully associated in authentication modal
                            authParams.maintainers.sso.push(selectedMntner);
                            // mark starred in selected
                            authParams.maintainers.object = MntnerService.enrichWithMine(authParams.maintainers.sso, authParams.maintainers.object);
                        }
                        $log.debug('After auth: maintainers.sso:', authParams.maintainers.sso);
                        $log.debug('After auth: maintainers.object:', authParams.maintainers.object);
                        if (angular.isFunction(authParams.successClbk)) {
                            authParams.successClbk(associationResp);
                        }
                    }, function () {
                        if (angular.isFunction(authParams.failureClbk)) {
                            authParams.failureClbk();
                        }
                    }
                );
            };

            webUpdatesCommons.addLinkToReferenceAttributes = function (attributes, objectSource) {
                var parser = document.createElement('a');
                return _.map(attributes, function (attribute) {
                    if (!_.isUndefined(attribute.link)) {
                        attribute.link.uiHref = _displayUrl(parser, attribute, objectSource);
                    }
                    return attribute;
                });
            };

            webUpdatesCommons.navigateToDisplay = function (objectSource, objectType, objectName, operation) {
                $state.transitionTo(STATE.DISPLAY, {
                    source: objectSource,
                    objectType: objectType,
                    name: objectName,
                    method: operation
                });
            };

            webUpdatesCommons.navigateToEdit = function (objectSource, objectType, objectName, operation) {
                $state.transitionTo(STATE.MODIFY, {
                    source: objectSource,
                    objectType: objectType,
                    name: objectName,
                    method: operation
                });
            };

            webUpdatesCommons.navigateToDelete = function (objectSource, objectType, objectName, onCancel) {
                $state.transitionTo(STATE.DELETE, {
                    source: objectSource,
                    objectType: objectType,
                    name: objectName,
                    onCancel: onCancel
                });
            };

            function _displayUrl(parser, attribute, objectSource) {
                parser.href = attribute.link.href;
                var parts = parser.pathname.split('/');

                return $state.href(STATE.DISPLAY, {
                    source: objectSource,
                    objectType: attribute['referenced-type'],
                    name: _.last(parts)
                });
            }

            return webUpdatesCommons;

        }]);
})();
