
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  link: string;
  loading: boolean;
}

const StatsCard = ({ title, value, icon, link, loading }: StatsCardProps) => {
  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">
            {loading ? (
              <span className="animate-pulse">...</span>
            ) : (
              <span>{value}</span>
            )}
          </div>
          <div className="bg-primary/10 p-2 rounded-full">
            {icon}
          </div>
        </div>
        <Link to={link}>
          <Button variant="link" className="mt-2 p-0 h-auto">
            View details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
