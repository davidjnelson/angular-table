'use strict';

angular.module('angular-table')
    .directive('headerColumn', function() {
        return {
            restrict: 'EA',
            template: '<div class="angularTableHeaderColumn" ng-transclude style="width: {{ getHeaderColumnCountAsPercentage() }}"></div>',
            replace: true,
            transclude: true
        }
    });
