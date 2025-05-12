import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Search, Menu } from "lucide-react";

type TopNavProps = {
  title: string;
  onSave?: () => void;
  showSaveButton?: boolean;
};

export default function TopNav({ title, onSave, showSaveButton = true }: TopNavProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="bg-discord-bg border-b border-black/20 p-4 flex items-center justify-between">
      <div className="flex items-center">
        <Menu className="mr-4 text-discord-lightgray cursor-pointer lg:hidden" />
        <h2 className="font-bold text-lg">{title}</h2>
      </div>
      <div className="flex items-center space-x-3">
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="text"
            placeholder="Search..."
            className="bg-discord-darkest text-sm px-3 py-1 rounded-md w-40 md:w-60 text-discord-lightgray focus:outline-none focus:ring-1 focus:ring-discord-blurple"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-discord-lightgray h-4 w-4" />
        </form>
        {showSaveButton && (
          <Button 
            variant="default" 
            className="bg-discord-blurple hover:bg-discord-blurple/80 text-white"
            onClick={onSave}
          >
            <Save className="mr-2 h-4 w-4" />
            <span>Save Changes</span>
          </Button>
        )}
      </div>
    </div>
  );
}
