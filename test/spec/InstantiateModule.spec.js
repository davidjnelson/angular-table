'use strict';

describe('angular-table module', function() {
    var module;

    beforeEach(function() {
        module = angular.module('angular-table')
    });

    it('should be instantiated', function() {
        expect(typeof(module)).not.toEqual('undefined');
    });
});
