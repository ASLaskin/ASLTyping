import { Hand, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
			<div className="text-center max-w-md">
				<div className="mb-8">
					<div className="bg-blue-100 rounded-full p-4 w-fit mx-auto mb-4">
						<Hand className="w-12 h-12 text-blue-600" />
					</div>
					<h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
					<h2 className="text-2xl font-semibold text-gray-700 mb-4">
						Page Not Found
					</h2>
					<p className="text-gray-600 mb-8">
						Looks like this page got lost in translation. Let&apos;s get you
						back to the ASL Translator.
					</p>
				</div>

				<Link
					href="/"
					className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back to Translator
				</Link>
			</div>
		</div>
	);
}
