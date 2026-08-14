import { RotateCcw } from "lucide-react";

const Results = ({ stats, duration, script, onRestart }) => {
  return (
    <div className="w-full flex flex-col items-center gap-8 py-10 animate-fadeIn">
      <div className="flex items-end gap-16">
        <div className="flex flex-col">
          <span className="font-mono text-6xl font-bold text-accent">{stats.wpm}</span>
          <span className="text-sm mt-1 text-sub">wpm</span>
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-6xl font-bold text-accent">{stats.accuracy}%</span>
          <span className="text-sm mt-1 text-sub">accuracy</span>
        </div>
      </div>

      <div className="flex gap-10 font-mono text-sm text-sub">
        <div className="flex flex-col items-center">
          <span className="text-text">{duration}m</span>
          <span>time</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-text">{stats.wordCount}</span>
          <span>words</span>
        </div>
        <div className="flex flex-col items-center">
          <span>
            <span className="text-correct">{stats.correctWords}</span>
            {" / "}
            <span className="text-error">{stats.incorrectWords}</span>
          </span>
          <span>correct / missed</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-text">{script}</span>
          <span>mode</span>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="flex items-center gap-2 px-4 py-2 rounded-lg mt-4 bg-bgSub text-accent transition-transform hover:scale-105"
      >
        <RotateCcw size={16} />
        restart test
      </button>
    </div>
  );
}

export default Results;