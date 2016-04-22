'use strict';

angular.module('dbWebApp').directive('scrollmarker', ['$document', function ($document) {
        return {
            restrict: 'A',
            controller: 'CreateModifyController',
            link: function (scope, element) {
                console.log('loading directive');
                var debounced = _.debounce(function () {
                    var raw = element[0];
                    if (raw.getBoundingClientRect().top < document.documentElement.clientHeight + document.body.scrollTop) {
                        scope.showMoreAttributes();
                    }
                }, 100);
                angular.element($document).on('scroll', debounced);
            }
        };
    }]
);
