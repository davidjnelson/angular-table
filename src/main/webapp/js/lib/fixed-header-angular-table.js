angular.module('fhat', [])
    .directive('fhat', ['fhatMessageBus', function(fhatMessageBus) {
        return {
            // only support elements for now to simplify the manual transclusion and replace logic.  see below.
            // this kills IE8< support for now, which is fine as that's not a use case that this directive is initially solving.
            restrict: 'E',
            // manually transclude and replace the template to work around not being able to have a template with td or tr as a root element
            // see bug: https://github.com/angular/angular.js/issues/1459
            compile: function (tElement, tAttrs) {
                fhatMessageBus.sortExpression = tAttrs.defaultSortColumn;

                // find whatever classes were passed into the fhat, and merge them with the built in classes for the container div
                tElement.addClass('fhatTableContainer');

                var rowTemplate = tElement[0].outerHTML.replace('<fhat', '<div');
                rowTemplate = rowTemplate.replace('</fhat>', '</div>');
                tElement.replaceWith(rowTemplate);

                // return linking function
                return function(scope, iElement) {
                    scope.fhatMessageBus = fhatMessageBus;

                    scope.$watch('fhatMessageBus', function(newValue, oldValue) {
                        // scroll to top when sort applied
                        var tableScrollContainer = iElement.children()[1];

                        tableScrollContainer.scrollTop = 0;
                    }, true);
                };
            },
            scope: {
                model: '='
            }
        };
    }])
    .directive('fhatHeaderRow', ['fhatManualCompiler', 'fhatMessageBus', function(fhatManualCompiler, fhatMessageBus) {
        return {
            // only support elements for now to simplify the manual transclusion and replace logic.  see below.
            // this kills IE8< support for now, which is fine as that's not a use case that this directive is initially solving.
            restrict: 'E',
            controller: ['$scope', '$parse', function($scope, $parse) {
                $scope.fhatMessageBus = fhatMessageBus;

                $scope.setSortExpression = function(columnName) {
                    fhatMessageBus.sortExpression = columnName;

                    // track sort directions by sorted column for a better ux
                    fhatMessageBus.sortDirectionToColumnMap[fhatMessageBus.sortExpression] = !fhatMessageBus.sortDirectionToColumnMap[fhatMessageBus.sortExpression];
                };
            }],
            // manually transclude and replace the template to work around not being able to have a template with td or tr as a root element
            // see bug: https://github.com/angular/angular.js/issues/1459
            compile: function (tElement, tAttrs) {
                fhatManualCompiler.compileRow(tElement, tAttrs, true);
            }
        };
    }])
    .directive('fhatRow', ['fhatManualCompiler', 'fhatMessageBus', function(fhatManualCompiler, fhatMessageBus) {
        return {
            // only support elements for now to simplify the manual transclusion and replace logic.  see below.
            // this kills IE8< support for now, which is fine as that's not a use case that this directive is initially solving.
            restrict: 'E',
            controller: ['$scope', function($scope) {
                $scope.sortExpression = fhatMessageBus.sortExpression;
                $scope.reverseSortEnabled = fhatMessageBus.reverseSortEnabled;

                $scope.handleClick = function(row, parentScopeClickHandler, selectedRowBackgroundColor) {
                    var clickHandlerFunctionName = parentScopeClickHandler.replace('(row)', '');

                    if(selectedRowBackgroundColor !== 'undefined') {
                        fhatMessageBus.previouslySelectedRow.backgroundColor = fhatMessageBus.previouslySelectedRowColor;

                        row.backgroundColor = selectedRowBackgroundColor;

                        fhatMessageBus.previouslySelectedRow = row;
                    }

                    if(clickHandlerFunctionName !== 'undefined') {
                        $scope.$parent[clickHandlerFunctionName](row);
                    }
                };
            }],
            // manually transclude and replace the template to work around not being able to have a template with td or tr as a root element
            // see bug: https://github.com/angular/angular.js/issues/1459
            compile: function (tElement, tAttrs) {
                fhatMessageBus.rowSelectedBackgroundColor = tAttrs.selectedColor;

                fhatManualCompiler.compileRow(tElement, tAttrs, false);
            }
        };
    }])
    .service('fhatManualCompiler', function() {
        var self = this;

        self.compileRow = function(tElement, tAttrs, isHeader) {
            var headerUppercase = '';
            var headerDash = ''

            if(isHeader) {
                headerUppercase = 'Header';
                headerDash = 'header-'
            }

            // find whatever classes were passed into the fhat-row, and merge them with the built in classes for the tr
            tElement.addClass('fhat' + headerUppercase + 'Row');

            // find whatever classes were passed into each fhat-column, and merge them with the built in classes for the td
            tElement.children().addClass('fhat' + headerUppercase + 'Column');

            if(isHeader) {
                angular.forEach(tElement.children(), function(childColumn, index) {
                    if(angular.element(childColumn).attr('sortable') === 'true') {
                        // add the ascending sort icon
                        angular.element(childColumn).find('fhat-sort-arrow-descending').attr('ng-show',
                            'fhatMessageBus.sortExpression == \'' + angular.element(childColumn).attr('sort-field-name') +
                            '\' && !fhatMessageBus.sortDirectionToColumnMap[\'' + angular.element(childColumn).attr('sort-field-name') + '\']').addClass('fhatDefaultSortArrowAscending');

                        // add the descending sort icon
                        angular.element(childColumn).find('fhat-sort-arrow-ascending').attr('ng-show',
                            'fhatMessageBus.sortExpression == \'' + angular.element(childColumn).attr('sort-field-name') +
                            '\' && fhatMessageBus.sortDirectionToColumnMap[\'' + angular.element(childColumn).attr('sort-field-name') + '\']').addClass('fhatDefaultSortArrowDescending');

                        // add the sort click handler
                        angular.element(childColumn).attr('ng-click', 'setSortExpression(\'' +
                            angular.element(childColumn).attr('sort-field-name') + '\')');

                        // remove the sort field name attribute from the dsl
                        angular.element(childColumn).removeAttr('sort-field-name');
                    }
                });
            }

            // replace fhat-row with tr
            var rowRegexString = 'fhat-' + headerDash + 'row';
            var rowRegex = new RegExp(rowRegexString, "g");
            var rowTemplate = tElement[0].outerHTML.replace(rowRegex, 'tr');

            // replace fhat-column with td
            var columnRegexString = 'fhat-' + headerDash + 'column';
            var columnRegex = new RegExp(columnRegexString, "g");
            rowTemplate = rowTemplate.replace(columnRegex, 'td');

            if(isHeader) {
                rowTemplate = rowTemplate.replace(/fhat-sort-arrow-descending/g, 'div');
                rowTemplate = rowTemplate.replace(/fhat-sort-arrow-ascending/g, 'div');
            } else {
                var selectedBackgroundColor = '';

                if(typeof(tAttrs.selectedColor) !== 'undefined') {
                    selectedBackgroundColor = 'style="background-color: {{ row.backgroundColor }}"';
                }

                // add the ng-repeat and row selection click handler to each row
                rowTemplate = rowTemplate.replace('<tr',
                    '<tr ng-repeat="row in model | orderBy:fhatMessageBus.sortExpression:fhatMessageBus.sortDirectionToColumnMap[fhatMessageBus.sortExpression]" ' +
                        selectedBackgroundColor + ' ng-click="handleClick(row, \'' +
                        tAttrs.onSelected + '\', \'' + tAttrs.selectedColor + '\')" ');
            }

            // wrap our rows in a table, and a container div.  the container div will manage the scrolling.
            rowTemplate = '<div class="fhat' + headerUppercase + 'TableContainer"><table class="fhat' + headerUppercase + 'Table">' + rowTemplate + '</table></div>';

            // replace the original template with the manually replaced and transcluded version
            tElement.replaceWith(rowTemplate);
        };
    })

    .service('fhatMessageBus', function() {
        var self = this;

        // store a reference to the previously selected row so we can access it without looking it up from the bound model
        self.previouslySelectedRow = {};
        self.previouslySelectedRowColor = '';

        // store the sort expression
        self.sortExpression = '';

        // store the columns sort direction mapping
        self.sortDirectionToColumnMap = {};

        return self;
    });
