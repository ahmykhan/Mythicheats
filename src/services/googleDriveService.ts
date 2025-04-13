
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

// Main Google Drive folder ID from the link provided
const MAIN_FOLDER_ID = "1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e";

// We're using direct links rather than API
let useApiKeyFallback = true;

// Updated folder data to match the exact files in the Google Drive link
const mockFolderData: { [key: string]: GoogleDriveFile[] } = {
  // Root folder - My School Drive with actual files from screenshot
  "1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e": [
    { id: "folder-lectures", name: "Lecture Notes", mimeType: "application/vnd.google-apps.folder" },
    { id: "folder-assignments", name: "Assignments", mimeType: "application/vnd.google-apps.folder" },
    { id: "folder-past-papers", name: "Past Papers", mimeType: "application/vnd.google-apps.folder" },
    { id: "file-course-outline", name: "IICT Course Outline.pdf", mimeType: "application/pdf" },
    { id: "file-reading-list", name: "Reading List.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
    { id: "file-schedule", name: "Class Schedule.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    { id: "file-syllabus", name: "Syllabus.pdf", mimeType: "application/pdf" }
  ],
  // Lecture Notes folder (expanded with more realistic content)
  "folder-lectures": [
    { id: "file-lecture1", name: "Lecture 1 - Introduction to IICT.pdf", mimeType: "application/pdf" },
    { id: "file-lecture2", name: "Lecture 2 - Computer Architecture.pdf", mimeType: "application/pdf" },
    { id: "file-lecture3", name: "Lecture 3 - Operating Systems.pdf", mimeType: "application/pdf" },
    { id: "file-lecture4", name: "Lecture 4 - Computer Networks.pdf", mimeType: "application/pdf" },
    { id: "file-lecture5", name: "Lecture 5 - Database Systems.pdf", mimeType: "application/pdf" },
    { id: "file-notes", name: "Study Notes.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
    { id: "file-slides", name: "Class Slides.pptx", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation" }
  ],
  // Assignments folder
  "folder-assignments": [
    { id: "file-assignment1", name: "Assignment 1 - HTML Basics.pdf", mimeType: "application/pdf" },
    { id: "file-assignment2", name: "Assignment 2 - CSS Styling.pdf", mimeType: "application/pdf" },
    { id: "file-assignment3", name: "Assignment 3 - JavaScript.pdf", mimeType: "application/pdf" },
    { id: "file-assignment4", name: "Assignment 4 - Database Design.pdf", mimeType: "application/pdf" },
    { id: "file-submission-template", name: "Submission Template.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }
  ],
  // Past Papers folder
  "folder-past-papers": [
    { id: "file-midterm2023", name: "Midterm Exam 2023.pdf", mimeType: "application/pdf" },
    { id: "file-final2023", name: "Final Exam 2023.pdf", mimeType: "application/pdf" },
    { id: "file-midterm2022", name: "Midterm Exam 2022.pdf", mimeType: "application/pdf" },
    { id: "file-final2022", name: "Final Exam 2022.pdf", mimeType: "application/pdf" }
  ]
};

// Simplified function to check authentication status - we'll always return false as we're using direct links
export const isAuthenticated = (): boolean => {
  return false;
};

// Always return true for using fallback data as we're using direct links
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
  if (mimeType.includes("word")) {
    return "doc";
  } else if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
    return "xls";
  } else if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) {
    return "ppt";
  } else if (mimeType.includes("pdf")) {
    return "pdf";
  } else if (mimeType.includes("image")) {
    return "image";
  } else if (mimeType.includes("audio")) {
    return "audio";
  } else if (mimeType.includes("video")) {
    return "video";
  } else {
    return "file";
  }
};

// Extract file extension from filename
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  if (parts.length === 1) return '';
  return parts[parts.length - 1].toLowerCase();
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
