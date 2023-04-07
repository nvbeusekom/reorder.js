function run_experiments(t,ls,str){
    // Just run all the things, print the mi values in the right formats
    let unstable = optimal_unstable(t,ls,str);
    console.log("IL")
    print_all(t);
    print_links(t);
    let simul = simultaneous_leaf_order_permute(t);
    console.log("SL")
    print_all(t);
    print_links(t);
    let all_greedy = all_intervals(t,ls,str);
    console.log("CI")
    print_all(t);
    print_links(t);
    let tree_greedy = greedy_tree_intervals(t,ls,str);
    console.log("TI")
    print_all(t);
    print_links(t);
    let all_simul = near_simultaneous_all_intervals(t,ls,str);
    console.log("CINS")
    print_all(t);
    print_links(t);
    let tree_simul = near_simultaneous_tree_intervals(t,ls,str);
    console.log("TINS")
    print_all(t);
    print_links(t);
//    console.log(tree_simul);
//    console.log("Morans I")
//    let res = "IL\tSL\tCI\tTI\tCINS\tTINS\n";
//    for (var i = 0; i < t.length; i++) {
//        res += unstable[0][i] + "\t" + simul[0][i] + "\t" + all_greedy[0][i] + "\t" + tree_greedy[0][i] + "\t" + all_simul[0][i] + "\t" + tree_simul[0][i] +"\n";
//    }
//    console.log(res);
//    console.log("Change")
//    let res2 = "IL\tSL\tCI\tTI\tCINS\tTINS\n";
//    for (var i = 0; i < t.length-1; i++) {
//        res2 += unstable[1][i] + "\t" + simul[1][i] + "\t" + all_greedy[1][i] + "\t" + tree_greedy[1][i] + "\t" + all_simul[1][i] + "\t" + tree_simul[1][i] +"\n";
//    }
//    console.log(res2);
//    console.log("Time")
//    let res3 = "IL\tSL\tCI\tTI\tCINS\tTINS\n";
//    res3 += unstable[2] + "\t" + simul[2] + "\t" + all_greedy[2] + "\t" + tree_greedy[2] + "\t" + all_simul[2] + "\t" + tree_simul[2] +"\n";
//    
//    console.log(res3);
}

function run_fast_experiments(t,ls,str){
    // Just run all the things, print the mi values in the right formats
    let unstable = optimal_unstable(t,ls,str);
    console.log(unstable);
    let simul = simultaneous_leaf_order_permute(t);
    console.log(simul);;
    let tree_greedy = greedy_tree_intervals(t,ls,str);
    console.log(tree_greedy);
    let tree_simul = near_simultaneous_tree_intervals(t,ls,str);
    console.log(tree_simul);
    console.log("Morans I")
    let res = "IL\tSL\tTI\tTINS\n";
    for (var i = 0; i < t.length; i++) {
        res += unstable[0][i] + "\t" + simul[0][i] + "\t" + tree_greedy[0][i] + "\t" + tree_simul[0][i] +"\n";
    }
    console.log(res);
    console.log("Change")
    let res2 = "IL\tSL\tTI\tTINS\n";
    for (var i = 0; i < t.length-1; i++) {
        res2 += unstable[1][i] + "\t" + simul[1][i] + "\t" + tree_greedy[1][i] + "\t" + tree_simul[1][i] +"\n";
    }
    console.log(res2);
    console.log("Time")
    let res3 = "IL\tSL\tTI\tTINS\n";
    res3 += unstable[2] + "\t" + simul[2] + "\t" + tree_greedy[2] + "\t" + tree_simul[2] +"\n";
    
    console.log(res3);
}

const nr_moves = 4;

function stepwise_improvement(t,str){
    // Leaf order on the first matrix
    let transpose = reorder.transpose(matrices[0]);
    let dist_rows = reorder.dist()(matrices[0]),
    dist_cols = reorder.dist()(transpose),
    order = reorder.optimal_leaf_order(),
    row_perm = order.distanceMatrix(dist_rows)(matrices[0]),
    col_perm = order.distanceMatrix(dist_cols)(transpose);
    
    t[0].order(row_perm, row_perm);
    
    for(let timestep = 1; timestep<t.length; timestep++){
        // Compute n and m, used for distance between rows
        let n = 0;
        let m = 0;
        for (let i = 0; i < matrices[timestep].length; i++) {
            for (let j = 0; j < matrices[timestep][0].length; j++) {
                n++;
                if(matrices[timestep][i][j] === 1){
                    m++;
                }
            }
        }
        // Compute smallest similarity between adjacent rows.
        let distar = weighted_value_rows(matrices[timestep][0],matrices[timestep][matrices[timestep].length-1],n,m);
        let minimum = n * n * n;
        let min_index = -1;
        for (let i = 0; i < matrices[timestep].length-1; i++) {
            let di = weighted_value_rows(matrices[timestep][i],matrices[timestep][i+1],n,m);
            if(di < minimum){
                minimum = di;
                min_index = i;
            }
        }
        // If the smallest distance in smaller than distar, we swap blocks in row perm
        if(minimum < distar){
            let new_perm = row_perm.slice(min_index+1).concat(row_perm.slice(0,min_index+1));
            row_perm = new_perm;
            
        }
        t[timestep].order(row_perm, row_perm);
        if(minimum < distar){
            t[timestep-1].highlight_order(t[timestep],timestep===1);
        }
    } 
    
}

function optimal_unstable(t,ls,str){
      let o1 = [];
      let l = [];
      let start = new Date().getTime();
      for(let i = 0; i<t.length; i++){
        let row_perm = lo_get_order(t,i);
        t[i].order(row_perm, row_perm);
        if(i > 0){
            ls[i-1].update_links(minLinks(o1,row_perm));
        }
        o1 = row_perm;
      }
      let end = new Date().getTime();
      let time = end - start;
      console.log("Time: " + time);
      return computeQualities(t,str,time);
}


function near_simultaneous_tree_intervals(t,ls,str){
    console.log("Tree intervals NS");
    let start = new Date().getTime();
    
    let simul_order = simul_get_order(t);
    let orders = [];
    let prev_order = [...simul_order];
    for (let timestep = 0; timestep < t.length; timestep++) {
        if(timestep > 0){
            prev_order = orders[timestep-1];
        }
        console.log("Doing " + timestep);
        let intervals = get_intervals(timestep,prev_order);
        
        let best_permutation = [];
        let best_inversion = [];
        let res = choose_k_intervals([],0,nr_moves, intervals, (x)=>reshuffle_intervals(timestep, x, prev_order, true, simul_order, nr_moves));
        best_permutation = res[1];
        best_inversion = res[2];
//        for (let i = 0; i < intervals.length; i++) {
//            for (let j = i+1; j < intervals.length; j++) {
//                let combination = [intervals[i],intervals[j]];
//                if(intervals[j][0] < intervals[i][0]){
//                    combination = [intervals[j],intervals[i]];
//                }
//                if(!overlapping_intervals(combination)){
//                    let res = reshuffle_intervals(timestep, combination, order, false, [], 2);
//                    if(res[0] > best_delta){
//                        best_delta = res[0];
//                        best_permutation = res[1];
//                        best_inversion = res[2];
//                    }
//                }
//            }
//        }
        let bestorder = create_order(prev_order,best_permutation,best_inversion);
        orders.push(bestorder);
    }
    
    let end = new Date().getTime();
    let time = end - start;
    console.log("Time: " + time);
    link_transitions = [];
    for (let i = 0; i < t.length; i++) {
        t[i].order(orders[i], orders[i]);
        if(i > 0){
            ls[i-1].update_links(minLinks(orders[i-1],orders[i]));
            link_transitions.push(minLinks(orders[i-1],orders[i]));
            if(minLinks(orders[i-1],orders[i]).length > nr_moves){
                debugger;
            }
        }
    }
    return computeQualities(t,str,time)
}

function check_proper_order(n,order){
    if(n !== order.length){
        debugger;
    }
    if(hasDuplicates(order)){
        debugger;
    }
    for (var i = 0; i < order.length; i++) {
        if(isNaN(order[i])){
            debugger;
        }
        if(order[i] < 0 || order[i] >= order.length){
            debugger;
        }
    }
}

function all_intervals(t,ls,str){
    console.log("All intervals");
    let start = new Date().getTime();
    let firstorder = lo_get_order(t,0);
    let orders = [firstorder];
    let intervals = [];
    for (let i = 0; i < firstorder.length; i++) {
        for (let j = i; j < firstorder.length; j++) {
            intervals.push([i,j]);
        }
    }
    for (let timestep = 1; timestep < t.length; timestep++) {
        console.log("Doing " + timestep);
        let order = orders[timestep-1];
        let best_permutation = [];
        let best_inversion = [];
        let res = choose_k_intervals([],0,nr_moves, intervals, (x)=>reshuffle_intervals(timestep, x, order, false, [], nr_moves));
        best_permutation = res[1];
        best_inversion = res[2];
        let bestorder = create_order(order,best_permutation,best_inversion);
//        console.log("Time: " + (new Date().getTime() - start));
        orders.push(bestorder);
    }
    let end = new Date().getTime();
    let time = end - start;
    console.log("Time: " + time);
    link_transitions = [];
    for (let i = 0; i < t.length; i++) {
        t[i].order(orders[i], orders[i]);
        if(i > 0){
            ls[i-1].update_links(minLinks(orders[i-1],orders[i]));
            link_transitions.push(minLinks(orders[i-1],orders[i]));
            if(minLinks(orders[i-1],orders[i]).length > nr_moves){
                debugger;
            }
        }
    }
    return computeQualities(t,str,time);
}

