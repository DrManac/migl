var crlf2 = new TextEncoder().encode('\r\n\r\n');
export default function parsemultipart(body, contentType) {
    //      multipart/*; boundary="----bnd"; ...
    //      multipart/*; boundary=----bnd; ...
	var m = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
	if(!m) throw new Error('Bad content-type header: no multipart boundary');
	var boundary = m[1] || m[2];
    // \r\n is part of the boundary.
    var boundary = '\r\n--' + boundary;

	if(typeof(body) === 'string')
		return parsemultipartstring(body, boundary);

	return parsemultipartbuffer(new Uint8Array(body), new TextEncoder().encode(boundary))
}

function parsemultipartbuffer(body, boundary) {
	var result = [];
	var sbnd = boundary.subarray(2);
	var rest = body;
	var i = indexOf(body, sbnd);
	rest = rest.subarray(i + sbnd.length);
	while(i >= 0) {
		i = indexOf(rest, boundary);
		var part = rest.subarray(0, i);
		var j = indexOf(part, crlf2);
		if(j >= 0)
			part = part.subarray(j + crlf2.length);
		result.push(part);
		rest = rest.subarray(i + boundary.length);
	}
	return result;
}

function parsemultipartstring(body, boundary) {
    var s = body;

    // Prepend what has been stripped by the body parsing mechanism.
    s = '\r\n' + s;

    var parts = s.split(new RegExp(boundary)),
        partsList = [];

    // First part is a preamble, last part is closing '--'
    for (var i = 1; i < parts.length - 1; i++) {
      var subparts = parts[i].split('\r\n\r\n');
      var headers = subparts[0].split('\r\n');
      partsList.push(subparts[1]);
    }

    return partsList;
}

function indexOf(string, word) {
	//return -1;
  var m = 0;
  var i = 0;
  var table = new Int16Array(word.length);

  var pos = 2;
  var cnd = 0;

  table[0] = -1;
  table[1] = 0;

  // build the table for KMP. This takes `O(word.length)` steps.
  while (pos < word.length) {
    if (word[pos - 1] == word[cnd]) {
      cnd = cnd + 1;
      table[pos] = cnd;
      pos = pos + 1;
    } else if (cnd > 0) {
      cnd = table[cnd];
    } else {
      table[pos] = 0;
      pos = pos + 1;
    }
  }

  // scan the string. This takes `O(string.length)` steps.
  while (m + i < string.length) {
    if (word[i] == string[m + i]) {
      if (i == word.length - 1) {
        return m;
      }
      i = i + 1;
    } else {
      if (table[i] > -1) {
        m = m + i - table[i];
        i = table[i];
      } else {
        i = 0;
        m = m + 1;
      }
    }
  }
  // Returns -1 if the subsequence was not found in the sequence.
  return -1;
}
