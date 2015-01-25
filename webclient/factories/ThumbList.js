﻿wwt.app.factory('ThumbList', ['$rootScope','Util','Places','$timeout', function ($rootScope, util, places, $timeout) {
    var api = {
        init:init,
        clickThumb: clickThumb,
        calcPageSize: calcPageSize,
        spliceOnePage: spliceOnePage,
        goFwd: goFwd,
        goBack: goBack
    };
  
    function init(scope, name) {
        scope.pageCount = 1; 
        scope.pageSize = 1;
        scope.currentPage = 0;
        
        scope.preventClickBubble = function (event) {
            event.stopImmediatePropagation();
        };
        scope.goBack = function () {
            goBack(scope);
        };
        scope.goFwd = function () {
            goFwd(scope);
        }; 
        scope.showMenu = function (i) {
            var item = scope.collectionPage[i];
            item.contextMenuEvent = true;
            $('.popover-content .close-btn').click();
            if (!item.get_isFolder() && item.get_name() !== 'Up Level') {
                var menuContainer = $((name === 'context' ? '.nearby-objects ' : '.top-panel ') + '#menuContainer' + i);
                if (util.isMobile) {
                    menuContainer = $('#' + name + 'Container #menuContainer' + i);
                }
                menuContainer.append($('#researchMenu')); 
                setTimeout(function () {
                    $('.popover-content .close-btn').click();
                    menuContainer.find('#researchMenu')
                        .addClass('open')
                        .off('click')
                        .on('click', function (event) {
                            event.stopPropagation();
                        });
                    menuContainer.find('.drop-toggle').click();
                    $timeout(function () {
                        $('.dropdown-backdrop').off('contextmenu');
                        $('.dropdown-backdrop').on('contextmenu', function (event) {
                            $(this).click();
                            event.preventDefault();
                        });
                        scope.setMenuContextItem(item, true);
                        item.contextMenuEvent = false;
                    }, 10);

                }, 10);
            }
        };
        scope.expandThumbnails = function (flag) {
            scope.currentPage = 0;
            scope.expanded = flag != undefined ? flag : !scope.expanded;
            scope.expandTop(scope.expanded,name);
            calcPageSize(scope, name === 'context');
        };
        scope.dropdownClass = name === 'context' && !util.isMobile ? 'dropup menu-container' : 'dropdown menu-container';
        scope.popupPosition = name === 'context' && !util.isMobile ? 'top' : 'bottom';
    }

    function clickThumb(item, scope, outParams, callback) {
        if (item.contextMenuEvent) {
            return outParams;
        }
        if (!outParams) {
            outParams = {}; 
        }
        scope.activeItem = item.get_thumbnailUrl() + item.get_name();
        scope.setActiveItem(item);
        wwt.wc.clearAnnotations();
        if (item.get_name() === 'Up Level') {
            scope.currentPage = 0;
            outParams.depth--;
            outParams.breadCrumb.pop();
            scope.breadCrumb = outParams.breadCrumb;
            outParams.cache.pop();
            scope.collection = outParams.cache[outParams.cache.length - 1];
            calcPageSize(scope, false);
            return outParams;
        }

        if (item.get_isFolder()) {
            scope.currentPage = 0;
            outParams.depth++;
            outParams.breadCrumb.push(item.get_name());
            scope.breadCrumb = outParams.breadCrumb;
            places.getChildren(item).then(function (result) {
                if ($.isArray(result[0])) {
                    result = result[0];
                }
                var unique = [];
                $.each(result, function (index, el) {
                    if ($.inArray(el, unique) === -1) unique.push(el);
                });
                scope.collection = unique;
                calcPageSize(scope, false);
                outParams.cache.push(result);
                if (outParams.openCollection) {
                    if (outParams.newCollectionUrl) {
                        var i = 0;
                        while (result[i].url && result[i].url.indexOf(outParams.newCollectionUrl) === -1) i++;

                        scope.clickThumb(result[i]);
                        outParams.newCollectionUrl = null;
                    } else if (result.length) {
                        scope.clickThumb(result[0]);
                    }
                }

                if (callback) {
                    callback();
                }
            });
            return outParams;
        } else if (outParams.openCollection) {
            outParams.openCollection = false;
        } else if (scope.$hide) {
            scope.$hide();
            $rootScope.searchModal = false;
        } else if (util.isMobile) {
            $('#explorerModal').modal('hide');
        }

        if ((item.isFGImage && item.imageSet && scope.lookAt !== 'Sky') || item.isSurvey) {
            scope.setLookAt('Sky', item.get_name(), true, item.isSurvey);
            if (item.isSurvey) {
                scope.setSurveyBg(item.get_name());
            } else {
                scope.setForegroundImage(item);
            }
            if (scope.$hide) {
                scope.$hide();
                $rootScope.searchModal = false;
            }
            return outParams;
        }
        else if (item.isPanorama) {
            scope.setLookAt('Panorama', item.get_name());
        } else if (item.isEarth) {
            scope.setLookAt('Earth', item.get_name());
        } else if (util.getIsPlanet(item) && scope.lookAt !== 'SolarSystem') {
            scope.setLookAt('Planet', item.get_name());
        } else if (item.isPlanet && scope.lookAt !== 'SolarSystem') {
            scope.setLookAt('Planet', '');
        }
        if ((ss.canCast(item, wwtlib.Place) || item.isEarth) && !item.isSurvey) {
            scope.setForegroundImage(item);
        }
        return outParams;  
    };

    function calcPageSize(scope, isContextPanel) {
        var list = scope.collection;
        var tnWid = 116;
        var winWid = $(window).width();

        if (isContextPanel && (scope.lookAt === 'Sky' || scope.lookAt === 'SolarSystem')) {
            winWid = winWid - 216; //angular.element('body.desktop .fov-panel').width();
        }
        scope.pageSize = util.isMobile ? 99999 : Math.floor(winWid / tnWid);

        if (scope.expanded) {
            scope.pageSize *= 5;
        }
        var listLength = list ? list.length : 2;
        $timeout(function () {
            scope.pageCount = Math.ceil(listLength / scope.pageSize);
            spliceOnePage(scope);
        });
    };

    function goBack(scope) {
        $('body').append($('#researchMenu'));
        scope.currentPage = scope.currentPage === 0 ? scope.currentPage : scope.currentPage - 1;
        return spliceOnePage(scope);
    };
    function goFwd(scope) {
        $('body').append($('#researchMenu'));
        scope.currentPage = scope.currentPage === scope.pageCount - 1 ? scope.currentPage : scope.currentPage + 1;
        return spliceOnePage(scope);
    };
    function spliceOnePage(scope) {
        var start = scope.currentPage * scope.pageSize;
        scope.collectionPage = scope.collection.slice(start, start + scope.pageSize);
    };
    return api;

}]);
