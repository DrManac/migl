import frame_vertex from './shaders/framev.glsl'
import frame_fragment from './shaders/framef.glsl'
import slice_vertex from './shaders/slicev.glsl'
import slice_fragment from './shaders/slicef.glsl'
import vr_vertex from './shaders/vrv.glsl'
import vr_fragment from './shaders/vrf.glsl'
import test_vertex from './shaders/testv.glsl'
import test_fragment from './shaders/testf.glsl'

export var Shaders = {
	frame_vertex : test_vertex,
	frame_fragment : test_fragment,
	slice_vertex : slice_vertex,
	slice_fragment : function(signed, bpp, textureCount) {
		signed = signed || false;
		bpp = bpp || 1;
		textureCount = textureCount || 1;
		var subHeader = '';
		if(bpp == 2)
			subHeader += '#define TWO_CHANNELS true\n';
		if(signed)
			subHeader += '#define SIGNED true\n';
		if(textureCount > 1)
			subHeader += '#define TEXTURE_COUNT '+ textureCount +'\n';
		return subHeader + slice_fragment;
	},
	vr_vertex : vr_vertex,
	vr_fragment : function(signed, bpp, textureCount, mip) {
		signed = signed || false;
		bpp = bpp || 1;
		textureCount = textureCount || 1;
		var subHeader = '';
		if(mip)
			subHeader += '#define MIP\n';
		if(bpp == 2)
			subHeader += '#define TWO_CHANNELS true\n';
		if(signed)
			subHeader += '#define SIGNED true\n';
		if(textureCount > 1)
			subHeader += '#define TEXTURE_COUNT '+ textureCount +'\n';
		return subHeader + vr_fragment;
	}
};
