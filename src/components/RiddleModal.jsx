import React, { useEffect, useState } from "react";
import {
  EASY_RIDDLES,
  MEDIUM_RIDDLES,
  HARD_RIDDLES
} from "../data/riddles.js";

const DIFFICULTY_LABELS = {
  easy: "Easy (+2 / -1)",
  medium: "Medium (+4 / -2)",
  hard: "Hard (+6 / -3)"
};

// Randomly select a riddle for the chosen difficulty.
function pickRiddle(difficulty) {
  const pool =
    difficulty === "easy"
      ? EASY_RIDDLES
      : difficulty === "medium"
      ? MEDIUM_RIDDLES
      : HARD_RIDDLES;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

export default function RiddleModal({
  isOpen,
  team,
  forced,
  onClose,
  onResult
}) {
  const [step, setStep] = useState("select"); // 'select' | 'riddle'
  const [difficulty, setDifficulty] = useState(null);
  const [riddle, setRiddle] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setStep("select");
      setDifficulty(null);
      setRiddle(null);
    }
  }, [isOpen]);

  const handleSelectDifficulty = (level) => {
    const chosen = pickRiddle(level);
    setDifficulty(level);
    setRiddle(chosen);
    setStep("riddle");
  };

  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 p-6 shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-slate-50">
            {forced ? "Forced Riddle" : "Riddle Challenge"}
          </h2>
          <span
            className="px-3 py-1 rounded-full text-xs md:text-sm"
            style={{ backgroundColor: team.color, color: "#020617" }}
          >
            {team.name}
          </span>
        </div>

        {step === "select" && (
          <div className="space-y-4">
            <p className="text-sm md:text-base text-slate-200">
              Choose difficulty. Higher difficulty gives more points but harsher penalties.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <button
                type="button"
                onClick={() => handleSelectDifficulty("easy")}
                className="rounded-xl border border-emerald-500/60 bg-emerald-500/10 px-4 py-3 text-sm md:text-base font-semibold text-emerald-200 hover:bg-emerald-500/20"
              >
                Easy
                <div className="mt-1 text-xs text-emerald-100">
                  Correct +2, Wrong -1
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleSelectDifficulty("medium")}
                className="rounded-xl border border-amber-500/60 bg-amber-500/10 px-4 py-3 text-sm md:text-base font-semibold text-amber-200 hover:bg-amber-500/20"
              >
                Medium
                <div className="mt-1 text-xs text-amber-100">
                  Correct +4, Wrong -2
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleSelectDifficulty("hard")}
                className="rounded-xl border border-rose-500/60 bg-rose-500/10 px-4 py-3 text-sm md:text-base font-semibold text-rose-200 hover:bg-rose-500/20"
              >
                Hard
                <div className="mt-1 text-xs text-rose-100">
                  Correct +6, Wrong -3
                </div>
              </button>
            </div>
          </div>
        )}

        {step === "riddle" && riddle && (
          <div className="space-y-5">
            <div className="text-sm md:text-base text-slate-300">
              Difficulty:{" "}
              <span className="font-semibold text-slate-100">
                {DIFFICULTY_LABELS[difficulty]}
              </span>
            </div>

            <div className="rounded-xl bg-slate-800/80 p-4 text-base md:text-lg text-slate-50">
              {riddle.question}
            </div>

            {Array.isArray(riddle.options) && riddle.options.length > 0 && (
              <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3 text-sm md:text-base text-slate-100">
                <ul className="space-y-1.5">
                  {riddle.options.map((opt, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-[0.7rem] md:text-xs">
                        {index + 1}
                      </span>
                      <span>{opt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <button
                type="button"
                onClick={() => onResult("correct", difficulty)}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm md:text-base font-semibold text-slate-900 hover:bg-emerald-400"
              >
                Correct
              </button>
              <button
                type="button"
                onClick={() => onResult("incorrect", difficulty)}
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm md:text-base font-semibold text-slate-900 hover:bg-rose-400"
              >
                Incorrect
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm md:text-base font-semibold text-slate-200 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

