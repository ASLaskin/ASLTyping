import { extractHandFeatures, getFingerStates } from './preprocessing';

export class ASLClassifier {
	constructor() {
		this.minConfidence = 0.7;
		this.lastPrediction = null;
		this.predictionBuffer = [];
		this.bufferSize = 5;
	}

	classifyHand(landmarks, handedness = 'Right') {
		if (!landmarks || landmarks.length < 21) {
			return null;
		}

		const fingerStates = getFingerStates(landmarks);
		if (!fingerStates) {
			return null;
		}

		const features = extractHandFeatures(landmarks);
		if (!features) {
			return null;
		}

		const prediction = this.applyRules(fingerStates, landmarks);

		if (prediction) {
			//buffer for smoothing
			this.predictionBuffer.push(prediction);
			if (this.predictionBuffer.length > this.bufferSize) {
				this.predictionBuffer.shift();
			}

			const smoothedPrediction = this.getMostCommonPrediction();

			return {
				letter: smoothedPrediction,
				confidence: this.calculateConfidence(smoothedPrediction),
				handedness: handedness,
				timestamp: Date.now(),
			};
		}

		return null;
	}

	applyRules(fingerStates, landmarks) {
		const { thumb, index, middle, ring, pinky } = fingerStates;

		if (!thumb && index && middle && !ring && !pinky) {
			const indexTip = landmarks[8];
			const middleTip = landmarks[12];
			const distance = this.calculateDistance(indexTip, middleTip);

			if (distance > 0.1) {
				return 'V';
			} else {
				return 'U';
			}
		}

		if (thumb && !index && !middle && !ring && pinky) {
			return 'Y';
		}

		if (!thumb && !index && !middle && !ring && !pinky) {
			return 'E';
		}

		//l
		if (thumb && index && !middle && !ring && !pinky) {
			const thumbTip = landmarks[4];
			const indexMcp = landmarks[5];
			const indexTip = landmarks[8];

			const thumbIndexAngle = this.calculateAngle(thumbTip, indexMcp, indexTip);
			const distance = this.calculateDistance(thumbTip, indexTip);

			if (thumbIndexAngle > 1.2 && distance > 0.08) {
				return 'L';
			}
		}

		if (!thumb && index && middle && ring && pinky) {
			return 'B';
		}

		if (!thumb && !index && middle && !ring && !pinky) {
			return ':(';
		}

		//c
		if (!index && !middle && !ring && !pinky && thumb) {
			const thumbTip = landmarks[4];
			const indexMcp = landmarks[5];

			const indexCurved = landmarks[5].y < landmarks[8].y;
			const middleCurved = landmarks[9].y < landmarks[12].y;

			if (thumbTip.y > indexMcp.y && indexCurved && middleCurved) {
				return 'C';
			}
		}

		//a
		if (!index && !middle && !ring && !pinky && thumb) {
			const indexTip = landmarks[8];
			const thumbTip = landmarks[4];
			const indexMcp = landmarks[5];

			const fingersFolded =
				landmarks[8].y > landmarks[5].y &&
				landmarks[12].y > landmarks[9].y &&
				landmarks[16].y > landmarks[13].y &&
				landmarks[20].y > landmarks[17].y;

			const distance = this.calculateDistance(indexTip, thumbTip);

			if (fingersFolded && distance > 0.05) {
				return 'A';
			}
		}

		//f
		if (!index && middle && ring && pinky && thumb) {
			const indexTip = landmarks[8];
			const thumbTip = landmarks[4];
			const indexMcp = landmarks[5];

			const indexFolded = indexTip.y > indexMcp.y;
			const distance = this.calculateDistance(indexTip, thumbTip);

			if (indexFolded && distance < 0.08) {
				return 'F';
			}
		}

		return null;
	}

	calculateAngle(p1, center, p2) {
		const v1 = { x: p1.x - center.x, y: p1.y - center.y };
		const v2 = { x: p2.x - center.x, y: p2.y - center.y };

		const dot = v1.x * v2.x + v1.y * v2.y;
		const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
		const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

		if (mag1 === 0 || mag2 === 0) return 0;

		return Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
	}

	calculateDistance(p1, p2) {
		return Math.sqrt(
			Math.pow(p1.x - p2.x, 2) +
				Math.pow(p1.y - p2.y, 2) +
				Math.pow((p1.z || 0) - (p2.z || 0), 2)
		);
	}

	getMostCommonPrediction() {
		if (this.predictionBuffer.length === 0) {
			return null;
		}

		const counts = {};
		this.predictionBuffer.forEach((pred) => {
			counts[pred] = (counts[pred] || 0) + 1;
		});

		return Object.keys(counts).reduce((a, b) =>
			counts[a] > counts[b] ? a : b
		);
	}

	calculateConfidence(prediction) {
		if (!prediction || this.predictionBuffer.length === 0) {
			return 0;
		}

		const count = this.predictionBuffer.filter((p) => p === prediction).length;
		return count / this.predictionBuffer.length;
	}

	reset() {
		this.predictionBuffer = [];
		this.lastPrediction = null;
	}
}
