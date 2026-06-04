"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { aboutService } from "@/lib/firebase/services/aboutService";
import { AboutSection } from "@/types";
import { PageHeader } from "@/components/admin/cms/PageHeader";
import { LoadingSpinner } from "@/components/admin/cms/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";

export default function AboutPage() {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    initAndFetch();
  }, []);

  const initAndFetch = async () => {
    try {
      await aboutService.initializeAboutSections();
      const data = await aboutService.getAboutContent();
      // sort based on predefined order
      const orderMap: Record<string, number> = {
        'who_am_i': 1,
        'things_i_wonder': 2,
        'things_i_love': 3,
        'current_mission': 4,
        'long_form_story': 5
      };
      data.sort((a, b) => (orderMap[a.key] || 99) - (orderMap[b.key] || 99));
      setSections(data);
    } catch (error) {
      toast.error("Failed to load about content");
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (id: string, newContent: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, content: newContent } : s));
  };

  const handleSave = async (id: string, content: string) => {
    setSavingId(id);
    try {
      await aboutService.updateAboutSection(id, content);
      toast.success("Section updated successfully");
    } catch (error) {
      toast.error("Failed to update section");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader 
        title="About Page Content" 
        description="Manage the content sections that appear on your About page. Leave empty if you don't want a section to show."
      />

      <div className="space-y-6">
        {sections.map(section => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="font-oleo text-brand-primary">{section.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                rows={section.key === 'long_form_story' ? 10 : 5}
                value={section.content}
                onChange={(e) => handleContentChange(section.id, e.target.value)}
                placeholder={`Write your content for ${section.label} here...`}
              />
            </CardContent>
            <CardFooter className="justify-end">
              <Button 
                onClick={() => handleSave(section.id, section.content)} 
                disabled={savingId === section.id}
                className="bg-brand-primary hover:bg-brand-accent"
              >
                {savingId === section.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Section
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
