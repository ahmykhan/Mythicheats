
import { supabase } from "@/integrations/supabase/client";

// Constants for Google Drive API
const CLIENT_ID = "679596751279-dj0o27k9s3f7je7ol71kimo84al4h39v.apps.googleusercontent.com";
const API_KEY = "AIzaSyCcAYHG73Z-Jq30WFOf7zVuEdgl4eZFNLk";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/drive.readonly";
const SHARED_FOLDER_ID = "1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e"; // ID of the shared folder

// Types for Google Drive files and folders
export type GoogleDriveFile = {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  fileExtension?: string;
  parents?: string[];
};

// For public folder
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

let gapi: any = null;
let tokenClient: any = null;
let isInitialized = false;
let useApiKeyFallback = false;

// Mock data for fallback when API fails
const mockFolderData: { [key: string]: GoogleDriveFile[] } = {
  // Root folder - My School Drive
  "1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e": [
    { id: "folder-assignments", name: "Assignments", mimeType: "application/vnd.google-apps.folder" },
    { id: "folder-lecture-notes", name: "Lecture Notes", mimeType: "application/vnd.google-apps.folder" },
    { id: "folder-past-papers", name: "Past Exam Papers", mimeType: "application/vnd.google-apps.folder" },
    { id: "file-syllabus", name: "Course Syllabus 2025.pdf", mimeType: "application/pdf" }
  ],
  // Assignments folder
  "folder-assignments": [
    { id: "file-assignment1", name: "Assignment 1 - Introduction.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
    { id: "file-assignment2", name: "Assignment 2 - Research Paper.pdf", mimeType: "application/pdf" },
    { id: "folder-group-projects", name: "Group Projects", mimeType: "application/vnd.google-apps.folder" }
  ],
  // Lecture Notes folder
  "folder-lecture-notes": [
    { id: "file-week1", name: "Week 1 - Overview.pdf", mimeType: "application/pdf" },
    { id: "file-week2", name: "Week 2 - Fundamentals.pdf", mimeType: "application/pdf" },
    { id: "file-week3", name: "Week 3 - Advanced Topics.pdf", mimeType: "application/pdf" }
  ],
  // Past Exam Papers folder
  "folder-past-papers": [
    { id: "file-midterm2024", name: "Midterm Exam 2024.pdf", mimeType: "application/pdf" },
    { id: "file-final2024", name: "Final Exam 2024.pdf", mimeType: "application/pdf" },
    { id: "folder-practice-exams", name: "Practice Exams", mimeType: "application/vnd.google-apps.folder" }
  ],
  // Group Projects subfolder
  "folder-group-projects": [
    { id: "file-project-guidelines", name: "Project Guidelines.pdf", mimeType: "application/pdf" },
    { id: "file-team-assignments", name: "Team Assignments.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
  ],
  // Practice Exams subfolder
  "folder-practice-exams": [
    { id: "file-practice1", name: "Practice Exam 1.pdf", mimeType: "application/pdf" },
    { id: "file-practice2", name: "Practice Exam 2.pdf", mimeType: "application/pdf" }
  ]
};

// Load the Google API client library
export const loadGoogleDriveApi = (): Promise<void> => {
  if (isInitialized) return Promise.resolve();
  
  return new Promise((resolve, reject) => {
    console.log("Loading Google Drive API...");
    
    // Load the Google API client library
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Load the client library
      window.gapi.load("client", async () => {
        try {
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOCS,
          });
          
          gapi = window.gapi;
          console.log("Google API client loaded");
          
          // Load the authentication library
          const scriptAuth = document.createElement("script");
          scriptAuth.src = "https://accounts.google.com/gsi/client";
          scriptAuth.async = true;
          scriptAuth.defer = true;
          scriptAuth.onload = () => {
            tokenClient = window.google.accounts.oauth2.initTokenClient({
              client_id: CLIENT_ID,
              scope: SCOPES,
              callback: () => {
                isInitialized = true;
                resolve();
              },
            });
          };
          document.body.appendChild(scriptAuth);
        } catch (error) {
          console.error("Error initializing Google API client:", error);
          useApiKeyFallback = true;
          resolve(); // Resolve anyway, we'll use fallback methods
        }
      });
    };
    script.onerror = (error) => {
      console.error("Error loading Google API client:", error);
      useApiKeyFallback = true;
      resolve(); // Resolve anyway, we'll use fallback methods
    };
    document.body.appendChild(script);
  });
};

// Authenticate with Google Drive
export const authenticateWithGoogleDrive = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      useApiKeyFallback = true;
      resolve(); // Resolve anyway, we'll use fallback methods
      return;
    }
    
    tokenClient.callback = async (response: any) => {
      if (response.error) {
        useApiKeyFallback = true;
        resolve(); // Resolve anyway, we'll use fallback methods
        return;
      }
      
      resolve();
    };
    
    if (gapi && gapi.client && gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: "consent" });
    } else if (gapi && gapi.client) {
      tokenClient.requestAccessToken({ prompt: "" });
    } else {
      useApiKeyFallback = true;
      resolve(); // Resolve anyway, we'll use fallback methods
    }
  });
};

