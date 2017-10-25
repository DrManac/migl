class Text {
	constructor(options) {
		options = options || {};
		this.text = options.text || '';
		this.font = options.font || "16px Arial";
		this.fillStyle = options.fillStyle || "#FFFFFF";
		this.textBaseline = options.textBaseline || "top";
		this.textAlign = options.textAlign || "left";
		this.x = options.x || 0;
		this.y = options.y || 0;
	}
	Render(ctx, camera, vprect) {
		var width = vprect.width, height = vprect.height;
		ctx.save();
		ctx.fillStyle = this.fillStyle;
		ctx.font = this.font;
		ctx.textBaseline = this.textBaseline;
		ctx.textAlign = this.textAlign;
		var x = this.x;
		var y = this.y;
		var text = (typeof this.text == 'function') ? this.text() : this.text;
		if(this.textAlign == 'right') x = width - x;
		if(this.textBaseline == 'bottom') y = height - y;
		fillTextMultiLine(ctx, text, x, y);
		ctx.restore();
	}
}

function fillTextMultiLine(ctx, text, x, y) {
	var lineHeight = ctx.measureText("M").width * 1.2;
	var lines = text.split("\n");
	if(ctx.textBaseline == 'bottom') y -= lineHeight * (lines.length - 1);
	for (var i = 0; i < lines.length; ++i) {
		ctx.fillText(lines[i], x, y);
		y += lineHeight;
	}
}

export {Text};
