angular.module('fhat', [])
    .directive('fhat', ['fhatMessageBus', function(fhatMessageBus) {
        return {
            // only support elements for now to simplify the manual transclusion and replace logic.  see below.
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
            },
            scope: {
                model: '='
            }
        };
    }])
    .directive('fhatHeaderRow', ['fhatManualCompiler', 'fhatMessageBus', function(fhatManualCompiler, fhatMessageBus) {
        return {
            // only support elements for now to simplify the manual transclusion and replace logic.  see below.
            restrict: 'E',
            controller: ['$scope', '$parse', function($scope, $parse) {
                $scope.fhatMessageBus = fhatMessageBus;

                $scope.setSortExpression = function(columnName) {
                    // there doesn't seem to be a way to prevent the watch from firing twice, even if we do both assignments in one operation:
                    // see (by design): https://github.com/angular/angular.js/issues/1305
                    fhatMessageBus.sortExpression = columnName;
                    fhatMessageBus.sortFiring = true;

                    // track sort directions by sorted column for a better ux
                    fhatMessageBus.sortDirectionToColumnMap[fhatMessageBus.sortExpression] = !fhatMessageBus.sortDirectionToColumnMap[fhatMessageBus.sortExpression];
                };
            }],
            // manually transclude and replace the template to work around not being able to have a template with td or tr as a root element
            // see bug: https://github.com/angular/angular.js/issues/1459
            compile: function (tElement, tAttrs) {
                fhatManualCompiler.compileRow(tElement, tAttrs, true);

                // return a linking function
                return function(scope, iElement) {
                    // unfortunately, angular's jqlite has no implemented computed properties, so we can't just call css('height')
                    fhatMessageBus.headerOffsetHeight = iElement[0].offsetHeight;
                };
            }
        };
    }])
    .directive('fhatRow', ['fhatManualCompiler', 'fhatMessageBus', 'fhatDebouncedResizer', '$window', 'fhatDebounce',
        function(fhatManualCompiler, fhatMessageBus, fhatDebouncedResizer, $window, fhatDebounce) {
        return {
            // only support elements for now to simplify the manual transclusion and replace logic.  see below.
            restrict: 'E',
            controller: ['$scope', function($scope) {
                $scope.sortExpression = fhatMessageBus.sortExpression;

                $scope.handleClick = function(row, parentScopeClickHandler, selectedRowBackgroundColor) {
                    var clickHandlerFunctionName = parentScopeClickHandler.replace('(row)', '');

                    if(selectedRowBackgroundColor !== 'undefined') {
                        fhatMessageBus.previouslySelectedRow.rowSelected = false;

                        row.rowSelected = true;

                        fhatMessageBus.previouslySelectedRow = row;
                    }

                    if(clickHandlerFunctionName !== 'undefined') {
                        $scope.$parent[clickHandlerFunctionName](row);
                    }
                };

                $scope.getRowColor = function(index, row) {
                    if(row.rowSelected) {
                        return fhatMessageBus.selectedRowColor;
                    } else {
                        if(index % 2 === 0) {
                            return fhatMessageBus.evenRowColor;
                        } else {
                            return fhatMessageBus.oddRowColor;
                        }
                    }
                };
            }],
            // manually transclude and replace the template to work around not being able to have a template with td or tr as a root element
            // see bug: https://github.com/angular/angular.js/issues/1459
            compile: function (tElement, tAttrs) {
                fhatMessageBus.rowSelectedBackgroundColor = tAttrs.selectedColor;

                fhatManualCompiler.compileRow(tElement, tAttrs, false);

                // return a linking function
                return function(scope, iElement) {
                    scope.fhatMessageBus = fhatMessageBus;

                    fhatDebounce.debounce()

                    angular.element($window).bind('resize', fhatDebounce.debounce(function() {
                        // must apply since the browswer resize event is not being seen by the digest process
                        scope.$apply(function() {
                            fhatMessageBus.debouncedResizeFiring = true;
                        });
                    }, 50));

                    scope.resizeScrollingContainerHeight = function() {
                        var scrollingContainerHeight = iElement[0].clientHeight - fhatMessageBus.headerOffsetHeight + 'px';

                        iElement.css('height', scrollingContainerHeight);
                    };

                    scope.$watch('fhatMessageBus', function(newValue, oldValue) {
                        console.log('watch handler fired');

                        if(fhatMessageBus.debouncedResizeFiring) {
                            fhatMessageBus.debouncedResizeFiring = false;
                            scope.resizeScrollingContainerHeight();
                        }

                        // scroll to top when sort applied
                        if(fhatMessageBus.sortFiring) {
                            // turn off the sortFiring tracking before manipulating the dom so we don't have wasted events
                            fhatMessageBus.sortFiring = false;

                            iElement[0].scrollTop = 0;
                        }
                    }, true);

                    // adjust the scrolling container height when the directive initially links too
                    scope.resizeScrollingContainerHeight();
                };
            }
        };
    }])

    .service('fhatDebounce', function() {
        var self = this;

        // debounce() method is slightly modified version of:
        // Underscore.js 1.4.4
        // http://underscorejs.org
        // (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
        // Underscore may be freely distributed under the MIT license.
        self.debounce = function(func, wait, immediate) {
            var timeout,
                result;

            return function() {
                var context = this,
                    args = arguments,
                    callNow = immediate && !timeout;

                var later = function() {
                    timeout = null;

                    if (!immediate) {
                        result = func.apply(context, args);
                    }
                };

                clearTimeout(timeout);
                timeout = setTimeout(later, wait);

                if (callNow) {
                    result = func.apply(context, args);
                }

                return result;
            };
        };

        return self;
    })

    .service('fhatDebouncedResizer', function() {
        var self = this;

        self.calculateScrollingContainerHeight = function() {
            // algorithm: take container height, and subtract by the first column in the header tables height, padding, margin and border combined
            return 432;
        };

        return self;
    })

        /*
    .service('fhatJqLiteExtension', function() {
        var self = this;

        self.

        return self;
    })*/

    .service('fhatManualCompiler', ['fhatMessageBus', function(fhatMessageBus) {
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

                fhatMessageBus.selectedRowColor = tAttrs.selectedColor;
                fhatMessageBus.evenRowColor = tAttrs.evenColor;
                fhatMessageBus.oddRowColor = tAttrs.oddColor;

                if(typeof(tAttrs.selectedColor) !== 'undefined' || typeof(tAttrs.evenColor) !== 'undefined' || typeof(tAttrs.oddColor) !== 'undefined' ) {
                    selectedBackgroundColor = 'ng-style="{ backgroundColor: getRowColor($index, row) }"';
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
    }])

    // be mindful of what is stored here, there is a watch tracking the properties of the singleton this returns.
    .service('fhatMessageBus', function() {
        var self = this;

        // store a reference to the previously selected row so we can access it without looking it up from the bound model
        self.previouslySelectedRow = {};
        self.previouslySelectedRowColor = '';

        // store the sort expression
        self.sortExpression = '';

        // store the columns sort direction mapping
        self.sortDirectionToColumnMap = {};

        // store selected, even and odd row background colors
        self.selectedRowColor = '';
        self.evenRowColor = '';
        self.oddRowColor = '';

        // track whether sort is firing so we can scroll the grid up to the top
        self.sortFiring = false;

        // store the offset height of the header so we know what the height of the scrolling container should be.
        self.headerOffsetHeight = 0;

        // track the debounced window resize event
        self.debouncedResizeFiring = false;

        return self;
    });
