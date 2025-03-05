
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface ProfileTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export const ProfileTasks = () => {
  const [tasks, setTasks] = useState<ProfileTask[]>([
    {
      id: "profile-pic",
      title: "Add a profile picture",
      description: "Help others recognize you",
      completed: false
    },
    {
      id: "skills",
      title: "Add your skills",
      description: "Highlight what you're good at",
      completed: false
    },
    {
      id: "interests",
      title: "Share your interests",
      description: "Connect with like-minded peers",
      completed: false
    }
  ]);

  const completeTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    ));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Complete Your Profile</h2>
      <div className="flex flex-col space-y-4">
        {tasks.map((task) => (
          <div 
            key={task.id}
            className={`rounded-md p-4 flex justify-between items-center ${
              task.completed ? "bg-green-50 border border-green-100" : "bg-gray-50 border border-gray-100"
            }`}
          >
            <div>
              <p className="font-medium flex items-center">
                {task.completed && <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />}
                {task.title}
              </p>
              <p className="text-sm text-gray-500">{task.description}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              disabled={task.completed}
              onClick={() => completeTask(task.id)}
            >
              {task.completed ? "Completed" : "Complete"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
