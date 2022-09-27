// Not very stable
function stable_split_LO(t, str){
    let halfway = Math.round(t.length/2);
    let t_copy = [].concat(t);
    const first_half = t_copy.splice(0,halfway);
    const second_half = t_copy;
    simul_get_order(first_half);
    simul_get_order(second_half);
    first_half[halfway-1].highlight_order(second_half[0]);
}

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
        let transpose = reorder.transpose(matrices[i]);
        let dist_rows = reorder.dist()(matrices[i]),
        dist_cols = reorder.dist()(transpose),
        order = reorder.optimal_leaf_order(),
        row_perm = order.distanceMatrix(dist_rows)(matrices[i]),
        col_perm = order.distanceMatrix(dist_cols)(transpose);
        t[i].order(row_perm, row_perm);
        if(i > 0){
            ls[i-1].update_links(minLinks(o1,row_perm));
        }
        o1 = row_perm;
      }
      let end = new Date().getTime();
      let time = end - start;

      computeQualities(t,str,time);
}

function print_links(l){
        let res = "";
//        console.log("printing:");
//        console.log(l);
        for (let i = 0; i < l.length; i++) {
            res += i.toString();
            res += '\n';
            for (let j = 0; j < l[i].length; j++) {
                res += l[i][j].print_link();
                res += '\n';
            }
        }
//        console.log(res);
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
    let orders = add_move(initial,[],nr_moves);
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
    return no_dups;
    
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
    if(hasDuplicates(neworder)){
        debugger;
    }
    return neworder;
}

function hasDuplicates(array) {
    return (new Set(array)).size !== array.length;
}

function do_swap_link(order,l, inv){
    // BUG
    // Going up
    if(l.topleft >= l.topright && l.topleft <= l.botright){
        return do_move_link(order,l,inv);
    }
    // Going down
    if(l.topleft <= l.topright && l.botleft >= l.topright){
        return do_move_link(order,l,inv);
    }
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
    if(!inv){
        let a = l.topright;
        for (let b = l.topleft; b <= l.botleft; b++) {
            neworder[b] = order[a];
            a++;
        }
    }
    else{
        let a = l.topright;
        for (let b = l.botleft; b >= l.topleft; b--) {
            neworder[b] = order[a];
            a++;
        }
    }
    if(hasDuplicates(neworder)){
        debugger;
    }
    return neworder;
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