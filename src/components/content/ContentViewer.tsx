import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Folder, FileText, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

interface ContentItem {
  id: string;
  type: 'section' | 'folder' | 'file';
  title: string;
  link?: string | null;
  parent_section?: string | null;
  order_index: number;
}

const ContentViewer: React.FC = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from("google_sheets_data")
        .select("*");

      if (error) throw error;
      
      // Map the data from JSONB
      const mappedData: ContentItem[] = (data || []).flatMap(item => {
        const jsonData = item.data as any;
        if (Array.isArray(jsonData)) {
          return jsonData.map((entry: any, idx: number) => ({
            id: `${item.id}-${idx}`,
            type: (entry.type || 'file') as 'section' | 'folder' | 'file',
            title: entry.title || 'Untitled',
            link: entry.link || null,
            parent_section: entry.parent_section || null,
            order_index: entry.order_index || idx
          }));
        }
        return [];
      });
      
      setContent(mappedData);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast({
        title: "Error",
        description: "Failed to load content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshContent = async () => {
    setRefreshing(true);
    await fetchContent();
    setRefreshing(false);
    toast({
      title: "Content Refreshed",
      description: "Latest content loaded from Google Sheets"
    });
  };

  const handleDownload = (link: string, title: string) => {
    if (!link) return;
    
    window.open(link, '_blank');
    
    toast({
      title: "Download Started",
      description: `Opening ${title}`
    });
  };

  const renderSectionHeader = (title: string) => (
    <div className="w-full my-6">
      <div className="flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="px-4 text-lg font-bold text-center bg-white">
          📚 {title}
        </span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
    </div>
  );

  const renderFolder = (item: ContentItem) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="mb-2"
    >
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center">
          <Folder className="h-5 w-5 text-blue-500 mr-3" />
          <span className="text-lg font-medium">{item.title}</span>
        </div>
      </Card>
    </motion.div>
  );

  const renderFile = (item: ContentItem) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="mb-2"
    >
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <FileText className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-lg">{item.title}</span>
          </div>
          {item.link && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownload(item.link!, item.title)}
              className="ml-4"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );

  const groupedContent = content.reduce((acc, item) => {
    if (item.type === 'section') {
      acc[item.title] = [];
    }
    return acc;
  }, {} as Record<string, ContentItem[]>);

  // Group folders and files under their parent sections
  content.forEach(item => {
    if (item.type !== 'section' && item.parent_section && groupedContent[item.parent_section]) {
      groupedContent[item.parent_section].push(item);
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Study Materials</h1>
        <Button
          onClick={refreshContent}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {Object.entries(groupedContent).map(([sectionTitle, items]) => (
        <div key={sectionTitle}>
          {renderSectionHeader(sectionTitle)}
          <div className="ml-4">
            {items.map(item => 
              item.type === 'folder' ? renderFolder(item) : renderFile(item)
            )}
          </div>
        </div>
      ))}

      {content.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No content available. Check back later!</p>
        </Card>
      )}
    </div>
  );
};

export default ContentViewer;
