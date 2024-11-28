"use client";

import { useEffect, useRef, useState } from "react";

import * as GoblinSquire from "@repo/engine/client";
import { FileSystemOptions } from "@repo/engine/client";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { SidebarProvider } from "@repo/ui/components/ui/sidebar";
import * as path from "@tauri-apps/api/path";
import * as fs from "@tauri-apps/plugin-fs";
import Database from "@tauri-apps/plugin-sql";

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

function useOnceWhen(condition: boolean, effect: () => void) {
  const countRef = useRef(0);

  useEffect(() => {
    if (countRef.current === 0 && condition) {
      countRef.current += 1;
      effect();
    }
  }, [condition]);
}

export default function GamePage() {
  const [app] = useState(new GoblinSquire.Application());
  const [hasInitialized, setHasInitialized] = useState(false);

  useOnce(async () => {
    const urlParams = new URLSearchParams(window.location.search);

    const worldId = urlParams.get("worldId");

    if (!worldId) {
      console.error("World ID is required");
      return;
    }

    const userData = await path.resolve(await path.appDataDir(), "Data");
    const appData = await path.resolve(await path.appDataDir());
    const logs = await path.resolve(await path.appLogDir());

    const getPath = (
      basePath: "appData" | "userData" | "logs" | (string & {}),
    ) => {
      if (!basePath || basePath === "") {
        return userData;
      }

      const paths: Record<string, string> = {
        appData,
        userData,
        logs,
      };

      return paths[basePath] || userData;
    };

    const fileSystem: FileSystemOptions = {
      readJson: async (targetPath, options) => {
        const base = getPath(options?.basePath || "userData");

        return JSON.parse(
          await fs.readTextFile(await path.resolve(base, targetPath)),
        );
      },
      readText: async (targetPath, options) => {
        const base = getPath(options?.basePath || "userData");

        return fs.readTextFile(await path.resolve(base, targetPath));
      },
      writeJson: async (targetPath, data) => {
        const base = getPath("userData");

        await fs.writeTextFile(
          await path.resolve(base, targetPath),
          JSON.stringify(data),
        );
      },
      writeText: async (targetPath, data, options) => {
        const base = getPath(options?.basePath || "userData");

        await fs.writeTextFile(await path.resolve(base, targetPath), data);
      },
      exists: async (targetPath, options) => {
        const base = getPath(options?.basePath || "userData");

        return fs.exists(await path.resolve(base, targetPath));
      },
      ensureDir: async (targetPath, options) => {
        const base = getPath(options?.basePath || "userData");

        if (await fs.exists(await path.resolve(base, targetPath))) {
          return;
        }

        await fs.mkdir(await path.resolve(base, targetPath), {
          recursive: options?.recursive || false,
        });
      },
    };

    const worldFolderExists = await fileSystem.exists(`worlds/${worldId}`, {
      basePath: "userData",
    });

    if (!worldFolderExists) {
      console.error("World does not exist");
      return;
    }

    const db = await Database.load(`sqlite:Data/worlds/${worldId}/world.db`);

    await app.init({
      gameId: worldId,
      htmlContainerSelector: "#gameCanvasContainer",
      locale: "en",
      paths: {
        userData,
        appData,
        logs,
      },
      database: {
        execute(query, bindValues) {
          return db.execute(query, bindValues);
        },
        select(query, bindValues) {
          return db.select(query, bindValues);
        },
      },
      fileSystem,
    });

    await app.run();

    console.log({ db });

    setHasInitialized(true);
  });

  useOnceWhen(hasInitialized, async () => {
    await app.database.schema
      .createTable("items", {
        ifNotExists: true,
      })
      .addColumn({
        name: "id",
        type: "INTEGER",
        autoIncrement: true,
        primaryKey: true,
        notNull: true,
        unique: true,
      })
      .addColumn({
        name: "name",
        type: "TEXT",
        notNull: true,
      })
      .addColumn({
        name: "description",
        type: "TEXT",
        notNull: true,
      })
      .execute();

    const items = await app.database.table("items").first();

    console.log(items?.id);
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
