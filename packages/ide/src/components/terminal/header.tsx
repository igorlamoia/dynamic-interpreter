import { motion } from "motion/react";
import { TerminalLine } from ".";
import { t } from "@/i18n";

interface HeaderProps {
  locale?: string;
  toggleTerminal: () => void;
  setLines: React.Dispatch<React.SetStateAction<TerminalLine[]>>;
  isExecuting: boolean;
}

export function Header({
  locale,
  toggleTerminal,
  setLines,
  isExecuting,
}: HeaderProps) {
  return (
    <div className="flex items-center border-t rounded-t-lg justify-between border-b border-black/10 dark:border-white/10 px-4 py-2">
      <div className="flex items-center gap-2">
        <div className="flex gap-x-2">
          <button
            onClick={toggleTerminal}
            className="h-3 w-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
            aria-label={t(locale, "ui.terminal_close")}
          />
          <button
            onClick={() => setLines([])}
            className="h-3 w-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors"
            aria-label={t(locale, "ui.terminal_clear")}
          />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <span className="ml-3 text-xs text-gray-400 font-mono select-none">
          lamoia-terminal
        </span>
      </div>
      {isExecuting && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-green-400 font-mono"
        >
          * {t(locale, "ui.terminal_executing")}
        </motion.span>
      )}
    </div>
  );
}
