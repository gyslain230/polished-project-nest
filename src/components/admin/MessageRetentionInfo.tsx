
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MessageRetentionInfo = () => {
  return (
    <Alert className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Automatic Message Cleanup</AlertTitle>
      <AlertDescription>
        Messages older than 5 days are automatically deleted from the database every day at midnight.
      </AlertDescription>
    </Alert>
  );
};

export default MessageRetentionInfo;
