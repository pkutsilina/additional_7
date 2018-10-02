module.exports = function solveSudoku(matrix) {
    var map = refine(initialTaskToMap(matrix));

    var result = [[],[],[],[],[],[],[],[],[]]
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            result[i][j] = map[i][j][0];
        }
    }

    return result;
}

function initialTaskToMap(matrix) {
    // initialize with all possible options
    var map = [[],[],[],[],[],[],[],[],[]];
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            map[i][j] = [1, 2, 3, 4 , 5, 6, 7, 8, 9];
        }
    }

    // reduce possible options to given values
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            var cellValue = matrix[i][j];
            if (cellValue != 0) {
                setValueToMapCell(map, cellValue, i, j);
            }
        }
    }

    return map;
}

function setValueToMapCell(map, value, row, col) {
    map[row][col] = [value];
    // reduce possible options from vertical and horizontal rows first
    for (var i = 0; i < 9; i++) {
        if (i != row) {
            removeOptionFromCell(map, value, i, col);
        }
        if (i != col) {
            removeOptionFromCell(map, value, row, i);
        }
    }
    // reduce possible options from 3x3 square
    for (var i = row - (row % 3); i < row - (row % 3) + 3; i++) {
        for (var j = col - (col % 3); j < col - (col % 3) + 3; j++) {
            if (!(i == row && j == col)) {
                removeOptionFromCell(map, value, i, j);
            }
        }
    }
}

function removeOptionFromCell(map, value, row, col) {
    var options = map[row][col];
    var initialSize = options.length;

    var index = options.indexOf(value);
    if (index !== -1) options.splice(index, 1);

    // if removed last possible option - it's not possible to solve this branch
    if (initialSize == 1 && options.length < initialSize) {
        throw true;
    }
    // it's optional in fact - trigger options reduce if we finalized value of cell
    if (initialSize == 2 && options.length < initialSize) {
        setValueToMapCell(map, options[0], row, col);
    }
}

function refine(map) {
    // cell with least possible options to create possible branches
    var mostRefinedCell = findMostRefinedCell(map);
    if (mostRefinedCell != null) {
        for (idx in mostRefinedCell.value) {
            option = mostRefinedCell.value[idx];
            // copy map, set value and create branch
            var copy = copyMap(map);
            try {
                setValueToMapCell(copy, option, mostRefinedCell.row, mostRefinedCell.col);
                var refined = refine(copy);
                return refined;
            } catch (err) {
            }
        }
    } else {
        return map;
    }
    // if none of branches were successful - rollback to previous fork
    throw false;
}

function copyMap(map) {
    return JSON.parse(JSON.stringify(map));
}

function findMostRefinedCell(map) {
    var mostRefinedCellNumberOfOptions = 10;
    var mostRefinedCell = null;
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            var numberOfOptions = map[i][j].length;
            if (numberOfOptions < mostRefinedCellNumberOfOptions && numberOfOptions > 1) {
                if (numberOfOptions == 2) {
                    return {"row": i, "col": j, "value":copyMap(map[i][j])};
                } else {
                    mostRefinedCellNumberOfOptions = numberOfOptions;
                    mostRefinedCell = {"row": i, "col": j, "value":copyMap(map[i][j])};
                }
            }
        }
    }
    return mostRefinedCell;
}