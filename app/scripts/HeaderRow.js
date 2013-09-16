'use strict';

angular.module('angular-table')
    .directive('headerRow', function() {
        return {
            restrict: 'EA',
            template: '<div ng-transclude></div>',
            link: function(scope, iElement, iAttrs) {
                scope.getHeaderColumnCountAsPercentage = function() {
                    return 100 / iElement.children().length.toString() + '%';
                };
            },
            replace: true,
            transclude: true
        }
    });
