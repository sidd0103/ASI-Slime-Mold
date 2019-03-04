import {Node} from "../graphObjects/Node";
import {Edge, Tubule} from "../graphObjects/Edge";
const { createCanvas, loadImage } = require('canvas')
const express = require('express');
import * as math from 'mathjs'

export class Map {
    constructor(mapData) {
        this.nodes = mapData.nodes.map((node) => new Node(node.i, node.pos));
        this.nodes[0].setStart();
        this.nodes[this.nodes.length - 1].setEnd();
        this.MAX_FLUX = 10;
        this.edges = mapData.edges.map((edge) =>
            new Tubule(
                edge.between,
                math.distance([this.getNode(edge.between[0]).pos[0],this.getNode(edge.between[0]).pos[1]],[this.getNode(edge.between[1]).pos[0],this.getNode(edge.between[1]).pos[1]]),
                Math.random(),
                parseFloat((Math.random() * .5 + 0.5).toFixed(2))
            )
        );
        this.addEdgesToNodes();
        this.setPressures();
        console.table(this.nodes);
    }
    findEdgesWithNode(node) {
        const matches = [];
        this.edges.map(edge => {
            if (edge.between.includes(node.index)) {
                matches.push(edge);
            }
        });
        return matches;
    }
    findEdgeWhichConnects(i,j) {
        let edgeMatch = null;
        this.edges.map(edge => {
            if (edge.between.includes(i) && edge.between.includes(j)) {
                edgeMatch = edge;
                return;
            }
        });
        return edgeMatch;
    }
    setPressures() {
        //first, construct an n x n matrix with the required values in the following pattern.
        const matrix = new Array(this.nodes.length);
        for (let i = 0; i < this.nodes.length; i++) {
            matrix[i] = new Array(this.nodes.length);
            for (let j = 0; j < this.nodes.length; j++) {
                if (i === j) {
                    matrix[i][j] = math.round(math.sum(this.getNode(i + this.nodes[0].index).edges.map(edge => -1 * (1 / edge.length))), 2);
                }
                else {
                    const connectingEdge = this.findEdgeWhichConnects(i + this.nodes[0].index, j + this.nodes[0].index);
                    matrix[i][j] = connectingEdge ? math.round(1 / connectingEdge.length, 2) : 0;
                }
            }
        }
        //then create an identity matrix (index 0 and nodes.length - 1 are the indexes with the start and end nodes)
        const identityMatrix = new Array(this.nodes.length).fill(0);
        identityMatrix[0] = -1 * this.MAX_FLUX;
        identityMatrix[this.nodes.length - 1] = this.MAX_FLUX;
        //finally multiply everything together to get a matrix with all the necessary pressures.
        const pressuresMatrix = math.round(math.multiply(math.inv(matrix), identityMatrix), 2);
        pressuresMatrix.map((pressureValue, i) => this.nodes[i].setPressure(pressureValue));
    }
    addEdgesToNodes() {
        this.nodes.map(node => {
            this.findEdgesWithNode(node).map(edge => {
                node.addEdge(edge);
            })
        })
    }
    getNode(index) {
        return this.nodes[(index - this.nodes[0].index)];
    }
    visualize(sizeX, sizeY) {
        //set canvas
        const canvas = createCanvas(sizeX, sizeY);
        const ctx = canvas.getContext('2d');
        //set margins
        sizeX = sizeX - 50;
        sizeY = sizeY - 50;
        //iterate through nodes and display them.
        //first get the most extreme x and y values
        let mostX = null;
        let mostY = null;
        this.nodes.map((node) => {
            if (mostX == null || node.pos[0] > mostX) {
                mostX = node.pos[0];
            }
            if (mostY == null || node.pos[1] > mostY) {
                mostY = node.pos[1];
            }
        });
        //calculate scale factor
        const scaleX = Math.round(sizeX / mostX);
        const scaleY  = Math.round(sizeY / mostY);
        let scale = scaleX;
        if (scaleY < scaleX) {
            scale = scaleY;
        }

        //draw nodes
        this.nodes.map((node) => {
            if (node.isStart) {
                ctx.fillStyle = "#00c853";
                ctx.fillRect(node.pos[0] * scale, sizeY - (node.pos[1] * scale), 10, 10);
            }
            else if (node.isEnd) {
                ctx.fillStyle = "#dd2c00";
                ctx.fillRect(node.pos[0] * scale, sizeY - (node.pos[1] * scale), 10, 10);
            }
            else {
                ctx.fillRect(node.pos[0] * scale, sizeY - (node.pos[1] * scale), 3, 3);
            }
            ctx.fillStyle = "#000000";
            ctx.font = scale+'px serif';
            ctx.fillText(node.index, node.pos[0] * scale, sizeY-(node.pos[1] * scale));
            ctx.fillStyle = "#424242";
            ctx.font = scale / 2 +'px serif';
            ctx.fillText(node.pressure, node.pos[0] * scale, sizeY-(node.pos[1] * scale) - 40);
            ctx.fillStyle = "#000000";
        });

        //draw lines
        this.edges.map(edge => {
            const startNode = this.nodes[(edge.between[0] - this.nodes[0].index)];
            const endNode = this.nodes[edge.between[1] - this.nodes[0].index];

            ctx.beginPath();
            ctx.moveTo(startNode.pos[0] * scale, sizeY - (startNode.pos[1] * scale));
            ctx.lineTo(endNode.pos[0] * scale, sizeY - (endNode.pos[1] * scale));
            ctx.stroke();

        });

        //start a server
        const app = express();
        const port = 3000;
        //decide size of canvas style
        app.get('/', (req, res) => res.send('<img src="' + canvas.toDataURL() + '" />'))
        app.listen(port, () => console.log(`Visualization hosted on ${port}!`))
    }
}