function near_simultaneous_all_intervals(t,ls,str){
    console.log("All intervals NS")
    let start = new Date().getTime();
    let simul_order = simul_get_order(t);
    let orders = [];
    let order = [...simul_order];
    let intervals = [];
    for (let i = 0; i < order.length; i++) {
        for (let j = i; j < order.length; j++) {
            intervals.push([i,j]);
        }
    }
//    console.log(intervals.length + " intervals");
    for (let timestep = 0; timestep < t.length; timestep++) {
        console.log("Doing " + timestep);
        if(timestep > 0){
            order = orders[timestep-1];
        }
        let best_permutation = [];
        let best_inversion = [];
        let res = choose_k_intervals([],0,nr_moves, intervals, (x)=>reshuffle_intervals(timestep, x, order, true, simul_order, nr_moves));
        best_permutation = res[1];
        best_inversion = res[2];
        let bestorder = create_order(order,best_permutation,best_inversion);
        orders.push(bestorder);
    }
    let end = new Date().getTime();
    let time = end - start;
    console.log("Time: " + time);
    link_transitions = [];
    for (let i = 0; i < t.length; i++) {
        t[i].order(orders[i], orders[i]);
        if(i > 0){
            ls[i-1].update_links(minLinks(orders[i-1],orders[i]));
            link_transitions.push(minLinks(orders[i-1],orders[i]));
            if(minLinks(orders[i-1],orders[i]).length > nr_moves){
                debugger;
            }
        }
    }
    return computeQualities(t,str,time);
}

// Try combinations of intervals taken from the hierarchical clustering trees.
function greedy_tree_intervals_slow(t,ls,str){
    let start = new Date().getTime();
    let firstorder = lo_get_order(t,0);
    let orders = [];
    orders.push(firstorder);
    for (let timestep = 1; timestep < t.length; timestep++) {
        console.log("Doing " + timestep);
        let order = orders[timestep-1];

        let intervals = get_intervals(timestep,order);
        
        let bestmi = evalOrder(timestep,order);
        let bestorder = order;
        for (let i = 0; i < intervals.length; i++) {
            for (let j = i+1; j < intervals.length; j++) {
                let combination = [intervals[i],intervals[j]];
                if(intervals[j][0] < intervals[i][0]){
                    combination = [intervals[j],intervals[i]];
                }
                if(!overlapping_intervals(combination)){
                    let o = reshuffle_intervals_slow(timestep, combination, order, false,order);
                    if(minLinks(order,o) > nr_moves){
                        debugger;
                    }
                    let omi = evalOrder(timestep,o);
                    if(omi > bestmi){
                        bestmi = omi;
                        bestorder = o;
                    }
                }
            }
        }
        if(minLinks(order,bestorder).length > nr_moves){
            debugger;
        }
        orders.push(bestorder);
    }
    let end = new Date().getTime();
    let time = end - start;
    console.log("Time: " + time);
    link_transitions = [];
    for (let i = 0; i < t.length; i++) {
        t[i].order(orders[i], orders[i]);
        if(i > 0){
            ls[i-1].update_links(minLinks(orders[i-1],orders[i]));
            link_transitions.push(minLinks(orders[i-1],orders[i]));
            if(minLinks(orders[i-1],orders[i]).length > nr_moves){
                debugger;
            }
        }
    }
    return computeQualities(t,str,time);
}

// Try combinations of intervals taken from the hierarchical clustering trees.
function greedy_tree_intervals(t,ls,str){
    console.log("Tree intervals");
    let start = new Date().getTime();
    let firstorder = lo_get_order(t,0);
    let orders = [];
    orders.push(firstorder);
    for (let timestep = 1; timestep < t.length; timestep++) {
        console.log("Doing " + timestep);
        let order = orders[timestep-1];

        let intervals = get_intervals(timestep,order);
        
        let best_permutation = [];
        let best_inversion = [];
        let res = choose_k_intervals([],0,nr_moves, intervals, (x)=>reshuffle_intervals(timestep, x, order, false, [], nr_moves));
        best_permutation = res[1];
        best_inversion = res[2];
//        for (let i = 0; i < intervals.length; i++) {
//            for (let j = i+1; j < intervals.length; j++) {
//                let combination = [intervals[i],intervals[j]];
//                if(intervals[j][0] < intervals[i][0]){
//                    combination = [intervals[j],intervals[i]];
//                }
//                if(!overlapping_intervals(combination)){
//                    let res = reshuffle_intervals(timestep, combination, order, false, [], 2);
//                    if(res[0] > best_delta){
//                        best_delta = res[0];
//                        best_permutation = res[1];
//                        best_inversion = res[2];
//                    }
//                }
//            }
//        }
        let bestorder = create_order(order,best_permutation,best_inversion);
//        console.log("Time: " + (new Date().getTime() - start));
        orders.push(bestorder);
    }
    let end = new Date().getTime();
    let time = end - start;
    console.log("Time: " + time);
    link_transitions = [];
    for (let i = 0; i < t.length; i++) {
        t[i].order(orders[i], orders[i]);
        if(i > 0){
            ls[i-1].update_links(minLinks(orders[i-1],orders[i]));
            link_transitions.push(minLinks(orders[i-1],orders[i]));
            if(minLinks(orders[i-1],orders[i]).length > nr_moves){
                debugger;
            }
        }
    }
    return computeQualities(t,str,time);
}

function get_intervals(timestep, prev_order){
    let dist = reorder.dist();
    dist.distance(getDistance(matrices[timestep]));
    let dist_rows = dist(matrices[timestep]);
    for (let i = 0; i < prev_order.length; i++) {
        let index = prev_order[i];
        for (let j = 0; j < dist_rows[0].length; j++) {
            if(i === 0 && j !== prev_order[i+1]){
                dist_rows[index][j] = Infinity; 
            }
            else if(i === prev_order.length - 1 && j !== prev_order[i-1]){
                dist_rows[index][j] = Infinity; 
            }
            else if(j !== prev_order[i-1] && j !== prev_order[i+1]){
                dist_rows[index][j] = Infinity;  
            }
        }
    }
    let hierarchical_tree = reorder.hcluster().linkage("single").distance(getDistance(matrices[timestep])).distanceMatrix(dist_rows)(matrices[timestep]);
    let intervals = tree_to_intervals(hierarchical_tree,prev_order);
    return intervals;
}

// Returns [All recursive intervals]
function tree_to_intervals(tree, order){
    if(tree.size === 1){
        let index = indexOf(order,tree.id);
        let interval = [index,index];
        return [interval];
    }
    let left = tree.left;
    let right = tree.right;
    let left_intervals = tree_to_intervals(left,order);
    let left_root_interval = left_intervals[left_intervals.length-1];
    
    let right_intervals = tree_to_intervals(right,order);
    let right_root_interval = right_intervals[right_intervals.length-1];
    
    let current_interval = [];
    if(left_root_interval[0] > right_root_interval[0]){
        current_interval = [right_root_interval[0],left_root_interval[1]];
    }
    else{
        current_interval = [left_root_interval[0],right_root_interval[1]];
    }
    let intervals = [...left_intervals,current_interval,...right_intervals];
    if(right_intervals[0][0] < left_intervals[0][0]){
        intervals = [...right_intervals,current_interval,...left_intervals];
    }
    return intervals;
}

// Return all permutations of an array
// From https://stackoverflow.com/questions/9960908/permutations-in-javascript
const permutator = (inputArr) => {
  let result = [];

  const permute = (arr, m = []) => {
    if (arr.length === 0) {
      result.push(m)
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next))
     }
   }
 }

 permute(inputArr)

 return result;
}
let intcount = 0;
// Call as choose_k([],0,k,input,callback)where callback should be reshuffle intervals with most parameters already filled in
function choose_k_intervals(array,count,k, input, callback){
    if(array.length === k) {
        return callback(array);
    }
    else {
        let best = [Number.NEGATIVE_INFINITY,[],[]];
        for (var i = count; i < input.length; i++) {
//            if(array.length === 0 && i>0 && input[i][0] > input[i-1][0]){
//                console.log(input[i][0]);
//            }
            if(array.length === 0 || !overlapping_intervals([array[array.length-1],input[i]])){
                let res = choose_k_intervals([...array,input[i]], i+1,k, input, callback);
                if(res[0] > best[0]){
                    best = res;
                }
            }
        }
        return [...best,array];
    }
}



