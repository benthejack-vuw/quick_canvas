import * as _Canvas from "./canvas/canvas"
import * as _Geometry from "./geometry/geometry"

var QC = {
	Canvas:_Canvas,
	Geometry:_Geometry,
};

(<any>window).QC = QC;

export{QC}
export * from "./canvas/canvas";
export * from "./geometry/geometry";
