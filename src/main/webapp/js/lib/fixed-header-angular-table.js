angular.module('fhat', [])
    .directive('fhat', ['fhatScrollingContainerHeightState', 'fhatJqLiteExtension', 'fhatSortState', 'fhatResizeState',
        function(fhatScrollingContainerHeightState, fhatJqLiteExtension, fhatSortState, fhatResizeState) {
        return {
            // only support elements for now to simplify the manual transclusion and replace logic.  see below.
            restrict: 'E',
            // manually transclude and replace the template to work around not being able to have a template with td or tr as a root element
            // see bug: https://github.com/angular/angular.js/issues/1459
            compile: function (tElement, tAttrs) {
                fhatSortState.sortExpression = tAttrs.defaultSortColumn;

                // find whatever classes were passed into the fhat, and merge them with the built in classes for the container div
                tElement.addClass('fhatContainer');

                var rowTemplate = tElement[0].outerHTML.replace('<fhat', '<div');
                rowTemplate = rowTemplate.replace('</fhat>', '</div>');
                tElement.replaceWith(rowTemplate);

                // return linking function
                return function(scope, iElement) {
                    var storeComputedHeight = function() {
                        fhatScrollingContainerHeightState.outerContainerComputedHeight = fhatJqLiteExtension.getComputedHeight(iElement[0]);
                    };

                    // store the computed height on resize
                    scope.$watch('fhatResizeState', function(oldValue, newValue) {
                        storeComputedHeight();
                    });

                    // store the computed height on load
                    storeComputedHeight();
                };
            },
            scope: {
                model: '='
            }
        };
    }])
    .directive('fhatHeaderRow', ['fhatManualCompiler', 'fhatScrollingContainerHeightState', 'fhatJqLiteExtension', 'fhatSortState', 'fhatResizeState',
        function(fhatManualCompiler, fhatScrollingContainerHeightState, fhatJqLiteExtension, fhatSortState, fhatResizeState) {
        return {
            // only support elements for now to simplify the manual transclusion and replace logic.  see below.
            restrict: 'E',
            controller: ['$scope', '$parse', function($scope, $parse) {
                $scope.fhatSortState = fhatSortState;

                $scope.setSortExpression = function(columnName) {
                    // there doesn't seem to be a way to prevent the watch from firing twice, even if we do both assignments in one operation:
                    // see (by design): https://github.com/angular/angular.js/issues/1305
                    fhatSortState.sortExpression = columnName;
                    fhatSortState.sortFiring = true;

                    // track sort directions by sorted column for a better ux
                    fhatSortState.sortDirectionToColumnMap[fhatSortState.sortExpression] = !fhatSortState.sortDirectionToColumnMap[fhatSortState.sortExpression];
                };
            }],
            // manually transclude and replace the template to work around not being able to have a template with td or tr as a root element
            // see bug: https://github.com/angular/angular.js/issues/1459
            compile: function (tElement, tAttrs) {
                fhatManualCompiler.compileRow(tElement, tAttrs, true);

                // return a linking function
                return function(scope, iElement) {
                    fhatScrollingContainerHeightState.headerComputedHeight = fhatJqLiteExtension.getComputedHeight(iElement[0]);
                };
            }
        };
    }])
    .directive('fhatRow', ['fhatManualCompiler', 'fhatResizeState', '$window', 'fhatDebounce', 'fhatTemplateStaticState', 'fhatRowState', 'fhatSortState', 'fhatScrollingContainerHeightState',
        function(fhatManualCompiler, fhatResizeState, $window, fhatDebounce, fhatTemplateStaticState, fhatRowState, fhatSortState, fhatScrollingContainerHeightState) {
        return {
            // only support elements for now to simplify the manual transclusion and replace logic.  see below.
            restrict: 'E',
            controller: ['$scope', function($scope) {
                $scope.sortExpression = fhatSortState.sortExpression;

                $scope.handleClick = function(row, parentScopeClickHandler, selectedRowBackgroundColor) {
                    var clickHandlerFunctionName = parentScopeClickHandler.replace('(row)', '');

                    if(selectedRowBackgroundColor !== 'undefined') {
                        fhatRowState.previouslySelectedRow.rowSelected = false;

                        row.rowSelected = true;

                        fhatRowState.previouslySelectedRow = row;
                    }

                    if(clickHandlerFunctionName !== 'undefined') {
                        $scope.$parent[clickHandlerFunctionName](row);
                    }
                };

                $scope.getRowColor = function(index, row) {
                    if(row.rowSelected) {
                        return fhatTemplateStaticState.selectedRowColor;
                    } else {
                        if(index % 2 === 0) {
                            return fhatTemplateStaticState.evenRowColor;
                        } else {
                            return fhatTemplateStaticState.oddRowColor;
                        }
                    }
                };
            }],
            // manually transclude and replace the template to work around not being able to have a template with td or tr as a root element
            // see bug: https://github.com/angular/angular.js/issues/1459
            compile: function (tElement, tAttrs) {
                fhatRowState.rowSelectedBackgroundColor = tAttrs.selectedColor;

                fhatManualCompiler.compileRow(tElement, tAttrs, false);

                // return a linking function
                return function(scope, iElement) {
                    scope.fhatResizeState = fhatResizeState;
                    scope.fhatSortState = fhatSortState;

                    angular.element($window).bind('resize', fhatDebounce.debounce(function() {
                        // must apply since the browswer resize event is not being seen by the digest process
                        scope.$apply(function() {
                            fhatResizeState.debouncedResizeFiring = true;
                        });
                    }, 50));

                    scope.$watch('fhatResizeState', function(newValue, oldValue) {
                        // this gets called n times until the model settles.
                        // it's typically two, but processing in this function must be idempotent and shouldn't
                        // rely on it being two.

                        console.log('fhatResizeState watch handler fired');

                        if(fhatResizeState.debouncedResizeFiring) {
                            fhatResizeState.debouncedResizeFiring = false;

                            // get the padding, and border and height for the fhatContainer, which we stored earlier, and
                            // add subtract the padding, border and height of the fhatHeaderTableContainer
                            // then set the fhatTableContainer height to that value, storing it so we don't re-apply it

                            var newScrollingContainerHeight =
                                fhatScrollingContainerHeightState.outerContainerComputedHeight -
                                fhatScrollingContainerHeightState.headerComputedHeight;
                            iElement.css('height', newScrollingContainerHeight + 'px');
                        }
                    }, true);

                     scope.$watch('fhatSortState', function(newValue, oldValue) {
                        // this gets called n times until the model settles.
                        // it's typically two, but processing in this function must be idempotent and shouldn't
                        // rely on it being two.

                        console.log('fhatSortState watch handler fired');

                        // scroll to top when sort applied
                        if(fhatSortState.sortFiring) {
                            // turn off the sortFiring tracking before manipulating the dom so we don't have wasted events
                            fhatSortState.sortFiring = false;

                            iElement[0].scrollTop = 0;
                        }
                    }, true);

                    // adjust the scrolling container height when the directive initially links too
                    fhatResizeState.debouncedResizeFiring = true;
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

    .service('fhatJqLiteExtension', function() {
        var self = this;

        // NOTE: this does not support IE8<
        var getComputedStyleAsNumber = function(rawDomElement, property) {
            return parseInt(document.defaultView.getComputedStyle(rawDomElement, '').getPropertyValue(property).replace('px', ''), 10);
        };

        self.getComputedHeight = function(rawDomElement, property) {
            return getComputedStyleAsNumber(rawDomElement, 'height');
        };

        return self;
    })

    .service('fhatManualCompiler', ['fhatTemplateStaticState', function(fhatTemplateStaticState) {
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
                            'fhatSortState.sortExpression == \'' + angular.element(childColumn).attr('sort-field-name') +
                            '\' && !fhatSortState.sortDirectionToColumnMap[\'' + angular.element(childColumn).attr('sort-field-name') + '\']').addClass('fhatDefaultSortArrowAscending');

                        // add the descending sort icon
                        angular.element(childColumn).find('fhat-sort-arrow-ascending').attr('ng-show',
                            'fhatSortState.sortExpression == \'' + angular.element(childColumn).attr('sort-field-name') +
                            '\' && fhatSortState.sortDirectionToColumnMap[\'' + angular.element(childColumn).attr('sort-field-name') + '\']').addClass('fhatDefaultSortArrowDescending');

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

                fhatTemplateStaticState.selectedRowColor = tAttrs.selectedColor;
                fhatTemplateStaticState.evenRowColor = tAttrs.evenColor;
                fhatTemplateStaticState.oddRowColor = tAttrs.oddColor;

                if(typeof(tAttrs.selectedColor) !== 'undefined' || typeof(tAttrs.evenColor) !== 'undefined' || typeof(tAttrs.oddColor) !== 'undefined' ) {
                    selectedBackgroundColor = 'ng-style="{ backgroundColor: getRowColor($index, row) }"';
                }

                // add the ng-repeat and row selection click handler to each row
                rowTemplate = rowTemplate.replace('<tr',
                    '<tr ng-repeat="row in model | orderBy:fhatSortState.sortExpression:fhatSortState.sortDirectionToColumnMap[fhatSortState.sortExpression]" ' +
                        selectedBackgroundColor + ' ng-click="handleClick(row, \'' +
                        tAttrs.onSelected + '\', \'' + tAttrs.selectedColor + '\')" ');
            }

            // wrap our rows in a table, and a container div.  the container div will manage the scrolling.
            rowTemplate = '<div class="fhat' + headerUppercase + 'TableContainer"><table class="fhat' + headerUppercase + 'Table">' + rowTemplate + '</table></div>';

            // replace the original template with the manually replaced and transcluded version
            tElement.replaceWith(rowTemplate);
        };
    }])

    .service('fhatResizeState', function() {
        var self = this;

        // track the debounced window resize event
        self.debouncedResizeFiring = false;

        return self;
    })

    .service('fhatScrollingContainerHeightState', function() {
        var self = this;

        // get the padding, border and height for the outer fhatContainer which holds the header table and the rows table
        self.outerContainerComputedHeight = 0;

        // store the offset height plus margin of the header so we know what the height of the scrolling container should be.
        self.headerComputedHeight = 0;

        return self;
    })

    .service('fhatTemplateStaticState', function() {
        var self = this;

        // store selected, even and odd row background colors
        self.selectedRowColor = '';
        self.evenRowColor = '';
        self.oddRowColor = '';

        return self;
    })

    .service('fhatRowState', function() {
        var self = this;

        // store a reference to the previously selected row so we can access it without looking it up from the bound model
        self.previouslySelectedRow = {};
        self.previouslySelectedRowColor = '';

        return self;
    })

    .service('fhatSortState', function() {
        var self = this;

        // store the sort expression
        self.sortExpression = '';

        // store the columns sort direction mapping
        var self = this;

        self.sortDirectionToColumnMap = {};

        // track whether sort is firing so we can scroll the grid up to the top
        self.sortFiring = false;

        return self;
    });