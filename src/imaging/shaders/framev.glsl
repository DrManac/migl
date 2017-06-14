varying vec2 texCoord;

uniform mat3 transform;

void main()
{
	texCoord = (transform * vec3(uv, 1.0)).xy;
	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( position, 1.0 );
}
