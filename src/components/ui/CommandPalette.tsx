import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useNavigate } from "@tanstack/react-router";
import { Search, Home, Folder, User, Mail, FileText, ArrowRight } from "lucide-react";
import { site } from "@/content/site";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] sm:pt-[25vh]">
      <div
        className="fixed inset-0 bg-op-bg/80 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <Command
        className="op-glass relative z-10 w-full max-w-[640px] overflow-hidden rounded-xl border border-op-line shadow-2xl mx-4 animate-in fade-in zoom-in-95 duration-200"
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      >
        <div className="flex items-center border-b border-op-line px-4" cmdk-input-wrapper="">
          <Search className="mr-2 h-5 w-5 shrink-0 text-op-text-3" />
          <Command.Input
            autoFocus
            placeholder="Type a command or search..."
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-[15px] outline-none placeholder:text-op-text-3 text-op-text"
          />
        </div>
        <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
          <Command.Empty className="py-6 text-center text-[14px] text-op-text-2">
            No results found.
          </Command.Empty>

          <Command.Group
            heading="Navigation"
            className="text-op-text-3 text-[12px] font-op-mono p-1"
          >
            <Command.Item
              onSelect={() => runCommand(() => navigate({ to: "/" }))}
              className="relative flex cursor-pointer select-none items-center rounded-md px-3 py-2.5 text-[14px] text-op-text-2 outline-none aria-selected:bg-op-surface-2 aria-selected:text-op-accent group transition-colors"
            >
              <Home className="mr-2.5 h-4 w-4" />
              <span>Home</span>
              <ArrowRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-aria-selected:opacity-100" />
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate({ to: "/projects" }))}
              className="relative flex cursor-pointer select-none items-center rounded-md px-3 py-2.5 text-[14px] text-op-text-2 outline-none aria-selected:bg-op-surface-2 aria-selected:text-op-accent group transition-colors"
            >
              <Folder className="mr-2.5 h-4 w-4" />
              <span>Projects</span>
              <ArrowRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-aria-selected:opacity-100" />
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate({ to: "/about" }))}
              className="relative flex cursor-pointer select-none items-center rounded-md px-3 py-2.5 text-[14px] text-op-text-2 outline-none aria-selected:bg-op-surface-2 aria-selected:text-op-accent group transition-colors"
            >
              <User className="mr-2.5 h-4 w-4" />
              <span>About</span>
              <ArrowRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-aria-selected:opacity-100" />
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate({ to: "/contact" }))}
              className="relative flex cursor-pointer select-none items-center rounded-md px-3 py-2.5 text-[14px] text-op-text-2 outline-none aria-selected:bg-op-surface-2 aria-selected:text-op-accent group transition-colors"
            >
              <Mail className="mr-2.5 h-4 w-4" />
              <span>Contact</span>
              <ArrowRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-aria-selected:opacity-100" />
            </Command.Item>
          </Command.Group>

          <Command.Separator className="-mx-2 my-1 h-px bg-op-line" />

          <Command.Group heading="External" className="text-op-text-3 text-[12px] font-op-mono p-1">
            <Command.Item
              onSelect={() => runCommand(() => window.open(site.cvHref, "_blank"))}
              className="relative flex cursor-pointer select-none items-center rounded-md px-3 py-2.5 text-[14px] text-op-text-2 outline-none aria-selected:bg-op-surface-2 aria-selected:text-op-accent group transition-colors"
            >
              <FileText className="mr-2.5 h-4 w-4" />
              <span>Download CV</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
