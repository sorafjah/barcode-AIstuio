import React, { useState, useEffect } from 'react';
import { AppState, ScanItem } from './types';
import Scanner from './components/Scanner';
import { audioService } from './services/audioService';
import { ShoppingCart, RefreshCcw, CreditCard, Camera } from 'lucide-react';

const UNIT_PRICE = 110; // Fixed price per scan

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [items, setItems] = useState<ScanItem[]>([]);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');

  // Derived state
  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
  const totalCount = items.length;

  const handleStart = () => {
    // Initialize audio context on user gesture (crucial for iOS)
    audioService.initialize();
    setAppState(AppState.SCANNING);
  };

  const handleScan = (code: string) => {
    const newItem: ScanItem = {
      id: crypto.randomUUID(),
      code,
      name: '100円ショップの商品',
      price: UNIT_PRICE,
      timestamp: Date.now(),
    };

    setItems((prev) => [...prev, newItem]);
    setLastScannedCode(code);

    // Audio Feedback
    audioService.playBeep();
    // Use a slight delay for TTS so the beep is clear
    setTimeout(() => {
      audioService.speak("ひゃくじゅうえん");
    }, 300);
  };

  const handlePayment = () => {
    setAppState(AppState.PAYMENT);
    audioService.speak(`ごうけい、${totalAmount}えんです。`);
  };

  const handleReset = () => {
    setItems([]);
    setLastScannedCode('');
    setAppState(AppState.SCANNING);
    audioService.speak("つぎの、どうぞ！");
  };

  // --- RENDER HELPERS ---

  const renderStartScreen = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-white p-6">
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-blue-600 mb-4">100円レジ</h1>
        <p className="text-xl text-gray-600 font-bold">がっこう・あそび用</p>
      </div>
      
      <div className="bg-gray-100 p-8 rounded-3xl mb-8 flex items-center justify-center">
        <ShoppingCart size={120} className="text-blue-500" />
      </div>

      <button
        onClick={handleStart}
        className="w-full max-w-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-4xl font-black py-8 px-6 rounded-3xl shadow-xl transition-transform transform active:scale-95 flex items-center justify-center gap-4"
      >
        <Camera size={48} />
        レジをはじめる
      </button>
      <p className="mt-6 text-gray-500 text-sm font-bold">
        ※カメラと音をつかいます
      </p>
    </div>
  );

  const renderScanningScreen = () => (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Header: Stats */}
      <div className="bg-blue-50 p-4 pb-2 border-b-4 border-blue-200 shadow-sm z-10">
        <div className="flex justify-between items-end mb-1">
          <span className="text-2xl font-bold text-gray-600">個数</span>
          <span className="text-2xl font-bold text-gray-600">合計</span>
        </div>
        <div className="flex justify-between items-end">
          <div className="text-6xl font-black text-blue-900 leading-none">
            {totalCount}<span className="text-2xl ml-1">こ</span>
          </div>
          <div className="text-7xl font-black text-red-600 leading-none">
            {totalAmount.toLocaleString()}<span className="text-2xl ml-1 text-black">円</span>
          </div>
        </div>
      </div>

      {/* Main Content: Scanner & Last Item */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto bg-gray-50">
        
        {/* Scanner Viewport */}
        <div className="flex-shrink-0 w-full aspect-square max-h-[40vh] mx-auto bg-black rounded-xl overflow-hidden shadow-inner relative">
          <Scanner onScan={handleScan} isActive={appState === AppState.SCANNING} />
        </div>

        {/* Last Scanned Item Info */}
        <div className="bg-white p-4 rounded-2xl border-2 border-gray-200 shadow-sm flex flex-col items-center justify-center flex-1 min-h-[120px]">
           {lastScannedCode ? (
             <>
               <span className="text-blue-600 font-bold text-lg mb-1">いまスキャンしたもの</span>
               <div className="text-4xl font-black text-gray-800 text-center mb-1">
                 100円ショップの商品
               </div>
               <div className="text-gray-400 font-mono text-sm">
                 CODE: {lastScannedCode}
               </div>
               <div className="mt-2 bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full font-bold text-xl">
                 + 110円
               </div>
             </>
           ) : (
             <p className="text-2xl text-gray-400 font-bold">バーコードをうつしてね</p>
           )}
        </div>
      </div>

      {/* Footer: Pay Button */}
      <div className="p-4 bg-white border-t border-gray-200 pb-8">
        <button
          onClick={handlePayment}
          disabled={totalCount === 0}
          className={`w-full text-4xl font-black py-6 rounded-3xl shadow-lg flex items-center justify-center gap-3 transition-all ${
            totalCount === 0 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-yellow-400 hover:bg-yellow-500 text-black active:scale-95 active:bg-yellow-500'
          }`}
        >
          <CreditCard size={40} />
          お支払い
        </button>
      </div>
    </div>
  );

  const renderPaymentScreen = () => (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-500 mb-2">おかいあげ点数</h2>
          <p className="text-6xl font-black text-blue-900">{totalCount} こ</p>
        </div>

        <div className="w-full h-1 bg-gray-200 my-4"></div>

        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-500 mb-4">お支払い合計</h2>
          <div className="text-8xl font-black text-red-600 tracking-tight">
            {totalAmount.toLocaleString()}
            <span className="text-4xl ml-2 text-black">円</span>
          </div>
        </div>

        <div className="bg-green-100 p-6 rounded-3xl border-4 border-green-200">
          <p className="text-2xl font-bold text-green-800">
            お買い上げ<br/>ありがとうございます！
          </p>
        </div>
      </div>

      <div className="p-4 pb-10 bg-white">
        <button
          onClick={handleReset}
          className="w-full bg-red-500 hover:bg-red-600 text-white text-4xl font-black py-8 rounded-3xl shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-transform"
        >
          <RefreshCcw size={40} />
          つぎの人（リセット）
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans select-none">
      {appState === AppState.IDLE && renderStartScreen()}
      {appState === AppState.SCANNING && renderScanningScreen()}
      {appState === AppState.PAYMENT && renderPaymentScreen()}
    </div>
  );
};

export default App;
