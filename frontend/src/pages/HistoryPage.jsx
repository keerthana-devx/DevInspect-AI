import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, History as HistoryIcon, LayoutGrid, List, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { getReviews, deleteReview, clearAllReviews } from '@/lib/historyStorage';
import { toast } from 'sonner';

const HistoryPage = () => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [viewType, setViewType] = useState('table'); // table or grid

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = getReviews();
        setReviews(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredReviews = reviews.filter(r => {
    const matchSearch = r.language.toLowerCase().includes(search.toLowerCase());
    const matchMode = filterMode === 'all' || r.mode === filterMode;
    return matchSearch && matchMode;
  });

  const handleDelete = (id) => {
    if (deleteReview(id)) {
      setReviews(getReviews());
      toast.success('Review deleted successfully');
    } else {
      toast.error('Failed to delete review');
    }
  };

  const handleClearAll = () => {
    if (clearAllReviews()) {
      setReviews([]);
      toast.success('All reviews cleared');
    } else {
      toast.error('Failed to clear reviews');
    }
  };

  const getSeverityBadge = (sev) => {
    const s = sev?.toLowerCase() || 'low';
    if (s === 'critical') return <Badge className="bg-destructive hover:bg-destructive text-white">Critical</Badge>;
    if (s === 'high') return <Badge className="bg-orange-500 hover:bg-orange-500 text-white">High</Badge>;
    if (s === 'medium') return <Badge className="bg-yellow-500 hover:bg-yellow-500 text-black">Medium</Badge>;
    return <Badge className="bg-green-500 hover:bg-green-500 text-white">Low</Badge>;
  };

  return (
    <>
      <Helmet><title>Review History | DevInspect AI</title></Helmet>
      <div className="w-full min-h-screen py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4"
          >
            <div>
              <h1 className="text-4xl font-extrabold mb-2 text-gradient">Review History</h1>
              <p className="text-muted-foreground">Access and reference your past analyses.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search language..." 
                  className="input-premium pl-9 h-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={filterMode} onValueChange={setFilterMode}>
                <SelectTrigger className="w-[140px] h-10 input-premium">
                  <SelectValue placeholder="Filter Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="interviewer">Interviewer</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                </SelectContent>
              </Select>
              <div className="hidden sm:flex bg-card/50 backdrop-blur-sm rounded-xl p-1 border border-border/30">
                <Button variant="ghost" size="icon" onClick={()=>setViewType('table')} className={`h-8 w-8 rounded-lg ${viewType==='table'?'bg-primary/20 text-primary':''}`}><List className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={()=>setViewType('grid')} className={`h-8 w-8 rounded-lg ${viewType==='grid'?'bg-primary/20 text-primary':''}`}><LayoutGrid className="w-4 h-4" /></Button>
              </div>
              {reviews.length > 0 && (
                <Button variant="outline" size="icon" onClick={handleClearAll} className="h-10 w-10 rounded-xl border-border/50 hover:bg-destructive/10 hover:text-destructive" title="Clear All">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl bg-muted/30" />)}
            </div>
          ) : filteredReviews.length === 0 ? (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="card-glow bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl border border-white/50 rounded-3xl p-16 flex flex-col items-center justify-center text-center">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mb-6 border border-white/30"
              >
                <HistoryIcon className="w-10 h-10 text-primary animate-pulse" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-gradient">No history found</h3>
              <p className="text-muted-foreground">You haven't run any code reviews that match this filter.</p>
            </motion.div>
          ) : viewType === 'table' ? (
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="card-glass p-0 overflow-hidden rounded-3xl">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="py-4 font-bold text-foreground/80">Date</TableHead>
                      <TableHead className="font-bold text-foreground/80">Language</TableHead>
                      <TableHead className="font-bold text-foreground/80">Mode</TableHead>
                      <TableHead className="font-bold text-foreground/80">AI Score</TableHead>
                      <TableHead className="font-bold text-foreground/80">Issues</TableHead>
                      <TableHead className="text-right font-bold text-foreground/80">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReviews.map((r, i) => (
                      <motion.tr 
                        key={r.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-muted/20 transition-colors border-b border-border/20"
                      >
                        <TableCell className="py-4 font-medium">{new Date(r.timestamp).toLocaleDateString()}</TableCell>
                        <TableCell className="capitalize">{r.language}</TableCell>
                        <TableCell><Badge variant="secondary" className="capitalize bg-secondary/20 text-secondary border border-secondary/30">{r.mode}</Badge></TableCell>
                        <TableCell className="font-bold text-gradient">{r.aiScore || 0}/100</TableCell>
                        <TableCell>{r.issues?.length || 0}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" className="font-semibold rounded-xl border-border/50 hover:bg-muted/50">View</Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredReviews.map((r, i) => (
                <motion.div 
                  key={r.id} 
                  initial={{opacity:0, scale:0.95}} 
                  animate={{opacity:1, scale:1}} 
                  transition={{delay: i*0.05}}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="card-glow bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl border border-white/50 rounded-2xl p-6 hover:border-primary/30 group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="secondary" className="capitalize bg-secondary/20 text-secondary border border-secondary/30">{r.mode}</Badge>
                    <span className="text-xs text-muted-foreground font-medium">{new Date(r.timestamp).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-bold capitalize mb-1 text-gradient">{r.language}</h3>
                  <div className="flex gap-4 my-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase mb-1">AI Score</p>
                      <p className="font-bold text-lg text-gradient">{r.aiScore || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Issues</p>
                      <p className="font-bold text-lg text-gradient">{r.issues?.length || 0}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="secondary" className="flex-1 btn-secondary rounded-xl font-semibold">View</Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HistoryPage;