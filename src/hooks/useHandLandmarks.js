import { useState, useEffect, useRef, useCallback } from 'react';

const useHandLandmarks = () => {
	const [handLandmarker, setHandLandmarker] = useState(null);
	const [isReady, setIsReady] = useState(false);
	const [error, setError] = useState(null);
	const [landmarks, setLandmarks] = useState([]);
	const processingRef = useRef(false);
	const landmarkerRef = useRef(null);

	useEffect(() => {
		const initHandLandMarker = async () => {
			try {
				const { HandLandmarker, FilesetResolver } = await import(
					'@mediapipe/tasks-vision'
				);

				const vision = await FilesetResolver.forVisionTasks(
					'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
				);

				const landmarker = await HandLandmarker.createFromOptions(vision, {
					baseOptions: {
						modelAssetPath:
							'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
						delegate: 'GPU',
					},
					runningMode: 'VIDEO',
					numHands: 2,
					minHandDetectionConfidence: 0.5,
					minHandPresenceConfidence: 0.5,
					minTrackingConfidence: 0.5,
				});

				setHandLandmarker(landmarker);
				landmarkerRef.current = landmarker;
				setIsReady(true);
			} catch (err) {
				setError(err);
			}
		};

		initHandLandMarker();

		return () => {
			if (landmarkerRef.current) {
				landmarkerRef.current.close();
			}
		};
	}, []);

	const detectLandmarks = useCallback(
		async (videoElement) => {
			if (
				!handLandmarker ||
				!isReady ||
				!videoElement ||
				processingRef.current
			) {
				return [];
			}

			if (
				videoElement.videoWidth === 0 ||
				videoElement.videoHeight === 0 ||
				videoElement.readyState < 2
			) {
				return [];
			}

			try {
				processingRef.current = true;

				const nowInMs = Date.now();
				const result = await handLandmarker.detectForVideo(
					videoElement,
					nowInMs
				);

				const detectedLandmarks = [];

				if (result.landmarks && result.landmarks.length > 0) {
					for (let i = 0; i < result.landmarks.length; i++) {
						const handLandmarks = result.landmarks[i];
						const handedness =
							result.handednesses?.[i]?.[0]?.categoryName || 'Unknown';
						const confidence = result.handednesses?.[i]?.[0]?.score || 0;

						detectedLandmarks.push({
							landmarks: handLandmarks,
							handedness,
							confidence,
						});
					}

					setLandmarks(detectedLandmarks);
				}

				setLandmarks(detectedLandmarks);
				return detectedLandmarks;
			} catch (err) {
				setError(err);
				return [];
			} finally {
				processingRef.current = false;
			}
		},
		[handLandmarker, isReady]
	);

	return {
		detectLandmarks,
		landmarks,
		isReady,
		error,
		handLandmarker,
	};
};

export default useHandLandmarks;
