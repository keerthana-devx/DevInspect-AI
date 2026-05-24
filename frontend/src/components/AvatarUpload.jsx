import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Camera, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { AVATAR_URL } from '@/lib/apiConfig';

const UserAvatar = ({ user, size = 'md', className = '' }) => {
  const sizeMap = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-xl', xl: 'w-24 h-24 text-3xl' };
  const cls = sizeMap[size] || sizeMap.md;

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name || 'Avatar'}
        className={`${cls} rounded-full object-cover ring-2 ring-primary/30 ${className}`}
      />
    );
  }

  // Generated initials avatar
  const initials = (user?.name || 'U').charAt(0).toUpperCase();
  return (
    <div className={`${cls} rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ring-2 ring-primary/30 ${className}`}>
      <span className="font-bold text-primary">{initials}</span>
    </div>
  );
};

const AvatarUpload = ({ onSuccess }) => {
  const { currentUser, updateAvatarInContext } = useAuth();
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((accepted) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('devinspect-token');
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await fetch(AVATAR_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      updateAvatarInContext(data.avatar);
      setPreview(null);
      setFile(null);
      toast.success('Avatar updated!');
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      const token = localStorage.getItem('devinspect-token');
      const res = await fetch(AVATAR_URL, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to remove avatar');
      updateAvatarInContext('');
      toast.success('Avatar removed');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <UserAvatar user={preview ? { ...currentUser, avatar: preview } : currentUser} size="xl" />
        <div className="space-y-2">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition-colors text-sm ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-border/40 hover:border-primary/50 hover:bg-muted/30'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex items-center gap-2 text-muted-foreground">
              <Upload className="w-4 h-4" />
              <span>{isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}</span>
            </div>
            <p className="text-xs text-muted-foreground/60 mt-1">JPG, PNG, WEBP · Max 5MB</p>
          </div>
          <div className="flex gap-2">
            {preview && (
              <Button onClick={handleUpload} disabled={uploading} size="sm" className="btn-primary h-8 text-xs">
                <Camera className="w-3.5 h-3.5 mr-1" />
                {uploading ? 'Saving...' : 'Save Avatar'}
              </Button>
            )}
            {currentUser?.avatar && !preview && (
              <Button onClick={handleRemove} variant="outline" size="sm" className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
              </Button>
            )}
            {preview && (
              <Button onClick={() => { setPreview(null); setFile(null); }} variant="ghost" size="sm" className="h-8 text-xs">
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { UserAvatar };
export default AvatarUpload;
