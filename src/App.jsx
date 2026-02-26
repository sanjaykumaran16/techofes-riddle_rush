import React, { useEffect, useMemo, useState } from "react";
import Board from "./components/Board.jsx";
import TeamPanel from "./components/TeamPanel.jsx";
import Dice from "./components/Dice.jsx";
import RiddleModal from "./components/RiddleModal.jsx";
import Leaderboard from "./components/Leaderboard.jsx";
import SuddenDeath from "./components/SuddenDeath.jsx";
import { clearGameState, loadGameState, saveGameState } from "./utils/persist.js";

// Scoring configuration for riddle outcomes by difficulty.
// easy:  correct +2,  wrong -1
// medium: correct +4,  wrong -2
// hard:  correct +6,  wrong -3
const RIDDLE_SCORES = {
  easy: { correct: 2, incorrect: -1 },
  medium: { correct: 4, incorrect: -2 },
  hard: { correct: 6, incorrect: -3 }
};

const MAX_TURNS_PER_TEAM = 10;
// 10 columns x 7 rows = 70 squares
const BOARD_SIZE = 70;
const SPECIAL_SQUARE_COUNT = 6;

// Simple palette to assign team colors.
const TEAM_COLORS = [
  "#22c55e",
  "#60a5fa",
  "#f97316",
  "#e11d48",
  "#a855f7",
  "#14b8a6",
  "#facc15",
  "#fb7185",
  "#6366f1",
  "#2dd4bf"
];

function createInitialBoard() {
  const squares = Array.from({ length: BOARD_SIZE }, () => ({
    type: "normal",
    specialKind: null
  }));

  // Randomly mark about 15 squares as riddle squares (not start square).
  const riddleIndices = new Set();
  while (riddleIndices.size < 15) {
    const idx = Math.floor(Math.random() * BOARD_SIZE);
    if (idx === 0) continue;
    riddleIndices.add(idx);
  }
  for (const idx of riddleIndices) {
    squares[idx].type = "riddle";
  }

  // Add 6 non-overlapping special squares (2 of each type).
  const specialKinds = ["forward", "forward", "backward", "backward", "skip", "skip"];
  let usedIndices = new Set(riddleIndices);
  specialKinds.forEach((kind) => {
    let idx;
    do {
      idx = Math.floor(Math.random() * BOARD_SIZE);
    } while (idx === 0 || usedIndices.has(idx));
    usedIndices.add(idx);
    squares[idx].type = "special";
    squares[idx].specialKind = kind;
  });

  return squares;
}

