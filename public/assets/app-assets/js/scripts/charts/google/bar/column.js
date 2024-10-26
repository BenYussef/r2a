/*=========================================================================================
    File Name: column.js
    Description: google column bar chart
    ----------------------------------------------------------------------------------------
    Item Name: Robust - Responsive Admin Template
    Version: 2.0
    Author: PIXINVENT
    Author URL: http://www.themeforest.net/user/pixinvent
==========================================================================================*/

// Column chart
// ------------------------------

// Load the Visualization API and the corechart package.
google.load('visualization', '1.0', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
google.setOnLoadCallback(drawColumn);

// Callback that creates and populates a data table, instantiates the pie chart, passes in the data and draws it.
function drawColumn() {

    // Create the data table.
    var data = google.visualization.arrayToDataTable([
        ['Jours', 'Nombre d\'entretiens'],
        ['10/12',  130],
        ['11/12',  145],
        ['12/12',  0],
        ['13/12',  135],
        ['14/12',  120],
        ['15/12',  130],
        ['16/12',  120],
        ['17/12',  125],
        ['18/12',  99],
        ['19/12',  0],
        ['20/12',  110],
        ['21/12',  120],
        ['22/12',  135],
        ['23/12',  140],
        ['24/12',  123],
    ]);


    // Set chart options
    var options_column = {
        height: 400,
        fontSize: 12,
        colors:['#3BAFDA'],
        chartArea: {
            left: '5%',
            width: '90%',
            height: 350
        },
        vAxis: {
            gridlines:{
                color: '#e9e9e9',
                count: 10
            },
            minValue: 0
        },
        legend: {
            position: 'top',
            alignment: 'center',
            textStyle: {
                fontSize: 12
            }
        }
    };

    // Instantiate and draw our chart, passing in some options.
    var bar = new google.visualization.ColumnChart(document.getElementById('column-chart'));
    bar.draw(data, options_column);

    // Create the data table.
    var data2 = google.visualization.arrayToDataTable([
        ['Jours', 'Nombre de répondants'],
        ['01/12',  380],
        ['02/12',  190],
        ['03/12',  57],
        ['04/12',  20],
        ['05/12',  220],
        ['06/12',  110],
        ['07/12',  33],
        ['08/12',  23],
        ['09/12',  10],
        ['10/12',  3],
        ['11/12',  2],
        ['12/12',  1],
        ['13/12',  1],
        ['14/12',  0],
        ['15/12',  0],
    ]);


    // Set chart options
    var options_column2 = {
        height: 400,
        fontSize: 12,
        colors:['#9c39e3'],
        chartArea: {
            left: '5%',
            width: '90%',
            height: 350
        },
        vAxis: {
            gridlines:{
                color: '#e9e9e9',
                count: 10
            },
            minValue: 0
        },
        legend: {
            position: 'top',
            alignment: 'center',
            textStyle: {
                fontSize: 12
            }
        }
    };

    var bar2 = new google.visualization.ColumnChart(document.getElementById('column-chart2'));
    bar2.draw(data2, options_column2);

}


// Resize chart
// ------------------------------

$(function () {

    // Resize chart on menu width change and window resize
    $(window).on('resize', resize);
    $(".menu-toggle").on('click', resize);

    // Resize function
    function resize() {
        drawColumn();
    }
});