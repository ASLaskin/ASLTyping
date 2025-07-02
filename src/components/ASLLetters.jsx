import { Hand, BookOpen } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';

const ASLLetterCards = () => {
	const letters = [
		{
			letter: 'A',
			description: 'Closed fist with thumb positioned alongside the fingers',
		},
		{
			letter: 'B',
			description: 'Four fingers extended upward with thumb folded across palm',
		},
		{
			letter: 'C',
			description: 'Curved hand forming the shape of the letter C',
		},
		{
			letter: 'E',
			description: 'All fingers curled down with thumb touching fingertips',
		},
		{
			letter: 'F',
			description: 'Index finger touches thumb, other fingers extended',
		},
		{
			letter: 'L',
			description: 'Index finger and thumb extended at right angles',
		},
		{
			letter: 'U',
			description: 'Index and middle fingers extended together upward',
		},
		{
			letter: 'V',
			description: 'Index and middle fingers extended in V shape',
		},
		{
			letter: 'Y',
			description: 'Thumb and pinky extended, other fingers folded',
		},
	];

	const availableLetters = letters.map((l) => l.letter.toLowerCase());

	const possibleWords = [
		'by',
		'ace',
		'aye',
		'bay',
		'bye',
		'cab',
		'cue',
		'elf',
		'eye',
		'fab',
		'fly',
		'fuel',
		'lay',
		'lye',
		'yea',
		'you',
		'cube',
		'face',
		'lace',
		'veal',
		'yale',
		'cafe',
		'cave',
		'clue',
		,
		'value',
		'blue',
		'clef',
		'flue',
		'clay',
		'level',
		'fluke',
		'fluffy',
		'fleet',
	]
		.filter((word) => {
			return word
				.split('')
				.every((letter) => availableLetters.includes(letter));
		})
		.sort((a, b) => a.length - b.length);

	return (
		<div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-12">
					<div className="flex items-center justify-center mb-4">
						<div className="bg-blue-600 rounded-lg p-3 mr-3">
							<Hand className="w-8 h-8 text-white" />
						</div>
						<h2 className="text-3xl font-bold text-gray-900">
							Available ASL Letters
						</h2>
					</div>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
						Currently these are the recognized ASL letters the AI can detect. I
						am currently working on adding more
					</p>

					<Dialog>
						<DialogTrigger asChild>
							<button className="inline-flex items-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:from-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
								<BookOpen className="w-5 h-5 mr-2" />
								Try Making These Words
							</button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle className="flex items-center text-xl">
									<div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2 mr-3">
										<BookOpen className="w-5 h-5 text-white" />
									</div>
									Words You Can Make
								</DialogTitle>
							</DialogHeader>
							<div className="mt-4">
								<p className="text-gray-600 mb-6">
									Here are all the words you can spell using the available ASL
									letters: {availableLetters.join(', ').toUpperCase()}
								</p>

								<div className="space-y-4">
									<div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
										{possibleWords.map((word, index) => (
											<div
												key={index}
												className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center hover:bg-gray-100 transition-colors"
											>
												<span className="font-medium text-gray-800 uppercase text-sm">
													{word}
												</span>
											</div>
										))}
									</div>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{letters.map((item, index) => (
						<div
							key={item.letter}
							className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
						>
							<div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg h-48 mb-4 overflow-hidden border border-gray-200">
								<img
									src={`/Signs/${item.letter.toLowerCase()}.png`}
									alt={`ASL hand gesture for letter ${item.letter}`}
									className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
								/>
							</div>

							<div className="flex items-center justify-between mb-3">
								<div className="bg-blue-600 text-white text-2xl font-bold rounded-lg w-12 h-12 flex items-center justify-center">
									{item.letter}
								</div>
							</div>

							<p className="text-gray-600 text-sm leading-relaxed">
								{item.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default ASLLetterCards;
