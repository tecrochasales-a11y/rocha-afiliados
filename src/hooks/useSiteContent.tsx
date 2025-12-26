import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface SiteContent {
  id: string;
  section: string;
  content_key: string;
  title: string | null;
  description: string | null;
  value: string | null;
  icon: string | null;
  display_order: number;
  extra_data: Record<string, unknown>;
  is_active: boolean;
}

export const useSiteContent = (section: string) => {
  const [content, setContent] = useState<SiteContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from("site_content")
          .select("*")
          .eq("section", section)
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) throw error;
        
        const mappedData: SiteContent[] = (data || []).map(item => ({
          id: item.id,
          section: item.section,
          content_key: item.content_key,
          title: item.title,
          description: item.description,
          value: item.value,
          icon: item.icon,
          display_order: item.display_order ?? 0,
          extra_data: (typeof item.extra_data === 'object' && item.extra_data !== null && !Array.isArray(item.extra_data)) 
            ? item.extra_data as Record<string, unknown>
            : {},
          is_active: item.is_active,
        }));
        
        setContent(mappedData);
      } catch (error) {
        console.error(`Error fetching ${section} content:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [section]);

  return { content, isLoading };
};
