class Text {
	constructor() {
		this.text = '';
		this.font = "16px Arial";
		this.fillStyle = "#FFFFFF";
		this.textBaseline = "top";
		this.textAlign = "left";
		this.x = 0;
		this.y = 0;
	}
	Render(ctx, camera, vprect) {
		var width = vprect.width, height = vprect.height;
		ctx.save();
		ctx.fillStyle = this.fillStyle;
		ctx.font = this.font;
		ctx.textBaseline = this.textBaseline;
		ctx.textAlign = this.textAlign;
		fillTextMultiLine(ctx, this.text, this.x, this.y);
		ctx.restore();
	}
}

function fillTextMultiLine(ctx, text, x, y) {
	var lineHeight = ctx.measureText("M").width * 1.2;
	var lines = text.split("\n");
	for (var i = 0; i < lines.length; ++i) {
		ctx.fillText(lines[i], x, y);
		y += lineHeight;
	}
}

export {Text};
