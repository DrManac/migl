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
uniform sampler2D tfunc;
uniform vec2 window;
uniform vec2 minmax;
uniform vec3 volumeSize;
uniform vec3 voxelSize;
uniform vec2 rescale;
uniform vec2 colrows;

float sample(vec3 coord)
{
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
		value = color[0];
	else if(ch == 1)
		value = color[1];
	else if(ch == 2)
		value = color[2];
	else
		value = color[3];
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

float sample_linear_norm(vec3 coord, out vec3 norm)
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

	norm = vec3(
		mix(mix(valx, valxy, 0.5), mix(valxz, valxyz, 0.5), 0.5) - mix(mix(val0, valy, 0.5), mix(valz, valyz, 0.5), 0.5),
		mix(mix(valy, valxy, 0.5), mix(valyz, valxyz, 0.5), 0.5) - mix(mix(val0, valx, 0.5), mix(valz, valxz, 0.5), 0.5),
		mix(mix(valz, valxz, 0.5), mix(valyz, valxyz, 0.5), 0.5) - mix(mix(val0, valx, 0.5), mix(valy, valxy, 0.5), 0.5)
	 );
	 norm = (vec4(norm / voxelSize, 0.0) * inverseWorldMatrix).xyz;
	 float l = length(norm);
	 norm = l < .001 ? vec3(0.0) : norm / l;


	return mix(mix(mix(val0, valx, fuvw.x), mix(valy, valxy, fuvw.x), fuvw.y),
		mix(mix(valz, valxz, fuvw.x), mix(valyz, valxyz, fuvw.x), fuvw.y), fuvw.z);
}


bool intersectBox(vec3 o, vec3 dir, vec3 bmin, vec3 bmax, out float t0, out float t1)
{
    vec3 invR = 1.0 / dir;
    vec3 tbot = invR * (bmin-o);
    vec3 ttop = invR * (bmax-o);
    vec3 tmin = min(ttop, tbot);
    vec3 tmax = max(ttop, tbot);
    vec2 t = max(tmin.xx, tmin.yz);
    t0 = max(t.x, t.y);
    t = min(tmax.xx, tmax.yz);
    t1 = min(t.x, t.y);
    return t0 <= t1;
}
#define numSamples 512
//#define MIP

void main()
{
	vec3 o = (inverseWorldMatrix * inverseViewMatrix * vec4(0, 0, 0, 1)).xyz;
	vec3 dir = normalize(texCoord - o);
	float tnear, tfar;
	vec3 mmin = vec3(-1.0);
	vec3 mmax = vec3(1.0);
	// mmin = (worldMatrix * vec4(mmin, 1.0)).xyz;
	// mmax = (worldMatrix * vec4(mmax, 1.0)).xyz;
	intersectBox(o, dir, mmin, mmax, tnear, tfar);
	if (tnear < 0.0) tnear = 0.0;
	vec3 rayStart = o + dir * tnear;
	vec3 rayStop = o + dir * tfar;
	rayStart = 0.5 * (rayStart + 1.0);
	rayStop = 0.5 * (rayStop + 1.0);

	float maxDist = 2.0 * sqrt(3.0);
	float stepSize = maxDist/float(numSamples);

	vec3 pos = rayStart;
	vec3 step = normalize(rayStop-rayStart) * stepSize;
	float travel = distance(rayStop, rayStart);

#ifdef MIP
	float val = -10000.0;
	for(int i = 0; i < numSamples; i++)
	{
		if(travel <= 0.0) break;
		val = max(val, sample_linear(pos));
		pos += step;
		travel -= stepSize;
	}
	val = (val - window.x) / (window.y - window.x);
	gl_FragColor = texture2D( lut, vec2(val, 0.5));
#else
	vec3 light = vec3(0.0, 0.0, -1.0);
	//light = (vec4(light, 0.0) * inverseViewMatrix * inverseWorldMatrix).xyz;
	light = (inverseViewMatrix * vec4(light, 0.0)).xyz;
	light = normalize(light);

	vec3 col = vec3(0.0);
	float aa = 1.0;
	for(int i = 0; i < numSamples; i++)
	{
		if(travel <= 0.0) break;
		if(aa < 0.0001) break;
		vec3 norm;
		float val = sample_linear_norm(pos, norm);
		//norm = (vec4(norm, 0.0) * inverseWorldMatrix).xyz;
		//norm = normalize(norm);
		float vv = (val - minmax.x) / (minmax.y - minmax.x);
		float a = texture2D(tfunc, vec2(vv, 0.5)).r;
		val = (val - window.x) / (window.y - window.x);
		vec3 c = texture2D(lut, vec2(val, 0.5)).rgb;
		//vec3 c = texture2D(lut, vec2(val, 0.5)).rgb * dot(norm, light);
		//vec3 c = vec3(1.0) * dot(norm, light);
		col += c * a * aa;
		aa *= (1.0 - a);
		pos += step;
		travel -= stepSize;
	}
	gl_FragColor = vec4(col, 1.0);
#endif
}