// Intervals should be [low,high], ordered from low to high, non-overlapping
function reshuffle_intervals(timestep, tuples, order, check_with_simul, simul_order, nr_moves){
//    if(overlapping_intervals(tuples)){
//        return [-1,[],[]];
//    }
    let permutations = permutator(tuples);
    let inversals = all_possible_booleans(tuples.length);
    let best_delta = 0;
    let best_permutation = [];
    let best_inversion = [];
    for (let i = 0; i < permutations.length; i++) {
        let perm = permutations[i];
        // Check if the permuted intervals fit the input intervals
        if(evaluate_interval_permutation(timestep, inversals[0], order, tuples, perm) !== -1){
            // If so, apply all combinations of inversals
            for (let j = 0; j < inversals.length; j++) {
                let inv = inversals[j];
                
                let delta = evaluate_interval_permutation(timestep, inv, order, tuples, perm);
                
                if(check_with_simul && delta >= 0 && delta > best_delta){
                    let candidate = create_order(order,perm,inv);
                    if(minLinks(candidate,simul_order).length > nr_moves){
                        delta = -1;
                    }
                }
                if(delta > best_delta){
                    best_delta = delta;
                    best_permutation = perm;
                    best_inversion = inv;
                }
                
            }
        }
        
        
    }
    return [best_delta,best_permutation,best_inversion];
}

// Intervals should be [low,high], ordered from low to high, non-overlapping
function reshuffle_intervals_slow(timestep, tuples, order, check_with_simul, simul_order, nr_moves){
    let permutations = permutator(tuples);
    let inversals = all_possible_booleans(tuples.length);
    let bestmi = evalOrder(timestep, order);
    let bestorder = order;
    for (let i = 0; i < permutations.length; i++) {
        let perm = permutations[i];
        // Check if the permuted intervals fit the input intervals
        if(feasible_permutation(tuples,perm)){
            // If so, apply all combinations of inversals
            for (let j = 0; j < inversals.length; j++) {
                let inv = inversals[j];
                let neworder = create_order(order,perm,inv);
                check_proper_order(order.length,neworder); // O(n)
                if(evalOrder(timestep,neworder) > bestmi && (!check_with_simul || minLinks(neworder,simul_order).length <= nr_moves)){ // O(n)
                    bestorder = neworder;
                    bestmi = evalOrder(timestep,neworder);
                    if(minLinks(order,bestorder).length > nr_moves){
                        debugger;
                    }
                }
            }
        }
        
        
    }
    if(minLinks(order,bestorder).length > nr_moves){
        debugger;
    }
    return bestorder;
}

function create_order(order,perm,inv){
    if(perm.length === 0){
        return order;
    }
    let perm_tuple_i = 0;
    let neworder = [];
    for (var k = 0; k < order.length; k++) { // O(n)
        if(index_in_intervals(k,perm)){
            if(inv[perm_tuple_i]){
                for (let m = perm[perm_tuple_i][1]; m >= perm[perm_tuple_i][0]; m--) {
                    neworder.push(order[m]);
                }
            }
            else{
                for (let m = perm[perm_tuple_i][0]; m <= perm[perm_tuple_i][1]; m++) {
                    neworder.push(order[m]);
                }
            }
            k += perm[perm_tuple_i][1] - perm[perm_tuple_i][0];
            perm_tuple_i += 1;
        }
        else{
            neworder.push(order[k]);
        }
    }
    return neworder;
}

function all_possible_booleans(k){
    let res = [[true],[false]];
    for (let i = 0; i < k-1; i++) {
        let newres = [];
        for (let j = 0; j < res.length; j++) {
            let first = [...res[j]];
            let second = [...res[j]];
            first.push(true);
            second.push(false);
            newres.push(first);
            newres.push(second);
        }
        res = newres;
    }
    return res;
}

// Check if index is covered by list of intervals
function index_in_intervals(index,intervals){
    for (let i = 0; i < intervals.length; i++) {
        if(index >= intervals[i][0] && index <= intervals[i][1]){
            return true;
        }
    }
    return false;
}

function overlapping_intervals(intervals){
    for (var i = 0; i < intervals.length; i++) {
        for (var j = 0; j < intervals.length; j++) {
            if(i !== j){
                let i1 = intervals[i];
                let i2 = intervals[j];
                if(i1[0] >= i2[0] && i1[0] <= i2[1]){
                    return true;
                }
                if(i1[1] >= i2[0] && i1[1] <= i2[1]){
                    return true;
                }
            }
        }
    }
    return false;
}

function get_split_intervals(timestep, prev_order){
    let dist = reorder.dist();
    dist.distance(getDistance(matrices[timestep]));
    let dist_rows = dist(matrices[timestep]);
    for (let i = 0; i < prev_order.length; i++) {
        let index = prev_order[i];
        for (let j = 0; j < dist_rows[0].length; j++) {
            if(i === 0 && j !== prev_order[i+1]){
                dist_rows[index][j] = Infinity; 
            }
            else if(i === prev_order.length - 1 && j !== prev_order[i-1]){
                dist_rows[index][j] = Infinity; 
            }
            else if(j !== prev_order[i-1] && j !== prev_order[i+1]){
                dist_rows[index][j] = Infinity;  
            }
        }
    }
    let hierarchical_tree = reorder.hcluster().linkage("single").distance(getDistance(matrices[timestep])).distanceMatrix(dist_rows)(matrices[timestep]);
    let intervals1 = tree_to_intervals(hierarchical_tree.left,prev_order);
    let intervals2 = tree_to_intervals(hierarchical_tree.right,prev_order);
    return [intervals1,intervals2];
}

function vis_split_up(t,ls,str){
    console.log("VIS split tree intervals");
    let start = new Date().getTime();
    let firstorder = lo_get_order(t,0);
    let orders = [];
    orders.push(firstorder);
    for (let timestep = 1; timestep < t.length; timestep++) {
        console.log("Doing " + timestep);
        let order = orders[timestep-1];

        let intervals = get_split_intervals(timestep,order);
        
        let res = choose_k_intervals([],0,nr_moves, intervals[0], (x)=>reshuffle_intervals(timestep, x, order, false, [], nr_moves));
        let best_permutation = res[1];
        let best_inversion = res[2];
        let bestorder = create_order(order,best_permutation,best_inversion);
        
        let res2 = choose_k_intervals([],0,nr_moves, intervals[1], (x)=>reshuffle_intervals(timestep, x, bestorder, false, [], nr_moves));
        let best_permutation2 = res2[1];
        let best_inversion2 = res2[2];
        let bestorder2 = create_order(bestorder,best_permutation2,best_inversion2);
//        console.log("Time: " + (new Date().getTime() - start));
        orders.push(bestorder2);
    }
    let end = new Date().getTime();
    let time = end - start;
    console.log("Time: " + time);
    link_transitions = [];
    for (let i = 0; i < t.length; i++) {
        t[i].order(orders[i], orders[i]);
        if(i > 0){
            ls[i-1].update_links(minLinks(orders[i-1],orders[i]));
            link_transitions.push(minLinks(orders[i-1],orders[i]));
        }
    }
    return computeQualities(t,str,time);
}

// Takes left intervals, right intervals
function feasible_permutation(input_tuples, permutation){
    console.error("Don't use this function its not reliable");
    let left_surplus = 0;
    let right_surplus = 0;
    let left_i = 0;
    let right_i = 0;
    while(left_i < input_tuples.length && right_i < permutation.length){
        let left_len = input_tuples[left_i][1] - input_tuples[left_i][0];
        let right_len = permutation[right_i][1] - permutation[right_i][0];
        if(left_surplus === 0 && right_surplus === 0){ // Base case - the start
            
            
            // One is higher.. so.. advance on the lower side and keep track of the surplus
            if(left_len > right_len){
                left_surplus += left_len - right_len;
                right_i += 1;
            }
            else if(right_len > left_len){
                right_surplus += right_len - left_len;
                left_i += 1;
            }
            else{
                left_i += 1;
                right_i += 1; 
            }
            
            
        }
        else if(left_surplus > 0){
            // Check that we can continue
            if(permutation[right_i-1][1] + 1 !== permutation[right_i][0]){
                return false;
            }
            
            if(left_surplus > right_len){
                left_surplus -= right_len;
                right_i += 1;
            }
            else if(left_surplus === right_len){
                left_surplus = 0;
                left_i += 1;
                right_i += 1;
            }
            else if(right_len > left_surplus){
                right_surplus = right_len - left_surplus;
                left_surplus = 0;
                left_i += 1;
            }
        }
        else if(right_surplus > 0){
            // Check that we can continue
            if(input_tuples[left_i-1][1] + 1 !== input_tuples[left_i][0]){
                return false;
            }
            
            if(right_surplus > left_len){
                right_surplus -= left_len;
                left_i += 1;
            }
            else if(right_surplus === left_len){
                right_surplus = 0;
                left_i += 1;
                right_i += 1;
            }
            else if(left_len > right_surplus){
                left_surplus = left_len - right_surplus;
                right_surplus = 0;
                right_i += 1;
            }
        }
    }
    
    if(left_surplus === 0 && right_surplus === 0){
        return true;
    }
    return false;
}



