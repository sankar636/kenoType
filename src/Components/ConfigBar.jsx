import { Timer } from "lucide-react";
import { DURATIONS } from "../hooks/useTypingTest.js";

const SCRIPTS = ["hiragana", "katakana", "mixed"];

const ConfigBar = ({ script, duration, onScriptChange, onDurationChange }) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 rounded-lg px-6 py-3 mb-12 text-sm bg-bgSub">
      <div className="flex items-center gap-2">
        {SCRIPTS.map((s) => (
          <button
            key={s}
            onClick={() => onScriptChange(s)}
            className={`px-2 py-1 rounded transition-colors ${
              script === s ? "text-accent" : "text-sub hover:text-text"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="w-px h-4 bg-subAlt" />

      <div className="flex items-center gap-1">
        <Timer size={14} className="text-sub mr-1" />
        {DURATIONS.map((n) => (
          <button
            key={n}
            onClick={() => onDurationChange(n)}
            className={`px-2 py-1 rounded transition-colors ${
              duration === n ? "text-accent" : "text-sub hover:text-text"
            }`}
          >
            {n}m
          </button>
        ))}
        <input
          type="number"
          min={1}
          max={10}
          value={duration}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            const n = Math.min(10, Math.max(1, Number(e.target.value) || 1));
            onDurationChange(n);
          }}
          className="w-12 ml-1 text-center rounded bg-bg text-text border border-subAlt outline-none"
        />
      </div>
    </div>
  );
}

export default ConfigBar;