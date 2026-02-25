import React from "react";

// Single board square
function Square({ index, isRiddle, isSpecial, specialType, teamsOnSquare }) {
  const hasTeam = teamsOnSquare.length > 0;

  const specialLabel =
    specialType === "forward"
      ? "+3"
      : specialType === "backward"
      ? "-2"
      : specialType === "skip"
      ? "⏭"
      : "";

  return (
    <div
      className={[
        "relative flex items-center justify-center rounded-md border text-xs md:text-sm lg:text-base",
        "min-h-10 md:min-h-14 lg:min-h-16",
        "border-slate-600 bg-slate-800/80",
        isRiddle ? "ring-2 ring-purple-400/70" : "",
        isSpecial ? "ring-2 ring-amber-400/70" : "",
        hasTeam ? "shadow-[0_0_20px_rgba(255,255,255,0.3)]" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="absolute left-1 top-1 text-[0.55rem] text-slate-400 md:text-[0.6rem]">
        {index + 1}
      </div>
      {isRiddle && (
        <div className="absolute right-1 top-1 text-[0.6rem] text-purple-300 md:text-xs">
          R
        </div>
      )}
      {isSpecial && (
        <div className="absolute right-1 bottom-1 text-[0.6rem] text-amber-300 md:text-xs">
          {specialLabel}
        </div>
      )}
      <div className="flex gap-1">
        {teamsOnSquare.map((team) => (
          <div
            key={team.id}
            title={team.name}
            className="h-3 w-3 rounded-full border border-slate-900 md:h-4 md:w-4"
            style={{ backgroundColor: team.color }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Board({ squares, teams }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid flex-1 grid-cols-10 gap-1.5 md:gap-2">
        {squares.map((sq, idx) => (
          <Square
            key={idx}
            index={idx}
            isRiddle={sq.type === "riddle"}
            isSpecial={sq.type === "special"}
            specialType={sq.specialKind}
            teamsOnSquare={teams.filter((t) => t.position === idx)}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-slate-300 md:text-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-md ring-2 ring-purple-400/70 bg-slate-700" />
          <span>Riddle square</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-md ring-2 ring-amber-400/70 bg-slate-700" />
          <span>Special square (+3 / -2 / Skip)</span>
        </div>
      </div>
    </div>
  );
}