// IDEA if right starts or end continues, then we need to do an evaluation
// Takes left intervals, right intervals
function evaluate_interval_permutation(timestep, inversal, order, input_tuples, permutation){
    let left_surplus = 0;
    let right_surplus = 0;
    let left_i = 0;
    let right_i = 0;
    let delta = 0;
    let connecting_to_previous = false;
    let continued = false;
    let plus_count = 0;
    let min_count = 0;
    while(left_i < input_tuples.length && right_i < permutation.length){
        let left_len = 1 + input_tuples[left_i][1] - input_tuples[left_i][0];
        let right_len = 1 + permutation[right_i][1] - permutation[right_i][0];
        if(left_surplus === 0 && right_surplus === 0){ // Base case - the start
            let right_start = permutation[right_i][0];
            let left_start = input_tuples[left_i][0];
            // Add new to delta, if not already done
            if(!connecting_to_previous && left_start !== 0){
                if(inversal[right_i]){
                    plus_count += 1;
                    delta += precomputedMI[timestep][order[left_start-1]][order[permutation[right_i][1]]];
                }
                else{
                    plus_count += 1;
                    delta += precomputedMI[timestep][order[left_start-1]][order[right_start]];
                }
            }
            
            // One is higher.. so.. advance on the lower side and keep track of the surplus
            if(left_len > right_len){
                left_surplus += left_len - right_len;
                
                // They must be connecting
                
                continued = true;
                connecting_to_previous = true;
                right_i += 1;
            }
            else if(right_len > left_len){
                continued = false;
                connecting_to_previous = false;
                right_surplus += right_len - left_len;
                left_i += 1;
            }
            else{
//                EVAL down, check for connecting
                // Check if it will be connecting afterwards
                
                continued = true;
                connecting_to_previous = left_i < input_tuples.length - 1 && input_tuples[left_i][1] + 1 === input_tuples[left_i+1][0];
                
                left_i += 1;
                right_i += 1; 
                
            }
            
            
        }
        else if(left_surplus > 0){
            // We should not have to eval here, because it is connecting!
            
            if(left_surplus > right_len){
                left_surplus -= right_len;
                
                // eval down, connecting
                continued = true;
                connecting_to_previous = true;
                right_i += 1;
                
            }
            else if(left_surplus === right_len){
                left_surplus = 0;
                
                // eval down, check for connecting
                continued = true;
                connecting_to_previous = left_i < input_tuples.length - 1 && input_tuples[left_i][1] + 1 === input_tuples[left_i+1][0];
                left_i += 1;
                right_i += 1;
                
            }
            else if(right_len > left_surplus){
                continued = false;
                connecting_to_previous = false;
                right_surplus = right_len - left_surplus;
                left_surplus = 0;
                left_i += 1;
            }
        }
        else if(right_surplus > 0){
            // Check that we can continue
            if(input_tuples[left_i-1][1] + 1 !== input_tuples[left_i][0]){
                return -1;
            }
            
            if(right_surplus > left_len){
                continued = false;
                connecting_to_previous = false;
                right_surplus -= left_len;
                left_i += 1;
            }
            else if(right_surplus === left_len){
                right_surplus = 0;
                
                // eval down, check for connecting
                continued = true;
                connecting_to_previous = left_i < input_tuples.length - 1 && input_tuples[left_i][1] + 1 === input_tuples[left_i+1][0];
                left_i += 1;
                right_i += 1;
                
            }
            else if(left_len > right_surplus){
                left_surplus = left_len - right_surplus;
                right_surplus = 0;
                
                
                // eval down, connecting
                continued = true;
                connecting_to_previous = true;
                
                right_i += 1;
                
            }
        }
        if(continued && connecting_to_previous){// continued on right side, eval down from last one
            if(right_i === permutation.length){
                return -1;
            }
            else{
                let up = permutation[right_i-1][1];
                if(inversal[right_i-1]){
                    up = permutation[right_i-1][0];
                }

                let down = permutation[right_i][0];
                if(inversal[right_i]){
                    down = permutation[right_i][1];
                }
                plus_count += 1;
                delta += precomputedMI[timestep][order[up]][order[down]];
            }
        }
        else if(continued){ // and not connecting hence the input tuple lines up
            let left_end = input_tuples[left_i-1][1];
            if(left_end !== order.length-1){
                let up = permutation[right_i-1][1];
                if(inversal[right_i-1]){
                    up = permutation[right_i-1][0];
                }
                plus_count += 1;
                delta += precomputedMI[timestep][order[up]][order[left_end+1]];
            }

        }
    }
    
    for (var i = 0; i < input_tuples.length; i++) {
        let interval = input_tuples[i];
        if(interval[0] !== 0){
            min_count +=1;
            delta -= precomputedMI[timestep][order[interval[0]]][order[interval[0]-1]];
        }
        if(interval[1] !== order.length-1 && (i === input_tuples.length -1 || interval[1]+1 !== input_tuples[i+1][0])){
            min_count +=1;
            delta -= precomputedMI[timestep][order[interval[1]]][order[interval[1]+1]];
        }
    }
    
    if(left_surplus === 0 && right_surplus === 0){
        if(plus_count !== min_count){
            debugger;
            evaluate_interval_permutation(timestep, inversal, order, input_tuples, permutation)
        }
        return delta;
    }
    return -1;
}

// Todo: not yet optimized for high n 
// Assumes tuples are [low,high], order of tuples irrelevant, tuples should be non-overlapping
function reshuffle_intervals_old(timestep, tuples, order, used_tuples, simul_order){
    let k = 2;
    let bestorder = order;
    let bestmi = evalOrder(timestep,order);
    for (let i = 0; i < tuples.length; i++) {
        used_tuples.push(tuples[i]);
        let b1 = tuples[i][0];
        let b2 = tuples[i][1];
        let len1 = Math.abs(b2-b1);
        // Do inverse
        if(!tuple_used(tuples[i],used_tuples)){ // Check if in-place is available
            let li1 = new link(b1,b2,b1,b2,true); 
            let order1 = do_move_link(order,li1,true);
            let best_recursion = reshuffle_intervals(timestep,remove_index(tuples,i),order1, used_tuples,simul_order);
            if(evalOrder(timestep,best_recursion) > bestmi && minLinks(best_recursion,simul_order).length <= k){
                bestmi = evalOrder(timestep,best_recursion); 
                bestorder = best_recursion; 
            }
        }
        
        // Check displacement
        for (let j = i+1; j < tuples.length; j++) {
            if(tuple_used(tuples[j],used_tuples)){
                continue;
            }
            used_tuples.push(tuples[j]);
            let b3 = tuples[j][0];
            let b4 = tuples[j][1];
            let newtuples = remove_two_indices(tuples,i,j);
            let len2 = Math.abs(b4-b3);
            // Check adjacent
            if(b3 === b2+1){
                let l1 = new link(b1,b2,b4-len1,b4,true); 
                let l2 = new link(b1,b2,b4-len1,b4,false);
                
                let o1 = do_move_link(order,l1,true);
                best_recursion = reshuffle_intervals(timestep,newtuples,o1, used_tuples,simul_order);
                if(evalOrder(timestep,best_recursion) > bestmi && minLinks(best_recursion,simul_order).length <= k){
                    bestmi = evalOrder(timestep,best_recursion); 
                    bestorder = best_recursion; 
                }
                let o2 = do_move_link(order,l2,true);
                best_recursion = reshuffle_intervals(timestep,newtuples,o2, used_tuples,simul_order);
                if(evalOrder(timestep,best_recursion) > bestmi && minLinks(best_recursion,simul_order).length <= k){
                    bestmi = evalOrder(timestep,best_recursion); 
                    bestorder = best_recursion; 
                }
                let o1inv = do_move_link(order,l1,false);
                best_recursion = reshuffle_intervals(timestep,newtuples,o1inv, used_tuples,simul_order);
                if(evalOrder(timestep,best_recursion) > bestmi && minLinks(best_recursion,simul_order).length <= k){
                    bestmi = evalOrder(timestep,best_recursion); 
                    bestorder = best_recursion; 
                }
                let o2inv = do_move_link(order,l2,false);
                best_recursion = reshuffle_intervals(timestep,newtuples,o2inv, used_tuples,simul_order);
                if(evalOrder(timestep,best_recursion) > bestmi && minLinks(best_recursion,simul_order).length <= k){
                    bestmi = evalOrder(timestep,best_recursion); 
                    bestorder = best_recursion; 
                }
            }
            // Check equal length further
            else if(len1 === len2){
                let l1 = new link(b1,b2,b3,b4,true); 
                let l2 = new link(b1,b2,b3,b4,false);
                
                let o1 = do_gap_move(order,l1,true);
                best_recursion = reshuffle_intervals(timestep,newtuples,o1, used_tuples,simul_order);
                if(evalOrder(timestep,best_recursion) > bestmi && minLinks(best_recursion,simul_order).length <= k){
                    bestmi = evalOrder(timestep,best_recursion); 
                    bestorder = best_recursion; 
                }
                let o2 = do_gap_move(order,l2,true);
                best_recursion = reshuffle_intervals(timestep,newtuples,o2, used_tuples,simul_order);
                if(evalOrder(timestep,best_recursion) > bestmi && minLinks(best_recursion,simul_order).length <= k){
                    bestmi = evalOrder(timestep,best_recursion); 
                    bestorder = best_recursion; 
                }
                let o1inv = do_gap_move(order,l1,false);
                best_recursion = reshuffle_intervals(timestep,newtuples,o1inv, used_tuples,simul_order);
                if(evalOrder(timestep,best_recursion) > bestmi && minLinks(best_recursion,simul_order).length <= k){
                    bestmi = evalOrder(timestep,best_recursion); 
                    bestorder = best_recursion; 
                }
                let o2inv = do_gap_move(order,l2,false);
                best_recursion = reshuffle_intervals(timestep,newtuples,o2inv, used_tuples,simul_order);
                if(evalOrder(timestep,best_recursion) > bestmi && minLinks(best_recursion,simul_order).length <= k){
                    bestmi = evalOrder(timestep,best_recursion); 
                    bestorder = best_recursion; 
                }
            }
            used_tuples.pop();
        }
        used_tuples.pop();
    }
    return bestorder;
}

