/*=========================================================================================
    File Name: pie.js
    Description: google pie chart
    ----------------------------------------------------------------------------------------
    Item Name: Robust - Responsive Admin Template
    Version: 2.0
    Author: PIXINVENT
    Author URL: http://www.themeforest.net/user/pixinvent
==========================================================================================*/

// Pie chart
// ------------------------------

// Load the Visualization API and the corechart package.
google.load('visualization', '1.0', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
google.setOnLoadCallback(drawPie);

// Callback that creates and populates a data table, instantiates the pie chart, passes in the data and draws it.
function drawPie() {

    // Create the data table.
    var data = google.visualization.arrayToDataTable([
        ['Task', 'Hours per Day'],
        ['Web',     41],
        ['Tel',      59]
    ]);


    // Set chart options
    var options_bar = {
        title: '',
        height: 250,
        fontSize: 12,
        colors:['#9c39e3', '#3BAFDA'],
        chartArea: {
            left: '30%',
            width: '90%',
            height: 450
        },
    };

    // Instantiate and draw our chart, passing in some options.
    var bar = new google.visualization.PieChart(document.getElementById('pie-chart'));
    bar.draw(data, options_bar);

}


// Resize chart
// ------------------------------

$(function () {

    // Resize chart on menu width change and window resize
    $(window).on('resize', resize);
    $(".menu-toggle").on('click', resize);

    // Resize function
    function resize() {
        drawPie();
    }
});