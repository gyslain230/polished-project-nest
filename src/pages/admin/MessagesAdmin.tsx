
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MessageSquare, Eye, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  date: string;
  read: boolean;
  created_at: string;
}

const MessagesAdmin = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMessageDialog, setViewMessageDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      console.log("Fetching messages...");
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Messages data from Supabase:", data);
      
      if (data) {
        // Ensure each message has a date field, fallback to created_at if not present
        const messagesWithDate = data.map(msg => ({
          ...msg,
          date: msg.date || new Date(msg.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        }));
        
        console.log("Processed messages:", messagesWithDate);
        setMessages(messagesWithDate);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleView = async (message: Message) => {
    setSelectedMessage(message);
    setViewMessageDialog(true);
    
    // Mark as read if not already
    if (!message.read) {
      try {
        const { error } = await supabase
          .from('messages')
          .update({ read: true })
          .eq('id', message.id);
        
        if (error) {
          throw error;
        }
        
        // Update local state
        setMessages(prev => 
          prev.map(m => m.id === message.id ? { ...m, read: true } : m)
        );
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const handleDelete = (message: Message) => {
    setSelectedMessage(message);
    setDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedMessage) {
      try {
        const { error } = await supabase
          .from('messages')
          .delete()
          .eq('id', selectedMessage.id);
        
        if (error) {
          throw error;
        }
        
        // Update local state
        setMessages(prev => prev.filter(m => m.id !== selectedMessage.id));
        
        toast({
          title: "Message deleted",
          description: "The message has been permanently deleted."
        });
      } catch (error) {
        console.error('Error deleting message:', error);
        toast({
          title: "Error",
          description: "Failed to delete message. Please try again.",
          variant: "destructive",
        });
      }
    }
    setDeleteDialog(false);
    setSelectedMessage(null);
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Messages</h1>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} unread</Badge>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={fetchMessages}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
        
        <div className="bg-card rounded-lg border border-border shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No messages</h3>
              <p className="text-muted-foreground">
                You don't have any messages yet. When someone contacts you through your portfolio, their messages will appear here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => (
                  <TableRow key={message.id} className={!message.read ? "bg-primary/5" : ""}>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {!message.read && (
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{message.name}</div>
                    </TableCell>
                    <TableCell>{message.email}</TableCell>
                    <TableCell>{message.subject || "No subject"}</TableCell>
                    <TableCell>{message.date}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleView(message)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(message)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* View Message Dialog */}
        <Dialog open={viewMessageDialog} onOpenChange={setViewMessageDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Message from {selectedMessage?.name}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {selectedMessage?.email} • {selectedMessage?.date}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2">
              {selectedMessage?.subject && (
                <p className="font-medium mb-2">Subject: {selectedMessage.subject}</p>
              )}
              <p className="text-sm whitespace-pre-wrap">{selectedMessage?.message}</p>
            </div>
            <DialogFooter>
              <Button onClick={() => setViewMessageDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Message</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this message? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default MessagesAdmin;
