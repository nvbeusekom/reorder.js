class table{
    constructor(json,svg) {
        this.svg = svg;
        this.matrix = json.matrix;
	this.row_labels = json.row_labels;
	this.col_labels = json.col_labels;
	this.row_perm = json.row_permutation;
	this.col_perm = json.col_permutation;
	this.row_inv; 
        this.col_inv;
	this.n = this.matrix.length;
	this.m = this.matrix[0].length;
        this.left_side_colors;
        this.right_side_colors;
        
    if (! this.row_labels) {
	this.row_labels = Array(this.n);
	for (let i = 0; i < this.n; i++) 
	    this.row_labels[i] = i+1;
    }
    if (! this.col_labels) {
	this.col_labels = Array(this.m);
	for (let i = 0; i < this.n; i++) 
	    this.col_labels[i] = i+1;
    }

    if (! this.row_perm)
	this.row_perm = reorder.permutation(this.n);
    this.row_inv = reorder.inverse_permutation(this.row_perm);

    if (! this.col_perm)
	this.col_perm = reorder.permutation(this.m);
    this.col_inv = reorder.inverse_permutation(this.col_perm);

    this.left_side_colors = Array(this.row_perm.length).fill("white");
    this.right_side_colors = Array(this.row_perm.length).fill("white");

    var colorLow = 'white', colorHigh = 'black', colorGrid = 'grey';
    var max_value = d3.max(this.matrix.map(function(row) { return d3.max(row); })),
	color = d3.scale.linear()
	    .range([colorLow, colorHigh])
	    .domain([0, max_value]);

    var gridSize = Math.min(width / this.matrix.length, height / this.matrix[0].length);
	this.h = gridSize;
	this.th = this.h*this.n;
	this.w = gridSize;
	this.tw = this.w*this.m;

    var h = this.h;
    var row_inv = this.row_inv;
    var row = this.svg
	    .selectAll(".row")
	    .data(this.matrix, function(d, i) { return 'row'+i; })
	    .enter().append("g")
            .attr("id", function(d, i) { return "row"+i; })
            .attr("class", "row")
            .attr("transform", function(d, i) {
		return "translate(0,"+h*row_inv[i]+")";
	    });

    var w = this.w;
    var col_inv = this.col_inv;
    var cell = row.selectAll(".cell")
	    .data(function(d) { return d; })
	    .enter().append("rect")
            .attr("class", "cell")
            .attr("x", function(d, i) { return w*col_inv[i]; })
            .attr("width", w)
            .attr("height", h)
            .style("fill", function(d) { return color(d); });

    row.append("line")
	.attr("x2", this.tw)
        .style("stroke", colorGrid);

    var row_labels = this.row_labels;
    
    var left_side_colors = this.left_side_colors;
    var right_side_colors = this.right_side_colors;
    
    row.append("rect")
        .attr("class","left")
	.attr("x", -15)
	.attr("y", -.5)
	.attr('width', 15)
        .attr('height', h+1)
        .attr('fill', function(d, i) { return left_side_colors[i]; });
    row.append("rect")
            .attr("class","right")
            .attr("x", w*row_labels.length)
            .attr("y", -.5)
            .attr('width', 10)
            .attr('height', h+1)
            .attr('fill', function(d, i) { return right_side_colors[i]; });
    row.append("text")
	.attr("x", -6)
	.attr("y", h / 2)
	.attr("dy", ".32em")
	.attr("text-anchor", "end")
	.text(function(d, i) { return row_labels[i]; });

    var col = this.svg.selectAll(".col")
	    .data(this.matrix[0])
	    .enter().append("g")
	    .attr("id", function(d, i) { return "col"+i; })
	    .attr("class", "col")
	    .attr("transform", function(d, i) { return "translate(" + w*col_inv[i] + ")rotate(-90)"; });

    col.append("line")
	.attr("x1", -this.th)
        .style("stroke", colorGrid);

    var col_labels = this.col_labels;
    col.append("text")
	.attr("x", h/2)
	.attr("y", -10)
	.attr("dy", ".32em")
	.attr("text-anchor", "middle")
        .attr("transform", "rotate(90)")
	.text(function(d, i) { return col_labels[i]; });

    svg.append("rect")
	.attr("width", this.tw)
	.attr("height", this.th)
	.style("fill", "none")
	.style("stroke", colorGrid);

   
}
    
    order(rows, cols) {
        var x = function(i){ return this.w*this.col_inv[i]; },
            y = function(i){ return this.h*this.row_inv[i]; };
	this.row_perm = rows;
	this.row_inv = reorder.inverse_permutation(this.row_perm);
	this.col_perm = cols;
	this.col_inv = reorder.inverse_permutation(this.col_perm);
	
	var t = this.svg.transition().duration(1000);
        var w = this.w,
            h = this.h,
            col_inv = this.col_inv,
            row_inv = this.row_inv;
	t.selectAll(".row")
            .attr("transform", function(d, i) {
		return "translate(0," + h*row_inv[i] + ")"; })
	    .selectAll(".cell")
            .attr("x", function(d, i) { return w*col_inv[i]; });

	t.selectAll(".col")
            .attr("transform", function(d, i) {
		return "translate(" + w*col_inv[i] + ")rotate(-90)"; });
    }
    
    computeMorans(permuted){
        // Moran's i
        var N = this.row_perm.length * this.col_perm.length;
        var W = (this.row_perm.length-2) * (this.col_perm.length-2) * 4 + (this.row_perm.length-2) * 3 * 2 + (this.col_perm.length-2) * 3 * 2 + 8;
        
        
        var meank = 0;
        for (var i = 0; i < permuted.length; i++) {
            for (var j = 0; j < permuted[0].length; j++) {
                meank += permuted[i][j];
            }
        }
        var num = 0, denom = 0;
        for (var j = 0; j < permuted.length; j++) {
            for (var i = 0; i < permuted[0].length; i++) {
                denom += Math.pow(permuted[j][i] - meank/N, 2);
                var innersum = 0;
                for (var y = Math.max(0,j-1); y < Math.min(permuted.length,j+2); y++) {
                    for (var x = Math.max(0,i-1); x < Math.min(permuted[0].length,i+2); x++) {
                        if(y !== j || x !== i){
                            // Counting Diagonal Neighbours
//                            if(i - x >= -1 && i - x <= 1 && y - j >= -1 && y - j <= 1){
//                                innersum += (permuted[j][i] * N - meank) * (permuted[y][x] * N - meank);
//                            }
                            // Not Counting Diagonal Neighbours
                            if(i - x >= -1 && i - x <= 1 && j === y){
                                innersum += (permuted[j][i] * N - meank) * (permuted[y][x] * N - meank);
                            }
                            if(i === x && j - y >= -1 && j - y <= 1){
                                innersum += (permuted[j][i] * N - meank) * (permuted[y][x] * N - meank);
                            }
                        }
                    }
                }
                num += innersum;
            }
        }
        if(num === 0 && denom === 0){
            console.log("Both 0 in MI computation");
            return[1,num];
        }
        return [((N/W) * (num/denom))/(N*N),num];
    }
    
    print(){
        
        var permuted = [];
        for (var i = 0; i < this.row_perm.length; i++) {
            permuted.push([]);
            for (var j = 0; j < this.col_perm.length; j++) {
                permuted[i].push(this.matrix[this.row_perm[i]][this.col_perm[j]]);
            }
        }
        var res = "";
        for (var j = 0; j < this.col_perm.length; j++) {
                res += "\t" + this.col_perm[j];
        }
        for (var i = 0; i < permuted.length; i++) {
            res += "\n " + this.row_perm[i];
            for (var j = 0; j < permuted.length; j++) {
                res += "\t" + permuted[i][j];
            }
        }
        return res;
    }
    
    highlight_order(nexttable, debug){
        if(!nexttable){
            return
        }
        var colors = ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', 
            '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990', '#dcbeff', '#9A6324', 
            '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075'];
        var colorIndex = 0;
        var lastRight = 0;
        for (var left = 0; left < this.row_perm.length; left++){
            for (var right = 0; right < nexttable.row_perm.length; right++){
                if(this.row_perm[left] === nexttable.row_perm[right]){
                    // If we are in a different block, change the color
                    if(lastRight !== right-1){
                        colorIndex++;
                    }
                    this.right_side_colors[left] = colors[colorIndex];
                    nexttable.left_side_colors[right] = colors[colorIndex];
                    
                    lastRight = right;
                    right = nexttable.row_perm.length;
                }
            }
        }
        // right_side_colors = colors on the right of the first matrix
        var right_side_colors = this.right_side_colors;
        var row_perm1 = this.row_perm;
        var row_perm2 = nexttable.row_perm;
        var left_side_colors = nexttable.left_side_colors;
        if(debug){
            console.log("Colors:")
            console.log(right_side_colors);
            console.log(left_side_colors);
            console.log("Perms:")
            console.log(row_perm1);
            console.log(row_perm2);
        }
        var t = this.svg;
        t.selectAll(".row").select(".right")
                .attr('fill', function(d, i) { return right_side_colors[row_perm1.indexOf(i)]; });
       
        // Horizontal link generator
        var nodeData = [
        {id: "D3",       x: 100, y: 25},
        {id: "Scales",   x: 25, y: 175},
        {id: "Shapes",   x: 175, y: 175}];

        var linkData = [
            {source: [100,25], target: [175,175]},   // D3 -> Shapes
            {source: [100,25], target: [25,175]}]; // D3 -> Scales

        //Begin making the horizontal link diagram
        var link = d3.linkHorizontal()
                .source(function(d) {
                    return [d.source[1], d.source[0]];
                })
                .target(function(d) {
                    return [d.target[1], d.target[0]];
                });
            
            console.log(t.selectAll(".row")[0][0])
            console.log(t //Adding the link paths
            .selectAll(".row")
            .data(linkData))
            t //Adding the link paths
            .selectAll(".row")
            .data(linkData)
            .attr("d", link);

        t //Adding the text labels
              .selectAll("text")
              .data(nodeData)
              .join("text")
              .attr("font-size", "12px")
              .attr("text-anchor", "middle")
              .attr("x", d => d.y)
              .attr("y", d => d.x + 20)
              .text(d => d.id);
        
        
        var t2 = nexttable.svg;
        t2.selectAll(".row").select(".left")
                .attr('fill', function(d, i) { return left_side_colors[row_perm2.indexOf(i)]; });
        
        
        
        
    }
    
    
    quality(){
        
        var permuted = [];
        for (var i = 0; i < this.row_perm.length; i++) {
            permuted.push([]);
            for (var j = 0; j < this.col_perm.length; j++) {
                permuted[i].push(this.matrix[this.row_perm[i]][this.col_perm[j]]);
            }
        }
        
        var bandwidth = 0;
        var linarr = 0;
        for(var i=0 ; i< this.row_perm.length; i++){
            for(var j=0 ; j<this.col_perm.length ; j++){
                if(i!==j && this.matrix[i][j] === 1){
                    var lambda = 0;
                    var b = false;
                    for(var k=0; k<this.row_perm.length; k++){    
                        if(this.row_perm[k] === i || this.row_perm[k] === j){
                            b = !b;
                        }
                        if(b){
                            lambda++;
                        }
                    }
                    linarr += lambda;
                    if(lambda > bandwidth){
                        bandwidth = lambda;
                    }
                }
            }
        }
//        return max;
        var profile = 0;
        for(var i=0 ; i< this.row_perm.length; i++){
            var min = this.col_perm.length ;
            for(var j=0 ; j<this.col_perm.length ; j++){
                if(this.row_perm[i]===this.row_perm[j] || this.matrix[this.row_perm[i]][this.col_perm[j]] === 1){
                    if(j<min){
                        min = j;
                    }
                    
                }
            }
            profile += i - min;
        }
        
        var bbadjacencies = 0;
        var bwadjacencies = 0;
        var wwadjacencies = 0;
        for(var i=0 ; i< this.row_perm.length; i++){
            for(var j=0 ; j<this.col_perm.length ; j++){
                if(i<this.row_perm.length-1){
                    if(permuted[i][j] === 1){
                        bbadjacencies += permuted[i+1][j];
                        bwadjacencies += 1 - permuted[i+1][j];
                    }
                    if(permuted[i][j] === 0){
                        bwadjacencies += permuted[i+1][j];
                        wwadjacencies += 1 - permuted[i+1][j];
                    }
                }
                if(j<this.col_perm.length-1){
                    if(permuted[i][j] === 1){
                        bbadjacencies += permuted[i][j+1];
                        bwadjacencies += 1 - permuted[i][j+1];
                    }
                    if(permuted[i][j] === 0){
                        bwadjacencies += permuted[i][j+1];
                        wwadjacencies += 1 - permuted[i][j+1];
                    }
                } 
            }
        }
        
        
        
        var moran = this.computeMorans(permuted)[0];
        
        return [bandwidth,profile,linarr,moran,bbadjacencies,bwadjacencies,wwadjacencies];
    }
    
}

