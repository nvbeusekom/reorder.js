class link {
    constructor(topleft,botleft,topright,botright,inversed) {
        this.topleft = topleft;
        this.botleft = botleft;
        this.topright = topright;
        this.botright = botright;
        this.inversed = inversed;
    }
    print_link(){
        var inv = "0";
        if(this.inversed)
            inv = "1";
        return this.topleft + "\t" + this.topright + "\t" + this.botleft + "\t" + this.botright + "\t" + inv;
    }
}