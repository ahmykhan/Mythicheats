
import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import GoogleDriveEmbed from "@/components/drive/GoogleDriveEmbed";

const MAIN_FOLDER_ID = "1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e";

const CourseFiles = () => {
  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl mx-auto px-4">
        <GoogleDriveEmbed 
          folderId={MAIN_FOLDER_ID} 
          title="Course Materials" 
          height={700}
        />
      </div>
    </AdminLayout>
  );
};

export default CourseFiles;
