'use client'
import CameraFeed from "@/components/CameraFeed";
import { useState } from "react";
import { Hand, Zap, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <Hand className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ASL Translator</h1>
                <p className="text-sm text-gray-500">Real-time sign language recognition</p>
              </div>
            </div>
            <Badge variant="secondary" className="hidden sm:flex">
              <Zap className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Translate ASL in Real-Time
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Use your camera to recognize American Sign Language letters and convert them to text instantly.
          </p>
        </div>

        <CameraFeed />
      </main>

      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto bg-blue-100 rounded-full p-3 w-fit mb-4">
              <Hand className="w-8 h-8 text-blue-600" />
            </div>
            <DialogTitle className="text-2xl font-bold">Welcome to ASL Translator</DialogTitle>
            <DialogDescription className="text-base pt-2">
              Transform American Sign Language into text using AI recognition technology.
            </DialogDescription>
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg text-left">
                <div className="font-medium text-blue-900 mb-2">How it works:</div>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Position your hand clearly in front of the camera</li>
                  <li>• Form ASL letters with your fingers</li>
                  <li>• Hold each sign for 2 seconds to register</li>
                  <li>• Watch as letters appear in the text field</li>
                </ul>
              </div>
              <div className="text-sm text-gray-600">
                <Shield className="w-4 h-4 inline mr-1" />
                Your privacy is protected, all processing happens locally in your browser and no data is stored.
              </div>
            </div>
          </DialogHeader>
          <div className="flex flex-col space-y-2 pt-4">
            <Button onClick={() => setShowWelcome(false)} className="w-full">
              Get Started
            </Button>
            <Button variant="outline" onClick={() => setShowWelcome(false)} className="w-full">
              Learn More About ASL
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}