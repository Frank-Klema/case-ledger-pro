import { useState } from 'react';
import { MessageSquarePlus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useFeedback } from '@/hooks/useFeedback';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

/**
 * Floating feedback widget. Lets the signed-in user send feedback that
 * lands in the admin panel inbox. Shows an inline acknowledgement after
 * submission.
 */
export const FeedbackWidget = () => {
  const { user } = useAuth();
  const { submit } = useFeedback();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    submit({
      userId: user.id,
      userEmail: user.email,
      userDisplayName: user.displayName,
      message: message.trim(),
    });
    setSubmitted(true);
    setMessage('');
    setTimeout(() => { setSubmitted(false); setOpen(false); }, 2500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-80 rounded-xl border border-border bg-card shadow-xl p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-heading font-semibold">Send feedback</h4>
            <button
              type="button"
              onClick={() => { setOpen(false); setSubmitted(false); }}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {submitted ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <div className="rounded-full bg-success/15 p-3">
                <Check className="h-6 w-6 text-success" />
              </div>
              <p className="font-medium">Thanks! Feedback received.</p>
              <p className="text-xs text-muted-foreground">
                Your message has been sent to the admin team.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="fb-msg" className="text-xs">What's on your mind?</Label>
                <Textarea
                  id="fb-msg"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Bugs, ideas, anything…"
                  className="min-h-[100px] mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm"
                  onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={!message.trim()}>Send</Button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          className={cn('rounded-full shadow-lg h-12 px-4 gap-2')}
          variant="default"
        >
          <MessageSquarePlus className="h-4 w-4" />
          Feedback
        </Button>
      )}
    </div>
  );
};