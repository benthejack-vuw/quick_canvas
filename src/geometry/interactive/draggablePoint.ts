/*
*	An interactive point that can be dragged
*
*	Copyright Ben Jack 2016
*
*/

import {DataError} from "bj-utils"
import {Point} from "bj-utils"
import {DrawingUtils} from "bj-utils"
import {BJMath} from "bj-utils"

import {MouseData} from "interaction-centre"

import {SnapGrid} from "./snapGrid"
import {Circle} from "../circle"
import {DisplayObject} from "../../canvas/displayObject"

const DEFAULT_POINT_SIZE:number = 10;	

export class DraggablePoint extends DisplayObject{

	private _constraints:Array<PointLink>
	private _snapGrid:SnapGrid;
	private _radius:number;

	constructor(position:Point, radius:number){
		super(position, new Point(radius*2, radius*2));
		this._constraints = [];
		this._radius = radius;
	}

    public static fromData(data: any): DraggablePoint {
        if (typeof data.x !== "number" || typeof data.y !== "number") {
            throw new DataError("Point", "x and y must be numbers");
        }

        return new DraggablePoint(new Point(data.x, data.y), DEFAULT_POINT_SIZE);
    }

	public draw(context:CanvasRenderingContext2D):void{
		if(this._isMouseOver)
			context.fillStyle = DrawingUtils.rgb(0, 255, 0);
		else
			context.fillStyle = DrawingUtils.rgb(255, 0, 0);

		context.beginPath();
		context.arc(0, 0, this._radius, 0, 2*Math.PI);
		context.fill();
	}

	public addConstraint(slave:DraggablePoint, direction:Direction):void{
		this._constraints.push(new PointLink(this, slave, direction));
	}

	public contains(local_pt:Point):boolean{
		return BJMath.dist(local_pt.x, local_pt.y, 0, 0) < this._radius;
	}

	public mouseDragged(data:MouseData):void{
		this.moveTo(data.position);
		for(var i = 0; i < this._constraints.length; ++i){
			this._constraints[i].apply();
		}
		if(this._parent.mouseDragged){
			this._parent.mouseDragged(data);
		}
	}

	public moveTo(pt:Point):void{
		if(this._snapGrid){
			this.globalPosition = this._snapGrid.closest(pt);
		}else{
			this.globalPosition = pt;	
		}
	}

	public set(pt:Point):void{
		this.globalPosition = pt;	
	}

	public snapToGrid(snap:SnapGrid):void{
		this._snapGrid = snap;
	}
	
}

export enum Direction{
	x,
	y
}

class PointLink{

	public _master:DraggablePoint;
	public _slave:DraggablePoint;
	public _direction:Direction;

	constructor(master:DraggablePoint, slave:DraggablePoint, direction:Direction){
		this._master = master;
		this._slave  = slave;
		this._direction = direction;
	}

	public apply(){
		if(this._direction == Direction.x)
			this._slave.set(new Point(this._master.localPosition.x, this._slave.localPosition.y));
		else
			this._slave.set(new Point(this._slave.localPosition.x, this._master.localPosition.y));
	}

}