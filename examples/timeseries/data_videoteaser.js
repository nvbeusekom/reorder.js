var matrices_videoteaser = [];
var col_labels_videoteaser = [];
var row_labels_videoteaser = [];

var margin = {top: 30, right: 0, bottom: 10, left: 30},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;
function load_videoteaser(callback){

matrices_videoteaser = [
  [
    [1,0,1],
    [0,1,0],
    [1,0,1]]
, [
    [1,0,1],
    [0,1,1],
    [1,1,1]]
, [
    [0,1,0],
    [1,0,0],
    [0,0,1]]
];
    var labels = [];
    for (var i = 0; i < matrices_videoteaser[0].length; i++) {
        labels.push(i);
    }
    col_labels_videoteaser = labels;
    row_labels_videoteaser = labels;
    var tables_videoteaser = [];
    for(let i = 0; i<matrices_videoteaser.length; i++){
        var svg = d3.select("#heatmap").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        var t1 = new table({matrix: matrices_videoteaser[i], row_labels_videoteaser: labels, col_labels_videoteaser: labels},svg);
        tables_videoteaser[i] = t1;
    }
    
    callback(matrices_videoteaser, col_labels_videoteaser, row_labels_videoteaser, tables_videoteaser);
}