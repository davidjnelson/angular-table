'use strict';

describe('Header', function() {
    var compile,
        rootScope,
        renderDirective = function(template) {
            var directiveConsumer = angular.element(template);
            var linkingFunction = compile(directiveConsumer);
            var linkedElement = linkingFunction(rootScope);
            rootScope.$digest();

            return linkedElement;
        };

    beforeEach(module('angular-table'));

    beforeEach(inject(function($compile, $rootScope) {
        compile = $compile;
        rootScope = $rootScope;
    }));

    describe('when no header row columns are defined', function() {
        describe('when one column is present in the model', function() {
            var linkedElement;

            beforeEach(function() {
                linkedElement = renderDirective('<angular-table ng-init="boundModel = [ { name: \'Sharon\' } ]" ng-model="boundModel"></angular-table>');
            });

            it('should render one header column', function() {
                expect(linkedElement.find('.angularTableHeaderColumn').length).toEqual(1);
            });

            it('the one rendered header column should have a width of 100%', function() {
                var linkedElement = renderDirective('<angular-table ng-init="boundModel = [ { name: \'Sharon\' } ]" ng-model="boundModel"></angular-table>');
                expect(linkedElement.find('.angularTableHeaderColumn').css('width')).toEqual('100%');
            });
        });

        describe('when two columns are present in the model', function() {
            var linkedElement;

            beforeEach(function() {
                linkedElement = renderDirective('<angular-table ng-init="boundModel = [ { name: \'Sharon\', title: \'girlfriend\' } ]" ng-model="boundModel"></angular-table>');
            });

            it('should render two header column', function() {
                expect(linkedElement.find('.angularTableHeaderColumn').length).toEqual(2);
            });

            it('the one rendered header column should have a width of 50%', function() {
                expect(linkedElement.find('.angularTableHeaderColumn').css('width')).toEqual('50%');
            });
        });
    });
});
