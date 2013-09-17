'use strict';

describe('Header', function() {
    var $compile,
        $rootScope,
        $controller,
        renderDirective = function(template) {
            var directiveConsumer = angular.element(template);
            var linkingFunction = $compile(directiveConsumer);
            var linkedElement = linkingFunction($rootScope);
            $rootScope.$digest();

            return linkedElement;
        },
        linkedElement;

    beforeEach(module('angular-table'));

    beforeEach(inject(function(_$compile_, _$rootScope_, _$controller_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $controller = _$controller_;
    }));

    it('should throw an exception about a missing model if the model is missing', function() {
        var exceptionMessage;

        try {
            linkedElement = renderDirective('<angular-table></angular-table>');
        } catch(exception) {
            exceptionMessage = exception.message;
        }

        expect(exceptionMessage).toEqual('no model was passed via ng-model');
    });

    describe('when header rows are defined', function() {
        describe('parent scope', function() {
            it('should be accessible from within the header columns', function() {
                $controller(function($scope) {
                    $scope.returnString = function() {
                        return 'test';
                    };
                }, {
                    $scope: $rootScope
                });

                linkedElement = renderDirective(
                    '<angular-table ng-init="boundModel = [ { name: \'Sharon\' } ]" ng-model="boundModel">' +
                        '<header-row><header-column>{{ returnString() }}</header-column></header-row></angular-table>');

                expect(linkedElement.find('.angularTableHeaderColumn').eq(0).text()).toEqual('test');
            });
        });

        describe('when one column header is present in the directive consumer template', function() {
            beforeEach(function() {
                linkedElement = renderDirective(
                    '<angular-table ng-init="boundModel = [ { name: \'Sharon\' } ]" ng-model="boundModel">' +
                        '<header-row><header-column>test header text</header-column></header-row></angular-table>');
            });

            it('should render one header column', function() {
                expect(linkedElement.find('.angularTableHeaderColumn').length).toEqual(1);
            });

            it('should render the transcluded value inside the header column', function() {
                expect(linkedElement.find('.angularTableHeaderColumn').eq(0).text()).toEqual('test header text');
            });

            it('the one rendered header column should have a width of 100%', function() {
                expect(linkedElement.find('.angularTableHeaderColumn').eq(0).css('width')).toEqual('100%');
            });

            describe('when no sort direction arrows are specified', function() {
                describe('when the column has been specified as the default-sort-column', function() {
                    beforeEach(function() {
                        linkedElement = renderDirective(
                            '<angular-table ng-init="boundModel = [ { name: \'Sharon\' } ]" ng-model="boundModel">' +
                                '<header-row><header-column default-sort-column>test header text</header-column></header-row></angular-table>');
                    });

                    it('should show an ascending sort arrow in the header column to the left of the column header title', function() {
                        var headerColumnFirstChild = linkedElement.find('.angularTableHeaderColumn').eq(0).children().eq(0);
                        expect(headerColumnFirstChild.css('width')).toEqual('0px');
                        expect(headerColumnFirstChild.css('height')).toEqual('0px');
                        expect(headerColumnFirstChild.css('border-left')).toEqual('5px solid transparent');
                        expect(headerColumnFirstChild.css('border-right')).toEqual('5px solid transparent');
                        expect(headerColumnFirstChild.css('border-bottom')).toEqual('7px solid black');
                    });
                });

                describe('when two columns have been specified as the default-sort-column', function() {
                    it('should show throw an exception stating that only one header-column may have a default-sort-column specified', function() {
                            expect(function() {
                                renderDirective(
                                    '<angular-table ng-init="boundModel = [ { name: \'Sharon\' } ]" ng-model="boundModel">' +
                                        '<header-row><header-column default-sort-column>test header text</header-column>' +
                                        '<header-column default-sort-column>test header text</header-column></header-row></angular-table>');
                            }).toThrow({
                                    name: 'MultipleDefaultSortColumns',
                                    message: 'only one header-column may have a default-sort-column specified'
                                });
                    });
                });
            });
        });

        describe('when two column headers are present in the directive consumer template', function() {
            beforeEach(function() {
                linkedElement = renderDirective(
                    '<angular-table ng-init="boundModel = [ { name: \'Sharon\' } ]" ng-model="boundModel">' +
                        '<header-row><header-column>column 1 header</header-column><header-column>column 2 header</header-column></header-row></angular-table>');
            });

            it('should render two header columns', function() {
                expect(linkedElement.find('.angularTableHeaderColumn').length).toEqual(2);
            });

            it('the first rendered header column should have a width of 50%', function() {
                expect(linkedElement.find('.angularTableHeaderColumn').eq(0).css('width')).toEqual('50%');
            });
        });
    });

    describe('when no header row columns are defined', function() {
        it('should transclude classes into the root element', function() {
            linkedElement = renderDirective('<angular-table class="testClass" ng-init="boundModel = {}" ng-model="boundModel"></angular-table>');
            expect(linkedElement.hasClass('testClass')).toBeTruthy();
        });

        it('should transclude styles into the root element', function() {
            linkedElement = renderDirective('<angular-table style="font-size: 10px;" ng-init="boundModel = {}" ng-model="boundModel"></angular-table>');
            expect(linkedElement.css('font-size')).toEqual('10px');
        });

        describe('when one column is present in the model', function() {
            beforeEach(function() {
                linkedElement = renderDirective('<angular-table ng-init="boundModel = [ { name: \'Sharon\' } ]" ng-model="boundModel"></angular-table>');
            });

            it('should render one header column', function() {
                expect(linkedElement.find('.angularTableHeaderColumn').length).toEqual(1);
            });

            it('the one rendered header column should have a width of 100%', function() {
                expect(linkedElement.find('.angularTableHeaderColumn').eq(0).css('width')).toEqual('100%');
            });
        });

        describe('when two columns are present in the model', function() {
            beforeEach(function() {
                linkedElement = renderDirective('<angular-table ng-init="boundModel = [ { name: \'Sharon\', title: \'girlfriend\' } ]" ng-model="boundModel"></angular-table>');
            });

            it('should render two header column', function() {
                expect(linkedElement.find('.angularTableHeaderColumn').length).toEqual(2);
            });

            it('the first rendered header column should have a width of 50%', function() {
                expect(linkedElement.find('.angularTableHeaderColumn').eq(0).css('width')).toEqual('50%');
            });
        });
    });
});
