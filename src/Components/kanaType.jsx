import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { RotateCcw, Timer, Keyboard, ChevronRight } from "lucide-react";

/* ---------------------------------------------------------------------- */
/*  Kana data                                                              */
/* ---------------------------------------------------------------------- */

// [hiragana, romaji] pairs. Katakana is derived by a unicode offset.
const KANA_UNITS = [
  ["あ", "a"], ["い", "i"], ["う", "u"], ["え", "e"], ["お", "o"],
  ["か", "ka"], ["き", "ki"], ["く", "ku"], ["け", "ke"], ["こ", "ko"],
  ["さ", "sa"], ["し", "shi"], ["す", "su"], ["せ", "se"], ["そ", "so"],
  ["た", "ta"], ["ち", "chi"], ["つ", "tsu"], ["て", "te"], ["と", "to"],
  ["な", "na"], ["に", "ni"], ["ぬ", "nu"], ["ね", "ne"], ["の", "no"],
  ["は", "ha"], ["ひ", "hi"], ["ふ", "fu"], ["へ", "he"], ["ほ", "ho"],
  ["ま", "ma"], ["み", "mi"], ["む", "mu"], ["め", "me"], ["も", "mo"],
  ["や", "ya"], ["ゆ", "yu"], ["よ", "yo"],
  ["ら", "ra"], ["り", "ri"], ["る", "ru"], ["れ", "re"], ["ろ", "ro"],
  ["わ", "wa"], ["ん", "n"],
  ["が", "ga"], ["ぎ", "gi"], ["ぐ", "gu"], ["げ", "ge"], ["ご", "go"],
  ["ざ", "za"], ["じ", "ji"], ["ず", "zu"], ["ぜ", "ze"], ["ぞ", "zo"],
  ["だ", "da"], ["で", "de"], ["ど", "do"],
  ["ば", "ba"], ["び", "bi"], ["ぶ", "bu"], ["べ", "be"], ["ぼ", "bo"],
  ["ぱ", "pa"], ["ぴ", "pi"], ["ぷ", "pu"], ["ぺ", "pe"], ["ぽ", "po"],
  ["きゃ", "kya"], ["きゅ", "kyu"], ["きょ", "kyo"],
  ["しゃ", "sha"], ["しゅ", "shu"], ["しょ", "sho"],
  ["ちゃ", "cha"], ["ちゅ", "chu"], ["ちょ", "cho"],
  ["にゃ", "nya"], ["にゅ", "nyu"], ["にょ", "nyo"],
  ["ひゃ", "hya"], ["ひゅ", "hyu"], ["ひょ", "hyo"],
  ["みゃ", "mya"], ["みゅ", "myu"], ["みょ", "myo"],
  ["りゃ", "rya"], ["りゅ", "ryu"], ["りょ", "ryo"],
  ["ぎゃ", "gya"], ["ぎゅ", "gyu"], ["ぎょ", "gyo"],
  ["じゃ", "ja"], ["じゅ", "ju"], ["じょ", "jo"],
  ["びゃ", "bya"], ["びゅ", "byu"], ["びょ", "byo"],
  ["ぴゃ", "pya"], ["ぴゅ", "pyu"], ["ぴょ", "pyo"],
];

// Hiragana -> Katakana share a fixed +0x60 unicode offset.
const toKatakana = (str) =>
  str
    .split("")
    .map((ch) => {
      const code = ch.charCodeAt(0);
      return code >= 0x3041 && code <= 0x3096
        ? String.fromCharCode(code + 0x60)
        : ch;
    })
    .join("");

const rand = (n) => Math.floor(Math.random() * n);

function makeWord(script) {
  const len = 2 + rand(3); // 2-4 mora per word
  let kana = "";
  let romaji = "";
  for (let i = 0; i < len; i++) {
    const [k, r] = KANA_UNITS[rand(KANA_UNITS.length)];
    kana += k;
    romaji += r;
  }
  const useKata = script === "katakana" || (script === "mixed" && Math.random() < 0.5);
  return {
    kana: useKata ? toKatakana(kana) : kana,
    romaji,
    id: `${Date.now()}-${Math.random()}`,
  };
}

