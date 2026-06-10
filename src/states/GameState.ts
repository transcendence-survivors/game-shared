export class Player extends Schema {
	@type(Vect3) pos;
}

export class MyRoomState extends Schema {
	@type({ map: Player }) players = new MapSchema<Player>();
}
