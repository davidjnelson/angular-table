angular.module('fhat', [])
    .directive('fhat', function factory(){
        return {
            restrict: 'EA',
            transclude: true,
            replace: true,
            scope: {
                model:'='
            },
            controller: ['$scope', 'fhatMessageBus', function($scope, fhatMessageBus) {
                $scope.fhatMessageBus = fhatMessageBus;
            }],
            template:'<div ng-transclude class="fhatContainer"></div>',
            link: function(scope, iElement, iAttr){
                scope.fhatMessageBus.model = scope.model;
            }
        };
    })

    .directive('fhatColumn', function() {
        return {
            restrict:'EA',
            replace:true,
            transclude:true,
            template:'<div class="fhatHeaderColumn"><div ng-transclude></div></div>'
        };
    })

    .directive('fhatHeaderColumn', function() {
        return {
            restrict:'EA'
        };
    })

    .directive('fhatHeaderRow', function() {
        return {
            restrict: 'EA',
            replace: true,
            template: '<div class="fhatHeaderTableContainer"><table class="fhatHeaderTable"><tbody class="fhatTableBody"><tr class="fhatHeaderRow">' +
                '<td class="fhatHeaderColumn">Id</td><td class="fhatHeaderColumn">Name</td></tr></tbody></table></div>'
        };
    })

    .directive('fhatRow', function() {
        return {
            restrict: 'EA',
            replace: true,
            controller: ['$scope', 'fhatMessageBus', function($scope, fhatMessageBus) {
                $scope.fhatMessageBus = fhatMessageBus;
            }],
            template: '<div class="fhatTableContainer"><table class="fhatTable"><tr ng-repeat="row in fhatMessageBus.model" class="fhatRow">' +
                '<td class="fhatColumn" ng-repeat="columns in row" ng-click="onSelected({ row: row})">{{ columns }}</td></tr></table></div>',
            scope: {
                onSelected: '&'
            }
        };
    })
    .service('fhatMessageBus', function() {
        var self = this;

        return self;
    });
