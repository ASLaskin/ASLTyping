import { Hand } from 'lucide-react';

const ASLLetterCards = () => {
  const letters = [
    {
      letter: 'A',
      description: 'Closed fist with thumb positioned alongside the fingers'
    },
    {
      letter: 'B',
      description: 'Four fingers extended upward with thumb folded across palm'
    },
    {
      letter: 'C',
      description: 'Curved hand forming the shape of the letter C'
    },
    {
      letter: 'E',
      description: 'All fingers curled down with thumb touching fingertips'
    },
    {
      letter: 'F',
      description: 'Index finger touches thumb, other fingers extended'
    },
    {
      letter: 'L',
      description: 'Index finger and thumb extended at right angles'
    },
    {
      letter: 'U',
      description: 'Index and middle fingers extended together upward'
    },
    {
      letter: 'V',
      description: 'Index and middle fingers extended in V shape'
    },
    {
      letter: 'Y',
      description: 'Thumb and pinky extended, other fingers folded'
    }
  ];

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
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Currently these are the recognized ASL letters the AI can detect. I am currently working on adding more 
          </p>
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