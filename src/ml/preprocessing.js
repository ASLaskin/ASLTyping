export const normalizeHandLandmarks = (landmarks) => {
    if (!landmarks || landmarks.length === 0) {
		return null;
	}

	const wrist = landmarks[0];

	const normalizedLandmarks = landmarks.map((landmark) => ({
		x: landmark.x - wrist.x,
		y: landmark.y - wrist.y,
		z: (landmark.z || 0) - (wrist.z || 0),
	}));

    const xs = normalizedLandmarks.map((p) => p.x);
    const ys = normalizedLandmarks.map((p) => p.y);

    const minX = Math.min(...xs);
	const maxX = Math.max(...xs);
	const minY = Math.min(...ys);
	const maxY = Math.max(...ys);

    const scaleX = maxX - minX;
	const scaleY = maxY - minY;
	const scale = Math.max(scaleX, scaleY);

    //avoid dividing by zero
    if (scale === 0) {
		return normalizedLandmarks;
	}

    //normalize to 0,1 range
    const scaledLandmarks = normalizedLandmarks.map((landmark) => ({
		x: landmark.x / scale,
		y: landmark.y / scale,
		z: landmark.z / scale,
	}));

	return scaledLandmarks;
};

export const flattenLandmarks = (normalizedLandmarks) => {
    return normalizedLandmarks.flatMap((landmark) => [
        landmark.x,
        landmark.y,
        landmark.z
    ])
}

export const calculateFingerAngles = (landmarks) => {
    if (!landmarks) {
		return [];
	}

    const angles = [];

    const fingers = [
		{ tip: 4, pip: 3, mcp: 2 }, //thumb
		{ tip: 8, pip: 7, mcp: 6 }, //index
		{ tip: 12, pip: 11, mcp: 10 }, //middle
		{ tip: 16, pip: 15, mcp: 14 }, //ring
		{ tip: 20, pip: 19, mcp: 18 }, //pinky
	];

    fingers.forEach((finger) => {
        const tip = landmarks[finger.tip];
        const pip = landmarks[finger.pip];
		const mcp = landmarks[finger.mcp];

		const v1 = {
			x: mcp.x - pip.x,
			y: mcp.y - pip.y,
		};

		const v2 = {
			x: tip.x - pip.x,
			y: tip.y - pip.y,
		};

        const dot = v1.x * v2.x + v1.y * v2.y;
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
		const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

        if (mag1 === 0 || mag2 === 0) {
			angles.push(0);
		} else {
			const angle = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
			angles.push(angle);
		}
    });

    return angles;
}

export const calculateDistances = (landmarks) => {
	if (!landmarks || landmarks.length < 21) {
		return [];
	}

	const distances = [];

	// Key distance measurements for ASL recognition
	const distancePairs = [
		[4, 8], // Thumb tip to index tip
		[4, 12], // Thumb tip to middle tip
		[4, 16], // Thumb tip to ring tip
		[4, 20], // Thumb tip to pinky tip
		[8, 12], // Index tip to middle tip
		[8, 16], // Index tip to ring tip
		[8, 20], // Index tip to pinky tip
		[12, 16], // Middle tip to ring tip
		[12, 20], // Middle tip to pinky tip
		[16, 20], // Ring tip to pinky tip
	];

	distancePairs.forEach(([idx1, idx2]) => {
		const p1 = landmarks[idx1];
		const p2 = landmarks[idx2];

		const dx = p1.x - p2.x;
		const dy = p1.y - p2.y;
		const dz = (p1.z || 0) - (p2.z || 0);

		const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
		distances.push(distance);
	});

	return distances;
};

export const extractHandFeatures = (landmarks) => {
	if (!landmarks || landmarks.length < 21) {
		return null;
	}

	const normalized = normalizeHandLandmarks(landmarks);
	if (!normalized) {
		return null;
	}

	const flattened = flattenLandmarks(normalized);

	const angles = calculateFingerAngles(landmarks);

	const distances = calculateDistances(normalized);

	const features = [
		...flattened, 
		...angles, 
		...distances,
	];

	return features;
};

//Check if fingers are extended based on landmarks
export const getFingerStates = (landmarks) => {
	if (!landmarks || landmarks.length < 21) {
		return null;
	}

	const states = {
		thumb: false,
		index: false,
		middle: false,
		ring: false,
		pinky: false,
	};

	const thumbTip = landmarks[4];
	const thumbMcp = landmarks[2];
	const wrist = landmarks[0];
	states.thumb =
		Math.abs(thumbTip.x - wrist.x) > Math.abs(thumbMcp.x - wrist.x);

	states.index = landmarks[8].y < landmarks[6].y;
	states.middle = landmarks[12].y < landmarks[10].y;
	states.ring = landmarks[16].y < landmarks[14].y;
	states.pinky = landmarks[20].y < landmarks[18].y;

	return states;
};

//it is strange how good AI is at coding AI stuff, this look good to me according
//to my base knowledge from data science 
