angular.module('fhat', [])
    .directive('fhat', function() {
        return {
            // only support elements for now to simplify the manual transclusion and replace logic.  see below.
            // this kills IE8< support for now, which is fine as that's not a use case that this directive is initially solving.
            restrict: 'E',
            // manually transclude and replace the template to work around not being able to have a template with td or tr as a root element
            // see bug: https://github.com/angular/angular.js/issues/1459
            compile: function compile(tElement, tAttrs) {
                // find whatever classes were passed into the fhat, and merge them with the built in classes for the container div
                tElement.addClass('fhatTableContainer');

                var rowTemplate = tElement[0].outerHTML.replace('<fhat', '<div');
                rowTemplate = rowTemplate.replace('</fhat>', '</div>');
                tElement.replaceWith(rowTemplate);
            },
            scope: {
                model: '='
            }
        };
    })

    .directive('fhatHeaderColumn', function() {
        return {
            priority: 1,
            restrict:'E',
            transclude: false,
            replace: false,
            controller: ['$scope', 'fhatMessageBus', function($scope, fhatMessageBus) {
                $scope.fhatMessageBus = fhatMessageBus;
            }],
            compile: function compile(tElement, tAttrs) {
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
            restrict: 'E',
            replace: false,
            transclude: false,
            controller: ['$scope', '$compile', '$interpolate', 'fhatMessageBus', function($scope, $compile, $interpolate, fhatMessageBus) {
                $scope.fhatMessageBus = fhatMessageBus;
                $scope.compile = $compile;
                $scope.interpolate = $interpolate;
                $scope.fhatMessageBus.headerColumns = [];
            }],
            compile: function compile(tElement, tAttrs) {
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
            // only support elements for now to simplify the manual transclusion and replace logic.  see below.
            // this kills IE8< support for now, which is fine as that's not a use case that this directive is initially solving.
            restrict: 'E',
            controller: ['$scope', '$parse', function($scope, $parse) {

                $scope.handleClick = function(row, parentScopeClickHandler) {
                    var clickHandlerFunctionName = parentScopeClickHandler.replace('(row)', '');

                    $scope.$parent[clickHandlerFunctionName](row);
                };
            }],
            // manually transclude and replace the template to work around not being able to have a template with td or tr as a root element
            // see bug: https://github.com/angular/angular.js/issues/1459
            compile: function compile(tElement, tAttrs) {
                // find whatever classes were passed into the fhat-row, and merge them with the built in classes for the tr
                tElement.addClass('fhatRow');

                // find whatever classes were passed into each fhat-column, and merge them with the built in classes for the td
                tElement.children().addClass('fhatColumn');

                // replace fhat-row with tr
                var rowTemplate = tElement[0].outerHTML.replace(/fhat-row/g, 'tr');

                // replace fhat-column with td
                rowTemplate = rowTemplate.replace(/fhat-column/g, 'td');

                // add the ng-repeat and row selection click handler to each row
                rowTemplate = rowTemplate.replace('<tr',
                    '<tr ng-repeat="row in model" ng-click="handleClick(row, \'' + tAttrs.onSelected + '\')" ');

                // TODO: merge the user table classes and the component table classes


                // TODO: merge the user table container div classes and the component table container div classes

                // TODO: manage the height of the table container div on load and window resize, as 100% is too big
                // given whatever padding, margin and border the user specifies to the container

                // wrap our rows in a table, and a container div.  the container div will manage the scrolling.
                rowTemplate = '<div class="fhatTableContainer"><table class="fhatTable">' + rowTemplate + '</table></div>';

                // replace the original template with the manually replaced and transcluded version
                tElement.replaceWith(rowTemplate);
            }
        };
    })
    .service('fhatMessageBus', function() {
        var self = this;

        return self;
    });
