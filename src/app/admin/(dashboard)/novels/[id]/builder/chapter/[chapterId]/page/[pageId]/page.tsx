"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { novelBuilderService } from "@/lib/firebase/services/novelBuilderService";
import { storageService } from "@/lib/firebase/services/storage";
import { ContentBlock, BlockType, NovelPage } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Type, Quote, Minus, MessageSquare, Save, GripVertical } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PageEditorPage({ 
  params 
}: { 
  params: Promise<{ id: string, chapterId: string, pageId: string }> 
}) {
  const router = useRouter();
  const { id: novelId, chapterId, pageId } = use(params);

  const [page, setPage] = useState<NovelPage | null>(null);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const pages = await novelBuilderService.getPagesForChapter(chapterId);
        const p = pages.find(p => p.id === pageId);
        if (p) {
          setPage(p);
          setBlocks(p.blocks || []);
        } else {
          toast.error("Page not found");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load page");
      } finally {
        setIsLoading(false);
      }
    };
    if (pageId) fetchPage();
  }, [chapterId, pageId]);

  const addBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: crypto.randomUUID(),
      type,
      content: {},
      order: blocks.length
    };
    
    // Initialize default content based on type
    if (type === 'text') newBlock.content = { text: '' };
    if (type === 'image') newBlock.content = { url: '', caption: '' };
    if (type === 'quote') newBlock.content = { text: '', author: '' };
    if (type === 'callout') newBlock.content = { text: '', icon: '💡' };
    
    setBlocks([...blocks, newBlock]);
  };

  const updateBlockContent = (id: string, newContent: Record<string, any>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content: { ...b.content, ...newContent } } : b));
  };

  const deleteBlock = (id: string) => {
    if (!confirm("Remove this block?")) return;
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Re-assign order before saving
      const orderedBlocks = blocks.map((b, i) => ({ ...b, order: i }));
      await novelBuilderService.updatePage(pageId, { blocks: orderedBlocks });
      setBlocks(orderedBlocks);
      toast.success("Page saved successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save page");
    } finally {
      setIsSaving(false);
    }
  };

  const uploadImage = async (file: File, blockId: string) => {
    try {
      const url = await storageService.uploadFile(`novels/${novelId}/pages/${pageId}/${file.name}-${Date.now()}`, file);
      updateBlockContent(blockId, { url });
      toast.success("Image uploaded");
    } catch (err) {
      toast.error("Failed to upload image");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-24">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 border-b">
        <div className="flex items-center gap-4">
          <Link href={`/admin/novels/${novelId}/builder`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{page?.title || 'Edit Page'}</h1>
            <p className="text-sm text-muted-foreground">Manage blocks for this page</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <div className="space-y-4">
        {blocks.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-xl bg-card/50 text-muted-foreground">
            <p className="mb-4">This page is empty.</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add First Block
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => addBlock('text')}><Type className="mr-2 h-4 w-4"/> Text</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addBlock('image')}><ImageIcon className="mr-2 h-4 w-4"/> Image</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addBlock('quote')}><Quote className="mr-2 h-4 w-4"/> Quote</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addBlock('divider')}><Minus className="mr-2 h-4 w-4"/> Divider</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addBlock('callout')}><MessageSquare className="mr-2 h-4 w-4"/> Callout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          blocks.map((block, index) => (
            <Card key={block.id} className="relative group border-muted hover:border-primary/50 transition-colors">
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full shadow-sm" onClick={() => moveBlock(index, 'up')} disabled={index === 0}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full shadow-sm" onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteBlock(block.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <CardHeader className="py-2 px-4 border-b bg-muted/20 flex flex-row items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {block.type}
                </span>
              </CardHeader>
              
              <CardContent className="p-4">
                {block.type === 'text' && (
                  <Textarea 
                    value={block.content.text || ''} 
                    onChange={(e) => updateBlockContent(block.id, { text: e.target.value })}
                    placeholder="Write your text here..."
                    className="min-h-[150px] border-0 focus-visible:ring-0 p-0 resize-y shadow-none bg-transparent"
                  />
                )}

                {block.type === 'image' && (
                  <div className="space-y-4">
                    {block.content.url ? (
                      <div className="relative rounded-lg overflow-hidden border bg-muted">
                        <img src={block.content.url} alt="Block image" className="max-h-[300px] w-auto mx-auto object-contain" />
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="absolute top-2 right-2"
                          onClick={() => updateBlockContent(block.id, { url: '' })}
                        >
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/10">
                        <Label htmlFor={`file-${block.id}`} className="cursor-pointer flex flex-col items-center gap-2">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm font-medium">Click to upload image</span>
                          <span className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</span>
                        </Label>
                        <Input 
                          id={`file-${block.id}`} 
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              uploadImage(e.target.files[0], block.id);
                            }
                          }}
                        />
                      </div>
                    )}
                    <Input 
                      placeholder="Image caption (optional)" 
                      value={block.content.caption || ''}
                      onChange={(e) => updateBlockContent(block.id, { caption: e.target.value })}
                    />
                  </div>
                )}

                {block.type === 'quote' && (
                  <div className="space-y-4 border-l-4 border-primary pl-4 py-2">
                    <Textarea 
                      value={block.content.text || ''} 
                      onChange={(e) => updateBlockContent(block.id, { text: e.target.value })}
                      placeholder="Quote text..."
                      className="border-0 focus-visible:ring-0 p-0 resize-none shadow-none text-lg italic bg-transparent"
                    />
                    <Input 
                      value={block.content.author || ''} 
                      onChange={(e) => updateBlockContent(block.id, { author: e.target.value })}
                      placeholder="— Author name"
                      className="border-0 focus-visible:ring-0 p-0 shadow-none text-sm text-muted-foreground bg-transparent w-full"
                    />
                  </div>
                )}

                {block.type === 'divider' && (
                  <div className="py-8 flex items-center justify-center">
                    <div className="w-1/2 h-px bg-border flex items-center justify-center">
                      <div className="bg-background px-4 text-muted-foreground"><Minus className="h-4 w-4" /></div>
                    </div>
                  </div>
                )}

                {block.type === 'callout' && (
                  <div className="flex gap-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <Input 
                      value={block.content.icon || '💡'} 
                      onChange={(e) => updateBlockContent(block.id, { icon: e.target.value })}
                      className="w-12 h-12 text-center text-xl p-0 shrink-0 border-0 bg-transparent shadow-none focus-visible:ring-0"
                    />
                    <Textarea 
                      value={block.content.text || ''} 
                      onChange={(e) => updateBlockContent(block.id, { text: e.target.value })}
                      placeholder="Callout text..."
                      className="border-0 focus-visible:ring-0 p-0 resize-none shadow-none bg-transparent min-h-[60px]"
                    />
                  </div>
                )}
                
                {block.type === 'sticker' && (
                  <div className="text-center p-4 text-muted-foreground">
                    Sticker block support coming soon.
                  </div>
                )}
                
                {block.type === 'custom' && (
                  <div className="text-center p-4 text-muted-foreground">
                    Custom block support coming soon.
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {blocks.length > 0 && (
        <div className="flex justify-center mt-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-full shadow-sm">
                <Plus className="mr-2 h-4 w-4" /> Add Block
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => addBlock('text')}><Type className="mr-2 h-4 w-4"/> Text</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addBlock('image')}><ImageIcon className="mr-2 h-4 w-4"/> Image</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addBlock('quote')}><Quote className="mr-2 h-4 w-4"/> Quote</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addBlock('divider')}><Minus className="mr-2 h-4 w-4"/> Divider</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addBlock('callout')}><MessageSquare className="mr-2 h-4 w-4"/> Callout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
