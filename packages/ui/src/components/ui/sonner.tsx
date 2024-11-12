"use client";

import * as React from "react";

import { useTheme } from "next-themes";
import { Toaster as SonnerToaster } from "sonner";

type Position =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center";

interface ToastIcons {
  success?: React.ReactNode;
  info?: React.ReactNode;
  warning?: React.ReactNode;
  error?: React.ReactNode;
  loading?: React.ReactNode;
  close?: React.ReactNode;
}

interface ToastClassnames {
  toast?: string;
  title?: string;
  description?: string;
  loader?: string;
  closeButton?: string;
  cancelButton?: string;
  actionButton?: string;
  success?: string;
  error?: string;
  info?: string;
  warning?: string;
  loading?: string;
  default?: string;
  content?: string;
  icon?: string;
}

interface ToastOptions {
  className?: string;
  closeButton?: boolean;
  descriptionClassName?: string;
  style?: React.CSSProperties;
  cancelButtonStyle?: React.CSSProperties;
  actionButtonStyle?: React.CSSProperties;
  duration?: number;
  unstyled?: boolean;
  classNames?: ToastClassnames;
}

interface ToasterProps {
  invert?: boolean;
  theme?: "light" | "dark" | "system";
  position?: Position;
  hotkey?: string[];
  richColors?: boolean;
  expand?: boolean;
  duration?: number;
  gap?: number;
  visibleToasts?: number;
  closeButton?: boolean;
  toastOptions?: ToastOptions;
  className?: string;
  style?: React.CSSProperties;
  offset?: string | number;
  dir?: "rtl" | "ltr" | "auto";
  /**
   * @deprecated Please use the `icons` prop instead:
   * ```jsx
   * <Toaster
   *   icons={{ loading: <LoadingIcon /> }}
   * />
   * ```
   */
  loadingIcon?: React.ReactNode;
  icons?: ToastIcons;
  containerAriaLabel?: string;
  pauseWhenPageIsHidden?: boolean;
  cn?: CnFunction;
}

type CnFunction = (...classes: Array<string | undefined>) => string;

const Sonner = SonnerToaster as React.FC<ToasterProps>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
