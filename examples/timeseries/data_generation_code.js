let cluster_matrix = [
    [1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1]
];

//generate_data(20);
//console.log(minLinks([0,1,5,10,11,12,13,2,14,15,16,9,3,4,7,6,8],[0,1,3,4,5,9,16,2,15,14,13,12,11,10,7,6,8]));
// Chance to fail... just rerun until a good dataset comes out... (:
function generate_data(t){
    let init_order = [];
    for (let i = 0; i < cluster_matrix.length; i++) {
        init_order.push(i);
    }
    for (let chance = 0; chance < 0.11; chance+= 0.05) {
        // ===== Slow drift =====
        console.log("Slow drift with chance " + chance);
        let matrices = generate_drifting_matrices(cluster_matrix,t,chance,2,0);
        console.log(matrices);
        // ===== Fast drift =====
        console.log("Fast drift with chance " + chance);
        matrices = generate_drifting_matrices(cluster_matrix,t,chance,4,0);
        console.log(matrices);
        // ===== Single Jump =====
        console.log("Single jump with chance " + chance);
        let matrices = generate_drifting_matrices(cluster_matrix,t,chance,2,1);
        console.log(matrices);
        // ===== Double Jump =====
        console.log("Double jump with chance " + chance);
        matrices = generate_drifting_matrices(cluster_matrix,t,chance,2,2);
        console.log(matrices);
    }
}

function generate_drifting_matrices(init_matrix,timesteps,chance,drift_speed, jumps){
    let res = [];
    res.push(flip_cells(init_matrix,chance));
    let orders = [];
    let init_order = [];
    for (let i = 0; i < init_matrix.length; i++) {
        init_order.push(i);
    }
    orders.push(init_order);
    for (let i = 1; i < Math.floor(timesteps/(jumps+1)); i++) {
        let neworder = greedy_drifting_order(orders[orders.length-1],init_matrix.length,drift_speed);
        let matrix = gen_inverse_from_order(flip_cells(init_matrix,chance),neworder);
        res.push(matrix);
//        console.log(matrix_to_string(reshuffle(matrix,neworder)));
//        console.log(minLinks(orders[orders.length-1],neworder).length);
        orders.push(neworder);
    }
    if(jumps === 2){
        let jump1 = add_greedy_move(add_greedy_move(add_greedy_move(orders[orders.length-1],4),4),4);
        orders.push(jump1);
        res.push(gen_inverse_from_order(flip_cells(init_matrix,chance),jump1));
        for (let i = 1; i < Math.round(timesteps/(jumps+1)); i++) {
            let neworder = greedy_drifting_order(orders[orders.length-1],init_matrix.length,drift_speed);
            let matrix = gen_inverse_from_order(flip_cells(init_matrix,chance),neworder);
            res.push(matrix);
    //        console.log(matrix_to_string(reshuffle(matrix,neworder)));
    //        console.log(minLinks(orders[orders.length-1],neworder).length);
            orders.push(neworder);
        }
    }
    if(jumps >= 1){
        let jump2 = add_greedy_move(add_greedy_move(add_greedy_move(orders[orders.length-1],4),4),4);
        orders.push(jump2);
        res.push(gen_inverse_from_order(flip_cells(init_matrix,chance),jump2));
        for (let i = 1; i < Math.ceil(timesteps/(jumps+1)); i++) {
            let neworder = greedy_drifting_order(orders[orders.length-1],init_matrix.length,drift_speed);
            let matrix = gen_inverse_from_order(flip_cells(init_matrix,chance),neworder);
            res.push(matrix);
    //        console.log(matrix_to_string(reshuffle(matrix,neworder)));
    //        console.log(minLinks(orders[orders.length-1],neworder).length);
            orders.push(neworder);
        }
    }
    if(chance === 0){
        console.log("Last order:");
        console.log(orders[orders.length-1]);
    }
    return res;
}

function matrix_to_string(m){
    let str = "[";
    for (let i = 0; i < m.length; i++) {
        for (let j = 0; j < m[0].length; j++) {
            str += m[i][j] + ", ";
        }
        str += "]\n[";
        
    }
    return str;
}

function greedy_drifting_order(init,n,drift_speed){
    let order = add_greedy_move(init,drift_speed);
    while(minLinks(init,order) < drift_speed - 1 || order.length !== n){
        order = add_greedy_move(init,drift_speed);
    }
    return order;
}

