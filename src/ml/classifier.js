import { extractHandFeatures, getFingerStates } from './preprocessing';

export class ASLClassifier {
	constructor() {
		this.minConfidence = 0.7;
		this.lastPrediction = null;
		this.predictionBuffer = [];
		this.bufferSize = 5;
	}

	classifyHand(landmark, handedness = 'Right') {
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

		//a
		if (!index && !middle && !ring && !pinky && thumb) {
			const thumbTip = landmarks[4];
			const indexMcp = landmarks[5];
			if (thumbTip.y > indexMcp.y) {
				return 'A';
			}
		}

		//c
		if (!index && !middle && !ring && !pinky && thumb) {
			const indexTip = landmarks[8];
			const thumbTip = landmarks[4];
			const distance = Math.sqrt(
				Math.pow(indexTip.x - thumbTip.x, 2) +
					Math.pow(indexTip.y - thumbTip.y, 2)
			);
			if (distance > 0.1 && distance < 0.2) {
				return 'C';
			}
		}

		//f
		if (!index && middle && ring && pinky && thumb) {
			const indexTip = landmarks[8];
			const thumbTip = landmarks[4];
			const distance = Math.sqrt(
				Math.pow(indexTip.x - thumbTip.x, 2) +
					Math.pow(indexTip.y - thumbTip.y, 2)
			);
			if (distance < 0.08) {
				return 'F';
			}
		}

		//o
		if (!index && !middle && !ring && !pinky && thumb) {
			const thumbTip = landmarks[4];
			const indexTip = landmarks[8];
			const middleTip = landmarks[12];

			const d1 = this.calculateDistance(thumbTip, indexTip);
			const d2 = this.calculateDistance(thumbTip, middleTip);

			if (d1 < 0.1 && d2 < 0.15) {
				return 'O';
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
