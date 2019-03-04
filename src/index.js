import {Map} from "./mapCreation/Map";
import {TestMap} from "./mapCreation/maps/TestMap";

const map = new Map(TestMap);
map.visualize(500,500);