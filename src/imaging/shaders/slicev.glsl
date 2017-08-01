attribute vec3 position;
attribute vec2 uv;
attribute vec2 uv2;
uniform mat4 projectionMatrix;
uniform mat4 worldMatrix;
uniform mat4 viewMatrix;

varying vec3 texCoord;
varying vec2 srcTc;

uniform mat4 world2volume;

void main()
{
	texCoord = ((world2volume * worldMatrix * vec4( position, 1.0 )).xyz + 1.0) * 0.5;
	srcTc = uv;
	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( position, 1.0 );
}
