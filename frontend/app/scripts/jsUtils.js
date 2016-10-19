/*global*/

(function () {
    'use strict';

    angular.module('dbWebApp').service('jsUtilService',
        function () {

            this.checkTypes = checkTypes;
            this.typeOf = typeOf;

            /**
             * Checks the types of args against an array of expected JS types and throws a
             * TypeError if not. Uses the types returned by jsUtilService.typeOf(obj) rather
             * than Javascript's own.
             *
             * @param args JS built-in 'arguments'
             * @param types String array of type names returned by typeOf
             */
            function checkTypes(args, types) {
                args = [].slice.call(args);
                for (var i = 0; i < types.length; ++i) {
                    if (typeOf(args[i]) !== types[i]) {
                        throw new TypeError([
                            'checkTypes: param ', i,
                            ' must be of type ', types[i],
                            ' but was ', typeOf(args[i])
                        ].join(''));
                    }
                }
            }

            /**
             * Returns a string which describes the /internal/ Javascript name for the type, rather
             * than the one which comes from 'typeof'. This way we can identify a much wider range
             * of objects.
             *
             * @param obj Any JS object
             * @returns {string} Description of the JS type
             */
            function typeOf(obj) {
                return {}.toString.call(obj).match(/\s(\w+)/)[1].toLowerCase();
            }

        });
})();
