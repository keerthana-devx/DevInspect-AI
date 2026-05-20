import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { User, Calendar, Trash2, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';

const ProfilePage = () => {
  const { currentUser, logout } = useAuth();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await pb.collection('users').delete(currentUser.id, { $autoCancel: false });
      toast.success('Account deleted.');
      logout();
    } catch (err) {
      toast.error('Failed to delete account.');
      setDeleting(false);
      setDeleteDialog(false);
    }
  };

  return (
    <>
      <Helmet><title>My Profile | DevInspect AI</title></Helmet>
      <div className="w-full min-h-screen py-12 px-4 flex justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="card-glow bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl border border-white/50 rounded-3xl relative overflow-hidden p-0">
            {/* Header Cover */}
            <div className="h-40 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute inset-0 animate-blob opacity-30" />
            </div>
            
            <div className="px-8 pb-8">
              {/* Avatar */}
              <div className="relative -mt-20 mb-6 flex justify-between items-end">
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-36 h-36 rounded-3xl bg-card border-4 border-white/50 shadow-2xl overflow-hidden flex items-center justify-center"
                >
                  {currentUser?.avatar ? (
                    <img src={pb.files.getUrl(currentUser, currentUser.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/20">
                      <span className="text-5xl font-extrabold text-gradient">{currentUser?.name?.charAt(0) || 'U'}</span>
                    </div>
                  )}
                </motion.div>
                <Button variant="outline" className="font-bold border-border/50 bg-background/50 backdrop-blur-sm hover:bg-muted/50 rounded-xl">
                  Edit Profile
                </Button>
              </div>

              {/* Info */}
              <div className="mb-8">
                <h1 className="text-4xl font-extrabold mb-2 text-gradient">{currentUser?.name}</h1>
                <div className="flex items-center gap-6 text-muted-foreground text-sm font-medium">
                  <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> {currentUser?.email}</span>
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-secondary" /> Joined {new Date(currentUser?.created).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Stats Fake Placeholder */}
              <div className="grid grid-cols-3 gap-4 mb-10">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="card-glass bg-gradient-to-br from-baby-pink/20 to-blush-pink/10 p-6 rounded-2xl border border-baby-pink/20 text-center"
                >
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Reviews</p>
                  <p className="text-3xl font-extrabold text-gradient">12</p>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="card-glass bg-gradient-to-br from-lavender/20 to-pastel-purple/10 p-6 rounded-2xl border border-lavender/20 text-center"
                >
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Avg Score</p>
                  <p className="text-3xl font-extrabold text-gradient">88</p>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="card-glass bg-gradient-to-br from-pastel-blue/20 to-soft-lilac/10 p-6 rounded-2xl border border-pastel-blue/20 text-center"
                >
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Top Lang</p>
                  <p className="text-3xl font-extrabold text-gradient">JS</p>
                </motion.div>
              </div>

              {/* Danger Zone */}
              <div className="pt-6 border-t border-destructive/30">
                <h3 className="text-lg font-bold text-destructive mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <Button variant="destructive" onClick={() => setDeleteDialog(true)} className="font-bold rounded-xl">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
          <AlertDialogContent className="border-destructive/30 rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive">Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting} className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
                {deleting ? 'Deleting...' : 'Yes, delete account'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default ProfilePage;