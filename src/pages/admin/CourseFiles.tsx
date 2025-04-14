
import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import GoogleDriveEmbed from "@/components/drive/GoogleDriveEmbed";

const MAIN_FOLDER_ID = "1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e";

const CourseFiles = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Course Files</h1>
            <p className="text-muted-foreground">Access course materials from Google Drive</p>
          </div>
        </div>

        <Card className="bg-white border border-gray-200 shadow-sm p-6">
          <GoogleDriveEmbed 
            folderId={MAIN_FOLDER_ID} 
            title="IICT Files" 
            height={600}
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CourseFiles;
