'use strict';

angular.module('angular-table')
    .directive('angularTableHeader', function() {
        return {
            restrict: 'EA',
            require: '^angularTable',
            link: function(scope, iElement, iAttrs, ngModel) {

            },
            template: '<div class="angularTableHeaderColumn" ng-repeat="column in columns"></div>',
            replace: true
        }
    });

