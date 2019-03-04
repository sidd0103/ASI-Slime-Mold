export class Edge {
    constructor(between) {
        this.between = between;
    }
}


export class Tubule extends Edge {
    constructor(between, length, utility, area) {
        super(between);
        this.length = length;
        this.utility = utility;
        this.area = area;
    }
}