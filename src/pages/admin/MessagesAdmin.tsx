
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MessageSquare, Eye, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  date: string;
  read: boolean;
}

const MessagesAdmin = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem("portfolioMessages");
    return savedMessages ? JSON.parse(savedMessages) : [
      {
        id: 1,
        name: "John Smith",
        email: "john@example.com",
        message: "I'm interested in hiring you for a project. Please contact me when you have a chance.",
        date: "May 10, 2023",
        read: false
      },
      {
        id: 2,
        name: "Sarah Johnson",
        email: "sarah@example.com",
        message: "Your portfolio is impressive! I would love to discuss a potential collaboration.",
        date: "May 5, 2023",
        read: true
      },
      {
        id: 3,
        name: "Michael Lee",
        email: "michael@example.com",
        message: "Hello, I have a question about your UI/UX design services. What is your typical process?",
        date: "April 28, 2023",
        read: true
      },
    ];
  });

  const [viewMessageDialog, setViewMessageDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const handleView = (message: Message) => {
    setSelectedMessage(message);
    setViewMessageDialog(true);
    
    // Mark as read if not already
    if (!message.read) {
      const updatedMessages = messages.map(m => 
        m.id === message.id ? { ...m, read: true } : m
      );
      setMessages(updatedMessages);
      localStorage.setItem("portfolioMessages", JSON.stringify(updatedMessages));
    }
  };

  const handleDelete = (message: Message) => {
    setSelectedMessage(message);
    setDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedMessage) {
      const updatedMessages = messages.filter(m => m.id !== selectedMessage.id);
      setMessages(updatedMessages);
      localStorage.setItem("portfolioMessages", JSON.stringify(updatedMessages));
      
      toast({
        title: "Message deleted",
        description: "The message has been permanently deleted."
      });
    }
    setDeleteDialog(false);
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
        </div>
        
        <div className="bg-card rounded-lg border border-border shadow-sm">
          {messages.length === 0 ? (
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
