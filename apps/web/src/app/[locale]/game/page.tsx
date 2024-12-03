"use client";

import { useState } from "react";

import * as GoblinSquire from "@repo/engine/client";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { SidebarProvider } from "@repo/ui/components/ui/sidebar";
import { useOnce } from "@repo/ui/hooks";

import { GameContext } from "./providers";
import { AppSidebar } from "./sidebar";

export default function GamePage() {
  const [hasInitialized, setHasInitialized] = useState(false);

  useOnce(async () => {
    const urlParams = new URLSearchParams(window.location.search);

    const worldId = urlParams.get("worldId");

    if (!worldId) {
      console.error("World ID is required");
      return;
    }

    const app = new GoblinSquire.Application();

    await app.initialize({
      worldId,
      container: document.getElementById("gameCanvasContainer")!,
    });

    await app.run();

    setHasInitialized(true);
  });

  return (
    <GameContext value={{ initialized: hasInitialized }}>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full h-screen overflow-hidden p-3 flex flex-col">
          <Card className="w-full h-full flex-1 p-0 overflow-hidden">
            <CardContent
              className="p-0 w-full h-full"
              id="gameCanvasContainer"
            />
          </Card>
        </main>
      </SidebarProvider>
    </GameContext>
  );
}