export default function App() {
  const initialRaw = loadGameState();
  const initial = (() => {
    if (!initialRaw) return null;
    const boardValid =
      Array.isArray(initialRaw.board) && initialRaw.board.length === BOARD_SIZE;
    if (!boardValid) return { ...initialRaw, board: null };

    // If an older saved game has fewer special squares, add more (without moving teams).
    const savedBoard = initialRaw.board;
    const specialCount = savedBoard.filter((s) => s?.type === "special").length;
    if (specialCount >= SPECIAL_SQUARE_COUNT) return initialRaw;

    const nextBoard = savedBoard.map((sq) => ({
      type: sq?.type ?? "normal",
      specialKind: sq?.specialKind ?? null
    }));

    const used = new Set(
      nextBoard
        .map((sq, idx) => ({ sq, idx }))
        .filter(({ sq, idx }) => idx === 0 || sq.type === "riddle" || sq.type === "special")
        .map(({ idx }) => idx)
    );

    const kindsToAdd = [];
    // Add a balanced mix when upgrading: cycle forward/backward/skip.
    const cycle = ["forward", "backward", "skip"];
    const need = SPECIAL_SQUARE_COUNT - specialCount;
    for (let i = 0; i < need; i += 1) kindsToAdd.push(cycle[i % cycle.length]);

    kindsToAdd.forEach((kind) => {
      let idx;
      do {
        idx = Math.floor(Math.random() * BOARD_SIZE);
      } while (used.has(idx));
      used.add(idx);
      nextBoard[idx] = { type: "special", specialKind: kind };
    });

    return { ...initialRaw, board: nextBoard };
  })();

  const [teams, setTeams] = useState(() => {
    const loaded = initial?.teams ?? [];
    if (!Array.isArray(loaded)) return [];
    return loaded.map((t) => ({
      ...t,
      position: Math.max(0, Math.min(BOARD_SIZE - 1, Number(t.position) || 0))
    }));
  });
  const [currentTeamIndex, setCurrentTeamIndex] = useState(
    () => initial?.currentTeamIndex ?? 0
  );
  const [diceValue, setDiceValue] = useState(() => initial?.diceValue ?? 1);
  const [board, setBoard] = useState(() =>
    initial?.board ? initial.board : createInitialBoard()
  );
  const [gameStarted, setGameStarted] = useState(() => initial?.gameStarted ?? false);
  const [gameOver, setGameOver] = useState(() => initial?.gameOver ?? false);
  const [showSuddenDeath, setShowSuddenDeath] = useState(
    () => initial?.showSuddenDeath ?? false
  );
  const [finalWinner, setFinalWinner] = useState(() => initial?.finalWinner ?? null);

  const [riddleState, setRiddleState] = useState({
    open: false,
    forced: false,
    teamId: null
  });

  const currentTeam = teams[currentTeamIndex] || null;

  // Persist game state so refresh/reload doesn't wipe the session.
  useEffect(() => {
    saveGameState({
      teams,
      currentTeamIndex,
      diceValue,
      board,
      gameStarted,
      gameOver,
      showSuddenDeath,
      finalWinner
    });
  }, [
    teams,
    currentTeamIndex,
    diceValue,
    board,
    gameStarted,
    gameOver,
    showSuddenDeath,
    finalWinner
  ]);

  const resetGame = () => {
    clearGameState();
    setTeams([]);
    setCurrentTeamIndex(0);
    setDiceValue(1);
    setBoard(createInitialBoard());
    setGameStarted(false);
    setGameOver(false);
    setShowSuddenDeath(false);
    setFinalWinner(null);
    setRiddleState({ open: false, forced: false, teamId: null });
  };

  const canRoll = useMemo(() => {
    if (!gameStarted || gameOver) return false;
    if (!currentTeam) return false;
    if (currentTeam.turnsTaken >= MAX_TURNS_PER_TEAM) return false;
    return true;
  }, [gameStarted, gameOver, currentTeam]);

  const addTeam = () => {
    if (gameStarted) return;
    if (teams.length >= 10) return;
    const index = teams.length;
    const newTeam = {
      id: `team-${index + 1}`,
      name: `Team ${index + 1}`,
      color: TEAM_COLORS[index % TEAM_COLORS.length],
      position: 0,
      wrongAttempts: 0,
      turnsTaken: 0,
      consecutiveNonRiddle: 0,
      skipNext: false
    };
    setTeams((prev) => [...prev, newTeam]);
  };

  const removeLastTeam = () => {
    if (gameStarted) return;
    setTeams((prev) => prev.slice(0, -1));
    setCurrentTeamIndex(0);
  };

  const updateTeamMeta = (id, updated) => {
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  };

  const startGame = () => {
    if (!teams.length) return;
    setGameStarted(true);
    setCurrentTeamIndex(0);
  };

  const allTeamsFinished = (updatedTeams) =>
    updatedTeams.every((t) => t.turnsTaken >= MAX_TURNS_PER_TEAM);

  const advanceToNextTeam = (updatedTeams) => {
    if (!updatedTeams.length) return;
    let idx = currentTeamIndex;
    for (let i = 0; i < updatedTeams.length; i += 1) {
      idx = (idx + 1) % updatedTeams.length;
      if (updatedTeams[idx].turnsTaken < MAX_TURNS_PER_TEAM) {
        setCurrentTeamIndex(idx);
        return;
      }
    }
    setGameOver(true);
  };

  // Handle riddle outcome: adjust position and wrong attempts, then move to next team.
  const handleRiddleResult = (result, difficulty) => {
    setRiddleState({ open: false, forced: false, teamId: null });
    if (!difficulty || !currentTeam) return;

    const delta = RIDDLE_SCORES[difficulty][result === "correct" ? "correct" : "incorrect"];

    setTeams((prev) => {
      const updated = prev.map((t, idx) => {
        if (idx !== currentTeamIndex) return t;
        const newPos = Math.min(
          BOARD_SIZE - 1,
          Math.max(0, t.position + delta)
        );
        return {
          ...t,
          position: newPos,
          wrongAttempts:
            result === "incorrect" ? t.wrongAttempts + 1 : t.wrongAttempts,
          turnsTaken: t.turnsTaken + 1,
          consecutiveNonRiddle: 0 // any riddle breaks the streak
        };
      });

      if (allTeamsFinished(updated)) {
        setGameOver(true);
      } else {
        advanceToNextTeam(updated);
      }
      return updated;
    });
  };

  const handleMove = (steps) => {
    if (!canRoll || !currentTeam) return;

    // Handle skip-next-turn square effect.
    if (currentTeam.skipNext) {
      setTeams((prev) =>
        prev.map((t, idx) =>
          idx === currentTeamIndex
            ? { ...t, skipNext: false, turnsTaken: t.turnsTaken + 1 }
            : t
        )
      );
      setTimeout(() => {
        setTeams((prev) => {
          if (allTeamsFinished(prev)) {
            setGameOver(true);
            return prev;
          }
          advanceToNextTeam(prev);
          return prev;
        });
      }, 200);
      return;
    }

    // Forced riddle if no riddle landed for 3 consecutive turns.
    if (currentTeam.consecutiveNonRiddle >= 3) {
      setRiddleState({ open: true, forced: true, teamId: currentTeam.id });
      return;
    }

    const clamped = Math.max(1, Math.min(6, steps));
    setDiceValue(clamped);
    applyMove(clamped);
  };

  // Apply movement, then resolve board square effects.
  const applyMove = (steps) => {
    if (!currentTeam) return;

    setTeams((prev) => {
      const updated = prev.map((t, idx) => {
        if (idx !== currentTeamIndex) return t;
        const tentative = t.position + steps;
        const newPos = tentative >= BOARD_SIZE ? BOARD_SIZE - 1 : tentative;
        return { ...t, position: newPos };
      });

      const teamAfterMove = updated[currentTeamIndex];
      const square = board[teamAfterMove.position];

      // Landing on a riddle square opens the modal and ends the move here.
      if (square.type === "riddle") {
        setRiddleState({
          open: true,
          forced: false,
          teamId: teamAfterMove.id
        });
        return updated;
      }

      // Apply special square effects if any.
      let finalTeams = [...updated];
      if (square.type === "special") {
        finalTeams = finalTeams.map((t, idx) => {
          if (idx !== currentTeamIndex) return t;
          if (square.specialKind === "forward") {
            const pos = Math.min(BOARD_SIZE - 1, t.position + 3);
            return { ...t, position: pos };
          }
          if (square.specialKind === "backward") {
            const pos = Math.max(0, t.position - 2);
            return { ...t, position: pos };
          }
          if (square.specialKind === "skip") {
            return { ...t, skipNext: true };
          }
          return t;
        });
      }

      // Non-riddle turn increments consecutive non-riddle counter.
      finalTeams = finalTeams.map((t, idx) => {
        if (idx !== currentTeamIndex) return t;
        return {
          ...t,
          turnsTaken: t.turnsTaken + 1,
          consecutiveNonRiddle: t.consecutiveNonRiddle + 1
        };
      });

      if (allTeamsFinished(finalTeams)) {
        setGameOver(true);
      } else {
        advanceToNextTeam(finalTeams);
      }

      return finalTeams;
    });
  };

  const rankedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      if (b.position !== a.position) return b.position - a.position;
      if (a.wrongAttempts !== b.wrongAttempts)
        return a.wrongAttempts - b.wrongAttempts;
      return 0;
    });
  }, [teams]);

  const winner = rankedTeams[0] || null;

  const isTieForFirst = useMemo(() => {
    if (rankedTeams.length < 2) return false;
    const first = rankedTeams[0];
    const tied = rankedTeams.filter(
      (t) =>
        t.position === first.position && t.wrongAttempts === first.wrongAttempts
    );
    return tied.length > 1;
  }, [rankedTeams]);

  const riddleTeam =
    riddleState.open && riddleState.teamId
      ? teams.find((t) => t.id === riddleState.teamId)
      : null;

  const handleSuddenDeathWinner = (team) => {
    setFinalWinner(team);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-3 py-4 md:px-6 md:py-6">
        <header className="mb-2 flex flex-col gap-2 md:mb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-cyan-300">
              Riddle Rush
            </h1>
            <p className="text-xs md:text-sm text-slate-300">
              Projected host-controlled board game for up to 10 teams.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
            <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
              {teams.length || 0} teams
            </span>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
              {BOARD_SIZE}-square board
            </span>
            <button
              type="button"
              onClick={resetGame}
              className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 font-semibold text-slate-100 hover:bg-slate-700"
              title="Clears saved game state"
            >
              Reset Game
            </button>
          </div>
        </header>

        {!gameStarted && (
          <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 md:p-5">
            <h2 className="mb-3 text-lg md:text-xl font-semibold text-slate-50">
              Setup
            </h2>
            <p className="mb-3 text-xs md:text-sm text-slate-300">
              Add teams, adjust their names and colors if desired, then start the game.
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button
                type="button"
                onClick={addTeam}
                disabled={teams.length >= 10}
                className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs md:text-sm font-semibold text-slate-900 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
              >
                Add Team
              </button>
              <button
                type="button"
                onClick={removeLastTeam}
                disabled={teams.length === 0}
                className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs md:text-sm font-semibold text-slate-100 hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
              >
                Remove Last Team
              </button>
              <button
                type="button"
                onClick={startGame}
                disabled={teams.length === 0}
                className="rounded-lg bg-cyan-500 px-4 py-1.5 text-xs md:text-sm font-semibold text-slate-900 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
              >
                Start Game
              </button>
            </div>
            <TeamPanel
              teams={teams}
              currentTeamId={null}
              onUpdateTeam={updateTeamMeta}
              gameStarted={false}
            />
          </div>
        )}

        {gameStarted && (
          <main className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[2fr,1fr]">
            <section className="flex flex-col gap-4">
              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-3 md:p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-xs md:text-sm text-slate-300">
                      Current team
                    </span>
                    {currentTeam ? (
                      <div className="flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1">
                        <div
                          className="h-3 w-3 rounded-full border border-slate-900 md:h-4 md:w-4"
                          style={{ backgroundColor: currentTeam.color }}
                        />
                        <span className="text-xs md:text-sm font-semibold text-slate-50">
                          {currentTeam.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">
                        No active team
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[0.7rem] md:text-xs text-slate-300">
                    {currentTeam && (
                      <>
                        <span>
                          Turn {currentTeam.turnsTaken + 1} of {MAX_TURNS_PER_TEAM}
                        </span>
                        <span>Wrong attempts {currentTeam.wrongAttempts}</span>
                        <span>
                          Non-riddle streak {currentTeam.consecutiveNonRiddle}
                        </span>
                        {currentTeam.skipNext && (
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-amber-200">
                            Next turn will be skipped
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <Board squares={board} teams={teams} />
              </div>
              {gameOver && (
                <div className="rounded-2xl border border-emerald-500/60 bg-emerald-500/10 p-4 md:p-5">
                  <h2 className="text-xl md:text-2xl font-bold text-emerald-200 mb-2">
                    Game Over
                  </h2>
                  {winner && (
                    <p className="text-sm md:text-base text-emerald-100 mb-2">
                      Winner by board position and wrong attempts:{" "}
                      <span className="font-semibold">{winner.name}</span>
                    </p>
                  )}
                  <ol className="mb-3 list-decimal space-y-1 pl-5 text-xs md:text-sm text-slate-100">
                    {rankedTeams.map((team) => (
                      <li key={team.id}>
                        {team.name} — Pos {team.position + 1}, Wrong{" "}
                        {team.wrongAttempts}
                      </li>
                    ))}
                  </ol>
                  {isTieForFirst && (
                    <button
                      type="button"
                      onClick={() => setShowSuddenDeath(true)}
                      className="mt-1 rounded-lg bg-purple-500 px-3 py-1.5 text-xs md:text-sm font-semibold text-slate-900 hover:bg-purple-400"
                    >
                      Sudden Death Mode
                    </button>
                  )}
                  {finalWinner && (
                    <p className="mt-3 text-sm md:text-base text-purple-200">
                      Final winner after Sudden Death:{" "}
                      <span className="font-semibold">
                        {finalWinner.name}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {gameOver && showSuddenDeath && (
                <SuddenDeath teams={teams} onWinnerSelected={handleSuddenDeathWinner} />
              )}
            </section>

            <aside className="flex flex-col gap-4">
              <TeamPanel
                teams={teams}
                currentTeamId={currentTeam ? currentTeam.id : null}
                onUpdateTeam={updateTeamMeta}
                gameStarted={gameStarted}
              />
              <Dice
                value={diceValue}
                onMove={handleMove}
                disabled={!canRoll}
              />
              <Leaderboard teams={teams} />
            </aside>
          </main>
        )}

        <RiddleModal
          isOpen={riddleState.open}
          forced={riddleState.forced}
          team={riddleTeam}
          onClose={() =>
            setRiddleState({ open: false, forced: false, teamId: null })
          }
          onResult={handleRiddleResult}
        />
      </div>
    </div>
  );
}