function reshuffle(matrix, order){
    let res = [];
    for (let i = 0; i < matrix.length; i++) {
        let row = [];
        for (let j = 0; j < matrix[0].length; j++) {
            row.push(matrix[order[i]][order[j]]);
        }
        res.push(row);
    }
    return res;
}

function gen_inverse_from_order(matrix, order){
    let res = [];
    for (let i = 0; i < matrix.length; i++) {
        let row = [];
        for (let j = 0; j < matrix[0].length; j++) {
            row.push(0);
        }
        res.push(row);
    }
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            res[order[i]][order[j]] = matrix[i][j];
        }
    }
    return res;
}

function flip_cells(matrix,chance){
    let res = [];
    for (let i = 0; i < matrix.length; i++) {
        let row = [];
        for (let j = 0; j < matrix[0].length; j++) {
            row.push(matrix[i][j]);
        }
        res.push(row);
    }
    for (let i = 0; i < matrix.length; i++) {
        let row = [];
        for (let j = i+1; j < matrix[0].length; j++) {
            if(Math.random() < chance){
                let v = Math.abs(res[i][j] - 1);
                res[i][j] = v;
                res[j][i] = v;
            }
        }
    }
    return res;
}


// Designed to work with two or four moves...
function add_greedy_move(order, nr_moves){
    
    let a = random_integer(0,order.length-1);
    let b = random_integer(0,order.length-1);
    let top_left = Math.min(a,b);
    let bot_left = Math.max(a,b);
    let top_right = random_integer(0,(order.length-1)-(bot_left - top_left));
    let bot_right = top_right + (bot_left - top_left);
    let link1;
    if(random_integer(0,1) || top_left === top_right){
        link1 = new link(top_left,bot_left,top_right,bot_right,true);
    }
    else{
        link1 = new link(top_left,bot_left,top_right,bot_right,false);
    }
    if(nr_moves === 2){
        let res = [];
        if(random_integer(0,1)){
            res = do_move_link(order,link1,random_integer(0,1));
        }
        else{
            res = do_swap_link(order,link1,random_integer(0,1));
        }
        return res;
    }
    // Number moves = 4, do another move
    let bool = random_integer(0,1);
    let cross = false;
    if(bool || Math.max(link1.botleft,link1.botright) === order.length-1){ // Above the previous
        let border = Math.min(link1.topleft,link1.topright) - 1;
        a = random_integer(0,border);
        b = random_integer(0,border);
        top_left = Math.min(a,b);
        bot_left = Math.max(a,b);
        if(random_integer(0,1) && (bot_left - top_left) < (order.length-1)-link1.botright){ // Let it cross the other move
            top_right = random_integer(Math.max(link1.botleft,link1.botright) + 1,(order.length-1)-(bot_left - top_left));
            cross = true;
        }
        else{ // No cross
            top_right = random_integer(0,(border)-(bot_left - top_left));
        }
    }
    else{ // Below the previous
        let border = Math.max(link1.botleft,link1.botright) + 1;
        a = random_integer(border,order.length-1);
        b = random_integer(border,order.length-1);
        top_left = Math.min(a,b);
        bot_left = Math.max(a,b);
        top_right = random_integer(border,(order.length-1)-(bot_left - top_left));
        
        if(random_integer(0,1) && (bot_left - top_left) < link1.topright){ // Let it cross the other move
            top_right = random_integer(0,(Math.min(link1.topleft,link1.topright) - 1)-(bot_left - top_left));
            cross = true;
        }
        else{ // No cross
            top_right = random_integer(border,(order.length-1)-(bot_left - top_left));
        }
        
    }
    bot_right = top_right + (bot_left - top_left);
    let link2;
    if(random_integer(0,1) || top_left === top_right){
        link2 = new link(top_left,bot_left,top_right,bot_right,true);
    }
    else{
        link2 = new link(top_left,bot_left,top_right,bot_right,false);
    }
    let res = [];
    if(random_integer(0,1)){
        res = do_move_link(order,link1,random_integer(0,1));
    }
    else{
        res = do_swap_link(order,link1,random_integer(0,1));
    }
    if(random_integer(0,1) && !cross){
        res = do_move_link(res,link2,random_integer(0,1));
    }
    else{
        res = do_swap_link(res,link2,random_integer(0,1));
    }
    return res;
    
}

function random_integer(min, max) {
    max = max + 0.5;
    min = min - 0.5;
    return Math.round(Math.random() * (max - min) + min);
}