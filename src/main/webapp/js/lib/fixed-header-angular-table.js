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
            priority: 1,
            restrict:'EA',
            transclude: false,
            replace: false,
            controller: ['$scope', 'fhatMessageBus', function($scope, fhatMessageBus) {
                $scope.fhatMessageBus = fhatMessageBus;
            }],
            compile: function compile(tElement, tAttrs, transclude) {
                return {
                    pre: function preLink(scope, iElement, iAttrs, controller) {

                    },
                    post: function postLink(scope, iElement, iAttrs, controller) {
                        // workaround (part 1) to issue: https://github.com/angular/angular.js/issues/1459
                        // ( can't use a td in a template )
                        // so, shallow (being mindful of not causing memory leaks) copy out the non $ attributes and the innerHTML
                        var attributes = {};
                        angular.forEach(iAttrs, function(value, key) {
                            if(key.indexOf('$') !== 0) { // not an angular attribute
                                attributes[key] = value; // strings should be safe to copy
                            }
                        });
                        scope.fhatMessageBus.headerColumns.push({
                            attributes: attributes,
                            innerHTML: iElement[0].innerHTML  // strings should be safe to copy
                        });
                    }
                };
            }
        };
    })

    .directive('fhatHeaderRow', function($compile) {
        return {
            restrict: 'EA',
            replace: false,
            transclude: false,
            controller: ['$scope', '$compile', '$interpolate', 'fhatMessageBus', function($scope, $compile, $interpolate, fhatMessageBus) {
                $scope.fhatMessageBus = fhatMessageBus;
                $scope.compile = $compile;
                $scope.interpolate = $interpolate;
                $scope.fhatMessageBus.headerColumns = [];
            }],
            compile: function compile(tElement, tAttrs, transclude) {
                return {
                    pre: function preLink(scope, iElement, iAttrs, controller) {

                    },
                    post: function postLink(scope, iElement, iAttrs, controller) {
                        // workaround (part 2) to issue: https://github.com/angular/angular.js/issues/1459
                        // inserting an entire table works fine, so we reassemble our rows here based on the data extracted earlier from the input dsl
                        var columns = '';

                        var convertObjectToAttributes = function(attributesAsObject) {
                            var attributesAsString = '';

                            angular.forEach(attributesAsObject, function(value, key) {
                                attributesAsString = ' ' + key + '\"' + value + '\" ';
                            });

                            return attributesAsString;
                        };

                        angular.forEach(scope.fhatMessageBus.headerColumns, function(headerColumn, index) {
                            columns += '<td class="fhatHeaderColumn" ' + convertObjectToAttributes(headerColumn.attributes) + '>' +
                            headerColumn.innerHTML +
                             '</td>';
                        });

                        var nonInterpolatedTemplate = '<table class="fhatHeaderTable"><tr class="fhatHeaderRow">' + columns + '</table></tr>';
                        var interpolationFunction = scope.interpolate(nonInterpolatedTemplate);
                        var interpolatedTemplate = interpolationFunction(scope);

                        iElement.replaceWith(interpolatedTemplate);
                    }
                };
            }
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
