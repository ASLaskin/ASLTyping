'use client';
import { useRef, useEffect, useState } from 'react';
import useHandLandmarks from '@/hooks/useHandLandmarks';
import { drawHandLandmarks } from '@/utils/drawing';

const CameraFeed = () => {
	const videoRef = useRef(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [stream, setStream] = useState(null);
	const animationRef = useRef();
	const canvasRef = useRef(null);

	const {
		detectLandmarks,
		landmarks,
		isReady: isHandLandmarkerReady,
		error: handError,
	} = useHandLandmarks();

	useEffect(() => {
		let mounted = true;

		const startCamera = async () => {
			try {
				setIsLoading(true);
				setError(null);

				if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
					throw new Error('Camera access is not supported by this browser');
				}

				//camera access with a fallback
				const constraints = {
					video: {
						width: { ideal: 640, min: 320, max: 1280 },
						height: { ideal: 480, min: 240, max: 720 },
						facingMode: 'user',
					},
					audio: false,
				};

				//here requests
				let mediaStream;
				try {
					mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
				} catch (err) {
					mediaStream = await navigator.mediaDevices.getUserMedia({
						video: true,
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

				// console.error('Camera dont work');
				setError(err.message);
				setIsLoading(false);
			}
		};

		startCamera();

		//cleanup
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

		const detectAndDraw = async () => {
			if (videoRef.current && canvasRef.current) {
				const video = videoRef.current;
				const canvas = canvasRef.current;
				const ctx = canvas.getContext('2d');

				//check video ready
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
					drawHandLandmarks(ctx, landmarks, canvas.width, canvas.height);
				} catch (err) {
					console.error('Hand detection error:', err);
				}
			}

			animationRef.current = requestAnimationFrame(detectAndDraw);
		};

		detectAndDraw();

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, [isHandLandmarkerReady, isLoading, detectLandmarks, landmarks]);

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
				<div>{error}</div>
				<div>Make sure to allow camera access in your browser</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col justify-center items-center">
			{(isLoading || !isHandLandmarkerReady) && (
				<div>
					<div className="text-gray-600">
						{isLoading ? 'Loading camera...' : 'Initializing hand detection...'}
					</div>
					<div className="text-gray-600">Accept Permissions to start </div>
				</div>
			)}

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
				<div className="mt-4 text-center">
					<div className="text-sm text-gray-600">
						Hand detection active - {landmarks.length} hand
						{landmarks.length !== 1 ? 's' : ''} detected
					</div>
					{landmarks.length > 0 && (
						<div className="text-xs text-gray-500 mt-1">
							{landmarks.map((hand, idx) => (
								<span key={idx} className="inline-block mx-2">
									{hand.handedness} hand ({Math.round(hand.confidence * 100)}%)
								</span>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default CameraFeed;