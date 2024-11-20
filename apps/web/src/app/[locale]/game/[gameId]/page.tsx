"use client";

import { useEffect, useRef, useState } from "react";

import * as GoblinSquire from "@repo/engine/client";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { SidebarProvider } from "@repo/ui/components/ui/sidebar";

import { AppSidebar } from "./sidebar";

function useOnce(effect: () => void) {
  const countRef = useRef(0);

  useEffect(() => {
    countRef.current += 1;

    if (countRef.current === 1) {
      effect();
    }
  }, []);
}

export default function GamePage() {
  const [app] = useState(new GoblinSquire.Application());

  useOnce(async () => {
    await app.init({
      gameId: "gameId",
      htmlContainerSelector: "#gameCanvasContainer",
      locale: "en",
    });

    console.log(app);
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full h-screen overflow-hidden p-3 flex flex-col">
        <Card className="w-full h-full flex-1 p-0 overflow-hidden">
          <CardContent
            className="p-0 w-full h-full"
            id="gameCanvasContainer"
          ></CardContent>
        </Card>
      </main>
    </SidebarProvider>
  );
}
