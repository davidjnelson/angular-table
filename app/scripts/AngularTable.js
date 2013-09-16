'use strict';

angular.module('angular-table')
    .directive('angularTable', function() {
        var headerRowColumnsAreDefined,
            convertObjectKeysToArray = function(listOfObjects) {
                var columnNames = [],
                    firstArrayElement = listOfObjects[0];
                for(var key in firstArrayElement) {
                    if(firstArrayElement.hasOwnProperty(key)) {
                        columnNames.push(key);
                    }
                }

                return columnNames;
            };

        return {
            restrict: 'EA',
            require: '?ngModel',
            replace: true,
            transclude: true,
            scope: {},
            template: '<div ng-transclude></div>',
            link: function(scope, iElement, iAttrs, ngModel) {
                headerRowColumnsAreDefined = function() {
                    return iElement.children().length > 0;
                };

                if(typeof(ngModel) === 'undefined') {
                    throw new Error('no model was passed via ng-model');
                }

                ngModel.$render = function() {
                    scope.model = ngModel.$viewValue;

                    // when angular 1.2 hits stable, replace this with using ng-if to load headerRow and headerColumn in the template
                    var generatedHeaderColumnNames = convertObjectKeysToArray(scope.model),
                        columnCount = 100 / generatedHeaderColumnNames.length,
                        columnCountAsPercentage = columnCount.toString(10) + '%';

                    if(!headerRowColumnsAreDefined()) {
                        var generatedHeaderColumnNames = convertObjectKeysToArray(scope.model);

                        angular.forEach(generatedHeaderColumnNames, function(columnName) {
                            iElement.append('<div class="angularTableHeaderColumn" style="width: ' + columnCountAsPercentage + ';">' + columnName + '</div>');
                        });
                    }
                };
            }
        };
    });
