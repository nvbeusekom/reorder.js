let matrices_sch = [];
let col_labels_sch = [];
let row_labels_sch = [];

//Dataset from http://www.sociopatterns.org/datasets/primary-school-temporal-network-data/
function load_sch(callback){

d3.csv("primaryschool.csv", function(err,data) {
    let indices = {};
    let count = 0;
    for (let i = 0; i < data.length; i++) {
            if(indices[data[i]['i']] === undefined){
                indices[data[i]['i']] = count;
                count++;
            }
            if(indices[data[i]['j']] === undefined){
                indices[data[i]['j']] = count;
                count++;
            }
    }
    let T = 31220;
    let matrix = []
    for (let i = 0; i < Object.keys(indices).length; i++) {
        let arr = [];
        for (let j = 0; j < Object.keys(indices).length; j++) {
            arr[j] = 0;
        }
        matrix[i] = arr;

    }
    for (let i = 0; i < data.length; i++) {
        if(parseInt(data[i]['t']) > T + 3600){
            matrices_sch.push(matrix);
            matrix = [];
            for (let k = 0; k < Object.keys(indices).length; k++) {
                let arr = [];
                for (let l = 0; l < Object.keys(indices).length; l++) {
                    arr[l] = 0;
                }
                matrix[k] = arr;

            }
            T = parseInt(data[i]['t']);
        }
        matrix[indices[data[i]['i']]][indices[data[i]['j']]] = 1;
        matrix[indices[data[i]['j']]][indices[data[i]['i']]] = 1;
    }
    let loaded_data = load_data(matrices_sch);
    callback(loaded_data[0], loaded_data[1], loaded_data[2], loaded_data[3], loaded_data[4]);
});
}
