"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@repo/ui/components/ui/button";

async function getHello() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Hello");
    }, 1000);
  });
}

export default function Page(): JSX.Element {
  const { data } = useQuery({
    queryKey: ["get-hello"],
    queryFn: () => getHello(),
  });

  return (
    <main>
      <div>
        <p>Hello world</p>
        <Button>Hi</Button>
      </div>
    </main>
  );
}
