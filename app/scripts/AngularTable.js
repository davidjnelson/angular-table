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
            template: '<div></div>',
            compile: function(tElement, tAttrs) {
                headerRowColumnsAreDefined = function() {
                    return tElement.children().length > 0;
                };

                return function(scope, iElement, iAttrs, ngModel) {
                    ngModel.$render = function() {
                        scope.model = ngModel.$viewValue;

                        if(!headerRowColumnsAreDefined()) {
                            var generatedHeaderColumnNames = convertObjectKeysToArray(scope.model),
                                columnCount = 100 / generatedHeaderColumnNames.length,
                                columnCountAsPercentage = columnCount.toString(10) + '%';

                            angular.forEach(generatedHeaderColumnNames, function(columnName) {
                                iElement.append('<div class="angularTableHeaderColumn" style="width: ' + columnCountAsPercentage + ';">' + columnName + '</div>');
                            });
                        }
                    };
                }
            }
        };
    });
