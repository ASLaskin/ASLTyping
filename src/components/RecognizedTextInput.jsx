import { useState, forwardRef, useImperativeHandle } from 'react';

const RecognizedTextInput = forwardRef(({ onTextChange }, ref) => {
	const [recognizedText, setRecognizedText] = useState('');

	const handleChange = (e) => {
		const newText = e.target.value;
		setRecognizedText(newText);
		if (onTextChange) {
			onTextChange(newText);
		}
	};

	const addLetter = (letter) => {
		const newText = recognizedText + letter;
		setRecognizedText(newText);
		if (onTextChange) {
			onTextChange(newText);
		}
	};

	useImperativeHandle(ref, () => ({
		addLetter
	}));

	return (
		<div className="w-full max-w-2xl">
			<input
				type="text"
				value={recognizedText}
				onChange={handleChange}
				placeholder="Recognized ASL letters will appear here..."
				className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
			/>
		</div>
	);
});

export default RecognizedTextInput;