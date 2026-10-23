import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-12 py-32 text-center flex flex-col items-center justify-center gap-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-amber-500">
        <Compass className="h-8 w-8" />
      </div>
      <span className="font-mono-meta text-xs uppercase tracking-widest text-amber-500 font-bold">
        Error 404
      </span>
      <h1 className="font-heading text-4xl sm:text-6xl font-bold tracking-tight text-white">
        Page Not Found
      </h1>
      <p className="max-w-md text-sm text-zinc-400">
        The coordinate or asset you requested does not exist in this design studio index.
      </p>
      <Link
        to="/"
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Portfolio Home</span>
      </Link>
    </div>
  );
};