function tuple_used(tuple, used_tuples){
    for (let i = 0; i < used_tuples.length; i++) {
        let check = used_tuples[i];
        if(tuple[0] >= check[0] && tuple[0] <= check[1]){
            return true;
        }
        if(tuple[1] >= check[0] && tuple[1] <= check[1]){
            return true;
        }
        if(check[0] >= tuple[0] && check[0] <= tuple[1]){
            return true;
        }
        if(check[1] >= tuple[0] && check[1] <= tuple[1]){
            return true;
        }
    }
    return false;
}

function remove_index(array, index){
    let res = [];
    for (let i = 0; i < array.length; i++) {
        if(i !== index){
            res.push(array[i]);
        }
    }
    return res;
}

function remove_two_indices(array, index1, index2){
    let res = [];
    for (let i = 0; i < array.length; i++) {
        if(i !== index1 && i !== index2){
            res.push(array[i]);
        }
    }
    return res;
}

function indexOf(array, elem){
    for (let i = 0; i < array.length; i++) {
        if(array[i] === elem){
            return i;
        }
    }
    return -1;
}


// Returns index of breakpoint that yields the highest MI, and that MI
function best_breakpoint(t,order,breakpoints){
    let best_i = 0;
    let best_mi = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < breakpoints.length; i++) {
        let b1 = breakpoints[i];
        let mi = 0;
        if(b1 === 0){
            mi = 2 * precomputedMI[t][order[b1]][order[b1+1]];
        }
        else if(b1 === order.length - 1){
            mi = 2 * precomputedMI[t][order[b1]][order[b1-1]];
        }
        else{
            mi = precomputedMI[t][order[b1]][order[b1-1]] + precomputedMI[t][order[b1]][order[b1+1]];
        }
            
        if(mi > best_mi){
            best_i = i;
            best_mi = mi;
        }
    }
    return [best_i,best_mi];
    
}

function print_links(l){
        let res = "";
//        console.log("printing:");
//        console.log(l);
        for (let i = 0; i < l.length; i++) {
            res += i.toString();
            res += '\n';
            for (let j = 0; j < l[i].links.length; j++) {
                res += l[i].links[j].print_link();
                res += '\n';
            }
        }
        console.log(res);
        return res;
}
//minLinks([1,2,3,4],[3,1,2,4]);

function minLinks(p1,p2){
    if(p1.length !== p2.length){
        return [];
    }
    let res = [];
    for (let i = 0; i < p1.length; i++) {
        let top_left = i;
        let bot_left = i;
        for (let j = 0; j < p2.length; j++) {
            if(p1[i] === p2[j]){
                let top_right = j;
                let bot_right = j;
                let inv = false;
                if(i === p1.length-1){
                    if(j !== p2.length-1){
//                        console.log(new link(i,i,j,j,false).print_link());
                        res.push(new link(i,i,j,j,false));
                    }
                    return res;
                }
                else if(j > 0 && p1[i+1] === p2[j-1]){
                    // Inverse loop
                    while(bot_left < p1.length && top_right > 0 && p1[bot_left+1] === p2[top_right-1]){
                        bot_left += 1;
                        top_right -= 1;
                    }
                    inv = true;
                }
                else if(j < p2.length-1 && p1[i+1] === p2[j+1]){
                    // Normal loop
                    while(bot_left < p1.length && bot_right < p2.length && p1[bot_left+1] === p2[bot_right+1]){
                        bot_left += 1;
                        bot_right += 1;
                    }
                }
                if(inv || top_left !== top_right){
//                    console.log(new link(top_left,bot_left,top_right,bot_right,inv).print_link());
                    res.push(new link(top_left,bot_left,top_right,bot_right,inv));
                }
            }
        }
        i = bot_left;
    
    }
    return res;
}

function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}

function identity(n){
    let identity = [];
    for (let i = 0; i < n; i++) {
        identity.push(i);
    }
    return identity;
}

function greedy_topk(t,ls,str) {
    let start = new Date().getTime();
    let identity = [];
    for (let i = 0; i < t[0].n; i++) {
        identity.push(i);
    }
    let id_reachable = get_reachable_orders(identity,1);
    let firstorder = lo_get_order(t,0);
    let paths = [[firstorder]];
    let MIs = [pathEval(paths[0])];
    for (let i = 1; i < t.length; i++) {
        console.log("Doing  t" + i);
        let new_paths = [];
        let new_MIs = [];
        for (let j = 0; j < paths.length; j++) {
//            console.log("Order " + j + " of timestep " + i);
            // For each path look at the last order
            let order = clone(paths[j][paths[j].length-1]);
            let reachable = map_reachable(order,id_reachable);
            let candidate = clone(paths[j]);
            candidate.push(reachable[0]);
//            console.log(candidate);
//            console.log("Before")
//            console.log(new_paths);
            for (let k = 0; k < reachable.length; k++) {
                // Make sure that the location of the added order is returned as well
                if(i === 1){
                    if(arrayEquals(reachable[k],[16,15,14,13,12,11,10,9,8,7,6,5,0,1,2,3,4,17,18,19])){
                        console.log("EQUALS--------------------------------------------");
                        console.log(evalOrder(i,reachable[k]));
                        console.log(MIs[j] + evalOrder(i,reachable[k]));
                    }
                }
                candidate[candidate.length-1] = reachable[k];
                let MI = MIs[j] + evalOrder(i,reachable[k]);
                // This cloning is slow, can it happen as ref by value? ========================================================= TODO ===========================
                let sol = possibly_add_path(new_paths,clone(candidate), new_MIs, MI);
                new_paths = sol[0];
                new_MIs = sol[1];
            }
//            console.log("After");
//            console.log(new_paths);
//            console.log(new_MIs);
        }
        paths = clone(new_paths);
        MIs = clone(new_MIs);
//        console.log(paths);
//        console.log(MIs);
//        return;
    }
    console.log(paths);
    console.log(MIs);
    let best = 0;
    for (let i = 0; i < MIs.length; i++) {
        if(MIs[i] > MIs[best]){
            best = i;
        }
    }
    let end = new Date().getTime();
    let time = end - start;
    console.log(time/1000);
    link_transitions = [];
    let res = paths[best];
    for (let i = 0; i < t.length; i++) {
        t[i].order(res[i], res[i]);
        if(i > 0){
            ls[i-1].update_links(minLinks(res[i-1],res[i]));
            link_transitions.push(minLinks(res[i-1],res[i]));
        }
    }
    return computeQualities(t,str,-1);
}

function greedy_lookahead(t,ls,str) {
    let start = new Date().getTime();
    let res = [];
    let identity = [];
    for (let i = 0; i < t[0].n; i++) {
        identity.push(i);
    }
    let id_reachable = get_reachable_orders(identity,1);
    let last_orders = [lo_get_order(t,0)];
//    let last_orders = [identity];
    for (let i = 1; i < t.length; i++) {
        console.log("Doing " + i);
        let best_new_orders = [];
        let best_order = 0;
        let best_value = Number.NEGATIVE_INFINITY;
        for (let j = 0; j < last_orders.length; j++) {
//            console.log("Order " + j + " of timestep " + i);
            let new_orders = [];
            let new_MIs = [];
            let reachable = map_reachable(last_orders[j],id_reachable);
            for (let k = 0; k < reachable.length; k++) {
                let MI = evalOrder(i,reachable[k]);
                let sol = possibly_add(new_orders,reachable[k],new_MIs,MI);
                new_orders = sol[0];
                new_MIs = sol[1];
            }
            let val = evalOrder(i-1,last_orders[j]) + averageEval(i,new_orders);
            if(val > best_value){
                best_new_orders = new_orders;
                best_order = j;
                best_value = val;
            }
        }
        res.push(last_orders[best_order]);
        last_orders = best_new_orders;
        if(i === t.length - 1){
            let best_val = -2;
            let best_ind = 0;
            for (let j = 0; j < last_orders.length; j++) {
                let mi = evalOrder(i,last_orders[j]);
                if(mi > best_val){
                    best_val = mi;
                    best_ind = j;
                }
            }
            res.push(last_orders[best_ind]);
        }
    }
//    console.log(res);
    let end = new Date().getTime();
    let time = end - start;
    console.log(time/1000);
    link_transitions = [];
    for(let i = 0; i<t.length; i++){
        t[i].order(res[i], res[i]);
        if(i > 0){
            ls[i-1].update_links(minLinks(res[i-1],res[i]));
            link_transitions.push(minLinks(res[i-1],res[i]));
        }
    }
    return computeQualities(t,str,-1);
}

