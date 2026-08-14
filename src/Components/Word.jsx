
const Word = ({ wordRef, kana, isCurrent, isDone, correct, typed, target }) => {
  const kanaColor = isCurrent
    ? "text-accent"
    : isDone
    ? correct
      ? "text-correct"
      : "text-error"
    : "text-subAlt";

  return (
    <div ref={wordRef} className="flex flex-col items-center min-w-[2ch]">
      <span className={`font-jp text-3xl leading-tight transition-colors ${kanaColor}`}>
        {kana}
      </span>

      {/* while typing: echo the user's own keystrokes, not the target */}
      {isCurrent && (
        <span className="font-mono text-sm text-text/80 mt-1 min-h-5">
          {typed}
          <span className="border-l border-accent animate-blink ml-px" />
        </span>
      )}

      {/* after a miss: reveal the correct romaji reading as a hint */}
      {isDone && !correct && (
        <span className="font-mono text-xs text-error mt-1">{target}</span>
      )}
    </div>
  );
}

export default Word;