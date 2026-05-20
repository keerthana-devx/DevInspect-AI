import React from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const ReviewDetailModal = ({ review, isOpen, onClose }) => {
  if (!review) return null;

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-secondary text-secondary-foreground';
      case 'medium':
        return 'bg-primary text-primary-foreground';
      case 'low':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Code Review Details</span>
            <Badge className={getSeverityColor(review.severity)}>
              {review.severity || 'N/A'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Language</p>
                <p className="font-medium">{review.language}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mode</p>
                <p className="font-medium capitalize">{review.mode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issues Found</p>
                <p className="font-medium">{review.issuesCount || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quality Score</p>
                <p className="font-medium">{review.qualityScore || 'N/A'}/100</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Code</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{review.code}</code>
              </pre>
            </div>

            {review.results && (
              <div>
                <h3 className="font-semibold mb-2">Analysis Results</h3>
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  {Array.isArray(review.results) ? (
                    review.results.map((result, index) => (
                      <div key={index} className="border-b border-border last:border-0 pb-3 last:pb-0">
                        <p className="font-medium">{result.title || `Issue ${index + 1}`}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {result.description || result.message || 'No description available'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm">{JSON.stringify(review.results, null, 2)}</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-muted-foreground">
                Created: {new Date(review.created).toLocaleString()}
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDetailModal;