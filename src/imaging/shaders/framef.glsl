#ifdef TWO_CHANNELS
#define MAX_SIGNED_VALUE 32767.0
#define TWO_COMPLEMENT 65536.0
#else
#define MAX_SIGNED_VALUE 127.0
#define TWO_COMPLEMENT 256.0
#endif
varying vec2 texCoord;
uniform sampler2D map;
uniform sampler2D lut;
uniform float black;
uniform float white;
uniform vec2 imageSize;
uniform vec2 rescale;

float sample(vec2 coord)
{
#ifdef TWO_CHANNELS
	vec2 st = coord * imageSize - 0.5;
	vec2 iuv = floor(st);
	if(iuv.x < 0.0) return 0.0;
	float low = texture2D(map, (iuv + vec2(0.25, 0.5)) / imageSize).r;
	float high = texture2D(map, (iuv + vec2(0.75, 0.5)) / imageSize).r;
	float val = low * 255.0 + high * 255.0 * 256.0;
#else
	float val = texture2D(map, coord).r * 255.0;
#endif
#ifdef SIGNED
	if(val > MAX_SIGNED_VALUE)
		val -= TWO_COMPLEMENT;
#endif
	return val;
}

float sample_linear(vec2 coord)
{
	vec2 st = coord * imageSize - 0.5;
	vec2 iuv = floor(st);
	vec2 fuv = fract(st);
	float val0 = sample((iuv + vec2(0.5, 0.5)) / imageSize);
	float valx = sample((iuv + vec2(1.5, 0.5)) / imageSize);
	float valy = sample((iuv + vec2(0.5, 1.5)) / imageSize);
	float valxy = sample((iuv + vec2(1.5, 1.5)) / imageSize);
	return mix(mix(val0, valx, fuv.x), mix(valy, valxy, fuv.x), fuv.y);
}

void main()
{
	float val = sample_linear(texCoord);
	//float val = sample(texCoord);
	val = dot(vec2(val, 1), rescale);
	if(texCoord.x < 0.0 || texCoord.x > 1.0 || texCoord.y < 0.0 || texCoord.y > 1.0)
		val = 0.0;
	val = (val - black) / (white - black);
	if(val < 0.0)
		val = 0.0;
	if(val > 1.0)
		val = 1.0;

//	gl_FragColor = vec4(val, val, val, 1.0);
	gl_FragColor = texture2D( lut, vec2(val, 0.5));
}
