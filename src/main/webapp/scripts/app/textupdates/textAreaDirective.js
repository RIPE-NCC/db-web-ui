'use strict';

angular.module('textUpdates')
    .directive("autoHeight", function ($timeout) {
        return {
            restrict: 'A',
            link: function ($scope, element) {
                if (element[0].scrollHeight < 5) {
                    element[0].style.height = 5;
                } else {
                    element[0].style.height = (element[0].scrollHeight) + "px";
                }

                var resize = function () {
                    return element[0].style.height = "" + element[0].scrollHeight + "px";
                };

                element.on("blur keyup change", resize);
                $timeout(resize, 0);
            }
        }
    });
