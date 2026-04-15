import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Loader2, Folder, FileText, File, FileImage, FileArchive, FileSpreadsheet, Home, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

// ── Configurable GitHub repo ──
const GITHUB_OWNER = "saleha-muzammil";
const GITHUB_REPO = "Academic-Time-Machine";

interface GitHubItem {
  name: string;
  path: string;
  type: "file" | "dir";
  download_url: string | null;
  html_url: string;
  size: number;
}

const getFileIcon = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "pdf":
      return <FileText className="h-8 w-8 text-red-500" />;
    case "png": case "jpg": case "jpeg": case "gif": case "svg":
      return <FileImage className="h-8 w-8 text-green-500" />;
    case "zip": case "rar": case "7z":
      return <FileArchive className="h-8 w-8 text-amber-500" />;
    case "xlsx": case "csv":
      return <FileSpreadsheet className="h-8 w-8 text-green-700" />;
    case "doc": case "docx":
      return <FileText className="h-8 w-8 text-blue-500" />;
    case "ppt": case "pptx":
      return <FileText className="h-8 w-8 text-orange-500" />;
    default:
      return <File className="h-8 w-8 text-muted-foreground" />;
  }
};

const PastPapers: React.FC = () => {
  const [currentPath, setCurrentPath] = useState("");
  const [items, setItems] = useState<GitHubItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchContents = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
      const data: GitHubItem[] = await res.json();
      data.sort((a, b) => {
        if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      setItems(data);
    } catch (e: any) {
      setError(e.message || "Failed to load contents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSearchQuery("");
    fetchContents(currentPath);
  }, [currentPath, fetchContents]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    const matchingFiles = items.filter(
      (item) => item.name.toLowerCase().includes(q)
    );
    // If a file inside a folder matches, also keep the parent folder visible
    const matchingDirPaths = new Set<string>();
    matchingFiles.forEach((item) => {
      if (item.type === "file") {
        // Find folders that are "parents" at the current level — the folder items in the list
        items.forEach((potentialDir) => {
          if (potentialDir.type === "dir") {
            matchingDirPaths.add(potentialDir.path);
          }
        });
      }
    });
    // Return unique items: direct matches + parent dirs of matching files
    const result = new Map<string, GitHubItem>();
    matchingFiles.forEach((i) => result.set(i.path, i));
    // Only add dirs that contain matching files if there ARE matching files
    if (matchingFiles.some((f) => f.type === "file")) {
      items.filter((i) => i.type === "dir" && matchingDirPaths.has(i.path))
        .forEach((i) => result.set(i.path, i));
    }
    const arr = Array.from(result.values());
    arr.sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return arr;
  }, [items, searchQuery]);

  const navigateTo = (path: string) => setCurrentPath(path);
  const segments = currentPath ? currentPath.split("/") : [];

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="bg-card rounded-lg border border-border shadow-sm p-3 flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              {segments.length === 0 ? (
                <BreadcrumbPage className="flex items-center gap-1">
                  <Home className="h-4 w-4" /> Home
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink className="flex items-center gap-1 cursor-pointer" onClick={() => navigateTo("")}>
                  <Home className="h-4 w-4" /> Home
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {segments.map((seg, i) => {
              const path = segments.slice(0, i + 1).join("/");
              const isLast = i === segments.length - 1;
              return (
                <React.Fragment key={path}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{decodeURIComponent(seg)}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink className="cursor-pointer" onClick={() => navigateTo(path)}>
                        {decodeURIComponent(seg)}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <Button variant="outline" size="sm" onClick={() => fetchContents(currentPath)}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search files and folders…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button variant="outline" onClick={() => fetchContents(currentPath)}>
            <RefreshCw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed border-border">
          <p className="text-muted-foreground">{searchQuery ? "No matches found" : "This folder is empty"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.path}
              className="flex flex-col items-center cursor-pointer rounded-lg transition-all duration-200 hover:bg-accent/50 p-3 group"
              onClick={() => {
                if (item.type === "dir") {
                  navigateTo(item.path);
                } else {
                  window.open(item.download_url || item.html_url, "_blank");
                }
              }}
            >
              <div className="w-full aspect-square flex items-center justify-center bg-muted/30 rounded-lg mb-2 group-hover:bg-accent/30 transition-colors">
                {item.type === "dir" ? (
                  <Folder className="h-12 w-12 text-yellow-500" />
                ) : (
                  getFileIcon(item.name)
                )}
              </div>
              <p className="text-sm font-medium text-foreground text-center truncate w-full" title={item.name}>
                {item.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.type === "dir" ? "Folder" : (item.name.split(".").pop()?.toUpperCase() ?? "File")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PastPapers;
