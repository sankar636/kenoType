import React from "react";

/**
 * Only the kana is ever shown as the "prompt" - the romaji reading is never
 * displayed ahead of time. While a word is active we echo back what the
 * user has typed so far (their own input, not the target) so they can see
 * their keystrokes. Once a word is submitted:
 *   - correct  -> kana turns green, nothing else is shown, test moves on
 *   - incorrect -> kana turns red and the correct romaji reading is
 *                  revealed underneath as a hint, test still moves on
 */
export default function Word({ wordRef, kana, isCurrent, isDone, correct, typed, target }) {
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
        <span className="font-mono text-sm text-text/80 mt-1 min-h-[1.25rem]">
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