// Public access functions (no authentication required)
export const parseGoogleDriveId = (url: string): string | null => {
  const regex = /\/folders\/([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// List files in a public folder
export const listPublicFolderContents = async (folderId: string): Promise<GoogleDriveFile[]> => {
  try {
    // Check if API key fallback is needed
    if (useApiKeyFallback) {
      console.log("Using mock data fallback");
      return getMockFolderContents(folderId);
    }
    
    // For a public folder, we can use the Google Drive API without authentication
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,webViewLink)&key=${API_KEY}`
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to fetch folder contents:", error);
      
      // If the API key is invalid, use the fallback data
      if (error.error?.message?.includes("API key not valid")) {
        useApiKeyFallback = true;
        return getMockFolderContents(folderId);
      }
      
      throw new Error(`Failed to fetch folder contents: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Map to our format
    return data.files.map((file: any) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      webViewLink: file.webViewLink || getGoogleDriveFileLink(file.id, file.mimeType)
    }));
  } catch (error) {
    console.error("Error listing public folder contents:", error);
    useApiKeyFallback = true;
    return getMockFolderContents(folderId);
  }
};

// Get mock folder contents
const getMockFolderContents = (folderId: string): GoogleDriveFile[] => {
  // Return mock data for the requested folder
  return mockFolderData[folderId] || [];
};

// Generate direct Google Drive links based on file ID and type
export const getGoogleDriveFileLink = (fileId: string, mimeType?: string): string => {
  if (mimeType === "application/vnd.google-apps.folder") {
    return `https://drive.google.com/drive/folders/${fileId}`;
  }
  return `https://drive.google.com/file/d/${fileId}/view`;
};

// Get file details (for authenticated users)
export const getFileDetails = async (fileId: string): Promise<GoogleDriveFile> => {
  if (!gapi || useApiKeyFallback) {
    // Return mock data for the file
    for (const folderId in mockFolderData) {
      const file = mockFolderData[folderId].find(file => file.id === fileId);
      if (file) return file;
    }
    throw new Error("File not found");
  }
  
  try {
    const response = await gapi.client.drive.files.get({
      fileId,
      fields: "id, name, mimeType, webViewLink, iconLink, fileExtension, parents",
    });
    
    return response.result;
  } catch (error) {
    console.error("Error getting file details:", error);
    throw error;
  }
};

// List files in a folder (for authenticated users)
export const listFiles = async (folderId: string = SHARED_FOLDER_ID): Promise<GoogleDriveFile[]> => {
  if (useApiKeyFallback) {
    return getMockFolderContents(folderId);
  }
  
  if (gapi && gapi.client) {
    // Use the authenticated API if available
    try {
      const response = await gapi.client.drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: "files(id, name, mimeType, webViewLink, iconLink, fileExtension, parents)",
        orderBy: "folder,name",
      });
      
      return response.result.files;
    } catch (error) {
      console.error("Error listing files (authenticated):", error);
      useApiKeyFallback = true;
      return getMockFolderContents(folderId);
    }
  } else {
    // Use the public method if not authenticated
    return listPublicFolderContents(folderId);
  }
};

// Check if user is authenticated with Google Drive
export const isAuthenticated = (): boolean => {
  return gapi && gapi.client && gapi.client.getToken() !== null;
};

// Check if using API key fallback
export const isUsingFallbackData = (): boolean => {
  return useApiKeyFallback;
};

// Convert Google Drive MIME types to file types
export const getMimeTypeIcon = (mimeType: string, fileExtension?: string): string => {
  if (mimeType === "application/vnd.google-apps.folder") {
    return "folder";
  }
  
  if (fileExtension) {
    switch (fileExtension.toLowerCase()) {
      case "pdf":
        return "pdf";
      case "doc":
      case "docx":
        return "doc";
      case "xls":
      case "xlsx":
        return "xls";
      case "ppt":
      case "pptx":
        return "ppt";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "image";
      case "mp3":
      case "wav":
        return "audio";
      case "mp4":
      case "mov":
        return "video";
      case "zip":
      case "rar":
        return "archive";
      default:
        return "file";
    }
  }
  
  // Handle Google Workspace file types
  switch (mimeType) {
    case "application/vnd.google-apps.document":
      return "doc";
    case "application/vnd.google-apps.spreadsheet":
      return "xls";
    case "application/vnd.google-apps.presentation":
      return "ppt";
    case "application/vnd.google-apps.drawing":
      return "image";
    case "application/vnd.google-apps.form":
      return "form";
    case "application/pdf":
      return "pdf";
    case "image/jpeg":
    case "image/png":
    case "image/gif":
      return "image";
    case "audio/mpeg":
    case "audio/wav":
      return "audio";
    case "video/mp4":
    case "video/quicktime":
      return "video";
    case "application/zip":
    case "application/x-rar-compressed":
      return "archive";
    default:
      return "file";
  }
};
