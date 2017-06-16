precision highp float;
uniform mat4 worldMatrix;
uniform mat4 inverseViewMatrix;
uniform mat4 inverseWorldMatrix;

varying vec2 texCoord;
uniform sampler2D map;
uniform sampler2D lut;
uniform vec2 window;

void main()
{
	float val = texture2D(map, texCoord).r;
	if(texCoord.x < 0.0 || texCoord.x > 1.0 || texCoord.y < 0.0 || texCoord.y > 1.0)
		val = 0.0;
	val = (val - window.x) / (window.y - window.x);
	//gl_FragColor = vec4(val, val, val, 1.0);
	//gl_FragColor = texture2D(lut, vec2(val, 0.5));
	//gl_FragColor = texture2D(lut, vec2(texCoord.x, 0.5));
	gl_FragColor = vec4(texCoord, 0.0, 1.0);
}