function generateWords(count, script) {
  return Array.from({ length: count }, () => makeWord(script));
}

/* ---------------------------------------------------------------------- */
/*  Theme (Monkeytype "Serika Dark" inspired)                              */
/* ---------------------------------------------------------------------- */

const COLORS = {
  bg: "#2c2e31",
  bgSub: "#232527",
  text: "#d1d0c5",
  sub: "#646669",
  subAlt: "#4d4e51",
  accent: "#e2b714",
  error: "#ca4754",
  errorExtra: "#7e2a33",
};

const DURATIONS = [1, 2, 3, 5, 10];

/* ---------------------------------------------------------------------- */
/*  Component                                                              */
/* ---------------------------------------------------------------------- */

export default function KanaType() {
  const [duration, setDuration] = useState(1);
  const [script, setScript] = useState("mixed"); // hiragana | katakana | mixed
  const [words, setWords] = useState(() => generateWords(60, "mixed"));
  const [isCorrect, setIsCorrect] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [typedWords, setTypedWords] = useState([]);

  const [testActive, setTestActive] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration * 60);

  const inputRef = useRef(null);
  const wordRefs = useRef({});
  const scrollRef = useRef(null);

  /* -------- setup / restart -------- */

  const restart = useCallback(
    (nextDuration = duration, nextScript = script) => {
      setWords(generateWords(60, nextScript));
      setCurrentWordIndex(0);
      setCurrentInput("");
      setTypedWords([]);
      setTestActive(false);
      setTestFinished(false);
      setTimeLeft(nextDuration * 60);
      wordRefs.current = {};
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    [duration, script]
  );

  const changeDuration = (n) => {
    setDuration(n);
    if (!testActive) restart(n, script);
  };

  const changeScript = (s) => {
    setScript(s);
    if (!testActive) restart(duration, s);
  };

  /* -------- timer -------- */

  useEffect(() => {
    if (!testActive) return;
    if (timeLeft <= 0) {
      finishTest();
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testActive, timeLeft]);

  const finishTest = () => {
    setTestActive(false);
    setTestFinished(true);
    inputRef.current?.blur();
  };

  /* -------- typing -------- */

  const ensureMoreWords = (idx) => {
    setWords((prev) => {
      if (idx > prev.length - 20) {
        return [...prev, ...generateWords(40, script)];
      }
      return prev;
    });
  };

  // const commitWord = (raw) => {
  //   const target = words[currentWordIndex]?.romaji ?? "";
  //   setTypedWords((prev) => [...prev, { typed: raw, target }]);
  //   const next = currentWordIndex + 1;
  //   setCurrentWordIndex(next);
  //   ensureMoreWords(next);
  // };

  const commitWord = (raw) => {
    const target = words[currentWordIndex]?.romaji ?? '';
    const isCorrect = raw === target;

    setTypedWords((prev) => [
      ...prev,
      {
        typed: raw,
        target,
        isCorrect,
      },
    ]);

    const next = currentWordIndex + 1;
    setCurrentWordIndex(next);
    ensureMoreWords(next);
  };

  const handleChange = (e) => {
    if (testFinished) return;
    let val = e.target.value;

    if (!testActive) {
      setTestActive(true);
    }

    if (val.endsWith(" ")) {
      const word = val.slice(0, -1);
      if (word.length > 0) commitWord(word);
      setCurrentInput("");
    } else {
      setCurrentInput(val);
    }
  };

  /* -------- autoscroll current word into view -------- */

  useEffect(() => {
    const el = wordRefs.current[currentWordIndex];
    if (el && scrollRef.current) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [currentWordIndex]);

  /* -------- stats -------- */

  const stats = useMemo(() => {
    let correctChars = 0;
    let incorrectChars = 0;
    typedWords.forEach(({ typed, target }) => {
      const len = Math.max(typed.length, target.length);
      for (let i = 0; i < len; i++) {
        if (typed[i] !== undefined && typed[i] === target[i]) correctChars++;
        else incorrectChars++;
      }
      correctChars++; // the space between words
    });
    const totalChars = correctChars + incorrectChars;
    const accuracy = totalChars ? Math.round((correctChars / totalChars) * 100) : 100;
    const minutes = duration;
    const wpm = Math.max(0, Math.round(correctChars / 5 / minutes));
    return { wpm, accuracy, correctChars, incorrectChars, wordCount: typedWords.length };
  }, [typedWords, duration]);

  const mm = String(Math.floor(timeLeft / 60)).padStart(1, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  /* ---------------------------------------------------------------------- */

  return (
    <div
      className="w-full min-h-[640px] flex flex-col items-center px-6 py-8 select-none"
      style={{ backgroundColor: COLORS.bg, color: COLORS.text, fontFamily: "'Lexend', ui-sans-serif, system-ui" }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* hidden input that captures all keystrokes */}
      <input
        ref={inputRef}
        value={currentInput}
        onChange={handleChange}
        autoFocus
        disabled={testFinished}
        className="opacity-0 absolute w-0 h-0"
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
      />

      {/* header */}
      <div className="w-full max-w-3xl flex items-center gap-2 mb-10">
        <Keyboard size={22} style={{ color: COLORS.accent }} />
        <span className="text-lg font-semibold tracking-tight">
          kana<span style={{ color: COLORS.accent }}>type</span>
        </span>
      </div>

      <div className="w-full max-w-3xl flex-1 flex flex-col items-center">
        {/* config bar */}
        {!testActive && !testFinished && (
          <div
            className="flex flex-wrap items-center justify-center gap-6 rounded-lg px-6 py-3 mb-12 text-sm"
            style={{ backgroundColor: COLORS.bgSub }}
          >
            <div className="flex items-center gap-2">
              {["hiragana", "katakana", "mixed"].map((s) => (
                <button
                  key={s}
                  onClick={() => changeScript(s)}
                  className="px-2 py-1 rounded transition-colors"
                  style={{ color: script === s ? COLORS.accent : COLORS.sub }}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="w-px h-4" style={{ backgroundColor: COLORS.subAlt }} />
            <div className="flex items-center gap-1">
              <Timer size={14} style={{ color: COLORS.sub }} className="mr-1" />
              {DURATIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => changeDuration(n)}
                  className="px-2 py-1 rounded transition-colors"
                  style={{ color: duration === n ? COLORS.accent : COLORS.sub }}
                >
                  {n}m
                </button>
              ))}
              <input
                type="number"
                min={1}
                max={10}
                value={duration}
                onChange={(e) => {
                  const n = Math.min(10, Math.max(1, Number(e.target.value) || 1));
                  changeDuration(n);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-12 ml-1 text-center rounded outline-none"
                style={{ backgroundColor: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.subAlt}` }}
              />
            </div>
          </div>
        )}

        {/* live timer while typing */}
        {testActive && (
          <div className="w-full mb-8 font-mono text-3xl" style={{ color: COLORS.accent }}>
            {mm}:{ss}
          </div>
        )}

        {/* results screen */}
        {testFinished ? (
          <div className="w-full flex flex-col items-center gap-8 py-10 animate-[fadeIn_0.3s_ease]">
            <div className="flex items-end gap-16">
              <div className="flex flex-col">
                <span className="font-mono text-6xl font-bold" style={{ color: COLORS.accent }}>
                  {stats.wpm}
                </span>
                <span className="text-sm mt-1" style={{ color: COLORS.sub }}>
                  wpm
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-6xl font-bold" style={{ color: COLORS.accent }}>
                  {stats.accuracy}%
                </span>
                <span className="text-sm mt-1" style={{ color: COLORS.sub }}>
                  accuracy
                </span>
              </div>
            </div>

            <div className="flex gap-10 font-mono text-sm" style={{ color: COLORS.sub }}>
              <div className="flex flex-col items-center">
                <span style={{ color: COLORS.text }}>{duration}m</span>
                <span>time</span>
              </div>
              <div className="flex flex-col items-center">
                <span style={{ color: COLORS.text }}>{stats.wordCount}</span>
                <span>words</span>
              </div>
              <div className="flex flex-col items-center">
                <span style={{ color: COLORS.text }}>
                  <span style={{ color: "#98c379" }}>{stats.correctChars}</span>
                  {" / "}
                  <span style={{ color: COLORS.error }}>{stats.incorrectChars}</span>
                </span>
                <span>correct / error</span>
              </div>
              <div className="flex flex-col items-center">
                <span style={{ color: COLORS.text }}>{script}</span>
                <span>mode</span>
              </div>
            </div>

            <button
              onClick={() => restart()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg mt-4 transition-transform hover:scale-105"
              style={{ backgroundColor: COLORS.bgSub, color: COLORS.accent }}
            >
              <RotateCcw size={16} />
              restart test
            </button>
          </div>
        ) : (
          <>
            {/* words area */}
            <div
              ref={scrollRef}
              className="w-full h-[220px] overflow-hidden leading-[2.6rem] text-2xl"
            >
              <div className="flex flex-wrap gap-x-4 gap-y-3 content-start">
                {words.map((w, idx) => {
                  const isCurrent = idx === currentWordIndex;
                  const isDone = idx < currentWordIndex;
                  const typedRecord = isDone ? typedWords[idx] : null;
                  const inputForWord = isCurrent ? currentInput : typedRecord?.typed ?? "";

                  return (
                    <div
                      key={w.id}
                      ref={(el) => (wordRefs.current[idx] = el)}
                      className="flex flex-col items-center"
                    >
                      <span
                        className="text-sm mb-0.5"
                        style={{
                          color: isCurrent ? COLORS.accent : COLORS.subAlt,
                        }}
                      >
                        {w.kana}
                      </span>
                      {/* <span className="font-mono whitespace-nowrap">
                        {w.romaji.split("").map((ch, i) => {
                          let color = COLORS.sub;
                          let extra = {};
                          if (i < inputForWord.length) {
                            color = inputForWord[i] === ch ? COLORS.text : COLORS.error;
                            if (inputForWord[i] !== ch) extra.textDecoration = "underline";
                          }
                          const showCaret = isCurrent && i === currentInput.length;
                          return (
                            <span
                              key={i}
                              style={{
                                color,
                                ...extra,
                                borderLeft: showCaret ? `2px solid ${COLORS.accent}` : "none",
                                animation: showCaret ? "blink 1s step-end infinite" : "none",
                              }}
                            >
                              {ch}
                            </span>
                          );
                        })}
                        {inputForWord.length > w.romaji.length && (
                          <span style={{ color: COLORS.errorExtra }}>
                            {inputForWord.slice(w.romaji.length)}
                          </span>
                        )}
                        {isCurrent && currentInput.length === w.romaji.length && (
                          <span
                            style={{
                              borderLeft: `2px solid ${COLORS.accent}`,
                              animation: "blink 1s step-end infinite",
                            }}
                          />
                        )}
                      </span> */}
                      {isDone && typedRecord?.isCorrect === false && (
                        <span
                          className="font-mono text-xs whitespace-nowrap"
                          style={{ color: COLORS.error }}
                        >
                          {w.romaji}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-10 text-sm" style={{ color: COLORS.subAlt }}>
              <ChevronRight size={14} />
              <span>type the romaji reading for each kana word · space to continue</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                restart();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg mt-6 transition-transform hover:scale-105"
              style={{ backgroundColor: COLORS.bgSub, color: COLORS.sub }}
            >
              <RotateCcw size={14} />
              <span className="text-sm">restart</span>
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
}
