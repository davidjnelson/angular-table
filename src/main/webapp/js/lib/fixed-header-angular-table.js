angular.module('fhat', [])
    .directive('fhat', ['fhatScrollingContainerHeightState', 'fhatJqLiteExtension', 'fhatSortState', 'fhatResizeState', 'fhatTemplateStaticState',
        function(fhatScrollingContainerHeightState, fhatJqLiteExtension, fhatSortState, fhatResizeState, fhatTemplateStaticState) {
        return {
            // only support elements for now to simplify the manual transclusion and replace logic.
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
                    scope.fhatResizeState = fhatResizeState;

                    var storeComputedHeight = function() {
                        fhatScrollingContainerHeightState.outerContainerComputedHeight = fhatJqLiteExtension.getComputedHeightAsFloat(iElement[0]);
                    };

                    // store the computed height on resize
                    // watches get called n times until the model settles. it's typically one or two, but processing in the functions
                    // must be idempotent and as such shouldn't rely on it being any specific number.
                    scope.$watch('fhatResizeState', function(oldValue, newValue) {
                        console.log('fhatResizeState watch handler fired');

                        storeComputedHeight();
                    }, true);

                    // store the computed height on load
                    storeComputedHeight();
                };
            },
            scope: {
                model: '='
            }
        };
    }])
    .directive('fhatHeaderRow', ['fhatManualCompiler', 'fhatScrollingContainerHeightState', 'fhatJqLiteExtension', 'fhatSortState', 'fhatResizeState', 'fhatScrollingContainerWidthState',
        function(fhatManualCompiler, fhatScrollingContainerHeightState, fhatJqLiteExtension, fhatSortState, fhatResizeState, fhatScrollingContainerWidthState) {
        return {
            // only support elements for now to simplify the manual transclusion and replace logic.
            restrict: 'E',
            controller: ['$scope', '$parse', function($scope, $parse) {
                $scope.fhatSortState = fhatSortState;

                $scope.setSortExpression = function(columnName) {
                    fhatSortState.sortExpression = columnName;

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
                    scope.fhatResizeState = fhatResizeState;
                    scope.fhatScrollingContainerWidthState = fhatScrollingContainerWidthState;

                    var storeComputedHeight = function() {
                        fhatScrollingContainerHeightState.headerComputedHeight = fhatJqLiteExtension.getComputedHeightAsFloat(iElement[0]);
                    };

                    // store the computed height on resize
                    // watches get called n times until the model settles. it's typically one or two, but processing in the functions
                    // must be idempotent and as such shouldn't rely on it being any specific number.
                    scope.$watch('fhatResizeState', function(oldValue, newValue) {
                        console.log('fhatResizeState watch handler fired');

                        storeComputedHeight();
                    }, true);

                    // update the header width when the scrolling container's width changes due to a scrollbar appearing
                    // watches get called n times until the model settles. it's typically one or two, but processing in the functions
                    // must be idempotent and as such shouldn't rely on it being any specific number.
                    scope.$watch('fhatScrollingContainerWidthState', function(newValue, oldValue) {
                        iElement.css('width', newValue.scrollingContainerComputedWidth + 'px');
                    }, true);

                    // store the computed height on load
                    storeComputedHeight();
                };
            }
        };
    }])
    .directive('fhatRow', ['fhatManualCompiler', 'fhatResizeState', '$window', 'fhatDebounce', 'fhatTemplateStaticState', 'fhatRowState', 'fhatSortState',
        'fhatScrollingContainerHeightState', 'fhatScrollingContainerWidthState', 'fhatJqLiteExtension',
        function(fhatManualCompiler, fhatResizeState, $window, fhatDebounce, fhatTemplateStaticState, fhatRowState, fhatSortState, fhatScrollingContainerHeightState,
            fhatScrollingContainerWidthState, fhatJqLiteExtension) {
        return {
            // only support elements for now to simplify the manual transclusion and replace logic.
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
                    scope.fhatScrollingContainerHeightState = fhatScrollingContainerHeightState;
                    scope.fhatSortState = fhatSortState;

                    var storeComputedWidth = function() {
                        fhatScrollingContainerWidthState.scrollingContainerComputedWidth = fhatJqLiteExtension.getComputedWidthAsFloat(iElement[0]);
                    };

                    angular.element($window).bind('resize', fhatDebounce.debounce(function() {
                        // don't need to apply since we're just reading the dom
                        storeComputedWidth();

                        // must apply since the browser resize event is not being seen by the digest process
                        scope.$apply(function() {
                            // flip the boolean to trigger the watches
                            fhatResizeState.debouncedResizeFiring = !fhatResizeState.debouncedResizeFiring;
                        });
                    }, 50));

                    // when the computed height for the fhatContainer and fhatHeaderTableContainer change,
                    // set the fhatTableContainer height to fhatContainer computed height - fhatHeaderTableContainer computed height
                    // watches get called n times until the model settles. it's typically one or two, but processing in the functions
                    // must be idempotent and as such shouldn't rely on it being any specific number.
                    scope.$watch('fhatScrollingContainerHeightState', function(newValue, oldValue) {
                        console.log('fhatScrollingContainerHeightState watch handler fired');

                        var newScrollingContainerHeight =
                            fhatScrollingContainerHeightState.outerContainerComputedHeight -
                            fhatScrollingContainerHeightState.headerComputedHeight;
                        iElement.css('height', newScrollingContainerHeight + 'px');
                    }, true);

                    // scroll to top when sort applied
                    // watches get called n times until the model settles. it's typically one or two, but processing in the functions
                    // must be idempotent and as such shouldn't rely on it being any specific number.
                    scope.$watch('fhatSortState', function(newValue, oldValue) {
                        console.log('fhatSortState watch handler fired');

                        iElement[0].scrollTop = 0;
                    }, true);

                    // check for scrollbars and adjust the header table width as needed when the number of bound rows changes
                    scope.$watch('model', function(newValue, oldValue) {
                        storeComputedWidth();
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

    .service('fhatJqLiteExtension', ['$window', function($window) {
        var self = this;

        // TODO: make this work with IE8<, android 3<, and ios4<: http://caniuse.com/getcomputedstyle
        var getComputedStyleAsFloat = function(rawDomElement, property) {
            var computedValueAsString = $window.getComputedStyle(rawDomElement).getPropertyValue(property).replace('px', '');
            return parseFloat(computedValueAsString);
        };

        self.getComputedHeightAsFloat = function(rawDomElement) {
            return getComputedStyleAsFloat(rawDomElement, 'height');
        };

        self.getComputedWidthAsFloat = function(rawDomElement) {
            return getComputedStyleAsFloat(rawDomElement, 'width');
        };

        return self;
    }])

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

        // flip a boolean to indicate resize occured.  the value of the property has no meaning.
        self.debouncedResizeFiring = false;

        return self;
    })

     .service('fhatScrollingContainerWidthState', function() {
        var self = this;

        // get the computed width for the outer fhatTableContainer
        self.scrollingContainerComputedWidth = 0;

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
        self.sortDirectionToColumnMap = {};

        return self;
    });