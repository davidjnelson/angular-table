angular.module('demo', ['fhat'])
    .controller('demoController', ['$scope', function($scope) {
        var numbers = [];
        $scope.selectedRow = {};

        for(var i = 0; i < 25; i++) {
            numbers.push({
               id: i,
               name: 'name ' + i
            });
        }

        $scope.listOfNumbers = numbers;

        $scope.handleRowSelection = function(row) {
            $scope.selectedRow = row;
        };
    }]);
