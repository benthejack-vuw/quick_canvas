import {OrderError} from "bj_utils"
import {DrawingUtils} from "bj_utils"
import {Point} from "bj_utils"
import {Transform} from "bj_utils"

import {Polygon} from "./polygon";
import {BoundingBox} from "./boundingBox";
import {Rectangle} from "./rectangle";
import {Line} from "./line";
import {SnapGrid} from "./interactive/snapGrid"


export class PolygonGrid{
	
	public _polygons:Array<Polygon>;
	public _clipRect:Rectangle;
	public _normalizedPolygons:Array<Array<Point>>;
	public _normalizedClipRect:Rectangle;
	public _edgeNormalizedPolygons:Array<Array<Point>>;
	public _edgeNormalizedClipRect:Rectangle;

	constructor(){
		this._polygons = [];
		this._clipRect = new BoundingBox();
		this._normalizedPolygons = [];
		this._normalizedClipRect = new BoundingBox();
	}
	public setPolygonData(data:any){
		this._polygons = [];

		for (var i = data.length - 1; i >= 0; i--) {
			this._polygons.push(new Polygon(data[i]));
		}
	}

	public addPolygon(polygon:Polygon): void{
		this._polygons.push(polygon);
	}

	public get size():number{
		return this._polygons.length;
	}

	public deletePolyUnderPoint(point:Point):Polygon | void{
		var poly = this.polygonUnder(point);
		return this.deletePolygon(poly);
	}

	public deletePolygon(poly:Polygon){
		if(poly){
			var index = this._polygons.indexOf(poly);
			if(index > -1){this._polygons.splice(index, 1);}
			return poly;
		}
		return null;
	}

	public get first():Polygon{
		return this._polygons[0];
	}

	public closestEdge(pt:Point):Line{
		var closest:Line = null;
		var min_dist = Number.MAX_SAFE_INTEGER;
		for(var i = 0; i < this._polygons.length; ++i){
			var edge = this._polygons[i].closest_edge(pt);
			if(edge){
				var dist_from = edge.distanceToPoint(pt);
				if(dist_from < min_dist){
					closest = edge;
					min_dist = dist_from;
				}
			}

		}
		return closest;
	}

	public generateSnapGrid(resolution:number):SnapGrid{
		var snap_points:Array<Point> = [];
		for (var i = 0; i < this._polygons.length; ++i) {
			var poly_pts = this._polygons[i].generate_inner_grid(resolution);
			snap_points = snap_points.concat(poly_pts);			
		}
		return new SnapGrid(snap_points);
	}

	public polygonUnder(pt:Point):Polygon{
		for(var i = 0; i < this._polygons.length; ++i){
			if(this._polygons[i].contains(pt)){
				return this._polygons[i];
			}
		}
		return null;
	}

	public set clipRect(rect:Rectangle){
		this._clipRect = rect.copy();
	}

	public isEmpty():boolean{
		return this._polygons.length <= 0;
	}

	public draw(context:CanvasRenderingContext2D):void{
		
		context.strokeStyle = DrawingUtils.grey(0);
		context.fillStyle = DrawingUtils.grey(255);
		for(var i = 0; i < this._polygons.length; ++i){
			this._polygons[i].draw(context, true);
		}
		
	}

	public crop(bounds: any){
		for(var i = 0; i < this._polygons.length; ++i){
			if(!this._polygons[i].inside(bounds)){
				this.deletePolygon(this._polygons[i]);
				i = 0;
			}
		}
	}

	public normalize(newBounds: Polygon, rotate?:number, edgeLength?:number):void{
		var boundaryTestRect = new BoundingBox(newBounds.copy().points);
		newBounds.rotate(rotate);
		this._clipRect = new BoundingBox(newBounds.points);
		this._normalizedClipRect = this._clipRect.copy().normalize();
		this._normalizedPolygons = [];
		this._edgeNormalizedClipRect = this._clipRect.copy();
		this._edgeNormalizedClipRect.scale(1.0/edgeLength);
		this._edgeNormalizedClipRect.x = 0;
		this._edgeNormalizedClipRect.y = 0;
		this._edgeNormalizedPolygons = []; 

		for(var i = 0; i < this._polygons.length; ++i){
			if(this._polygons[i].inside(boundaryTestRect)){
				this._normalizedPolygons.push(this._polygons[i].normalizedPointArray(this._clipRect, rotate));
				
				if(edgeLength !== undefined)
					this._edgeNormalizedPolygons.push(this._polygons[i].normalizedPointArray(this._clipRect, rotate, edgeLength));
			}
		}

	}

	public toJSON():any{

		if(!this._normalizedPolygons || !this._normalizedClipRect){
			throw(new OrderError("PolygonGrid", "toJSON", "normalize"));
		}

		var out = {
			polygons: this._polygons,
			bounds: this._clipRect,
			normalized_clipRect: this._normalizedClipRect,
			normalized_polygons: this._normalizedPolygons,
			edge_normalized_clipRect: this._edgeNormalizedClipRect,
			edge_normalized_polygons: this._edgeNormalizedPolygons,
		};

		return out;
	}
}