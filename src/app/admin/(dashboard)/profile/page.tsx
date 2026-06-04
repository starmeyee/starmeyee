"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { firestoreService } from "@/lib/firebase/services/firestore";
import { storageService } from "@/lib/firebase/services/storage";
import { updateProfile } from "firebase/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserType } from "@/types";
import { Camera, Loader2, Save } from "lucide-react";

export default function ProfilePage() {
  const { profile, user } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    
    setIsUpdating(true);
    setMessage(null);

    try {
      // Update Firebase Auth
      await updateProfile(user, { displayName });
      
      // Update Firestore Document
      await firestoreService.updateDocument<UserType>('users', profile.uid, {
        displayName,
        updatedAt: new Date()
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !profile) return;

    setIsUploading(true);
    setMessage(null);

    try {
      const path = `avatars/${user.uid}/${file.name}`;
      const photoURL = await storageService.uploadFile(path, file);

      // Update Firebase Auth
      await updateProfile(user, { photoURL });
      
      // Update Firestore Document
      await firestoreService.updateDocument<UserType>('users', profile.uid, {
        photoURL,
        updatedAt: new Date()
      });

      // Force a reload or update local state context typically, 
      // but since we rely on the context to listen to onAuthStateChanged, 
      // we might just need to show success.
      setMessage({ type: 'success', text: 'Profile picture updated! Please refresh to see changes everywhere.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to upload image.' });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-oleo tracking-tight text-brand-primary">
          Profile Settings
        </h1>
        <p className="text-muted-foreground font-klee mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>View your basic account information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{profile.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <p className="text-sm capitalize text-brand-accent font-semibold">{profile.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleUpdateProfile}>
        <Card>
          <CardHeader>
            <CardTitle>Public Profile</CardTitle>
            <CardDescription>Update how you appear to others.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {message && (
              <div className={`p-3 rounded-md text-sm text-white ${message.type === 'success' ? 'bg-green-600' : 'bg-destructive'}`}>
                {message.text}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-border">
                  <AvatarImage src={profile.photoURL || user?.photoURL || ""} alt={profile.displayName || "Avatar"} />
                  <AvatarFallback className="text-2xl">
                    {profile.displayName?.substring(0, 2).toUpperCase() || "AD"}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                  onClick={triggerFileInput}
                >
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-sm">Profile Picture</h3>
                <p className="text-xs text-muted-foreground">
                  Click the avatar to upload a new picture. JPG, GIF or PNG. Max size 2MB.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input 
                id="displayName" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
                placeholder="Jane Doe"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isUpdating} className="bg-brand-primary hover:bg-brand-accent">
              {isUpdating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Save Changes</>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
