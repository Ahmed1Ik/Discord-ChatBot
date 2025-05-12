import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Command } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CommandsTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch commands
  const { data: commands, isLoading, error } = useQuery<Command[]>({
    queryKey: ["/api/commands"],
  });
  
  // Toggle command enabled state
  const toggleCommand = useMutation({
    mutationFn: async ({ id, enabled }: { id: number, enabled: boolean }) => {
      const res = await apiRequest("PATCH", `/api/commands/${id}`, { enabled });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/commands"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update command",
        description: "There was an error updating the command status.",
        variant: "destructive",
      });
    },
  });
  
  // Handle toggle change
  const handleToggle = (id: number, currentState: boolean) => {
    toggleCommand.mutate({ id, enabled: !currentState });
  };
  
  // Add new command (placeholder, would open a modal in a real app)
  const addCommand = () => {
    toast({
      title: "Add Command",
      description: "This would open a modal to add a new command in a real app.",
    });
  };
  
  if (isLoading) {
    return <div className="text-center p-4">Loading commands...</div>;
  }
  
  if (error) {
    return <div className="text-center p-4 text-red-500">Error loading commands</div>;
  }
  
  return (
    <div className="bg-discord-darkbg rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-black/20 text-left">
              <th className="px-4 py-3 text-sm font-medium text-discord-lightgray">Command</th>
              <th className="px-4 py-3 text-sm font-medium text-discord-lightgray">Description</th>
              <th className="px-4 py-3 text-sm font-medium text-discord-lightgray">Usage</th>
              <th className="px-4 py-3 text-sm font-medium text-discord-lightgray">Enabled</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-discord-darkest">
            {commands?.map((command) => (
              <tr key={command.id} className="hover:bg-black/10">
                <td className="px-4 py-3 text-sm font-medium">{command.name}</td>
                <td className="px-4 py-3 text-sm text-discord-lightgray">{command.description}</td>
                <td className="px-4 py-3 text-sm text-discord-lightgray">{command.usage}</td>
                <td className="px-4 py-3">
                  <Switch
                    checked={command.enabled}
                    onCheckedChange={() => handleToggle(command.id, command.enabled)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-discord-bg/30 px-4 py-3 flex justify-between items-center">
        <div className="text-sm text-discord-lightgray">
          Showing {commands?.length || 0} commands
        </div>
        <Button 
          onClick={addCommand}
          className="text-sm bg-discord-blurple hover:bg-discord-blurple/80 text-white px-3 py-1 rounded flex items-center"
        >
          <Plus className="mr-1 h-4 w-4" />
          <span>Add Command</span>
        </Button>
      </div>
    </div>
  );
}
