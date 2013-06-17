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

    .directive('fhatHeaderRow', ['fhatManualCompiler', function(fhatManualCompiler) {
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
                fhatManualCompiler.compileRow(tElement, tAttrs, true);
            }
        };
    }])

    .directive('fhatRow', ['fhatManualCompiler', function(fhatManualCompiler) {
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

            // replace fhat-row with tr
            var rowRegexString = 'fhat-' + headerDash + 'row';
            var rowRegex = new RegExp(rowRegexString, "g");
            var rowTemplate = tElement[0].outerHTML.replace(rowRegex, 'tr');

            // replace fhat-column with td
            var columnRegexString = 'fhat-' + headerDash + 'column';
            var columnRegex = new RegExp(columnRegexString, "g");
            rowTemplate = rowTemplate.replace(columnRegex, 'td');

            if(isHeader) {

            } else {
                // add the ng-repeat and row selection click handler to each row
                rowTemplate = rowTemplate.replace('<tr',
                    '<tr ng-repeat="row in model" ng-click="handleClick(row, \'' + tAttrs.onSelected + '\')" ');
            }

            // wrap our rows in a table, and a container div.  the container div will manage the scrolling.
            rowTemplate = '<div class="fhat' + headerUppercase + 'TableContainer"><table class="fhat' + headerUppercase + 'Table">' + rowTemplate + '</table></div>';

            // replace the original template with the manually replaced and transcluded version
            tElement.replaceWith(rowTemplate);
        };
    })

    .service('fhatMessageBus', function() {
        var self = this;

        return self;
    });
