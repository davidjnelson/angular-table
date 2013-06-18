angular.module('demo', ['fhat'])
    .controller('demoController', ['$scope', function($scope) {
        $scope.selectedRow = {};
        $scope.listOfNumbers = [];

        $scope.addFiftyRows = function(startIndex) {
            var endIndex = startIndex + 50;

            for(var i = startIndex; i < endIndex; i++) {
                $scope.listOfNumbers.push({
                   id: i,
                   name: 'name ' + i
                });
            }
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
