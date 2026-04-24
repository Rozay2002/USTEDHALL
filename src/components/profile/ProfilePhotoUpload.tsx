import { useRef, useState } from "react";
import { Camera, Loader2, Upload, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/hooks/use-toast";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED = ["image/jpeg", "image/jpg", "image/png"];

interface Props {
  size?: "sm" | "md" | "lg";
}

export function ProfilePhotoUpload({ size = "lg" }: Props) {
  const { user, profile, refreshProfile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const sizeClass = size === "sm" ? "h-10 w-10" : size === "md" ? "h-16 w-16" : "h-24 w-24";
  const initials = (profile?.full_name || "U").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED.includes(f.type)) {
      toast({ title: "Invalid file", description: "Only JPG/PNG files allowed", variant: "destructive" });
      return;
    }
    if (f.size > MAX_BYTES) {
      toast({ title: "File too large", description: "File size must be less than 2MB", variant: "destructive" });
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setOpen(true);
  };

  const reset = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const upload = async () => {
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = pub.publicUrl;

      // Remove previous file if it was in our folder
      if (profile?.avatar_url) {
        try {
          const marker = "/avatars/";
          const idx = profile.avatar_url.indexOf(marker);
          if (idx !== -1) {
            const oldPath = profile.avatar_url.slice(idx + marker.length).split("?")[0];
            if (oldPath && oldPath !== path && oldPath.startsWith(`${user.id}/`)) {
              await supabase.storage.from("avatars").remove([oldPath]);
            }
          }
        } catch { /* ignore cleanup errors */ }
      }

      const { error: updErr } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);
      if (updErr) throw updErr;

      await refreshProfile();
      toast({ title: "Profile photo updated successfully" });
      setOpen(false);
      reset();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative group">
        <Avatar className={`${sizeClass} ring-2 ring-primary/20`}>
          {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.full_name} />}
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md hover:scale-110 transition-transform"
          aria-label="Change profile photo"
        >
          <Camera className="h-3.5 w-3.5" />
        </button>
      </div>
      <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
        {profile?.avatar_url ? "Change Photo" : "Upload Photo"}
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        className="hidden"
        onChange={onPick}
      />

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Preview your photo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="h-40 w-40 rounded-full object-cover ring-4 ring-primary/20"
              />
            )}
            <p className="text-xs text-muted-foreground">JPG or PNG • Max 2MB</p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { setOpen(false); reset(); }} disabled={uploading}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button onClick={upload} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
              {uploading ? "Uploading..." : "Upload Photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}