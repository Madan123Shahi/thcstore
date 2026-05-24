// components/Loader.jsx

import { GiLeafSkeleton } from "react-icons/gi";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-950 via-green-900 to-green-800">
      {/* Background Glow */}
      <div className="absolute w-72 h-72 bg-green-500/20 blur-3xl rounded-full animate-pulse" />

      <div className="relative flex flex-col items-center">
        {/* Logo */}
        <div className="w-20 h-20 rounded-3xl bg-green-600 flex items-center justify-center shadow-2xl animate-bounce">
          <GiLeafSkeleton className="text-white text-4xl" />
        </div>

        {/* Brand */}
        <h1 className="mt-6 text-4xl font-bold text-white tracking-wide">
          THC Store
        </h1>

        <p className="mt-2 text-green-200 text-sm tracking-widest uppercase">
          Loading Wellness...
        </p>

        {/* Animated Loader */}
        <div className="mt-8 flex gap-2">
          <span className="w-3 h-3 rounded-full bg-green-300 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-3 h-3 rounded-full bg-green-400 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-3 h-3 rounded-full bg-green-500 animate-bounce" />
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-2 bg-green-950/40 rounded-full overflow-hidden mt-8">
          <div className="h-full bg-gradient-to-r from-green-400 via-green-500 to-green-300 animate-loading-bar rounded-full" />
        </div>
      </div>
    </div>
  );
}
