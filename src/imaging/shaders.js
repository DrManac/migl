import frame_vertex from './shaders/framev.glsl'
import frame_fragment from './shaders/framef.glsl'
import slice_vertex from './shaders/slicev.glsl'
import slice_fragment from './shaders/slicef.glsl'
import vr_vertex from './shaders/vrv.glsl'
import vr_fragment from './shaders/vrf.glsl'

export var Shaders = {
	frame_vertex : frame_vertex,
	frame_fragment : frame_fragment,
	slice_vertex : slice_vertex,
	slice_fragment : slice_fragment,
	vr_vertex : vr_vertex,
	vr_fragment : vr_fragment
};