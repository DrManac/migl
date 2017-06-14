varying vec3 texCoord;
varying vec2 srcTc;

uniform mat4 transform;

void main()
{
	texCoord = (transform * vec4(uv2, 0.0, 1.0)).xyz;
	srcTc = uv;
	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( position, 1.0 );
}
