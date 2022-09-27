let matrices_flt = [];
let col_labels_flt = [];
let row_labels_flt = [];

// Datasets extracted from https://aviz.fr/~bbach/multipiles/
function load_flt(callback){

let filename = "FlashTap_flashtap_1_graphdat_8.dyjson";
//let filename = "RC4101_1_graphdat_16.dyjson";
//let filename = "RC4103_1_graphdat_16.dyjson";
//let filename = "RC4201_1_graphdat_16.dyjson";
//let filename = "RC4204_1_graphdat_16.dyjson";
d3.json(filename, function(err,data){
    if(err) console.log("error fetching data: " + err);
    let size = data.times.length;
    for (let i = 0; i < size; i++) {
        let step = data.times[i].matrix;
        matrices_flt.push(step);


    }
    for (let k = 0; k < matrices_flt.length; k++) {
        for (let i = 0; i < matrices_flt[0].length; i++) {
            for (let j = 0; j < matrices_flt[0][0].length; j++) {
                if(matrices_flt[k][i][j] >= 0.5){
                    matrices_flt[k][i][j] = 1;
                }
                else{
                    matrices_flt[k][i][j] = 0;
                }


            }
        }
    }
    let loaded_data = load_data(matrices_flt);
    callback(loaded_data[0], loaded_data[1], loaded_data[2], loaded_data[3], loaded_data[4]);
}); 
}