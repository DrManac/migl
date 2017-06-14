varying vec2 texCoord;

uniform mat3 transform;

void main()
{
	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( position, 1.0 );
	texCoord = (transform * vec3(uv, 1.0)).xy;
	//texCoord = uv;
}
