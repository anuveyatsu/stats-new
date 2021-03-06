define(['jquery', 'bootstrap', 'chroma', 'tablesorter', 'floatThead'], function($, bootstrap, chroma, tablesorter, floatThead) {

    var placeCount = placeCount || 260,
        colorSteps = ['#7ab800', '#edcf3b', '#ff0000',],
        colorScale = chroma.scale(colorSteps).domain([0, 100]),
        naString = 'n/a',
        $dataTable = $('.data-table'),
        $visiblePopover,
        $scoreDisplay = $('.score'),
        popover_tmpl = '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
        tablesorterPlaceOptions = {
            sortList: [[0,0]],
            headers: {
                6: {sorter: false},
                7: {sorter: false},
                8: {sorter: false},
                9: {sorter: false},
                10: {sorter: false},
                11: {sorter: false},
            }
        },
        tablesorterRiskOptions = {
            headers: {
                2: {sorter: false},
                3: {sorter: false},
            }
        },
        tablesorterSliceOptions = {
            sortList: [[0,1], [1,0]],
            headers: {
                2: {sorter: false},
                3: {sorter: false},
                4: {sorter: false},
                5: {sorter: false},
                6: {sorter: false},
            }
        },
        sortFlag = true;

    $('#places_overview_table').tablesorter(tablesorterPlaceOptions);
    $('#datasets_overview_table').tablesorter(tablesorterRiskOptions);
    $('#slice-table').tablesorter(tablesorterSliceOptions);
    $('#place-slice-table').tablesorter();

    $("#places_overview_table").floatThead();
    $("#datasets_overview_table").floatThead();
    $("#slice-table").floatThead();

    $('.content').on('click', '.sexyHeader .sort_rank, .sexyHeader .sort_place', function(e){
        $("#places_overview_table").trigger("sorton", [ [[ $(e.target).hasClass('sort_place')/1, sortFlag]] ]);
        $('.headerSortDown').removeClass('headerSortDown');
        $('.headerSortUp').removeClass('headerSortUp');
        $(e.target).addClass((sortFlag)?"headerSortUp":"headerSortDown");
        sortFlag = !sortFlag;
    });


    function filterTable(table, query, $actor) {

        table.find('tbody tr').each(function(index, value) {

            if (query.length < 2) {
                $(this).show();
            } else if (query.length >= 2) {
                if ($(this).data('place').toLowerCase().indexOf(query.toLowerCase()) === -1) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            }

        }) ;

    }


    function setInteractions() {

        $("[data-toggle='tooltip']").tooltip({html: true});
        $('[data-toggle="popover"]').popover({
            trigger: 'click',
            'placement': 'bottom',
            'html': true,
            'show': true,
            'template': popover_tmpl
        });

        $('[data-toggle="popover"]').on('click', function() {
            $('[data-toggle="popover"]').not(this).popover('hide');
        });

        $('body').on('click', 'td.showpopover', function() {
            var $this = $(this);

            // check if the one clicked is now shown
            if ($this.data('popover').tip().hasClass('in')) {

                // if another was showing, hide it
                if ($visiblePopover) {
                    $visiblePopover.popover('hide');
                }

                // then store reference to current popover
                $visiblePopover = $this;

            } else { // if it was hidden, then nothing must be showing
                $visiblePopover = '';
            }
        });

        $('.filter-table').on('keyup', function() {

            var $this = $(this),
                query = $this.val().toLowerCase().replace(' ', '-').replace(',', '');

            filterTable($dataTable, query, $this);

        });

        $('form.data-table-tools').on('submit', function() {
            return false;  // Prevent page reload when enter pressed
        })

        $.each($scoreDisplay, function(index, el) {
            var score,
                $el = $(el);
            if ($el.data('score') === naString) {
                $el.css({
                    'background-color': 'grey',
                    'color': 'white'
                });
                $el.attr("title",'No data available for this item')
            } else {
                score = parseInt($el.data('score'), 10);
                $el.css({
                  'background-color': colorScale(score).hex(),
                  'color': 'white'
                });
            }
        });

    }

    function initializeTable() {
        setInteractions();
    }

    return {
        init: initializeTable,
    };

});
