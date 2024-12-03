"use client";

import { useState } from "react";

import { LogEntry, Logger } from "@repo/engine/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { JsonViewer } from "@repo/ui/components/ui/json-viewer";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@repo/ui/components/ui/sidebar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import { useOnceWhen } from "@repo/ui/hooks";
import { ChevronDown, ChevronUp, User2 } from "@repo/ui/icons";

import { useGameContext } from "./providers";

export function AppSidebar() {
  const { initialized } = useGameContext();
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);

  useOnceWhen(initialized, () => {
    Logger.on("log", (_, allEntries) => {
      setLogEntries(allEntries);
    });

    Logger.info(new Error("Hello, world!"));
  });

  return (
    <Sidebar side="left" collapsible="icon">
      <SidebarHeader>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 />
                  Select Workspace
                  <ChevronDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem>
                  <span>Acme Inc</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Acme Corp.</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            {/* <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <ChevronUp />
                  Hello World
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu> */}
            <Tabs defaultValue="development-mode">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="development-mode">
                  Development Mode
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general"></TabsContent>

              <TabsContent value="development-mode">
                <JsonViewer value={logEntries} />
              </TabsContent>
            </Tabs>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> Username
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
