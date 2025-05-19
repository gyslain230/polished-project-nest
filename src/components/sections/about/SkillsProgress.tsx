
import React from "react";

const SkillsProgress = () => {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-2">
          <span>React & Frontend</span>
          <span>90%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full">
          <div className="h-full bg-primary rounded-full" style={{ width: '90%' }}></div>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between mb-2">
          <span>Node.js & Backend</span>
          <span>85%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full">
          <div className="h-full bg-primary rounded-full" style={{ width: '85%' }}></div>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between mb-2">
          <span>UI/UX Design</span>
          <span>75%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full">
          <div className="h-full bg-primary rounded-full" style={{ width: '75%' }}></div>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between mb-2">
          <span>Database & DevOps</span>
          <span>80%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full">
          <div className="h-full bg-primary rounded-full" style={{ width: '80%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default SkillsProgress;
