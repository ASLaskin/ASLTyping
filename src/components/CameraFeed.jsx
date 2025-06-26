'use client';
import { useRef, useEffect, useState, useCallback } from 'react';
import useHandLandmarks from '@/hooks/useHandLandmarks';
import { drawHandLandmarks } from '@/utils/drawing';
import { ASLClassifier } from '@/ml/classifier';
import RecognizedTextInput from '@/components/RecognizedTextInput';

const CameraFeed = () => {
	const videoRef = useRef(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [stream, setStream] = useState(null);
	const animationRef = useRef();
	const canvasRef = useRef(null);

	const [currentPrediction, setCurrentPrediction] = useState(null);
	const [holdProgress, setHoldProgress] = useState(0);

	const holdStartTimeRef = useRef(null);
	const classifierRef = useRef(new ASLClassifier());
	const lastFrameTimeRef = useRef(0);
	const textInputRef = useRef(null);
	const progressAnimationRef = useRef(null); 

	const {
		detectLandmarks,
		landmarks,
		isReady: isHandLandmarkerReady,
		error: handError,
	} = useHandLandmarks();

	const HOLD_DURATION = 2000;
	const TARGET_FPS = 60;
	const FRAME_INTERVAL = 1000 / TARGET_FPS;

	const updateHoldProgress = useCallback(() => {
		if (holdStartTimeRef.current && currentPrediction) {
			const elapsed = Date.now() - holdStartTimeRef.current;
			const progress = Math.min(elapsed / HOLD_DURATION, 1);
			setHoldProgress(progress);

			if (progress >= 1) {
				if (textInputRef.current) {
					textInputRef.current.addLetter(currentPrediction.letter);
				}
				holdStartTimeRef.current = null;
				setHoldProgress(0);
				setCurrentPrediction(null);
				classifierRef.current.reset();
			}
		} else if (!currentPrediction) {
			setHoldProgress(0);
		}
	}, [currentPrediction, HOLD_DURATION]);

	useEffect(() => {
		let animationId;
		
		const animateProgress = () => {
			updateHoldProgress();
			
			if (holdStartTimeRef.current && currentPrediction) {
				animationId = requestAnimationFrame(animateProgress);
			}
		};

		if (holdStartTimeRef.current && currentPrediction) {
			animationId = requestAnimationFrame(animateProgress);
		}

		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		};
	}, [currentPrediction, updateHoldProgress]);

	useEffect(() => {
		let mounted = true;

		const startCamera = async () => {
			try {
				setIsLoading(true);
				setError(null);

				if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
					throw new Error('Camera access is not supported by this browser');
				}

				const constraints = {
					video: {
						width: { ideal: 640, min: 320, max: 1280 },
						height: { ideal: 480, min: 240, max: 720 },
						facingMode: 'user',
						frameRate: { ideal: 30, max: 60 },
					},
					audio: false,
				};

				let mediaStream;
				try {
					mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
				} catch (err) {
					mediaStream = await navigator.mediaDevices.getUserMedia({
						video: { frameRate: { ideal: 30, max: 60 } },
						audio: false,
					});
				}

				if (!mounted) {
					mediaStream.getTracks().forEach((track) => track.stop());
					return;
				}

				setStream(mediaStream);

				if (videoRef.current) {
					videoRef.current.srcObject = mediaStream;
					const handleLoadedMetadata = () => {
						if (mounted) {
							setIsLoading(false);
						}
					};

					videoRef.current.addEventListener(
						'loadedmetadata',
						handleLoadedMetadata
					);

					return () => {
						if (videoRef.current) {
							videoRef.current.removeEventListener(
								'loadedmetadata',
								handleLoadedMetadata
							);
						}
					};
				}

				setIsLoading(false);
			} catch (err) {
				if (!mounted) return;
				setError(err.message);
				setIsLoading(false);
			}
		};

		startCamera();

		return () => {
			mounted = false;
			if (stream) {
				stream.getTracks().forEach((track) => track.stop());
			}
		};
	}, []);

	useEffect(() => {
		if (!isHandLandmarkerReady || isLoading) {
			return;
		}

		const detectAndDraw = async (currentTime) => {
			// Throttle frame rate
			if (currentTime - lastFrameTimeRef.current < FRAME_INTERVAL) {
				animationRef.current = requestAnimationFrame(detectAndDraw);
				return;
			}
			lastFrameTimeRef.current = currentTime;

			if (videoRef.current && canvasRef.current) {
				const video = videoRef.current;
				const canvas = canvasRef.current;
				const ctx = canvas.getContext('2d');

				if (
					video.readyState < 2 ||
					video.videoWidth === 0 ||
					video.videoHeight === 0
				) {
					animationRef.current = requestAnimationFrame(detectAndDraw);
					return;
				}

				//set canvas dimensions to match video
				if (
					canvas.width !== video.videoWidth ||
					canvas.height !== video.videoHeight
				) {
					canvas.width = video.videoWidth;
					canvas.height = video.videoHeight;
				}

				try {
					await detectLandmarks(video);

					ctx.clearRect(0, 0, canvas.width, canvas.height);
					drawHandLandmarks(ctx, landmarks, canvas.width, canvas.height);

					if (landmarks && landmarks.length > 0) {
						const handLandmarks = landmarks[0]?.landmarks;
						const handedness = landmarks[0]?.handedness || 'Right';

						if (handLandmarks) {
							const prediction = classifierRef.current.classifyHand(
								handLandmarks,
								handedness
							);

							if (prediction && prediction.confidence > 0.6) {
								if (
									!currentPrediction ||
									currentPrediction.letter !== prediction.letter
								) {
									setCurrentPrediction(prediction);
									holdStartTimeRef.current = Date.now();
									setHoldProgress(0);
								}
							} else {
								if (currentPrediction) {
									setCurrentPrediction(null);
									holdStartTimeRef.current = null;
									setHoldProgress(0);
									classifierRef.current.reset();
								}
							}
						}
					} else {
						if (currentPrediction) {
							setCurrentPrediction(null);
							holdStartTimeRef.current = null;
							setHoldProgress(0);
							classifierRef.current.reset();
						}
					}
				} catch (err) {
					console.error('Hand detection error:', err);
				}
			}

			animationRef.current = requestAnimationFrame(detectAndDraw);
		};

		animationRef.current = requestAnimationFrame(detectAndDraw);

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, [isHandLandmarkerReady, isLoading, detectLandmarks, landmarks, currentPrediction]);

	//stop camera when component unmounts
	useEffect(() => {
		return () => {
			if (stream) {
				stream.getTracks().forEach((track) => track.stop());
			}
		};
	}, [stream]);

	if (error || handError) {
		return (
			<div className="flex flex-col items-center justify-center">
				<div>Camera Error</div>
				<div>{error || handError}</div>
				<div>Make sure to allow camera access in your browser</div>
			</div>
		);
	}

	const progressPercentage = Math.round(holdProgress * 100);

	return (
		<div className="flex flex-col justify-center items-center space-y-4">
			{(isLoading || !isHandLandmarkerReady) && (
				<div className="text-center">
					<div className="text-gray-600">
						{isLoading ? 'Loading camera...' : 'Initializing hand detection...'}
					</div>
					<div className="text-gray-600">Accept Permissions to start</div>
				</div>
			)}

			<RecognizedTextInput ref={textInputRef} />

			<div className="relative">
				<video
					ref={videoRef}
					autoPlay
					playsInline
					muted
					className="w-full max-w-2xl rounded-lg shadow-lg"
					style={{ transform: 'scaleX(-1)' }}
				/>

				<canvas
					ref={canvasRef}
					className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none"
					style={{ transform: 'scaleX(-1)' }}
				/>
			</div>

			{!isLoading && isHandLandmarkerReady && (
				<div className="text-center space-y-2">
					<div className="text-sm text-gray-600">
						Hand detection active - {landmarks?.length || 0} hand
						{landmarks?.length !== 1 ? 's' : ''} detected
					</div>

					{currentPrediction && (
						<div className="space-y-2">
							<div className="text-lg font-bold text-blue-600">
								Recognizing: {currentPrediction.letter}
							</div>
							<div className="text-sm text-gray-500">
								Confidence: {Math.round(currentPrediction.confidence * 100)}%
							</div>

							<div className="w-64 mx-auto">
								<div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
									<div
										className="bg-blue-600 h-full rounded-full transition-all duration-100 ease-linear"
										style={{ 
											width: `${progressPercentage}%`,
											transform: `translateX(0%)` 
										}}
									></div>
								</div>
								<div className="text-xs text-gray-500 mt-1">
									Hold for 2 seconds to add letter ({progressPercentage}%)
								</div>
							</div>
						</div>
					)}

					{landmarks?.length > 0 && !currentPrediction && (
						<div className="text-sm text-gray-500">
							Make a clear ASL letter sign
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default CameraFeed;