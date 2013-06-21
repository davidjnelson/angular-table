angular.module('angular-table', [])
    .directive('angularTable', ['ScrollingContainerHeightState', 'JqLiteExtension', 'SortState', 'ResizeHeightEvent', 'TemplateStaticState', 'Instrumentation',
        function(ScrollingContainerHeightState, JqLiteExtension, SortState, ResizeHeightEvent, TemplateStaticState, Instrumentation) {
        return {
            // only support elements for now to simplify the manual transclusion and replace logic.
            restrict: 'E',
            // manually transclude and replace the template to work around not being able to have a template with td or tr as a root element
            // see bug: https://github.com/angular/angular.js/issues/1459
            compile: function (tElement, tAttrs) {
                SortState.sortExpression = tAttrs.defaultSortColumn;
                TemplateStaticState.instrumentationEnabled = tAttrs.instrumentationEnabled;

                // find whatever classes were passed into the angular-table, and merge them with the built in classes for the container div
                tElement.addClass('angularTableContainer');

                var rowTemplate = tElement[0].outerHTML.replace('<angular-table', '<div');
                rowTemplate = rowTemplate.replace('</angular-table>', '</div>');
                tElement.replaceWith(rowTemplate);

                // return linking function
                return function(scope, iElement) {
                    scope.ResizeHeightEvent = ResizeHeightEvent;

                    var storeComputedHeight = function() {
                        ScrollingContainerHeightState.outerContainerComputedHeight = iElement[0].clientHeight; //JqLiteExtension.getComputedPropertyAsFloat(iElement[0], 'height');
                        Instrumentation.log('angularTable', 'outer container computed height measured', ScrollingContainerHeightState.outerContainerComputedHeight);
                    };

                    // store the computed height on resize
                    // watches get called n times until the model settles. it's typically one or two, but processing in the functions
                    // must be idempotent and as such shouldn't rely on it being any specific number.
                    scope.$watch('ResizeHeightEvent', function() {
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
    .directive('headerRow', ['ManualCompiler', 'ScrollingContainerHeightState', 'JqLiteExtension', 'SortState', 'ResizeHeightEvent', 'ScrollingContainerWidthState', 'Instrumentation',
        function(ManualCompiler, ScrollingContainerHeightState, JqLiteExtension, SortState, ResizeHeightEvent, ScrollingContainerWidthState, Instrumentation) {
        return {
            // only support elements for now to simplify the manual transclusion and replace logic.
            restrict: 'E',
            controller: ['$scope', '$parse', function($scope, $parse) {
                $scope.SortState = SortState;

                $scope.setSortExpression = function(columnName) {
                    SortState.sortExpression = columnName;

                    // track sort directions by sorted column for a better ux
                    SortState.sortDirectionToColumnMap[SortState.sortExpression] = !SortState.sortDirectionToColumnMap[SortState.sortExpression];
                };
            }],
            // manually transclude and replace the template to work around not being able to have a template with td or tr as a root element
            // see bug: https://github.com/angular/angular.js/issues/1459
            compile: function (tElement, tAttrs) {
                ManualCompiler.compileRow(tElement, tAttrs, true);

                // return a linking function
                return function(scope, iElement) {
                    scope.ResizeHeightEvent = ResizeHeightEvent;
                    scope.ScrollingContainerWidthState = ScrollingContainerWidthState;

                    var storeComputedHeight = function() {
                        ScrollingContainerHeightState.headerComputedHeight = JqLiteExtension.getComputedHeightAsFloat(iElement[0]);
                        Instrumentation.log('headerRow', 'header computed height measured', ScrollingContainerHeightState.headerComputedHeight);
                    };

                    // store the computed height on resize
                    // watches get called n times until the model settles. it's typically one or two, but processing in the functions
                    // must be idempotent and as such shouldn't rely on it being any specific number.
                    scope.$watch('ResizeHeightEvent', function() {
                        storeComputedHeight();
                    }, true);

                    // update the header width when the scrolling container's width changes due to a scrollbar appearing
                    // watches get called n times until the model settles. it's typically one or two, but processing in the functions
                    // must be idempotent and as such shouldn't rely on it being any specific number.
                    scope.$watch('ScrollingContainerWidthState', function(newValue) {
                        iElement.css('width', newValue.scrollingContainerComputedWidth + 'px');
                        Instrumentation.log('headerRow', 'header width set', newValue.scrollingContainerComputedWidth + 'px');
                    }, true);

                    // store the computed height on load
                    storeComputedHeight();
                };
            }
        };
    }])
    .directive('row', ['ManualCompiler', 'ResizeHeightEvent', '$window', 'Debounce', 'TemplateStaticState', 'RowState', 'SortState',
        'ScrollingContainerHeightState', 'ScrollingContainerWidthState', 'JqLiteExtension', 'Instrumentation',
        function(ManualCompiler, ResizeHeightEvent, $window, Debounce, TemplateStaticState, RowState, SortState, ScrollingContainerHeightState,
            ScrollingContainerWidthState, JqLiteExtension, Instrumentation) {
        return {
            // only support elements for now to simplify the manual transclusion and replace logic.
            restrict: 'E',
            controller: ['$scope', function($scope) {
                $scope.sortExpression = SortState.sortExpression;

                $scope.handleClick = function(row, parentScopeClickHandler, selectedRowBackgroundColor) {
                    var clickHandlerFunctionName = parentScopeClickHandler.replace('(row)', '');

                    if(selectedRowBackgroundColor !== 'undefined') {
                        RowState.previouslySelectedRow.rowSelected = false;

                        row.rowSelected = true;

                        RowState.previouslySelectedRow = row;
                    }

                    if(clickHandlerFunctionName !== 'undefined') {
                        $scope.$parent[clickHandlerFunctionName](row);
                    }
                };

                $scope.getRowColor = function(index, row) {
                    if(row.rowSelected) {
                        return TemplateStaticState.selectedRowColor;
                    } else {
                        if(index % 2 === 0) {
                            return TemplateStaticState.evenRowColor;
                        } else {
                            return TemplateStaticState.oddRowColor;
                        }
                    }
                };
            }],
            // manually transclude and replace the template to work around not being able to have a template with td or tr as a root element
            // see bug: https://github.com/angular/angular.js/issues/1459
            compile: function (tElement, tAttrs) {
                RowState.rowSelectedBackgroundColor = tAttrs.selectedColor;

                ManualCompiler.compileRow(tElement, tAttrs, false);

                // return a linking function
                return function(scope, iElement) {
                    scope.ScrollingContainerHeightState = ScrollingContainerHeightState;
                    scope.SortState = SortState;

                    var storeComputedWidth = function() {
                        ScrollingContainerWidthState.scrollingContainerComputedWidth = JqLiteExtension.getComputedWidthAsFloat(iElement[0]);
                        Instrumentation.log('row', 'scrolling container width measured', ScrollingContainerWidthState.scrollingContainerComputedWidth);
                    };

                    angular.element($window).bind('resize', Debounce.debounce(function() {
                        // must apply since the browser resize event is not being seen by the digest process
                        scope.$apply(function() {
                            storeComputedWidth();

                            // flip the boolean to trigger the watches
                            ResizeHeightEvent.fireTrigger = !ResizeHeightEvent.fireTrigger;
                            Instrumentation.log('row', 'debounced window resize triggered');
                        });
                    }, 50));

                    // when the computed height for the angularTableContainer and angularTableHeaderTableContainer change,
                    // set the angularTableTableContainer height to angularTableContainer computed height - angularTableHeaderTableContainer computed height
                    // watches get called n times until the model settles. it's typically one or two, but processing in the functions
                    // must be idempotent and as such shouldn't rely on it being any specific number.
                    scope.$watch('ScrollingContainerHeightState', function() {
                        var newScrollingContainerHeight =
                            ScrollingContainerHeightState.outerContainerComputedHeight -
                            ScrollingContainerHeightState.headerComputedHeight;
                        iElement.css('height', newScrollingContainerHeight + 'px');
                        Instrumentation.log('row', 'scrolling container height set', newScrollingContainerHeight + 'px');
                    }, true);

                    // scroll to top when sort applied
                    // watches get called n times until the model settles. it's typically one or two, but processing in the functions
                    // must be idempotent and as such shouldn't rely on it being any specific number.
                    scope.$watch('SortState', function() {
                        iElement[0].scrollTop = 0;
                    }, true);

                    // check for scrollbars and adjust the header table width, and scrolling table height as needed when the number of bound rows changes
                    scope.$watch('model', function(newValue, oldValue) {
                        storeComputedWidth();
                    }, true);
                };
            }
        };
    }])

    .service('Debounce', function() {
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

    .service('JqLiteExtension', ['$window', function($window) {
        var self = this;

        // TODO: make this work with IE8<, android 3<, and ios4<: http://caniuse.com/getcomputedstyle
        self.getComputedPropertyAsFloat = function(rawDomElement, property) {
            var computedValueAsString = $window.getComputedStyle(rawDomElement).getPropertyValue(property).replace('px', '');
            return parseFloat(computedValueAsString);
        };

        self.getComputedWidthAsFloat = function(rawDomElement) {
            return self.getComputedPropertyAsFloat(rawDomElement, 'width');
        };

        self.getComputedHeightAsFloat = function(rawDomElement) {
            return self.getComputedPropertyAsFloat(rawDomElement, 'height');
        };

        return self;
    }])

    .service('ManualCompiler', ['TemplateStaticState', function(TemplateStaticState) {
        var self = this;

        self.compileRow = function(tElement, tAttrs, isHeader) {
            var headerUppercase = '';
            var headerDash = ''

            if(isHeader) {
                headerUppercase = 'Header';
                headerDash = 'header-'
            }

            // find whatever classes were passed into the row, and merge them with the built in classes for the tr
            tElement.addClass('angularTable' + headerUppercase + 'Row');

            // find whatever classes were passed into each column, and merge them with the built in classes for the td
            tElement.children().addClass('angularTable' + headerUppercase + 'Column');

            if(isHeader) {
                angular.forEach(tElement.children(), function(childColumn, index) {
                    if(angular.element(childColumn).attr('sortable') === 'true') {
                        // add the ascending sort icon
                        angular.element(childColumn).find('sort-arrow-descending').attr('ng-show',
                            'SortState.sortExpression == \'' + angular.element(childColumn).attr('sort-field-name') +
                            '\' && !SortState.sortDirectionToColumnMap[\'' + angular.element(childColumn).attr('sort-field-name') + '\']').addClass('angularTableDefaultSortArrowAscending');

                        // add the descending sort icon
                        angular.element(childColumn).find('sort-arrow-ascending').attr('ng-show',
                            'SortState.sortExpression == \'' + angular.element(childColumn).attr('sort-field-name') +
                            '\' && SortState.sortDirectionToColumnMap[\'' + angular.element(childColumn).attr('sort-field-name') + '\']').addClass('angularTableDefaultSortArrowDescending');

                        // add the sort click handler
                        angular.element(childColumn).attr('ng-click', 'setSortExpression(\'' +
                            angular.element(childColumn).attr('sort-field-name') + '\')');

                        // remove the sort field name attribute from the dsl
                        angular.element(childColumn).removeAttr('sort-field-name');
                    }
                });
            }

            // replace row with tr
            if(isHeader) {
                var rowTemplate = tElement[0].outerHTML.replace('<header-row', '<tr');
                rowTemplate = rowTemplate.replace('/header-row>', '/tr>')
            } else {
                var rowTemplate = tElement[0].outerHTML.replace('<row', '<tr');
                rowTemplate = rowTemplate.replace('/row>', '/tr>')
            }

            // replace column with td
            var columnRegexString = headerDash + 'column';
            var columnRegex = new RegExp(columnRegexString, "g");
            rowTemplate = rowTemplate.replace(columnRegex, 'td');

            if(isHeader) {
                rowTemplate = rowTemplate.replace(/sort-arrow-descending/g, 'div');
                rowTemplate = rowTemplate.replace(/sort-arrow-ascending/g, 'div');
            } else {
                var selectedBackgroundColor = '';

                TemplateStaticState.selectedRowColor = tAttrs.selectedColor;
                TemplateStaticState.evenRowColor = tAttrs.evenColor;
                TemplateStaticState.oddRowColor = tAttrs.oddColor;

                if(typeof(tAttrs.selectedColor) !== 'undefined' || typeof(tAttrs.evenColor) !== 'undefined' || typeof(tAttrs.oddColor) !== 'undefined' ) {
                    selectedBackgroundColor = 'ng-style="{ backgroundColor: getRowColor($index, row) }"';
                }

                // add the ng-repeat and row selection click handler to each row
                rowTemplate = rowTemplate.replace('<tr',
                    '<tr ng-repeat="row in model | orderBy:SortState.sortExpression:SortState.sortDirectionToColumnMap[SortState.sortExpression]" ' +
                        selectedBackgroundColor + ' ng-click="handleClick(row, \'' +
                        tAttrs.onSelected + '\', \'' + tAttrs.selectedColor + '\')" ');
            }

            // wrap our rows in a table, and a container div.  the container div will manage the scrolling.
            rowTemplate = '<div class="angularTable' + headerUppercase + 'TableContainer"><table class="angularTable' + headerUppercase + 'Table">' + rowTemplate + '</table></div>';

            // replace the original template with the manually replaced and transcluded version
            tElement.replaceWith(rowTemplate);
        };
    }])

    .service('ResizeHeightEvent', function() {
        var self = this;

        // flip a boolean to indicate resize occured.  the value of the property has no meaning.
        self.fireTrigger = false;

        return self;
    })

     .service('ScrollingContainerWidthState', function() {
        var self = this;

        // get the computed width for the outer angularTableTableContainer
        self.scrollingContainerComputedWidth = 0;

        return self;
    })

    .service('ScrollingContainerHeightState', function() {
        var self = this;

        // get the padding, border and height for the outer angularTableContainer which holds the header table and the rows table
        self.outerContainerComputedHeight = 0;

        // store the offset height plus margin of the header so we know what the height of the scrolling container should be.
        self.headerComputedHeight = 0;

        return self;
    })

    .service('TemplateStaticState', function() {
        var self = this;

        // store selected, even and odd row background colors
        self.selectedRowColor = '';
        self.evenRowColor = '';
        self.oddRowColor = '';

        return self;
    })

    .service('RowState', function() {
        var self = this;

        // store a reference to the previously selected row so we can access it without looking it up from the bound model
        self.previouslySelectedRow = {};
        self.previouslySelectedRowColor = '';

        return self;
    })

    .service('SortState', function() {
        var self = this;

        // store the sort expression
        self.sortExpression = '';

        // store the columns sort direction mapping
        self.sortDirectionToColumnMap = {};

        return self;
    })

    .service('Instrumentation', ['TemplateStaticState', '$log', function(TemplateStaticState, $log) {
        var self = this;
        self.log = function(source, event, value) {
            if(TemplateStaticState.instrumentationEnabled) {
                $log.log('Source: ' + source);
                $log.log('Event: ' + event);
                $log.log('Value: ' + value);
                $log.log('------------------------\n');
            }
        };

        return self;
    }]);