'use strict';

angular.module('angular-table')
    .directive('headerColumn', ['$compile', function($compile) {
        return {
            restrict: 'EA',
            template: '<div class="angularTableHeaderColumn" ng-style="{ width: getHeaderColumnCountAsPercentage() }"></div>',
            replace: true,
            transclude: 'element',
            compile: function(tElement, tAttrs, transclude) {
                return function(scope, iElement, iAttrs) {
                    var element = iElement; // wrap element in a closure so we can access it in the transclude function

                    transclude(scope, function(clone) {
                        if(typeof(iAttrs.defaultSortColumn) !== 'undefined') {
                            // inline styles so no css is needed for the most simplistic install
                            element.append(
                                '<div style="width: 0px; height: 0px; border-left: 5px solid transparent; border-right: 5px solid transparent; ' +
                                    'border-bottom: 7px solid black; display: inline-block; vertical-align: baseline; margin-bottom: 2px; margin-right: 2px;"></div>');
                            element.append(clone);
                        } else {
                            element.append(clone);
                        }
                    });
                }
            }
        }
    }]);
