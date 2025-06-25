export const HAND_CONNECTIONS = [
	//thumb
	[0, 1],
	[1, 2],
	[2, 3],
	[3, 4],
	//index finger
	[0, 5],
	[5, 6],
	[6, 7],
	[7, 8],
	//middle finger
	[0, 9],
	[9, 10],
	[10, 11],
	[11, 12],
	//ring finger
	[0, 13],
	[13, 14],
	[14, 15],
	[15, 16],
	//pinky
	[0, 17],
	[17, 18],
	[18, 19],
	[19, 20],
	//palm connections
	[5, 9],
	[9, 13],
	[13, 17],
];

export const HAND_COLORS = {
	Left: '#FF6B6B',
	Right: '#4ECDC4',
	Unknown: '#95A5A6',
};

export const drawHandLandmarks = (
	ctx,
	landmarks,
	canvasWidth,
	canvasHeight
) => {
	if (!ctx || !landmarks || landmarks.length === 0) {
		return;
	}

	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	landmarks.forEach((handData) => {
		const { landmarks: handLandmarks, handedness } = handData;
		const color = HAND_COLORS[handedness] || HAND_COLORS['Unknown'];

		drawConnections(ctx, handLandmarks, canvasWidth, canvasHeight, color);
		drawLandmarkPoints(ctx, handLandmarks, canvasWidth, canvasHeight, color);
		if (handLandmarks.length > 0) {
			drawHandLabel(
				ctx,
				handLandmarks[0],
				handedness,
				canvasWidth,
				canvasHeight,
				color
			);
		}
	});
};

const drawConnections = (ctx, landmarks, canvasWidth, canvasHeight, color) => {
	ctx.strokeStyle = color;
	ctx.lineWidth = 2;
	ctx.globalAlpha = 0.8;

	HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
		if (startIdx < landmarks.length && endIdx < landmarks.length) {
			const start = landmarks[startIdx];
			const end = landmarks[endIdx];

			const startX = start.x * canvasWidth;
			const startY = start.y * canvasHeight;
			const endX = end.x * canvasWidth;
			const endY = end.y * canvasHeight;

			ctx.beginPath();
			ctx.moveTo(startX, startY);
			ctx.lineTo(endX, endY);
			ctx.stroke();
		}
	});
	ctx.globalAlpha = 1.0;
};

const drawLandmarkPoints = (
	ctx,
	landmarks,
	canvasWidth,
	canvasHeight,
	color
) => {
	ctx.fillStyle = color;
	ctx.strokeStyle = '#FFFFFF';
	ctx.lineWidth = 1;

	landmarks.forEach((landmark, index) => {
		const x = landmark.x * canvasWidth;
		const y = landmark.y * canvasHeight;

		let radius = 3;
		if (index === 0) radius = 5; //wrist
		if ([4, 8, 12, 16, 20].includes(index)) radius = 4; //fingertips

		//circle
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2 * Math.PI);
		ctx.fill();

		//white border
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2 * Math.PI);
		ctx.stroke();
	});
};

const drawHandLabel = (
	ctx,
	wristLandmark,
	handedness,
	canvasWidth,
	canvasHeight,
	color
) => {
	const x = wristLandmark.x * canvasWidth;
	const y = wristLandmark.y * canvasHeight;
	ctx.save();

	ctx.scale(-1, 1);
	ctx.translate(-canvasWidth, 0);

	const transformedX = canvasWidth - x;

	ctx.fillStyle = color;
	ctx.font = '14px Arial';
	ctx.fontWeight = 'bold';

	const text = handedness;
	const textMetrics = ctx.measureText(text);
	const textWidth = textMetrics.width;
	const textHeight = 16;

	ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
	ctx.fillRect(
		transformedX - textWidth / 2 - 4,
		y - 25 - textHeight,
		textWidth + 8,
		textHeight + 4
	);

	//text
	ctx.fillStyle = '#FFFFFF';
	ctx.fillText(text, transformedX - textWidth / 2, y - 25);

	ctx.restore();
};

export const getLandmark = (landmarks, index) => {
	if (!landmarks || index < 0 || index >= landmarks.length) {
		return null;
	}
	return landmarks[index];
};

export const calculateDistance = (landmark1, landmark2) => {
	if (!landmark1 || !landmark2) return 0;

	const dx = landmark1.x - landmark2.x;
	const dy = landmark1.y - landmark2.y;
	const dz = (landmark1.z || 0) - (landmark2.z || 0);

	return Math.sqrt(dx * dx + dy * dy + dz * dz);
};
