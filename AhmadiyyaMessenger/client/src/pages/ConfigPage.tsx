import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import BotConfig from "@/components/dashboard/BotConfig";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ConfigPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  
  // Mutation for saving all configuration changes
  const saveChanges = useMutation({
    mutationFn: async () => {
      // This is a placeholder. In reality, we'd collect all changes from BotConfig component
      // and send them in a consolidated request
      const res = await apiRequest("PATCH", "/api/config", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({
        title: "Configuration saved",
        description: "All changes have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save changes",
        description: "There was an error saving your changes. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleSave = () => {
    saveChanges.mutate();
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-discord-bg text-white">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav title="Bot Configuration" onSave={handleSave} />
        
        <div className="flex-1 overflow-y-auto p-6">
          {/* Configuration Tabs */}
          <div className="mb-6">
            <div className="border-b border-discord-darkest">
              <Tabs 
                defaultValue="general" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="flex overflow-x-auto bg-transparent">
                  <TabsTrigger 
                    value="general"
                    className={`px-4 py-2 border-b-2 ${activeTab === 'general' ? 'border-discord-blurple text-white' : 'border-transparent text-discord-lightgray hover:text-white'}`}
                  >
                    General
                  </TabsTrigger>
                  <TabsTrigger 
                    value="commands"
                    className={`px-4 py-2 border-b-2 ${activeTab === 'commands' ? 'border-discord-blurple text-white' : 'border-transparent text-discord-lightgray hover:text-white'}`}
                  >
                    Commands
                  </TabsTrigger>
                  <TabsTrigger 
                    value="knowledge"
                    className={`px-4 py-2 border-b-2 ${activeTab === 'knowledge' ? 'border-discord-blurple text-white' : 'border-transparent text-discord-lightgray hover:text-white'}`}
                  >
                    Knowledge Base
                  </TabsTrigger>
                  <TabsTrigger 
                    value="responses"
                    className={`px-4 py-2 border-b-2 ${activeTab === 'responses' ? 'border-discord-blurple text-white' : 'border-transparent text-discord-lightgray hover:text-white'}`}
                  >
                    Responses
                  </TabsTrigger>
                  <TabsTrigger 
                    value="permissions"
                    className={`px-4 py-2 border-b-2 ${activeTab === 'permissions' ? 'border-discord-blurple text-white' : 'border-transparent text-discord-lightgray hover:text-white'}`}
                  >
                    Permissions
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="mt-6">
                  <BotConfig />
                </TabsContent>
                
                <TabsContent value="commands" className="mt-6">
                  <div className="p-8 text-center text-discord-lightgray">
                    <h3 className="text-xl mb-2">Commands Configuration</h3>
                    <p>This tab would contain commands configuration in a complete application.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="knowledge" className="mt-6">
                  <div className="p-8 text-center text-discord-lightgray">
                    <h3 className="text-xl mb-2">Knowledge Base Management</h3>
                    <p>This tab would contain knowledge base management in a complete application.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="responses" className="mt-6">
                  <div className="p-8 text-center text-discord-lightgray">
                    <h3 className="text-xl mb-2">Response Configuration</h3>
                    <p>This tab would contain response customization in a complete application.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="permissions" className="mt-6">
                  <div className="p-8 text-center text-discord-lightgray">
                    <h3 className="text-xl mb-2">Permission Settings</h3>
                    <p>This tab would contain permission settings in a complete application.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* General Settings Content - moved to BotConfig component */}
          {activeTab === "general" && (
            <>
              {/* BotConfig is rendered via TabsContent above */}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
