'use strict';

angular.module('dbWebApp')
    .factory( 'DiffService', [
        function() {

        return {
            diff: function(before, after) {
                var dmp = new diff_match_patch();
                var diffs = dmp.diff_main(before, after);
                console.log('before and after: ' + diffs.length);
                return '';
            }
        };
    }
]);
