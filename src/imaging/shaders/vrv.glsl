varying vec3 texCoord;
varying vec2 srcTc;

uniform mat4 transform;

void main()
{
	//texCoord = (transform * vec4(uv, 0.0, 1.0)).xyz;
	texCoord = position;
	srcTc = uv;
	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( position, 1.0 );
}
