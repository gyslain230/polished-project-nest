
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { User, Calendar, MapPin } from "lucide-react";
import { Profile } from "@/hooks/useProfileData";

interface ProfileBioProps {
  profile: Profile | null;
  isLoading: boolean;
}

const ProfileBio = ({ profile, isLoading }: ProfileBioProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  return (
    <>
      <p className="text-lg mb-6">
        {profile?.bio || 
          "I am a passionate developer with over 5 years of experience building web applications. My journey began with HTML, CSS, and JavaScript, and has evolved to include modern frameworks like React, Node.js, and cloud technologies."}
      </p>
      <p className="text-lg mb-6">
        {"When I'm not coding, I enjoy contributing to open source projects, writing technical articles, and mentoring aspiring developers. I believe in continuous learning and staying updated with the latest industry trends."}
      </p>
      <div className="flex flex-col md:flex-row gap-6 mt-8">
        <Card className="flex-1 bg-background">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-primary/20 p-3 rounded-full">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Full Name</h3>
              <p className="text-muted-foreground">{profile?.name || "John Doe"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1 bg-background">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-primary/20 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Role</h3>
              <p className="text-muted-foreground">{profile?.professional_title || "Full Stack Developer"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      {profile?.location && (
        <Card className="bg-background mt-6">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-primary/20 p-3 rounded-full">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Location</h3>
              <p className="text-muted-foreground">{profile.location}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ProfileBio;
