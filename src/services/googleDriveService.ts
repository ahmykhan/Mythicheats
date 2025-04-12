
import { supabase } from "@/integrations/supabase/client";

// Constants for Google Drive API
const CLIENT_ID = "679596751279-dj0o27k9s3f7je7ol71kimo84al4h39v.apps.googleusercontent.com"; // The OAuth client ID for your Google API
const API_KEY = "AIzaSyCcAYHG73Z-Jq30WFOf7zVuEdgl4eZFNLk"; // Google API key
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/drive.readonly";

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

let gapi: any = null;
let tokenClient: any = null;
let isInitialized = false;

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
          reject(error);
        }
      });
    };
    script.onerror = (error) => {
      console.error("Error loading Google API client:", error);
      reject(error);
    };
    document.body.appendChild(script);
  });
};

// Authenticate with Google Drive
export const authenticateWithGoogleDrive = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error("Token client not initialized"));
      return;
    }
    
    tokenClient.callback = async (response: any) => {
      if (response.error) {
        reject(response);
        return;
      }
      
      resolve();
    };
    
    if (gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: "consent" });
    } else {
      tokenClient.requestAccessToken({ prompt: "" });
    }
  });
};

// List files in a folder
export const listFiles = async (folderId: string = "root"): Promise<GoogleDriveFile[]> => {
  if (!gapi) throw new Error("Google API not initialized");
  
  try {
    const response = await gapi.client.drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType, webViewLink, iconLink, fileExtension, parents)",
      orderBy: "folder,name",
    });
    
    return response.result.files;
  } catch (error) {
    console.error("Error listing files:", error);
    throw error;
  }
};

// Get file details
export const getFileDetails = async (fileId: string): Promise<GoogleDriveFile> => {
  if (!gapi) throw new Error("Google API not initialized");
  
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

// Save file reference to Supabase (commented out until the table is created)
export const saveFileReferenceToSupabase = async (
  fileId: string,
  fileName: string,
  filePath: string[],
  courseId: string,
  fileType: string
): Promise<void> => {
  try {
    // We'll need to create the course_files table in Supabase before using this function
    // For now, just log that we would save the file reference
    console.log("Would save file reference:", {
      file_id: fileId,
      file_name: fileName,
      file_path: filePath.join('/'),
      course_id: courseId,
      file_type: fileType,
    });
    
    // Uncomment when course_files table is created
    // const { error } = await supabase.from("course_files").insert({
    //   file_id: fileId,
    //   file_name: fileName,
    //   file_path: filePath.join('/'),
    //   course_id: courseId,
    //   file_type: fileType,
    // });
    // 
    // if (error) throw error;
  } catch (error) {
    console.error("Error saving file reference:", error);
    throw error;
  }
};

// Check if user is authenticated with Google Drive
export const isAuthenticated = (): boolean => {
  return gapi && gapi.client.getToken() !== null;
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
