precision highp float;
uniform mat4 worldMatrix;
uniform mat4 inverseViewMatrix;
uniform mat4 inverseWorldMatrix;

#ifdef TWO_CHANNELS
#define MAX_SIGNED_VALUE 32767.0
#define TWO_COMPLEMENT 65536.0
#define NUM_CHANNELS 2
#else
#define MAX_SIGNED_VALUE 127.0
#define TWO_COMPLEMENT 256.0
#define NUM_CHANNELS 4
#endif
varying vec3 texCoord;
varying vec2 srcTc;
#ifdef TEXTURE_COUNT
uniform sampler2D map[TEXTURE_COUNT];
#else
uniform sampler2D map;
#endif
uniform sampler2D lut;
uniform vec2 window;
uniform vec3 volumeSize;
uniform vec2 rescale;
uniform vec2 colrows;
uniform bool progressiveAlpha;

float sample(vec3 coord)
{
// 	vec3 st = coord * volumeSize - 0.5;
// 	vec3 iuvw = floor(st);
// 	int lin = int(iuvw.x) + int(volumeSize.x) * (int(iuvw.y) + int(iuvw.z) * int(volumeSize.y));
// #ifdef TEXTURE_COUNT
// 	int tidx = lin / TEXTURE_SIZE;
// 	lin = lin - tidx * TEXTURE_SIZE;
// #endif
// 	int lin2 = lin / NUM_CHANNELS;
//
// 	int ch = lin - NUM_CHANNELS * lin2;
//
// 	vec2 res = vec2(0.0);
// 	int tmp = lin2 / int(mapSize.x);
// 	res.x = float(lin2 - tmp * int(mapSize.x));
// 	res.y = float(tmp);
//
// 	res += 0.5;
// 	res /= mapSize;
//
// #ifdef TEXTURE_COUNT
// 	vec4 color = vec4(0.0);
// 	for(int i = 0; i < TEXTURE_COUNT; i++)
// 		if(i == tidx) {
// 			color = texture2D(map[i], res);
// 			break;
// 		}
// #else
// 	vec4 color = texture2D(map, res);
// #endif

	float zs1 = floor(coord.z * volumeSize.z - 0.5);
	vec2 res = coord.xy;
	//int ch = int(mod(zs1, float(NUM_CHANNELS)));
	int ch = int(mod(floor(coord.x * volumeSize.x), float(NUM_CHANNELS)));
	res.x += mod(zs1, colrows.x);
	res.y += floor(zs1 / colrows.x);
	res /= colrows;

#ifdef TEXTURE_COUNT
	vec4 color = vec4(0.0);
	for(int i = 0; i < TEXTURE_COUNT; i++)
		if(res.y > 1.0) {
			res.y -= 1.0;
		} else {
			color = texture2D(map[i], res);
			break;
		}
#else
	vec4 color = texture2D(map, res);
#endif


	float value = 0.0;

#ifdef TWO_CHANNELS
	if(ch == 0)
		value = color[0] * 255.0 + color[1] * 255.0 * 256.0;
	else
		value = color[2] * 255.0 + color[3] * 255.0 * 256.0;
#else
	if(ch == 0)
		value = color[0] * 255.0;
	else if(ch == 1)
		value = color[1] * 255.0;
	else if(ch == 2)
		value = color[2] * 255.0;
	else
		value = color[3] * 255.0;
#endif

#ifdef SIGNED
	if(value > MAX_SIGNED_VALUE)
		value -= TWO_COMPLEMENT;
#endif
	//return coord.z * 255.0 * colrows.x;
	return dot(vec2(value, 1), rescale);
	//return value;
}

float sample_linear(vec3 coord)
{
	vec3 st = coord * volumeSize - 0.5;
	vec3 iuvw = floor(st);
	vec3 fuvw = fract(st);

	float val0 = sample((iuvw + vec3(0.5, 0.5, 0.5)) / volumeSize);
	float valx = sample((iuvw + vec3(1.5, 0.5, 0.5)) / volumeSize);
	float valy = sample((iuvw + vec3(0.5, 1.5, 0.5)) / volumeSize);
	float valxy = sample((iuvw + vec3(1.5, 1.5, 0.5)) / volumeSize);
	float valz = sample((iuvw + vec3(0.5, 0.5, 1.5)) / volumeSize);
	float valxz = sample((iuvw + vec3(1.5, 0.5, 1.5)) / volumeSize);
	float valyz = sample((iuvw + vec3(0.5, 1.5, 1.5)) / volumeSize);
	float valxyz = sample((iuvw + vec3(1.5, 1.5, 1.5)) / volumeSize);

	return mix(mix(mix(val0, valx, fuvw.x), mix(valy, valxy, fuvw.x), fuvw.y),
		mix(mix(valz, valxz, fuvw.x), mix(valyz, valxyz, fuvw.x), fuvw.y), fuvw.z);
}

void main()
{
	//float val = sample(texCoord);
	float val = sample_linear(texCoord);
	//float val = texture2D( map, texCoord.xy ).r;
	if(texCoord.x < 0.0 || texCoord.x > 1.0 || texCoord.y < 0.0 || texCoord.y > 1.0 || texCoord.z < 0.0 || texCoord.z > 1.0)
		val = window.x;
	val = (val - window.x) / (window.y - window.x);

	vec4 col = texture2D( lut, vec2(val, 0.5));
	//if(progressiveAlpha)
	col.a = progressiveAlpha ? val : 1.0;

	gl_FragColor = col;
	//gl_FragColor = texture2D( map, texCoord.xy).grab;
	//gl_FragColor = texture2D( map, srcTc).grab;
	//gl_FragColor = vec4(texCoord.xyz, 1.0);
}
