let matrices_example = [];
let col_labels_example = [];
let row_labels_example = [];

/* The example used for the teaser image of:
 * 
 * Simultaneous Matrix Orderings for Graph Collections.
 * Nathan van Beusekom, Wouter Meulemans, and Bettina Speckmann.
 * IEEE Transactions on Visualization and Computer Graphics, 28(1), pp 1-10, 2021.
 * https://arxiv.org/abs/2109.12050 
 */
function load_example(callback){

matrices_example = [
  [
    [1,1,1,1,0,0,0,0],
    [1,1,0,1,0,0,1,0],
    [1,0,1,1,0,0,0,0],
    [1,1,1,1,0,0,0,0],
    [0,0,0,0,0,1,1,1],
    [0,0,0,0,1,1,1,1],
    [0,1,0,0,1,1,0,1],
    [0,0,0,0,1,1,1,1]]
, [
    [0,0,0,0,1,1,1,1],
    [0,1,1,0,1,1,1,1],
    [0,1,0,0,1,1,0,1],
    [0,0,0,0,1,1,1,1],
    [1,1,1,1,0,0,0,0],
    [1,1,1,1,0,0,0,1],
    [1,1,0,1,0,0,0,0],
    [1,1,1,1,0,1,0,0]]
];
//matrices_example = [
//  [
//    [1,0,0,1,0,1,1,0],
//    [0,1,1,0,1,0,0,1],
//    [0,1,1,0,1,0,0,1],
//    [1,0,0,1,0,1,1,0],
//    [0,1,1,0,1,0,0,1],
//    [1,0,0,1,0,1,1,0],
//    [1,0,0,1,0,1,1,0],
//    [0,1,1,0,1,0,0,1]]
//, [
//    [0,1,1,0,1,0,0,1],
//    [1,0,0,1,0,1,1,0],
//    [1,0,0,1,0,1,1,0],
//    [0,1,1,0,1,0,0,1],
//    [1,0,0,1,0,1,1,0],
//    [0,1,1,0,1,0,0,1],
//    [0,1,1,0,1,0,0,1],
//    [1,0,0,1,0,1,1,0]]
//];
    let loaded_data = load_data(matrices_example);
    callback(loaded_data[0], loaded_data[1], loaded_data[2], loaded_data[3], loaded_data[4]);
}