function averageEval(timestep, orders){
    let sum = 0;
    for (let i = 0; i < orders.length; i++) {
        sum += evalOrder(timestep,orders[i]);
    }
    return sum / orders.length;
}

function pathEval(path){
    let sum = 0;
    for (let i = 0; i < path.length; i++) {
//        console.log(path[i]);
        sum += evalOrder(i,path[i]);
    }
    return sum / path.length;
}

// The function assumes a list of neworders that are the best right now and check if order is worthy of joining, replacing some of them

function possibly_add(new_orders,order, new_MIs, MI){
    if(new_orders.length < 10){
        new_orders.push(order);
        new_MIs.push(MI);
        return [new_orders,new_MIs];
    }
    
//    let candidate = -1;
//    // Check how many are similar
//    for (let i = 0; i < new_orders; i++) {
//        if(difference(order,new_orders[i]) <= 2){
//            // Two are similar, it can never be added
//            if(candidate >= 0){
//                return new_orders;
//            }
//            candidate = i;
//        }
//    }
//    // One is similar
//    if(candidate >= 0){
//        if(evalOrder(timestep,order) > evalOrder(timestep,new_orders[candidate])){
//            new_orders[candidate] = order;
//        }
//        return new_orders;
//    }
//    // None is similar, get the best one
//    candidate = 0;
//    for (let i = 1; i < new_orders.length; i++) {
//        if(evalOrder(timestep,new_orders[i]) < evalOrder(timestep,new_orders[candidate])){
//            candidate = i;
//        }
//    }
//    new_orders[candidate] = order;
//    return new_orders;
    
    // A lot of cachinng..
    let lowest = new_orders.length;
    let lowestMI = MI;
    let similar_lower = [];
    for (let i = 0; i < new_orders.length; i++) {
        let checkOrder = new_orders[i];
        let evalI = new_MIs[i];
        if(evalI > MI){
            if(difference(order,checkOrder) <= 4){
                // Something similar and better is in new_orders
                return [new_orders,new_MIs];
            }
        }
        else{
            if(difference(order,checkOrder) <= 4){
                similar_lower.push(i);
            }
        }
        if(evalI < lowestMI){
            lowestMI = evalI;
            lowest = i;
        }
    }
    // Order is worse than everything in new_orders currently
    if(lowest === new_orders.length){
        return [new_orders,new_MIs];
    }
    let res1 = [];
    let res2 = [];
    let similar_index = 0;
    // Construct the result
    for (let i = 0; i < new_orders.length; i++) {
        if(similar_lower.length === 0){
            // Toss the worst
            if(i !== lowest){
                res1.push(new_orders[i]);
                res2.push(new_MIs[i]);
            }
        }
        else{
            // Toss everything similar
            if(similar_index === similar_lower.length || i !== similar_lower[similar_index]){
                res1.push(new_orders[i]);
                res2.push(new_MIs[i]);
            }
            else{
                similar_index += 1;
            }
        }
    }
    res1.push(order);
    res2.push(MI);
    return [res1,res2];
    
    
}
// The function assumes a list of neworders that are the best right now and check if order is worthy of joining, replacing some of them
function possibly_add_path(new_paths,path,new_MIs, MI){
    if(new_paths.length < 10){
        new_paths.push(path);
        new_MIs.push(MI);
        return [new_paths,new_MIs];
    }
    
    let order = path[path.length-1];
    
    let similar_lower = [];
    let lowestMI = MI;
    let lowest = new_paths.length;
//    return new_paths, new_MIs;
    for (let i = 0; i < new_paths.length; i++) {
        let checkOrder = new_paths[i][new_paths[i].length-1];
        if(new_MIs[i] > MI){
            if(difference(order,checkOrder) <= 4){
                // Something similar and better is in new_orders
                return [new_paths,new_MIs];
            }
        }
        else{
            if(difference(order,checkOrder) <= 4){
                similar_lower.push(i);
            }
        }
        if(new_MIs[i] < lowestMI){
            lowestMI = new_MIs[i];
            lowest = i;
        }
    }
    // Order is worse than everything in new_orders currently
    if(lowest === new_paths.length){
        return [new_paths,new_MIs];
    }
    let res1 = [];
    let res2 = [];
    let similar_index = 0;
    // Construct the result
    for (let i = 0; i < new_paths.length; i++) {
        if(similar_lower.length === 0){
            // Toss the worst
            if(i !== lowest){
                res1.push(new_paths[i]);
                res2.push(new_MIs[i]);
            }
        }
        else{
            // Toss everything similar
            if(similar_index === similar_lower.length || i !== similar_lower[similar_index]){
                res1.push(new_paths[i]);
                res2.push(new_MIs[i]);
            }
            else{
                similar_index += 1;
            }
        }
    }
    res1.push(clone(path));
    res2.push(MI);
    return [res1,res2];
    
    
}

function difference(o1,o2){
    let count = 0;
    for (let i = 0; i < o1.length; i++) {
        if(o1[i] !== o2[i]){
            count++;
        }
    }
    return count;
}

function map_reachable(order,reachable){
    let res = [];
    for (let i = 0; i < reachable.length; i++) {
        let reach = reachable[i];
        let o = [];
        for (let j = 0; j < order.length; j++) {
            o.push(order[reach[j]]);
        }
        res.push(o);
    }
    return res;

}

function near_simultaneous_incremental(t,ls,str){
    let start = new Date().getTime();
    let simul_order = simul_get_order(t);
    let reachable = get_reachable_orders(simul_order,1);
    let orders = [];
    for (let i = 0; i < t.length; i++) {
        console.log("Doing t" + i);
        let highest = -2;
        let highest_index = 0;
        for (let j = 0; j < reachable.length; j++) {
            let simul_order = reachable[j];
            let mi = evalOrder(i,simul_order);
            if(mi > highest && (i === 0 || minLinks(orders[i-1],reachable[j]).length <= 2)){
                highest = mi;
                highest_index = j;
            }
        }
        orders.push(reachable[highest_index]);
    }
    let end = new Date().getTime();
    let time = end - start;
    console.log(time/1000);
    link_transitions = [];
    for(let i = 0; i<t.length; i++){
        t[i].order(orders[i], orders[i]);
        if(i > 0){
            ls[i-1].update_links(minLinks(orders[i-1],orders[i]));
            link_transitions.push(minLinks(orders[i-1],orders[i]));
        }
    }
    console.log(orders);
    return computeQualities(t,str,-1);
}  

// Precompute and map indices!
function get_reachable_orders(initial, nr_moves){
    return get_reachable_k2(initial);
    let orders = add_move(initial,[],nr_moves);
    console.log("With dups:");
    console.log(orders.length);
    let no_dups = [];
    for (let i = 0; i < orders.length; i++) {
        let occurs_twice = false;
        for (let j = i+1; j < orders.length; j++) {
            if(same_array(orders[i],orders[j])){
                occurs_twice = true;
            }
        }
        if(!occurs_twice){
            no_dups.push(orders[i]);
        }
    }
    console.log("Reachable orders size: ");
    console.log(no_dups.length);
    return no_dups;
    
}

function sort_array(arr){
    
}

function same_array(o1,o2){
    if(o1.length !== o2.length){
        return false;
    }
    for(let i = 0 ; i < o1.length; i++){
        if(o1[i] !== o2[i]){
            return false;
        }
    }
    return true;
}

