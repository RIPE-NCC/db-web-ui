'use strict';

angular.module('dbWebApp').service('MntnerService', 'CredentialsService',[ function( CredentialsService) {

    this.extractMntnersFromObject = function() {

    };

    this.flattemMntners = function() {

    };

    this.isAuthenticationRequired = function (myMntners, selectedMntners) {
       if( _oneOfSelectedMntnersIsMine(selectedMntners) ) {
            $log.info("One of selected mntners is mine");
            return false;
        }

        if( _oneOfSelectedMntnersHasCredential(selectedMntners) ) {
            $log.info("One of selected mntners has credentials");
            return false;
        }

        return true;
    };

    function _oneOfSelectedMntnersIsMine(selectedMaintainers) {
        return _.any(selectedMaintainers, function (mntner) {
            return mntner.mine === true;
        });
    }

    function _oneOfSelectedMntnersHasCredential(selectedMaintainers) {
        if( CredentialsService.hasCredentials() ) {
            return _.any(selectedMaintainers, function (mntner) {
                return mntner.key === CredentialsService.getCredentials().successfulPassword;
            });
        }
        return false;
    }

    this.getMntnerWithPasswords = function(selected, mntnerWithPassword ) {
        return _.filter(selected, function(item) {
            return item.auth

        });
    };


}]);
