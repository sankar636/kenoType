import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generateWords } from "../data/kana.js";

export const DURATIONS = [1, 2, 3, 5, 10];
const INITIAL_WORD_COUNT = 60;
const REFILL_THRESHOLD = 20;
const REFILL_BATCH = 40;

export function useTypingTest() {
  const [duration, setDuration] = useState(1);
  const [script, setScript] = useState("mixed"); // "hiragana" | "katakana" | "mixed"
  const [words, setWords] = useState(() => generateWords(INITIAL_WORD_COUNT, "mixed"));
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  // typedWords[i] = { typed, target, correct }
  const [typedWords, setTypedWords] = useState([]);

  const [testActive, setTestActive] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration * 60);

  const inputRef = useRef(null);

  /* ---------------- setup / restart ---------------- */

  const restart = useCallback((nextDuration = duration, nextScript = script) => {
    setWords(generateWords(INITIAL_WORD_COUNT, nextScript));
    setCurrentWordIndex(0);
    setCurrentInput("");
    setTypedWords([]);
    setTestActive(false);
    setTestFinished(false);
    setTimeLeft(nextDuration * 60);
    requestAnimationFrame(() => inputRef.current?.focus());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, script]);

  const changeDuration = (n) => {
    setDuration(n);
    if (!testActive) restart(n, script);
  };

  const changeScript = (s) => {
    setScript(s);
    if (!testActive) restart(duration, s);
  };

  /* ---------------- timer ---------------- */

  const finishTest = useCallback(() => {
    setTestActive(false);
    setTestFinished(true);
    inputRef.current?.blur();
  }, []);

  useEffect(() => {
    if (!testActive) return;
    if (timeLeft <= 0) {
      finishTest();
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [testActive, timeLeft, finishTest]);

  /* ---------------- typing ---------------- */

  const ensureMoreWords = (idx) => {
    setWords((prev) =>
      idx > prev.length - REFILL_THRESHOLD
        ? [...prev, ...generateWords(REFILL_BATCH, script)]
        : prev
    );
  };

  const commitWord = (raw) => {
    const target = words[currentWordIndex]?.romaji ?? "";
    const correct = raw === target;
    setTypedWords((prev) => [...prev, { typed: raw, target, correct }]);
    const next = currentWordIndex + 1;
    setCurrentWordIndex(next);
    ensureMoreWords(next);
  };

  const handleChange = (e) => {
    if (testFinished) return;
    const val = e.target.value;

    if (!testActive) setTestActive(true);

    if (val.endsWith(" ")) {
      const word = val.slice(0, -1);
      if (word.length > 0) commitWord(word);
      setCurrentInput("");
    } else {
      setCurrentInput(val);
    }
  };

  /* ---------------- stats ---------------- */

  const stats = useMemo(() => {
    const correctWords = typedWords.filter((w) => w.correct).length;
    const incorrectWords = typedWords.length - correctWords;
    const correctChars = typedWords
      .filter((w) => w.correct)
      .reduce((sum, w) => sum + w.target.length + 1, 0); // +1 for the space
    const accuracy = typedWords.length
      ? Math.round((correctWords / typedWords.length) * 100)
      : 100;
    const wpm = Math.max(0, Math.round(correctChars / 5 / duration));
    return { wpm, accuracy, correctWords, incorrectWords, wordCount: typedWords.length };
  }, [typedWords, duration]);

  return {
    // config
    duration,
    script,
    changeDuration,
    changeScript,
    // words + progress
    words,
    currentWordIndex,
    currentInput,
    typedWords,
    // test lifecycle
    testActive,
    testFinished,
    timeLeft,
    restart,
    // input wiring
    inputRef,
    handleChange,
    // results
    stats,
  };
}
