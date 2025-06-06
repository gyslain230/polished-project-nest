
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const QuickActions = () => {
  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full justify-start" asChild>
          <Link to="/admin/projects/new">Add New Project</Link>
        </Button>
        <Button className="w-full justify-start" variant="outline" asChild>
          <Link to="/admin/certificates/new">Add New Certificate</Link>
        </Button>
        <Button className="w-full justify-start" variant="secondary" asChild>
          <Link to="/">View Website</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
