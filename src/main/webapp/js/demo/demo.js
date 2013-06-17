angular.module('demo', ['fhat'])
    .controller('demoController', ['$scope', function($scope) {
        var numbers = [];
        $scope.selectedRow = {};

        for(var i = 0; i < 50; i++) {
            numbers.push({
               id: i,
               name: 'name ' + i
            });
        }

        $scope.listOfNumbers = numbers;

        $scope.handleRowSelection = function(row) {
            $scope.selectedRow = row;
        };

        $scope.addRow = function() {
            $scope.listOfNumbers.push({
                id: parseInt($scope.listOfNumbers.length, 10) + 1,
                name: 'name ' + $scope.listOfNumbers.length + 1 })
        };
    }]);
