angular.module('demo', ['fhat'])
    .controller('demoController', ['$scope', function($scope) {
        var numbers = [];
        $scope.selectedRow = {};

        // TODO: fix this
        $scope.addFiftyRows = function(startIndex) {
            var endIndex = startIndex + 50;

            for(var i = startIndex; i < endIndex; i++) {
                numbers.push({
                   id: i,
                   name: 'name ' + i
                });
            }

            $scope.listOfNumbers = numbers;
        }

        $scope.handleRowSelection = function(row) {
            $scope.selectedRow = row;
        };

        $scope.addRow = function() {
            $scope.listOfNumbers.push({
                id: parseInt($scope.listOfNumbers.length, 10) + 1,
                name: 'name ' + $scope.listOfNumbers.length + 1 })
        };

        $scope.addFiftyRows(1);
    }]);
