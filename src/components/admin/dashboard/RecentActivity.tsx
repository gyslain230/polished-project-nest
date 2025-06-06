
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Activity {
  action: string;
  date: string;
}

interface RecentActivityProps {
  activities: Activity[];
  loading: boolean;
}

const RecentActivity = ({ activities, loading }: RecentActivityProps) => {
  return (
    <Card className="lg:col-span-2 border border-border">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center pb-4 border-b border-border animate-pulse">
                <div className="w-3/4 h-4 bg-secondary rounded"></div>
                <div className="w-1/4 h-4 bg-secondary rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((item, i) => (
              <div key={i} className="flex justify-between items-center pb-4 border-b border-border">
                <span>{item.action}</span>
                <span className="text-sm text-muted-foreground">{item.date}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
