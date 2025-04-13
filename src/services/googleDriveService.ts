import { supabase } from "@/integrations/supabase/client";

// Types for Google Drive files and folders
export type GoogleDriveFile = {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  fileExtension?: string;
  parents?: string[];
  thumbnailLink?: string;
};

// Interface for public folder data
interface PublicFolderData {
  id: string;
  name: string;
  files: PublicFileEntry[];
}

interface PublicFileEntry {
  id: string;
  name: string;
  isFolder: boolean;
  fileType?: string;
  viewLink?: string;
}

// We'll use this flag to indicate we're using mock data
let useApiKeyFallback = true;

// Mock data for the file structure - this will be enhanced to match the Rizzons style
const mockFolderData: { [key: string]: GoogleDriveFile[] } = {
  // Root folder - My School Drive
  "1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e": [
    { id: "folder-lectures", name: "Lectures", mimeType: "application/vnd.google-apps.folder" },
    { id: "file-graphics", name: "GraphicsScratchActivity.pdf", mimeType: "application/pdf" },
    { id: "file-iict-final", name: "IICT - FinalPaper-FirstTerm.pdf", mimeType: "application/pdf" },
    { id: "file-iict-outline", name: "IICT - outline - template.pdf", mimeType: "application/pdf" },
    { id: "file-iict-paper", name: "IICT-Paper Question.pdf", mimeType: "application/pdf" },
    { id: "file-iict-exam", name: "IICT_Final Exam.pdf", mimeType: "application/pdf" },
    { id: "file-presentation", name: "Presentation Topics.pdf", mimeType: "application/pdf" }
  ],
  // Lectures folder - matching the folder shown in the screenshot
  "folder-lectures": [
    { id: "file-lecture1", name: "Introduction to Computer Science.pdf", mimeType: "application/pdf" },
    { id: "file-lecture2", name: "Data Structures and Algorithms.pdf", mimeType: "application/pdf" },
    { id: "file-lecture3", name: "Object Oriented Programming.pdf", mimeType: "application/pdf" },
    { id: "file-lecture4", name: "Database Systems.pdf", mimeType: "application/pdf" }
  ]
};

// Simplified function to check authentication status - we'll always return false as we're using direct links
export const isAuthenticated = (): boolean => {
  return false;
};

// Always return true for using fallback data as we're skipping the API authentication
export const isUsingFallbackData = (): boolean => {
  return true;
};

// Parse Google Drive ID from URL - keeping this utility function
export const parseGoogleDriveId = (url: string): string | null => {
  const regexPatterns = [
    /\/folders\/([a-zA-Z0-9_-]+)/,
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/
  ];
  
  for (const regex of regexPatterns) {
    const match = url.match(regex);
    if (match) return match[1];
  }
  
  return null;
};

// Get folder contents - simplified to use mock data
export const listFiles = async (folderId: string): Promise<GoogleDriveFile[]> => {
  return getMockFolderContents(folderId);
};

// Get mock folder contents
const getMockFolderContents = (folderId: string): GoogleDriveFile[] => {
  return mockFolderData[folderId] || [];
};

// Generate direct Google Drive links
export const getGoogleDriveFileLink = (fileId: string, mimeType?: string): string => {
  if (mimeType === "application/vnd.google-apps.folder") {
    return `https://drive.google.com/drive/folders/${fileId}`;
  }
  
  // For files - create a direct view link
  return `https://drive.google.com/file/d/${fileId}/view`;
};

// Get direct download link
export const getDirectDownloadLink = (fileId: string): string => {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

// Convert Google Drive MIME types to file types
export const getMimeTypeIcon = (mimeType: string, fileExtension?: string): string => {
  if (mimeType === "application/vnd.google-apps.folder") {
    return "folder";
  }
  
  if (fileExtension) {
    switch (fileExtension.toLowerCase()) {
      case "pdf": return "pdf";
      case "doc":
      case "docx": return "doc";
      case "xls":
      case "xlsx": return "xls";
      case "ppt":
      case "pptx": return "ppt";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif": return "image";
      case "mp3":
      case "wav": return "audio";
      case "mp4":
      case "mov": return "video";
      case "zip":
      case "rar": return "archive";
      default: return "file";
    }
  }
  
  // Handle file types based on MIME type
  switch (mimeType) {
    case "application/pdf": return "pdf";
    case "application/vnd.google-apps.document": return "doc";
    case "application/vnd.google-apps.spreadsheet": return "xls";
    case "application/vnd.google-apps.presentation": return "ppt";
    case "image/jpeg":
    case "image/png": return "image";
    case "audio/mpeg": return "audio";
    case "video/mp4": return "video";
    default: return "file";
  }
};

// These are stub functions that no longer perform API calls
export const loadGoogleDriveApi = (): Promise<void> => {
  useApiKeyFallback = true;
  return Promise.resolve();
};

export const authenticateWithGoogleDrive = (): Promise<void> => {
  return Promise.resolve();
};

export const listPublicFolderContents = async (folderId: string): Promise<GoogleDriveFile[]> => {
  return getMockFolderContents(folderId);
};