function get_reachable_k2(order){
    let reachable = [order];
    for(let i = 0; i < order.length; i++){
        for(let j = i; j < order.length; j++){
            let len = (j - i);
            // Left interval, perfect inversal
            // 1. do inversal
            if(len > 0){
                let singleInvert = do_move_link(order,new link(i,j,i,j,true),true);
                // 2 add that isngle ordering
                reachable.push(singleInvert);
                // 3. Add all the extra inversals
                for(let k = j+1; k < order.length; k++){
                    for(let l = k+1; l < order.length; l++){
                        let nextInvert = do_move_link(singleInvert,new link(k,l,k,l,true),true);
                        reachable.push(nextInvert);
                    }
                }
            }
            // Left interval, link going down
            for(let k = i+1; k < order.length-len; k++){
                let l = k + len;
                
                if(k > j+1){
                    //Both not inversed
                    let s1 = do_gap_move(order,new link(i,j,k,l,false),false);
                    reachable.push(s1);
                    // Down inversed
                    if(len > 0){
                        let s2 = do_gap_move(order,new link(i,j,k,l,true),false);
                        reachable.push(s2);
                  
                        // Up inversed
                        let s3 = do_gap_move(order,new link(i,j,k,l,false),true);
                        reachable.push(s3);
                    
                        // Both inversed
//                        let s4 = do_gap_move(order,new link(i,j,k,l,true),true);
//                        reachable.push(s4);
                    }
                }
                
                //Both not inversed
                let s1 = do_move_link(order,new link(i,j,k,l,false),false);
                reachable.push(s1);
                // Down inversed
                if(len > 0 && k-i > 1){
                    let s2 = do_move_link(order,new link(i,j,k,l,true),false);
                    reachable.push(s2);
                }
                // Up inversed
                if(k > i+1 && len > 0){
                    let s3 = do_move_link(order,new link(i,j,k,l,false),true);
                    reachable.push(s3);
                }
                // Both inversed
                if(len > 0 && k > i+1 && k !== j+1 && k !== j+2){
                    let s4 = do_move_link(order,new link(i,j,k,l,true),true);
                    reachable.push(s4);
                }
            }
        }
    }
    console.log("Reachable:");
    console.log(reachable.length);
//    return reachable;
    let no_dups = [];
    reachable.sort();
    for (let i = 0; i < reachable.length; i++) {
        if(i === reachable.length-1 || !same_array(reachable[i],reachable[i+1])){
            no_dups.push(reachable[i]);
        }
    }
    console.log("First no dups");
    console.log(no_dups.length);
//    console.log(no_dups);
//    no_dups = [];
//    for (let i = 0; i < reachable.length; i++) {
//        let occurs_twice = false;
//        for (let j = i+1; j < reachable.length; j++) {
//            if(same_array(reachable[i],reachable[j])){
//                occurs_twice = true;
//            }
//        }
//        if(!occurs_twice){
//            no_dups.push(reachable[i]);
//        }
//    }
//    console.log("Second no dups: ");
//    console.log(no_dups.length);
//    console.log(no_dups);
    
    return no_dups;
}

function add_move(order,links, nr_moves){
    let outcomes = [order];
    if(nr_moves === 0){
        return outcomes;
    }
    for (let i = 0; i < order.length; i++) {
        for (let x = 0; x < links.length; x++) {
            if(i >= links[x].topleft && i <= links[x].botleft){
                i = links[x.botleft];
                break;
            }
        }
        for (let j = i; j < order.length; j++) {
            for (let x = 0; x < links.length; x++) {
                if(j === links[x].topleft){
                    j = order.length;
                    break;
                }
            }
            // Add i,j as the left side of a link
            // Same principle for right side (quadruple for loop with checking the links)
            for (let k = 0; k < order.length; k++) {
                for (let x = 0; x < links.length; x++) {
                    if(k >= links[x].topright && k <= links[x].botright){
                        k = links[x.botright];
                        break;
                    }
                }
                for (let l = k; l < order.length; l++) {
                    for (let x = 0; x < links.length; x++) {
                        if(l === links[x].topleft){
                            l = order.length;
                            break;
                        }
                    }
                    if(l-k === j-i){
                        // Add, ij -> kl and ij -> lk
                        // Prevent identical outcome
                        if(i !== k){
                            for (let bool = 0; bool <= 1; bool++) {
                                let newlinks = [...links];
                                let link1 = new link(i,j,k,l,false);
                                newlinks.push(link1);
                                let neworder1 = do_move_link(order,link1, bool);
                                outcomes = outcomes.concat(add_move(neworder1,newlinks,nr_moves-1));
                                if(!bool || i !== j){ // No need to invert single swaps
                                    let newlinks1 = [...links];
                                    newlinks1.push(link1);
                                    neworder1 = do_swap_link(order,link1,bool);
                                    outcomes = outcomes.concat(add_move(neworder1,newlinks1,nr_moves-1));
                                }
                            }
                        } // No need to invert singles
                        else if(i !== j){
                            for (let bool = 0; bool <= 1; bool++) {
                                let newlinksInv = [...links];
                                let link2 = new link(i,j,k,l,true);
                                newlinksInv.push(link2);
                                let neworder2 = do_move_link(order,link2,bool);
                                outcomes = outcomes.concat(add_move(neworder2,newlinksInv,nr_moves-1));
                                let newlinksInv1 = [...links];
                                newlinksInv1.push(link2);
                                neworder2 = do_swap_link(order,link2,bool);
                                outcomes = outcomes.concat(add_move(neworder2,newlinksInv1,nr_moves-1));
                            }
                        }
                    }
                    
                }
            }
            // Print the ouput, save it for precomputing purposes...
        }
    }
    return outcomes;
}

function do_gap_move(order,l,inv){
    let neworder = [...order];
    // Move the Link part
    let b;
    if(l.inversed){
        b = l.botright;
    }
    else{
        b = l.topright;
    }
    for(let a = l.topleft; a <= l.botleft; a++){
        neworder[b] = order[a];
        if(l.inversed){
            b--;
        }
        else{
            b++;
        }
    }
    // Move the rest
    if(inv){
        b = l.botleft;
    }
    else{
        b = l.topleft;
    }
    for(let a = l.topright; a <= l.botright; a++){
        neworder[b] = order[a];
        if(inv){
            b--;
        }
        else{
            b++;
        }
    }
    if(hasDuplicates(neworder) || minLinks(order,neworder).length > 2 || neworder.length !== order.length){
        debugger;
    }
    return neworder;
}

// For compatibility
function do_swap_link(order,l,inv){
    if(l.botleft === l.topright-1 || l.topleft === l.botright+1){
        return do_move_link(order,l,inv);
    }
    return do_gap_move(order,l,inv);
}

function do_move_link(order,l,inv){
    let neworder = [...order];
    // Move the Link part
    let b;
    if(l.inversed){
        b = l.botright;
    }
    else{
        b = l.topright;
    }
    for(let a = l.topleft; a <= l.botleft; a++){
        neworder[b] = order[a];
        if(l.inversed){
            b--;
        }
        else{
            b++;
        }
    }
    // Move the rest
    // Link is going down
    if(l.topleft < l.topright){
        if(!inv){
            let b = l.topleft;
            for(let a = l.botleft+1; a <= l.botright; a++){
                neworder[b] = order[a];
                b++;
            }
        }
        else{
            let b = l.topright-1;
            for(let a = l.botleft+1; a <= l.botright; a++){
                neworder[b] = order[a];
                b--;
            }
        }
    }
    // Link is going up 
    else{
        if(!inv){
            let b = l.botright+1;
            for(let a = l.topright; a < l.topleft; a++){
                neworder[b] = order[a];
                b++;
            }
        }
        else{
            let b = l.botleft;
            for(let a = l.topright; a < l.topleft; a++){
                neworder[b] = order[a];
                b--;
            }
        }
    }
    if(hasDuplicates(neworder) || minLinks(order,neworder).length > 2 || neworder.length !== order.length){
        debugger;
    }
    return neworder;
}

function hasDuplicates(array) {
    return (new Set(array)).size !== array.length;
}

function near_simultaneous_dag(t,ls,str){
    let start = new Date().getTime();
    // Create DAG / adjacency list
    let simul_order = simul_get_order(t);
    let reachable = get_reachable_orders(simul_order,1);
    let adjacencylist = [];
    for (let i = 0; i < reachable.length; i++) {
        let fromi = [];
        if(i%1000 === 0){
            console.log(i + " of " + reachable.length);
        }
        for (let j = 0; j < reachable.length; j++) {
            if(minLinks(reachable[i],reachable[j]).length <= 2){
                fromi.push(j);
            }
        }
        adjacencylist.push(fromi);
    }
    // O(V+E) computes MIs per timestep and the best paths to them
    // Keep one path per vertex: the best one,
    // a path is valued on the total of MIs
    let all_refs = [];
    let nodevalues = [];
    let fill = [];
    for (let i = 0; i < reachable.length; i++) {
        nodevalues.push(evalOrder(0,reachable[i]));
        fill.push(0);
    }
    // Push a useless array so that the indices match up
    all_refs.push(fill);
    for (let i = 1; i < t.length; i++) {
        console.log("Timestep " + i);
        let irefs = [];
        let try_values = [];
        for (let j = 0; j < reachable.length; j++) {
            try_values.push(Number.NEGATIVE_INFINITY);
            irefs.push(0);
        }
        for (let j = 0; j < adjacencylist.length; j++) {
            let neighbors = adjacencylist[j];
            for (let k = 0; k < neighbors.length; k++) {
                let reach = neighbors[k];
                let value = nodevalues[j] + evalOrder(i,reachable[reach]);
                if(value > try_values[reach]){
                    try_values[reach] = value;
                    irefs[reach] = j;
                }
                
            }
        }
        nodevalues = try_values;
        all_refs.push(irefs);
    }
    let best = 0;
    for (let i = 0; i < nodevalues.length; i++) {
        if(nodevalues[best] < nodevalues[i]){
            best = i;
        }
    }
    let orders = [];
    for (let i = 0; i < t.length; i++) {
        orders.push([]);
    }
    let lastindex = best;
    orders[t.length-1] = reachable[lastindex];
    for (let i = t.length-2; i >= 0; i--) {
        let index = all_refs[i+1][lastindex];
        orders[i] = reachable[index];
        lastindex = index;
    }
    let end = new Date().getTime();
    let time = end - start;
    console.log(time/1000);
    link_transitions = [];
    for(let i = 0; i<t.length; i++){
        t[i].order(orders[i], orders[i]);
        if(i > 0){
            ls[i-1].update_links(minLinks(orders[i-1],orders[i]));
            link_transitions.push(minLinks(orders[i-1],orders[i]));
        }
    }
    return computeQualities(t,str,-1);
    
}

