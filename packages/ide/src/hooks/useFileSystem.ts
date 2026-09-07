import { useCallback, useEffect, useState } from "react";

const FILES_STORAGE_KEY = "files-storage";

export interface FileData {
  path: string;
  content: string;
  language: string;
}

export function useFileSystem(storageScope?: string) {
  const [files, setFiles] = useState<Map<string, FileData>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  const filesStorageKey = storageScope
    ? `${storageScope}:files-storage`
    : FILES_STORAGE_KEY;

  // Initialize files from localStorage
  useEffect(() => {
    const initializeFiles = () => {
      if (typeof window === "undefined") return;

      try {
        const stored = localStorage.getItem(filesStorageKey);
        const filesMap = new Map<string, FileData>();

        if (stored) {
          const filesArray = JSON.parse(stored) as FileData[];
          filesArray.forEach((file) => {
            filesMap.set(file.path, file);
          });
        }

        setFiles(filesMap);
        setIsLoaded(true);
      } catch (error) {
        console.error("Falha ao carregar arquivos do localStorage:", error);
        setIsLoaded(true);
      }
    };

    initializeFiles();
  }, [filesStorageKey]);

  // Save files to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded) return;

    try {
      const filesArray = Array.from(files.values());
      localStorage.setItem(filesStorageKey, JSON.stringify(filesArray));
    } catch (error) {
      console.error("Falha ao salvar arquivos no localStorage:", error);
    }
  }, [files, isLoaded, filesStorageKey]);

  const getFile = useCallback(
    (path: string): FileData | undefined => {
      return files.get(path);
    },
    [files],
  );

  const createOrUpdateFile = useCallback(
    (path: string, content: string, language = "java-mm") => {
      setFiles((prev) => {
        const newFiles = new Map(prev);
        newFiles.set(path, { path, content, language });
        return newFiles;
      });
    },
    [],
  );

  const deleteFile = useCallback((path: string) => {
    setFiles((prev) => {
      const newFiles = new Map(prev);
      newFiles.delete(path);
      return newFiles;
    });
  }, []);

  const getAllFiles = useCallback(() => {
    return Array.from(files.values());
  }, [files]);

  const fileExists = useCallback(
    (path: string) => {
      return files.has(path);
    },
    [files],
  );

  const renameFile = useCallback((oldPath: string, newPath: string) => {
    setFiles((prev) => {
      const newFiles = new Map(prev);
      const fileData = newFiles.get(oldPath);

      if (fileData) {
        newFiles.delete(oldPath);
        newFiles.set(newPath, { ...fileData, path: newPath });
      }

      return newFiles;
    });
  }, []);

  return {
    files,
    isLoaded,
    getFile,
    createOrUpdateFile,
    deleteFile,
    getAllFiles,
    fileExists,
    renameFile,
  };
}
