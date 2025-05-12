import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import CommandsTable from "@/components/dashboard/CommandsTable";
import ConversationPreview from "@/components/dashboard/ConversationPreview";
import { BookOpen, Play } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex h-screen overflow-hidden bg-discord-bg text-white">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav title="Dashboard" showSaveButton={false} />
        
        <div className="flex-1 overflow-y-auto p-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-discord-blurple to-discord-blue rounded-lg p-6 mb-6 shadow-lg">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-2/3">
                <h2 className="text-2xl font-bold mb-2">Welcome to Ahmadiyya Bot Dashboard</h2>
                <p className="text-discord-lightgray mb-4">Configure your Discord bot to answer questions about Ahmadiyya beliefs, history, and teachings. The bot can respond to direct messages and commands in designated channels.</p>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="outline" 
                    className="bg-white hover:bg-gray-100 text-discord-darkbg"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>View Documentation</span>
                  </Button>
                  <Button 
                    variant="default" 
                    className="bg-discord-green hover:bg-discord-green/80 text-white"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    <span>Quick Start Guide</span>
                  </Button>
                </div>
              </div>
              <div className="md:w-1/3 flex justify-center mt-4 md:mt-0">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-discord-blurple" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                    <circle cx="12" cy="5" r="2"></circle>
                    <path d="M12 7v4"></path>
                    <line x1="8" y1="16" x2="8" y2="16"></line>
                    <line x1="16" y1="16" x2="16" y2="16"></line>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bot Commands Section */}
          <h3 className="text-lg font-semibold mb-4">Available Commands</h3>
          <CommandsTable />
          
          {/* Sample Conversation Section */}
          <h3 className="text-lg font-semibold mb-4 mt-6">Sample Conversation</h3>
          <ConversationPreview />
          
          {/* Support & Footer */}
          <Card className="mt-8 bg-discord-darkbg rounded-lg p-5 shadow">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
                <p className="text-discord-lightgray">Join our support server or check out our documentation for more information.</p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-3">
                <Button className="bg-discord-blurple hover:bg-discord-blurple/80 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8.2 12h-.28a1 1 0 0 1-.72-.28l-4-4a1 1 0 0 1 0-1.44l4-4a1 1 0 0 1 .72-.28h4.08a1 1 0 0 1 .72.28l4 4a1 1 0 0 1 0 1.44l-4 4a1 1 0 0 1-.72.28h-4.08a1 1 0 0 1-.72-.28l-4-4a1 1 0 0 1 0-1.44l4-4a1 1 0 0 1 .72-.28h4.08a1 1 0 0 1 .72.28l4 4a1 1 0 0 1 0 1.44l-4 4a1 1 0 0 1-.72.28h-.28"></path>
                    <circle cx="16" cy="12" r="2"></circle>
                    <circle cx="4" cy="12" r="2"></circle>
                    <circle cx="11" cy="4" r="2"></circle>
                    <circle cx="12" cy="20" r="2"></circle>
                  </svg>
                  <span>Join Support Server</span>
                </Button>
                <Button variant="outline" className="bg-discord-bg hover:bg-discord-darkest text-white">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>Documentation</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