// Since NN-2OPT is a heuristic, it does not always find the optimal last ordering. 
// For the no-noise generated datasets we can simply provide the optimal ordering that is used in data generation.
function get_last_order(order){
    if(document.getElementById('dataset').value === "gensd0"){
        order = [2,17,16,19,1,3,4,5,13,12,10,9,6,7,14,15,0,18,11,8];
    }
    if(document.getElementById('dataset').value === "genfd0"){
        order = [9,18,10,19,12,15,13,2,5,4,11,6,1,3,17,14,7,16,0,8];
    }
    if(document.getElementById('dataset').value === "gensj0"){
        order = [10,12,15,13,8,14,2,17,11,3,16,19,9,1,0,6,5,18,7,4];
    }
    if(document.getElementById('dataset').value === "gendj0"){
        order = [19,18,2,7,9,10,14,4,15,6,3,5,8,13,1,12,16,11,0,17];
    }
    return order;
}
function interpolate_linearly(t,ls,str){
    let starttime = new Date().getTime();
    let identity = [];
    for (let i = 0; i < t[0].n; i++) {
        identity.push(i);
    }
    let id_reachable = get_reachable_orders(identity,1);
    let start = lo_get_order(t,0);
    let end = lo_get_order(t,t.length-1);
    end = get_last_order(end);
    let res = [start];
    for (let i = 1; i < t.length-1; i++) {
        let best_value = Number.NEGATIVE_INFINITY;
        let best_index = -1;
//        console.log(can_interpolate_to(res[i-1],end,t.length-i));
        let reachable = map_reachable(res[i-1],id_reachable);
        console.log("T" + i);
//        console.log("Checking " + reachable.length + " candidates");
//        console.log("Last changes: " + nr_changes(res[i-1],end));
//        console.log(res[i-1]);
//        console.log(end);
        for (let j = 0; j < reachable.length; j++) {
//            if(same_array(reachable[j],[0,25,9,16,1,21,27,10,20,24,22,17,6,8,26,23,3,4,5,18,11,14,13,15,2,12,7,28,19])){
//                console.log("ITS IN HERE!");
//            }
            if(can_interpolate_to(reachable[j],end,(t.length-1)-i)){
                let score = evalOrder(i,reachable[j]);
                if(score > best_value){
                    best_value = score;
                    best_index = j;
                }
            }
        }
        if(best_index === -1){
            console.log("Interpolation not possible");
            return;
        }
        console.log("Found order for t" + i);
        res.push(reachable[best_index]);
    }
    res.push(end);
//    console.log(res);
    let endtime = new Date().getTime();
    let time = endtime - starttime;
    console.log(time/1000);
    link_transitions = [];
    for (let i = 0; i < t.length; i++) {
        console.log(res[i]);
        t[i].order(res[i], res[i]);
        if(i > 0){
            ls[i-1].update_links(minLinks(res[i-1],res[i]));
            link_transitions.push(minLinks(res[i-1],res[i]));
        }
    }
    return computeQualities(t,str,-1);
}

function interpolate_twoway(t,ls,str){
    let starttime = new Date().getTime();
    let identity = [];
    for (let i = 0; i < t[0].n; i++) {
        identity.push(i);
    }
    let id_reachable = get_reachable_orders(identity,1);
    let start = lo_get_order(t,0);
    let end = lo_get_order(t,t.length-1);
    end = get_last_order(end);
    let res = [start];
    let res_inv = [end];
    for (let i = 2; i < t.length; i++) {
        if(i % 2 === 0){
            let best_value = Number.NEGATIVE_INFINITY;
            let best_index = 0;
            let reachable = map_reachable(res[res.length-1],id_reachable);
            for (let j = 0; j < reachable.length; j++) {
                if(can_interpolate_to(reachable[j],res_inv[res_inv.length-1],(t.length-1)-i)){
                    let score = evalOrder(Math.floor(i/2),reachable[j]);
                    if(score > best_value){
                        best_value = score;
                        best_index = j;
                    }
                }
            }
            res.push(reachable[best_index]);
        }
        else{
            let best_value = Number.NEGATIVE_INFINITY;
            let best_index = 0;
            let reachable = map_reachable(res_inv[res_inv.length-1],id_reachable);
            for (let j = 0; j < reachable.length; j++) {
                if(can_interpolate_to(reachable[j],res[res.length-1],(t.length-1)-i)){
                    let score = evalOrder((t.length-1)-Math.floor(i/2),reachable[j]);
                    if(score > best_value){
                        best_value = score;
                        best_index = j;
                    }
                }
            }
            res_inv.push(reachable[best_index]);
        }
    }
    for (let i = res_inv.length-1; i >= 0; i--) {
        res.push(res_inv[i]);
    }
//    console.log(res);
    let endtime = new Date().getTime();
    let time = endtime - starttime;
    console.log(time/1000);
    link_transitions = [];
    for (let i = 0; i < t.length; i++) {
        t[i].order(res[i], res[i]);
        if(i > 0){
            ls[i-1].update_links(minLinks(res[i-1],res[i]));
            link_transitions.push(minLinks(res[i-1],res[i]));
        }
    }
    return computeQualities(t,str,-1);
    
}


function nr_changes(a,b){
    let changes = 0;
    for (let i = 0; i < a.length; i++) {
        if(a[i] !== b[i]){
            changes += 1;
        }
    }
    return changes;
}

function can_interpolate_to(a,b,batches){
//    return batches >= nr_changes(a,b);
    let m = minLinks(a,b).length;
    return batches >= (m + count_gaps(a,b))-1;
}

function count_gaps(a,b){
    let ingap = a[0] === b[0];
    let gaps = 0;
    for (let i = 1; i < a.length; i++) {
        if(!ingap && a[i] === b[i]){
            gaps += 1;
            ingap = true;
        }
        if(ingap && a[i] !== b[i])
            ingap = false;
    }
    if(a[a.length-1] === b[b.length-1]){
        gaps = gaps - 1;
    }
    return gaps;
}

function all_equal(a,b,c,d){
    return a === b && a === c && a === d && b === c && b === d && c === d;
}

function weighted_value_rows(r1,r2,cells,m){
    let result = 0;
    for (let i = 0; i < r1.length; i++) {
        result += (r1[i] * cells - m) * (r2[i] * cells - m);
    }
    return result;
}

function lo_get_order(t,timestep) {
    let dist = reorder.dist();
    dist.distance(getDistance(matrices[timestep]));
    let dist_rows = dist(matrices[timestep]);
//      let transpose = reorder.transpose(matrices[timestep]),
//      dist_cols = reorder.dist()(transpose);
    let order = reorder.optimal_leaf_order(),
    row_perm = order.distanceMatrix(dist_rows)(matrices[timestep]);
//      let col_perm = order.distanceMatrix(dist_cols)(transpose);

    return row_perm;
}

function simul_get_order(t) {
    let distances = [];
    for (let i = 0; i < t.length; i++) {
        distances.push(getDistance(matrices[i]));
    }
    let dist_rows = reorder.mult_dist()(matrices,distances);
    let order = reorder.optimal_leaf_order();
    let row_perm = order.distanceMatrix(dist_rows)(matrices[0]);
    return row_perm;
}

function precompute(){
    precomputedMI = [];
    for (let i = 0; i < matrices.length; i++) {
        // Compute n and m
        let matrix = [];
        
        let n = 0;
        let m = 0;
        for (let x = 0; x < matrices[i].length; x++) {
            for (let y = 0; y < matrices[i][0].length; y++) {
                n++;
                if(matrices[i][x][y] === 1){
                    m++;
                }
            }
        }
        
        for (let j = 0; j < matrices[i].length; j++) {
            let rowj = [];
            for (let k = 0; k < matrices[i].length; k++) {
                // Add mi gain to matrix;
                rowj.push(weighted_value_rows(matrices[i][j],matrices[i][k],n,m));
            }
            matrix.push(rowj);
        }
        precomputedMI.push(matrix);
    }
}

function evalOrder(timestep,order){
    let sum = 0;
    for (let i = 0; i < order.length-1; i++) {
        let val = precomputedMI[timestep][order[i]][order[i+1]];
        sum += val;
    }
    return sum;
}

function get_MI(ti,order){
    let permuted = [];
    for (let a = 0; a < ti.row_perm.length; a++) {
        permuted.push([]);
        for (let b = 0; b < ti.col_perm.length; b++) {
            permuted[a].push(ti.matrix[order[a]][order[b]]);
        }
    }
    let mi = ti.computeMorans(permuted)[0];
    return mi;
}
     
// Shallow copy
function clone(array){
    return array.slice();
}
function test(n){
    let id = identity(n);
    let orders = get_reachable_k2(identity(n));
    console.log(orders.length);
    for(let i = 0; i < orders.length; i++){
        if(minLinks(id,orders[i]).length > 2){
            console.log("I found this wrong one:");
            console.log(orders[i]);
        }
    }
}