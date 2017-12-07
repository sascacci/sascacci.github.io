
(function(ext) {

	var inputs = [];
	var outputs = [];

	var f8Cnt = 0;
	var startStop = 0;
	var measCnt = 0;
	var beatCnt = 0;
	var lastF8Cnt = 0;
	var deviceConnect = 0;
	var outport = -1;
	var rsv_note = 0;

/* -------------------------------------------------------------------------	*/
	midiInit();

	function midiInit() 
	{
		inputs = [];
		outputs = [];
		navigator.requestMIDIAccess({sysex:false}).then( success, failure );
		console.log("MIDI Init");
	}

	function handleStateChange(event) 
	{
		if (event.port.state == "connected") {
			deviceConnect = 1;
			console.log("GO:KEYS Connected");
		} else {
			deviceConnect = 0;
			console.log("GO:KEYS Disconnected");
		}
	}

	function success( midi ) 
	{
		var inputIterator = midi.inputs.values();
		for (var o = inputIterator.next(); !o.done; o = inputIterator.next()) {
			inputs.push(o.value)
		}

		var outputIterator = midi.outputs.values();
		for (var o = outputIterator.next(); !o.done; o = outputIterator.next()) {
			outputs.push(o.value)
		}

		for (var i = 0; i < outputs.length; i++){
			if (outputs[i].name == "GO:KEYS") {
				outport = i;
				console.log(outport);
			}
		}

		for (var i = 0; i < inputs.length; i++){
			if (inputs[i].name == "GO:KEYS") {
				inputs[i].onmidimessage = handleMIDIMessage;
				inputs[i].onstatechange = handleStateChange;
			}
		}
		if (outport < 0) setTimeout(function() { midiInit(); }, 2000);
	}

	function failure(error) 
	{
		setTimeout(function() { midiInit(); }, 2000);
		console.log("MIDI NG");
	}

	function handleMIDIMessage( ev ) {

		switch (ev.data[0] & 0xF0) {
			case 0x80:
				break;
			case 0x90:
				break;
			case 0xA0:
				break;
			case 0xB0:
				break;
			case 0xC0:
				break;
			case 0xD0:
				break;
			case 0xE0:
				break;
			case 0xF0:
				if (ev.data[0] == 0xFA) {
					startStop = 1;
					//lastF8Cnt=0;
					console.log("0xFA");
				} else if (ev.data[0] == 0xFC) {
					startStop = 0;
					f8Cnt = 0;
					beatCnt = 0;
					measCnt = 0;
					lastF8Cnt=0;
					console.log("0xFC");
				} else if (ev.data[0] == 0xF8) {
					if (startStop) {
						f8Cnt++;
						measCnt = Math.floor(f8Cnt / 96);
						beatCnt = Math.floor(f8Cnt / 24);
					}
				}
				break;
		}

	}

	function sendNRPN(ch, nrpn_lsb, nrpn_msb, data_lsb, data_msb)
	{
		sendMIDI(0xB0 | ch, 0x62, nrpn_lsb);
		sendMIDI(0xB0 | ch, 0x63, nrpn_msb);
		sendMIDI(0xB0 | ch, 0x26, data_lsb);
		sendMIDI(0xB0 | ch, 0x06, data_msb);
	}

	function sendMIDI(d0, d1, d2)
	{
		outputs[outport].send([d0, d1, d2], window.performance.now());
	}


/* -------------------------------------------------------------------------	*/
	ext.func_f8 = function() {
		return (f8Cnt % 96);
	};

	ext.func_meas = function() {
		return (measCnt+1);
	};

	ext.func_beat = function() {
		return ((beatCnt % 4) + 1) ;
	};

	ext.func_note = function() {
		return (rsv_note % 12);
	};

	ext.func_key_on = function() {
		if (noteon_flg) {
			noteon_flg = false;

			return true;
		}
		return false;
	};

	ext.func_fc = function(part) {
		switch (part) {
		case 'All':
			startStop = 0;
			measCnt = 0;
			f8Cnt = 0;
			lastF8Cnt=0;
			console.log("stop All");
			sendMIDI(0x9C, 0x00, 0x00);
			break;
		case 'Drums':
			sendMIDI(0x9C, 0x00, 0x01);
			break;
		case 'Bass':
			sendMIDI(0x9C, 0x00, 0x02);
			break;
		case 'Part A':
			sendMIDI(0x9C, 0x00, 0x03);
			break;
		case 'Part B':
			sendMIDI(0x9C, 0x00, 0x04);
			break;
		}
	};

	ext.func_note_on = function() {
		sendMIDI(0x90, 36, 0x7F);
	};

	ext.func_note_off = function() {
		sendMIDI(0x90, 36, 0x00);
	};

	ext.func_test = function(val, meas) {
		val--;
		if (val < 0) val = 0;
		if (val > 10) val = 10;
		sendMIDI(0x9A, 0, val);
	};

	ext.func_drum = function(val) {
		val--;
		if (val < 0) val = 0;
		if (val > 10) val = 10;
		sendMIDI(0x9A, 0, val);
	};

	ext.func_bass = function(val) {
		val--;
		if (val < 0) val = 0;
		if (val > 10) val = 10;
		sendMIDI(0x9A, 1, val);
	};

	ext.func_parta = function(val) {
		val--;
		if (val < 0) val = 0;
		if (val > 10) val = 10;
		sendMIDI(0x9A, 2, val);
	};

	ext.func_partb = function(val) {
		val--;
		if (val < 0) val = 0;
		if (val > 10) val = 10;
		sendMIDI(0x9A, 3, val);
	};

	ext.func_partx = function(val) {
		val--;
		if (val < 0) val = 0;
		if (val > 11) val = 11;
		sendMIDI(0x9A, 4, val);
	};

	ext.func_type = function(type, callback) {

		switch (type) {
		case 'Trance':
			sendMIDI(0x9D, 0x00, 0x00);
			break;
		case 'Funk':
			sendMIDI(0x9D, 0x00, 0x01);
			break;
		case 'House':
			sendMIDI(0x9D, 0x00, 0x02);
			break;
		case 'Drum N Bass':
			sendMIDI(0x9D, 0x00, 0x03);
			break;
		case 'Neo HipHop':
			sendMIDI(0x9D, 0x00, 0x04);
			break;
		case 'Pop':
			sendMIDI(0x9D, 0x00, 0x05);
			break;
		case 'Bright Rock':
			sendMIDI(0x9D, 0x00, 0x06);
			break;
		case 'Trap Step':
			sendMIDI(0x9D, 0x00, 0x07);
			break;
		case 'Future Bass':
			sendMIDI(0x9D, 0x00, 0x08);
			break;
		case 'Trad HipHop':
			sendMIDI(0x9D, 0x00, 0x09);
			break;
		case 'EDM':
			sendMIDI(0x9D, 0x00, 0x0A);
			break;
		case 'R&B':
			sendMIDI(0x9D, 0x00, 0x0B);
			break;
		}
		setTimeout(function() { callback(); }, 500);
	};
	ext.func_is_note = function(note) {
		switch(note){
		case 'C':
			if (rsv_note % 12 == 0) return true;
			break;
		case 'C#':
			if (rsv_note % 12 == 1) return true;
			break;
		case 'D':
			if (rsv_note % 12 == 2) return true;
			break;
		case 'D#':
			if (rsv_note % 12 == 3) return true;
			break;
		case 'E':
			if (rsv_note % 12 == 4) return true;
			break;
		case 'F':
			if (rsv_note % 12 == 5) return true;
			break;
		case 'F#':
			if (rsv_note % 12 == 6) return true;
			break;
		case 'G':
			if (rsv_note % 12 == 7) return true;
			break;
		case 'G#':
			if (rsv_note % 12 == 8) return true;
			break;
		case 'A':
			if (rsv_note % 12 == 9) return true;
			break;
		case 'A#':
			if (rsv_note % 12 == 10) return true;
			break;
		case 'B':
			if (rsv_note % 12 == 11) return true;
			break;
		}
		return false;
	};
	ext.func_chord = function(chord) {

		switch (chord) {
		case 'C':
			sendMIDI(0x9B, 0x00, 0x00);
			break;
		case 'C#':
			sendMIDI(0x9B, 0x00, 0x01);
			break;
		case 'D':
			sendMIDI(0x9B, 0x00, 0x02);
			break;
		case 'D#':
			sendMIDI(0x9B, 0x00, 0x03);
			break;
		case 'E':
			sendMIDI(0x9B, 0x00, 0x04);
			break;
		case 'F':
			sendMIDI(0x9B, 0x00, 0x05);
			break;
		case 'F#':
			sendMIDI(0x9B, 0x00, 0x06);
			break;
		case 'G':
			sendMIDI(0x9B, 0x00, 0x07);
			break;
		case 'G#':
			sendMIDI(0x9B, 0x00, 0x08);
			break;
		case 'A':
			sendMIDI(0x9B, 0x00, 0x09);
			break;
		case 'A#':
			sendMIDI(0x9B, 0x00, 0x0A);
			break;
		case 'B':
			sendMIDI(0x9B, 0x00, 0x0B);
			break;
		}
	};
	ext.func_wait_meas = function(wait, callback) {

		if (f8Cnt == 0) lastF8Cnt = 0;

		var target = lastF8Cnt + (wait*96);

		console.log("lastf8=",lastF8Cnt);
		console.log("target=",target);

		lastF8Cnt = target;

		var timerID = setInterval(function() {
			if (f8Cnt >= target) {
				console.log("f8=",f8Cnt);
				clearInterval(timerID);
				callback();
			}
		}, 1);
	};

/* -------------------------------------------------------------------------	*/
/* for Scratch Extension  */
/* -------------------------------------------------------------------------	*/
	ext._shutdown = function() {};

	ext._getStatus = function() {
		if (!deviceConnect) return {status: 1, msg: 'GO:KEYS not connected'};
		return {status: 2, msg: 'GO:KEYS connected'};
	};
/* -------------------------------------------------------------------------	*/
	var descriptor = {
		blocks: [
			['w', 'loop mix %m.type', 'func_type', 'Trance'],
			[' ', 'drum play %n', 'func_drum', 1],
			[' ', 'bass play %n', 'func_bass', 1],
			[' ', 'melody A play %n', 'func_parta', 1],
			[' ', 'melody B play %n', 'func_partb', 1],
			[' ', 'stop %m.part', 'func_fc', 'All'],
			[' ', 'key %m.chord', 'func_chord', 'C'],
			['w', 'wait %n measure', 'func_wait_meas', 1],
			['r', 'measure', 'func_meas'],
			['r', 'beat', 'func_beat'],
			['r', 'tick', 'func_f8'],
			['h', 'key on',	'func_key_on'],
			['b', 'note %m.note', 'func_is_note', 'C'],
			['r', 'note', 'func_note'],
			['-'],
		],
		menus: {
			note: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',],
			chord: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',],
			type: ['Trance','Funk','House','Drum N Bass','Neo HipHop','Pop','Bright Rock','Trap Step','Future Bass','Trad HipHop','EDM','R&B',],
			part: ['All', 'Drums', 'Bass', 'Part A', 'Part B'],
		},
	};

	// Register the extension
	ScratchExtensions.register('GO:KEYS Extesion', descriptor, ext);


})({});
