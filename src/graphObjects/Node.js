export class Node {
    constructor(index, pos) {
        this.pos = pos;
        this.index = index;
        this.edges = [];
    }
    setStart() {
        this.isStart = true;
    }
    setEnd() {
        this.isEnd = true;
    }
    setPressure(pressure) {
        this.pressure = pressure;
    }
    addEdge(edge) {
        this.edges.push(edge);
    }
}