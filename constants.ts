import React from 'react';
import { Game } from './components/Game';

function App() {
  return (
    // bg-transparent because the background is on the body in index.html
    <div className="antialiased text-stone-800 bg-transparent min-h-screen">
      <Game />
    </div>
  );
}

export default App;