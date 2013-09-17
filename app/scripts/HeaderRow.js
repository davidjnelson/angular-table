'use strict';

angular.module('angular-table')
    .directive('headerRow', function() {
        return {
            restrict: 'EA',
            template: '<div ng-transclude></div>',
            compile: function(tElement, tAttrs, transclude) {
                return function(scope, iElement, iAttrs) {
                    transclude(scope, function(clone) {
                        var defaultSortColumnCount = 0;

                        angular.forEach(clone, function(element) {
                            if(typeof(angular.element(element).attr('default-sort-column')) !== 'undefined') {
                                defaultSortColumnCount++;

                                if(defaultSortColumnCount > 1) {
                                    throw new Error('only one header-column may have a default-sort-column specified');
                                }
                            }
                        });
                    });

                    scope.getHeaderColumnCountAsPercentage = function() {
                        return 100 / iElement.children().length.toString() + '%';
                    };
                }
            },
            replace: true,
            transclude: true
        }
    });
