/*global angular, document*/

(function () {
    'use strict';

    angular.module('webUpdates').service('WebUpdatesCommons', ['$state', '$log', 'WhoisResources', 'CredentialsService', 'AlertService', 'MntnerService', 'ModalService', 'STATE',

        function ($state, $log, WhoisResources, CredentialsService, AlertService, MntnerService, ModalService, STATE) {

            var webUpdatesCommons = {};

            webUpdatesCommons.performAuthentication = function (authParams) {
                // maintainers, method, objectSource, objectType, objectName, isLirObject, successCloseCallback, cancelCloseCallback
                $log.debug('Perform authentication', authParams.maintainers);
                var mntnersWithPasswords = MntnerService.getMntnersForPasswordAuthentication(authParams.maintainers.sso, authParams.maintainers.objectOriginal, authParams.maintainers.object);
                var mntnersWithoutPasswords = MntnerService.getMntnersNotEligibleForPasswordAuthentication(authParams.maintainers.sso, authParams.maintainers.objectOriginal, authParams.maintainers.object);
                // see: https://www.pivotaltracker.com/n/projects/769061
                var allowForcedDelete = !_.find(authParams.maintainers.object, function (o) {
                    return MntnerService.isNccMntner(o.key);
                });
                ModalService.openAuthenticationModal(authParams.method, authParams.object, mntnersWithPasswords, mntnersWithoutPasswords, allowForcedDelete, authParams.isLirObject).then(
                    function (result) {
                        AlertService.clearErrors();
                        var selectedMntner = result.selectedItem;
                        $log.debug('selected mntner:' + JSON.stringify(selectedMntner));
                        var associationResp = result.response;
                        $log.debug('associationResp:' + JSON.stringify(associationResp));
                        if (MntnerService.isMine(selectedMntner)) {
                            // has been successfully associated in authentication modal
                            authParams.maintainers.sso.push(selectedMntner);
                            // mark starred in selected
                            authParams.maintainers.object = MntnerService.enrichWithMine(authParams.maintainers.sso, authParams.maintainers.object);
                        }
                        $log.debug('After auth: maintainers.sso:' + JSON.stringify(authParams.maintainers.sso));
                        $log.debug('After auth: maintainers.object:' + JSON.stringify(authParams.maintainers.object));
                        if (!_.isUndefined(authParams.successClbk)) {
                            authParams.successClbk(associationResp);
                        }
                    }, function () {
                        if (!_.isUndefined(authParams.failureClbk)) {
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
