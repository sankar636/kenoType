import './App.css';
// import KanaType from './Components/kanaType'
import { ChevronRight } from 'lucide-react';
import { useTypingTest } from './hooks/useTypingTest.js';

import Header from './components/Header.jsx';
import ConfigBar from './components/ConfigBar.jsx';
import LiveTimer from './components/LiveTimer.jsx';
import WordsDisplay from './components/WordsDisplay.jsx';
import Results from './components/Results.jsx';
import HiddenInput from './components/HiddenInput.jsx';
import RestartButton from './components/RestartButton.jsx';

function App() {
  const {
    duration,
    script,
    changeDuration,
    changeScript,
    words,
    currentWordIndex,
    currentInput,
    typedWords,
    testActive,
    testFinished,
    timeLeft,
    restart,
    inputRef,
    handleChange,
    stats,
  } = useTypingTest();
  return (
    <div
      className="w-full min-h-screen flex flex-col items-center px-6 py-8 select-none bg-bg text-text font-ui"
      onClick={() => inputRef.current?.focus()}
    >
      <HiddenInput
        inputRef={inputRef}
        value={currentInput}
        onChange={handleChange}
        disabled={testFinished}
      />

      <Header />

      <div className="w-full max-w-3xl flex-1 flex flex-col items-center">
        {!testActive && !testFinished && (
          <ConfigBar
            script={script}
            duration={duration}
            onScriptChange={changeScript}
            onDurationChange={changeDuration}
          />
        )}

        {testActive && <LiveTimer timeLeft={timeLeft} />}

        {testFinished ? (
          <Results
            stats={stats}
            duration={duration}
            script={script}
            onRestart={() => restart()}
          />
        ) : (
          <>
            <WordsDisplay
              words={words}
              currentWordIndex={currentWordIndex}
              currentInput={currentInput}
              typedWords={typedWords}
            />

            <div className="flex items-center gap-2 mt-10 text-sm text-subAlt">
              <ChevronRight size={14} />
              <span>
                type the romaji reading for each kana word · space to continue
              </span>
            </div>

            <RestartButton onRestart={() => restart()} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
