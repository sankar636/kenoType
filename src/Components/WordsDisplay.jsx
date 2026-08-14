import React, { useEffect, useRef } from "react";
import Word from "./Word.jsx";

export default function WordsDisplay({ words, currentWordIndex, currentInput, typedWords }) {
  const wordRefs = useRef({});
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = wordRefs.current[currentWordIndex];
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [currentWordIndex]);

  return (
    <div ref={scrollRef} className="w-full h-[220px] overflow-hidden">
      <div className="flex flex-wrap gap-x-5 gap-y-4 content-start">
        {words.map((w, idx) => {
          const isCurrent = idx === currentWordIndex;
          const isDone = idx < currentWordIndex;
          const record = isDone ? typedWords[idx] : null;

          return (
            <Word
              key={w.id}
              wordRef={(el) => (wordRefs.current[idx] = el)}
              kana={w.kana}
              isCurrent={isCurrent}
              isDone={isDone}
              correct={record?.correct}
              typed={isCurrent ? currentInput : record?.typed}
              target={w.romaji}
            />
          );
        })}
      </div>
    </div>
  );
}
