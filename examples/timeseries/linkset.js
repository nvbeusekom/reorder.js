class linkset{
    constructor(links, n ,svg) {
        this.svg = svg;
        this.n = n;
        this.links = links;
        this.draw_links();
    }
    
    update_links(links){
        this.links = links;
        this.draw_links();
    }
    
    draw_links(){
        this.svg.selectAll("*").remove();
        for (let i = 0; i < this.links.length; i++) {
            let link = this.links[i];
            
            let upper_r = 51;
            let upper_g = 51;
            let upper_b = 255;
            let lower_r = 153;
            let lower_g = 204;
            let lower_b = 255;
            
            let y1 = height/this.n * link.topleft;
            let dy = height/this.n * (link.botleft - link.topleft + 1);
            let x = (margin.left + margin.right) / 2;
            
            let y2 = height/this.n * link.topright;
            if(link.inversed){
                y2 = height/this.n * (link.botright+1);
            }
            
            for (let j = 0; j < dy; j++) {
                let f = j / dy;

                let r = upper_r * (1-f) + lower_r * f;
                let g = upper_g * (1-f) + lower_g * f;
                let b = upper_b * (1-f) + lower_b * f;
                this.svg.append("path")
                    .attr("d","M 0 " + y1 + " C " + x + " " + y1 + ", " + x + " " + y2 + ", " + (x*2) + " " + y2)
                    .style("stroke","rgb("+r+","+g+","+b+")")
                    .style("stroke-width",1.5)
                    .style("fill","transparent");
                y1++;
                if(link.inversed){
                    y2--;
                }
                else{
                    y2++;
                }
            }
        }
    }
}