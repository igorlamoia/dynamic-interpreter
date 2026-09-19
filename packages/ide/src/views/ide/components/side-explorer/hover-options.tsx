import { ChevronsDownUp, FilePlus2, FolderPlus } from "lucide-react";
import IconButton from "@/components/buttons/icon-button";
import { t } from "@/i18n";

export function HoverOptions({
  onCollapseAll,
  onCreateFile,
  onCreateFolder,
  locale,
}: {
  onCollapseAll: () => void;
  onCreateFile: () => void;
  onCreateFolder: () => void;
  locale?: string;
}) {
  return (
    <div className="flex items-center  opacity-0 transition-opacity group-hover:opacity-100">
      <IconButton
        tooltip={t(locale, "ui.create_file")}
        aria-label={t(locale, "ui.create_file")}
        onClick={onCreateFile}
        className="size-6 p-3.5 "
      >
        <FilePlus2 />
      </IconButton>
      <IconButton
        tooltip={t(locale, "ui.create_folder")}
        aria-label={t(locale, "ui.create_folder")}
        onClick={onCreateFolder}
        className="size-6 p-3.5 "
      >
        <FolderPlus />
      </IconButton>
      <IconButton
        tooltip={t(locale, "ui.collapse_all")}
        aria-label={t(locale, "ui.collapse_all")}
        onClick={onCollapseAll}
        className="size-6 p-3.5 "
      >
        <ChevronsDownUp />
      </IconButton>
    </div>
  );
}
