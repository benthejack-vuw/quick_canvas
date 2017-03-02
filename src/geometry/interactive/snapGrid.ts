/*
*	A snapgrid is a collection of points that can be used for snapping interactions 
*	to by using the closest method
*
*	Copyright Ben Jack 2016
*/

import {Point} from "bj_utils";
import {DrawingUtils} from "bj_utils";
import {BJMath} from "bj_utils";

import {DisplayObject} from "../../canvas/displayObject"
import {BoundingBox} from "../boundingBox";

export class SnapGrid extends DisplayObject{
	
	private _points:Array<Point>; //these points are local to the parent object

	constructor(local_to_parent_points:Array<Point>){
		super(new Point(0, 0), new Point(0,0));
		
		this._points = local_to_parent_points;
	}

	public contains(pt:Point){
		return false;
	}

	public addedToStage():void{
		this._size = this._parent.size;
	}

	public closest(global_position:Point):Point{
		var closest:Point = null;
		var min_dist = Number.MAX_SAFE_INTEGER;

		var local_position:Point = this.globalToLocal(global_position);

		for (var i = 0; i < this._points.length; i++) {
			var d = BJMath.dist(this._points[i].x, this._points[i].y, local_position.x, local_position.y);
			if(d < min_dist){
				closest = this._points[i];
				min_dist = d;
			}
		}

		return this.localToGlobal(new Point(closest.x, closest.y));
	}

	public draw(context:CanvasRenderingContext2D):void{
		
		for (var i = 0; i < this._points.length; i++) {
			context.fillStyle = DrawingUtils.rgba(50,0,0,100);
			context.beginPath();
			context.arc(this._points[i].x, this._points[i].y, 2, 0, 2 * Math.PI);
			context.fill();
		}

	};

	public get boundingBox():BoundingBox{
		return new BoundingBox(this._points);
	};

};