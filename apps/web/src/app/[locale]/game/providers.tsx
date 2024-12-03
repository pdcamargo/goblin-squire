"use client";

import { createContext, useContext } from "react";

export type GameContextType = {
  initialized: boolean;
};

export const GameContext = createContext<GameContextType>({
  initialized: false,
});

export const useGameContext = () => {
  const ctx = useContext(GameContext);

  if (!ctx) {
    throw new Error("useGame must be used within a GameProvider");
  }

  return ctx;
};
