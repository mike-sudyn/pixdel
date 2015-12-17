/*
 * By: Mike Sudyn
 * Website: https://ua.linkedin.com/in/mikesudyn
 * Version: 2.0
 * Licence: MIT
 */

/* jshint camelcase:false */
'use strict';

function PixDel($, angular) {
    var PixdelNG = angular.module('PixdelNG', []).config(['$controllerProvider', function ($controllerProvider) {
        $controllerProvider.allowGlobals();
    }]);

    PixdelNG.controller('PixdelController', ['$scope', function ($scope) {

        $scope.levelTypes = [
            {
                typeName: 'Colours',
                typeClassName: 'colours',
                types: ['blue', 'purple', 'red', 'orange', 'yellow', 'green', 'aqua', 'black']
            },
            {
                typeName: 'Icons',
                typeClassName: 'icons',
                types: ['burger', 'flash', 'airplane', 'camera', 'quaver', 'settings', 'theater', 'light-bulb']
            },
            {
                typeName: 'Photos',
                typeClassName: 'photos',
                types: ['balloon', 'fire', 'fireworks', 'lake', 'rooftops', 'sea', 'skatepark', 'snow']
            }
        ];

        $scope.difficultyLevel = [
            {
                levelName: 'Easy',
                levelClassName: 'easy',
                typesNum: 5,
                blocksMin: 3,
                size: 6,
                speed: 2.5
            },
            {
                levelName: 'Normal',
                levelClassName: 'normal',
                typesNum: 6,
                blocksMin: 4,
                size: 7,
                speed: 2
            },
            {
                levelName: 'Hard',
                levelClassName: 'hard',
                typesNum: 8,
                blocksMin: 4,
                size: 8,
                speed: 1.5
            },
            {
                levelName: 'Insane',
                levelClassName: 'insane',
                typesNum: 8,
                blocksMin: 5,
                size: 10,
                speed: 1
            }
        ];

        /* Initiate variables */
        var classes = {
                loading: 'loading',
                hiddenPage: 'page-hidden',
                tr: 'pixdel-tr',
                td: 'pixdel-td',
                pixdelDiv: 'pixdel-div',
                reserved: 'reserved',
                hidden: 'hidden',
                buttonPause: 'button__pause',
                scoreNum: 'pixdel-score--num',
                scoreNumBig: 'pixdel-score--num__big',
                bonus: 'pixdel-bonus',
                bonusNum: 'pixdel-bonus--num',
                bonusShow: 'pixdel-bonus__show',
                modalWindow: 'pixdel-modal--window',
                modalWindowContent: 'pixdel-modal--content',
                modalWindowHidden: 'pixdel-modal--hidden',
                modalClose: 'pixdel-modal--close',
                active: 'active',
                pause: 'pause'
            },

            selectors = {
                loading: '.' + classes.loading,
                wrapper: '.pixdel',
                startPage: '.pixdel-start-page',
                levelPage: '.pixdel-level-page',
                gamePage: '.pixdel-game-page',
                gamePageHeader: '.pixdel-header',
                share: '.js-share',
                buttonBack: '.button__back',
                table: '.pixdel-table',
                tr: '.' + classes.tr,
                td: '.' + classes.td,
                pixdelDiv: '.' + classes.pixdelDiv,
                reserved: '.' + classes.reserved,
                buttonPause: '.' + classes.buttonPause,
                scoreNum: '.' + classes.scoreNum,
                bonus: '.' + classes.bonus,
                bonusNum: '.' + classes.bonusNum,
                modalWindow: '.' + classes.modalWindow,
                modalWindowContent: '.' + classes.modalWindowContent,
                modalClose: '.' + classes.modalClose,
                active: '.' + classes.active,
                pause: '.' + classes.pause
            },

            $wrapper = $(selectors.wrapper),
            $loader = $(selectors.loading, $wrapper),
            $startPage = $(selectors.startPage, $wrapper),
            $levelPage = $(selectors.levelPage, $wrapper),
            $gamePage = $(selectors.gamePage, $wrapper),
            $gamePageHeader = $(selectors.gamePageHeader, $wrapper),
            $table = $(selectors.table, $wrapper),
            $modalWindow = $(selectors.modalWindow, $wrapper),
            $modalOverlay = $modalWindow.parent(),
            $score = $(selectors.scoreNum, $wrapper),
            $bonus = $(selectors.bonus),
            timer = 'Search and remove blocks';
        $scope.play = false;


        angular.element(document).ready(function () {
            $loader.addClass(classes.hiddenPage);
            $startPage.toggleClass(classes.hiddenPage);
        });


        $scope.chooseLevel = function (index) {
            $scope.levelType = $scope.levelTypes[index];
            $startPage.addClass(classes.hiddenPage);
            $levelPage.removeClass(classes.hiddenPage);
        };


        $scope.startGame = function (index) {
            /* Get options by level */
            $scope.options = $scope.difficultyLevel[index];
            $scope.options.types = $scope.levelType.types.slice(0, $scope.options.typesNum);
            $scope.levelName = $scope.options.levelName;
            $scope.field = $scope.buildField($scope.options.size);
            $scope.speed = $scope.options.speed * 500;
            $scope.play = true;
            $scope.score = 0;

            /* Switch to game page */
            setTimeout($scope.adjustCellHeight, 1);
            $levelPage.addClass(classes.hiddenPage);
            setTimeout(function(){
                $gamePage.removeClass(classes.hiddenPage);
                $scope.randomAppendBlock();
            }, 100);
        };


        $scope.buildField = function (fieldSize) {
            var field = [];
            for (var i = 0; i < fieldSize; i++) {
                field.push(new Array(fieldSize));
            }
            return field;
        };


        $scope.pauseGame = function () {
            $scope.play = false;
            $scope.clearPixdelTimeout();
            $scope.gameModalWindow.open('<b>Pause</b>', classes.pause);
        };


        $scope.continueGame = function () {
            $scope.play = true;
            $scope.randomAppendBlock();
        };


        $scope.stopGame = function () {
            $scope.play = false;
            $scope.clearPixdelTimeout();
            $startPage.removeClass(classes.hiddenPage);
            $levelPage.addClass(classes.hiddenPage);
            $gamePage.addClass(classes.hiddenPage);

            setTimeout(function () {
                $gamePage.find(selectors.pixdelDiv)
                    .attr('class', classes.pixdelDiv + ' ' + classes.hidden)
                    .attr('data-type', '');
            }, 400);
        };


        $scope.adjustCellHeight = function () {
            var windowHeight = window.innerHeight,
                windowWidth = window.innerWidth,
                headerHeight = $gamePageHeader.outerHeight(),
                wrapperWidth = windowHeight - headerHeight < windowWidth && windowWidth > 320 ? windowHeight - headerHeight + 'px' : 'auto';

            $wrapper.css({'width': wrapperWidth});

            if ($scope.options){
                var wrapperInnerWidth = $wrapper.width() - 3, // Borders 3px
                    tdSize = wrapperInnerWidth / $scope.options.size - 1 + 'px',
                    trHeight = wrapperInnerWidth / $scope.options.size + 'px';

                $wrapper.find(selectors.td).css({'width': tdSize, 'height': tdSize});
                $wrapper.find(selectors.tr).css({'height': trHeight});
            }
        };


        $scope.randomAppendBlock = function () {
            $scope.randomAppendBlockTimout = setTimeout(function () {
                if ($scope.play) {
                    var freeCell = $scope.findFreeCell(),
                        color = $scope.options.types[Math.floor(Math.random() * $scope.options.types.length)];

                    if (freeCell) {
                        $scope.field[freeCell.y][freeCell.x] = color;
                        $scope.insertBlock(freeCell, color);
                        if ($scope.play) {
                            $scope.randomAppendBlock();
                        }
                    } else {
                        $scope.showScores();
                    }
                }
            }, $scope.speed);
        };


        $scope.clearPixdelTimeout = function () {
            clearTimeout($scope.randomAppendBlockTimout);
            $scope.randomAppendBlockTimout = null;
        };


        $scope.findFreeCell = function () {
            var freeCells = [];
            // Gather all free cells
            for (var y = 0; y < $scope.field.length; y++) {
                for (var x = 0; x < $scope.field[y].length; x++) {
                    if ($scope.field[y][x] === undefined) {
                        freeCells.push({y: y, x: x});
                    }
                }
            }
            // Return one of free random cells
            return freeCells[Math.floor(Math.random() * freeCells.length)] || false;
        };


        $scope.insertBlock = function (cell, color) {
            var $cell = $table.find(selectors.tr + ':eq(' + cell.y + ') ' + selectors.td + ':eq(' + cell.x + ')');

            $cell.addClass(classes.reserved)
                .children(selectors.pixdelDiv)
                .attr('data-type', color)
                .removeClass(classes.hidden);

            setTimeout(function () {
                $cell.removeClass(classes.reserved);
                $scope.searchMatches(cell, color);
            }, 200);
        };


        $scope.showScores = function () {
            $scope.gameModalWindow.open('Your score is ' + $scope.score + '<br>on level ' + $scope.options.levelName + '!' +
                '<br><a class="share popup-share" href="https://www.facebook.com/dialog/feed?app_id=146418009056932&display=popup&link=http://pixdel.com&redirect_uri=http://pixdel.com&description=I+have+scored+' + $scope.score + '+on+level+' + $scope.options.levelName + '!+What+is+your+score?">Share on Facebook</a>');
        };


        $table.on('click', selectors.td, function (e) {
            var $currentTd = $(e.currentTarget),
                $currentBlock = $currentTd.children(selectors.pixdelDiv),
                cell = {y: $currentTd.parents(selectors.tr).index(), x: $currentTd.index()};

            if ($currentTd.hasClass(classes.reserved)) {
                return;
            }

            if ($currentBlock.hasClass(classes.active)) {
                $currentBlock.removeClass(classes.active);
                return;
            } else if (!$currentBlock.hasClass(classes.hidden)) {
                $table.find(selectors.pixdelDiv + selectors.active).removeClass(classes.active);
                $currentBlock.addClass(classes.active);
                return;
            }

            var activeDiv = $table.find(selectors.pixdelDiv + selectors.active);

            if (activeDiv[0] !== undefined) {
                var color = activeDiv.attr('data-type'),
                    prevTd = activeDiv.parent(),
                    prevCell = {y: activeDiv.parents(selectors.tr).index(), x: activeDiv.parents(selectors.td).index()};

                $scope.field[cell.y][cell.x] = color;

                prevTd.addClass(classes.reserved);
                $currentTd.addClass(classes.reserved);
                activeDiv.removeClass(classes.active).addClass(classes.hidden);
                $currentTd.children(selectors.pixdelDiv).attr('data-type', color).removeClass(classes.hidden);

                setTimeout(function () {
                    $scope.field[prevCell.y][prevCell.x] = undefined;
                    prevTd.removeClass(classes.reserved);
                    $currentTd.removeClass(classes.reserved);
                    activeDiv.attr('data-type', '');
                    $scope.searchMatches(cell, color);
                }, 200);
            }
        });


        /* Removing blocks by lines, columns and diagonals */
        $scope.searchMatches = function (cell, color) {
            console.time(timer);

            var elementsToRemove = [],
                linesToRemove = [],
                colsToRemove = [],
                leftDiagonalsToRemove = [],
                rightDiagonalsToRemove = [],

            /* Find diagonal start coordinates */
                LDiagonalTr = cell.y,
                LDiagonalTd = cell.x,
                RDiagonalTr = cell.y,
                RDiagonalTd = cell.x;

            while (LDiagonalTr > 0 && LDiagonalTd > 0) {
                LDiagonalTr--;
                LDiagonalTd--;
            }
            while (RDiagonalTr > 0 && RDiagonalTd < $scope.field.length - 1) {
                RDiagonalTr--;
                RDiagonalTd++;
            }

            /* Adding elements to main array for deleting elements with validation */
            this.addToMainRemoveArray = function (elementsArray) {
                if (elementsArray.length >= $scope.options.blocksMin) {
                    $.each(elementsArray, function (elKey, elValue) {
                        if ($.inArray(elValue, elementsToRemove) === -1) {
                            elementsToRemove.push(elValue);
                        }
                    });
                }
            };

            /* Collect horizontal and vertical lines */
            for (var i = 0; i < $scope.field.length; i++) {
                /* Horizontal lines */
                if ($scope.field[cell.y][i] === color) {
                    linesToRemove.push({y: cell.y, x: i});
                    this.addToMainRemoveArray(linesToRemove);
                } else {
                    linesToRemove = [];
                }

                /* Vertical lines */
                if ($scope.field[i][cell.x] === color) {
                    colsToRemove.push({y: i, x: cell.x});
                    this.addToMainRemoveArray(colsToRemove);
                } else {
                    colsToRemove = [];
                }
            }
            /* Collect horizontal and vertical lines end */

            /* Collect left to right diagonal lines */
            for (i = LDiagonalTr; i < $scope.field.length; i++) {
                if (i >= $scope.field.length || LDiagonalTd >= $scope.field.length) {
                    break;
                }

                if ($scope.field[i][LDiagonalTd] === color) {
                    leftDiagonalsToRemove.push({y: i, x: LDiagonalTd});
                    this.addToMainRemoveArray(leftDiagonalsToRemove);
                } else {
                    this.addToMainRemoveArray(leftDiagonalsToRemove);
                    leftDiagonalsToRemove = [];
                }
                LDiagonalTd++;
            }
            /* Collect left to right diagonal lines end */

            /* Collect right to left diagonal lines */
            for (i = RDiagonalTr; i < $scope.field.length; i++) {
                if (i >= $scope.field.length || RDiagonalTd < 0) {
                    break;
                }

                if ($scope.field[i][RDiagonalTd] === color) {
                    rightDiagonalsToRemove.push({y: i, x: RDiagonalTd});
                    this.addToMainRemoveArray(rightDiagonalsToRemove);
                } else {
                    this.addToMainRemoveArray(rightDiagonalsToRemove);
                    rightDiagonalsToRemove = [];
                }
                RDiagonalTd--;
            }
            /* Collect right to left diagonal lines end */

            /* Finely removing all elements from main removing array */
            if (elementsToRemove.length > 0) {
                $scope.removeBlocks(elementsToRemove);
            }

            console.timeEnd(timer);
        };


        $scope.removeBlocks = function (elementsToRemove) {
            $scope.bonus = 0;
            $scope.scoresToAdd = 0;

            if (elementsToRemove.length > $scope.options.blocksMin) {
                $scope.bonus = ( elementsToRemove.length - $scope.options.blocksMin ) * 2;
            }

            $.each(elementsToRemove, function (index, cell) {
                var $cell = $table.find(selectors.tr + ':eq(' + cell.y + ') ' + selectors.td + ':eq(' + cell.x + ')').addClass(classes.reserved),
                    $element = $cell.children(selectors.pixdelDiv).removeClass(classes.active).addClass(classes.hidden);

                setTimeout(function () {
                    $element.attr('data-type', '');
                    $cell.removeClass(classes.reserved);
                    $scope.field[cell.y][cell.x] = undefined;
                }, 300);
                $scope.scoresToAdd = $scope.scoresToAdd + 1;
            });

            $scope.countScores($scope.scoresToAdd + $scope.bonus);
        };


        /* Count scores + bonuses */
        $scope.countScores = function (score) {
            $.each(new Array(score), function(i){
                setTimeout(function(){
                    $scope.score = $scope.score + 1;
                    $scope.$apply();
                    $score.addClass(classes.scoreNumBig);
                    setTimeout(function() { $score.removeClass(classes.scoreNumBig); }, 200 * (i + 1));
                }, 100 * (i + 1));
            });

            if ($scope.bonus > 0) {
                var bonusClone = $bonus.clone();

                bonusClone.insertAfter($bonus).find(selectors.bonusNum).html($scope.bonus);
                bonusClone.addClass(classes.bonusShow);
                setTimeout(function() { bonusClone.remove(); }, 1000);
                $scope.bonus = 0;
            }
        };


        /* Stop game and return to start page */
        $scope.backToStart = function () {
            $scope.stopGame();
        };


        /* Toggle fullscreen */
        $scope.fullScreen = function () {
            if (document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen) {
                if (document.fullScreen) {
                    document.exitFullScreen();
                }
                else if (document.webkitIsFullScreen) {
                    document.webkitCancelFullScreen();
                }
                else if (document.mozFullScreen) {
                    document.mozCancelFullScreen();
                }
            } else {
                if (document.documentElement.requestFullScreen) {
                    document.documentElement.requestFullScreen();
                }
                else if (document.documentElement.webkitRequestFullScreen) {
                    document.documentElement.webkitRequestFullScreen();
                }
                else if (document.documentElement.mozRequestFullScreen) {
                    document.documentElement.mozRequestFullScreen();
                }
                else {
                    document.documentElement.requestFullScreen();
                }
            }
        };


        /* Game modal window */
        $scope.gameModalWindow = {
            close: function () {
                if ($modalOverlay.attr('data-type') === classes.pause) {
                    $scope.continueGame();
                } else {
                    $scope.stopGame();
                }
                $modalOverlay.attr('data-type', '').addClass(classes.modalWindowHidden);
            },

            open: function (content, className) {
                $modalOverlay.attr('data-type', className)
                    .find(selectors.modalWindowContent)
                    .html(content);
                $modalOverlay.removeClass(classes.modalWindowHidden);
            }
        };

        $wrapper.on('click', selectors.share, function (e) {
            e.preventDefault();
            var $target = $(e.currentTarget);
            window.open($target.attr('href'), 'Facebook Share', 'height=200,width=500');
        });


        $(window).resize(function () {
            $scope.adjustCellHeight();
        });


        $(document).keydown(function (e) {
            if (e.which === 70) {
                e.preventDefault();
                $scope.fullScreen();
            }
            else if ((e.which === 80 || e.which === 32) && $(selectors.modalWindow + selectors.pause).length < 1) {
                e.preventDefault();
                $scope.pauseGame();
            }
            else if ((e.which === 80 || e.which === 32) && $(selectors.modalWindow + selectors.pause).length > 0) {
                e.preventDefault();
                $modalWindow.children(selectors.modalClose).click();
            }
            else if (e.which === 8) {
                e.preventDefault();
                $gamePage.find(selectors.buttonBack).click();
            }
        });
    }]);
}

module.exports = PixDel;
