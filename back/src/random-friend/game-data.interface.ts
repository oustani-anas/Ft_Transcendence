
export interface Canvas{
    height: number;
    width: number;
}

export interface Ball{
    x:number;
    y:number;
    radius:number;
    speed: number;
    velocityX: number;
    velocityY: number;
    color: string;
}

export interface Net{
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

export interface Player {
    id: string;
    playerNb: number;
    x: number;
    y: number;
    score: number;
    width: number;
    height: number;
    name: string;
    giveUp: boolean;
    db_id: string;
    pic:string;
    g_id:string;
}

export interface Game{
    nb: number;
    ball: Ball;
    players: Player[];
    rooms: {[roomId:string]: string[]};
}


export interface Sides{
    top:number;
    bottom:number;
    left:number;
    right:number;
}