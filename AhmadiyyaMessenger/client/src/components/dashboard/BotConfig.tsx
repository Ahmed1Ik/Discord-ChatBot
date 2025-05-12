import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { BotConfig } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Range } from "@/components/ui/range";

export default function BotConfiguration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch bot configuration
  const { data: config, isLoading, error } = useQuery<BotConfig>({
    queryKey: ["/api/config"],
  });
  
  // Initialize state with default values
  const [botName, setBotName] = useState("");
  const [botDescription, setBotDescription] = useState("");
  const [status, setStatus] = useState("online");
  const [activityType, setActivityType] = useState("Playing");
  const [activityName, setActivityName] = useState("");
  const [commandPrefix, setCommandPrefix] = useState("!");
  const [useSlashCommands, setUseSlashCommands] = useState(true);
  const [autoReplyToMentions, setAutoReplyToMentions] = useState(true);
  const [responseMode, setResponseMode] = useState("precise");
  const [responseTimeout, setResponseTimeout] = useState(15);
  const [maxResponseLength, setMaxResponseLength] = useState("medium");
  const [includeCitations, setIncludeCitations] = useState(true);
  const [respondToDirectMessages, setRespondToDirectMessages] = useState(true);
  const [useEmbeds, setUseEmbeds] = useState(true);
  const [useAI, setUseAI] = useState(true);
  
  // Update state when config data is loaded
  useEffect(() => {
    if (config) {
      setBotName(config.name);
      setBotDescription(config.description);
      setStatus(config.status);
      setActivityType(config.activityType);
      setActivityName(config.activityName);
      setCommandPrefix(config.commandPrefix);
      setUseSlashCommands(config.useSlashCommands);
      setAutoReplyToMentions(config.respondToMentions);
      setResponseMode(config.responseMode);
      setResponseTimeout(config.responseTimeout);
      setMaxResponseLength(config.maxResponseLength);
      setIncludeCitations(config.includeCitations);
      setRespondToDirectMessages(config.respondToDirectMessages);
      setUseEmbeds(config.useEmbeds);
      setUseAI(config.useAI);
    }
  }, [config]);
  
  // Update config mutation
  const updateConfig = useMutation({
    mutationFn: async (data: Partial<BotConfig>) => {
      const res = await apiRequest("PATCH", "/api/config", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({
        title: "Configuration saved",
        description: "Bot configuration has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save",
        description: "There was an error updating the bot configuration.",
        variant: "destructive",
      });
    },
  });
  
  // Save all configuration changes
  const saveChanges = () => {
    updateConfig.mutate({
      name: botName,
      description: botDescription,
      status,
      activityType,
      activityName,
      commandPrefix,
      useSlashCommands,
      respondToMentions: autoReplyToMentions,
      responseMode,
      responseTimeout,
      maxResponseLength,
      includeCitations,
      respondToDirectMessages,
      useEmbeds,
      useAI,
    });
  };
  
  if (isLoading) {
    return <div className="p-6 text-center">Loading configuration...</div>;
  }
  
  if (error) {
    return <div className="p-6 text-center text-red-500">Error loading configuration</div>;
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bot Basic Settings */}
      <Card className="bg-discord-darkbg rounded-lg p-5 shadow">
        <h3 className="text-lg font-semibold mb-4">Bot Settings</h3>
        
        <div className="mb-4">
          <Label className="block text-discord-lightgray mb-2 text-sm">Bot Name</Label>
          <Input 
            type="text" 
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            className="w-full bg-discord-bg border border-black/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-discord-blurple"
          />
        </div>
        
        <div className="mb-4">
          <Label className="block text-discord-lightgray mb-2 text-sm">Bot Description</Label>
          <Textarea 
            value={botDescription}
            onChange={(e) => setBotDescription(e.target.value)}
            className="w-full bg-discord-bg border border-black/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-discord-blurple h-24 resize-none"
          />
        </div>
        
        <div className="mb-4">
          <Label className="block text-discord-lightgray mb-2 text-sm">Bot Avatar</Label>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-discord-darkest rounded-full overflow-hidden mr-3 flex items-center justify-center">
              <span className="text-discord-lightgray">
                {/* Use placeholder icon - in a real app this would be an image */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M7 21h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Z"></path><path d="M12 7V3"></path><path d="m14 5-4 4"></path></svg>
              </span>
            </div>
            <button className="bg-discord-bg hover:bg-discord-darkest text-white text-sm px-3 py-1.5 rounded">Change Avatar</button>
          </div>
        </div>
        
        <div className="mb-4">
          <Label className="block text-discord-lightgray mb-2 text-sm">Bot Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full bg-discord-bg border border-black/20 rounded px-3 py-2 text-white">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-discord-bg text-white">
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="idle">Idle</SelectItem>
              <SelectItem value="dnd">Do Not Disturb</SelectItem>
              <SelectItem value="invisible">Invisible</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="mb-4">
          <Label className="block text-discord-lightgray mb-2 text-sm">Bot Activity</Label>
          <div className="flex">
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger className="w-1/3 bg-discord-bg border border-black/20 rounded-l px-3 py-2 text-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-discord-bg text-white">
                <SelectItem value="Playing">Playing</SelectItem>
                <SelectItem value="Listening">Listening to</SelectItem>
                <SelectItem value="Watching">Watching</SelectItem>
                <SelectItem value="Competing">Competing in</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              type="text" 
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              className="flex-1 bg-discord-bg border border-black/20 border-l-0 rounded-r px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-discord-blurple"
            />
          </div>
        </div>
      </Card>

      {/* Response Configuration */}
      <Card className="bg-discord-darkbg rounded-lg p-5 shadow">
        <h3 className="text-lg font-semibold mb-4">Response Configuration</h3>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-discord-lightgray text-sm">Response Mode</Label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center bg-discord-bg p-3 rounded border border-transparent hover:border-discord-blurple cursor-pointer">
              <input 
                type="radio" 
                name="responseMode" 
                className="mr-2"
                checked={responseMode === "precise"}
                onChange={() => setResponseMode("precise")}
              />
              <div>
                <div className="text-sm font-medium">Precise</div>
                <div className="text-xs text-discord-lightgray">Direct answers with citations</div>
              </div>
            </label>
            <label className="flex items-center bg-discord-bg p-3 rounded border border-transparent hover:border-discord-blurple cursor-pointer">
              <input 
                type="radio" 
                name="responseMode" 
                className="mr-2"
                checked={responseMode === "conversational"}
                onChange={() => setResponseMode("conversational")}
              />
              <div>
                <div className="text-sm font-medium">Conversational</div>
                <div className="text-xs text-discord-lightgray">Friendly, detailed explanations</div>
              </div>
            </label>
          </div>
        </div>
        
        <div className="mb-4">
          <Label className="block text-discord-lightgray mb-2 text-sm">Response Timeout (seconds)</Label>
          <div className="flex items-center">
            <Range 
              min={5}
              max={60}
              step={1}
              value={[responseTimeout]}
              onValueChange={(value) => setResponseTimeout(value[0])}
              className="w-full mr-3"
            />
            <span className="text-white text-sm w-8">{responseTimeout}s</span>
          </div>
        </div>
        
        <div className="mb-4">
          <Label className="block text-discord-lightgray mb-2 text-sm">Max Response Length</Label>
          <Select value={maxResponseLength} onValueChange={setMaxResponseLength}>
            <SelectTrigger className="w-full bg-discord-bg border border-black/20 rounded px-3 py-2 text-white">
              <SelectValue placeholder="Select length" />
            </SelectTrigger>
            <SelectContent className="bg-discord-bg text-white">
              <SelectItem value="short">Short (250 characters)</SelectItem>
              <SelectItem value="medium">Medium (500 characters)</SelectItem>
              <SelectItem value="long">Long (1000 characters)</SelectItem>
              <SelectItem value="extended">Extended (2000 characters)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <Label className="text-discord-lightgray text-sm">Include Citations</Label>
            <Switch
              checked={includeCitations}
              onCheckedChange={setIncludeCitations}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <Label className="text-discord-lightgray text-sm">Respond to Direct Messages</Label>
            <Switch
              checked={respondToDirectMessages}
              onCheckedChange={setRespondToDirectMessages}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <Label className="text-discord-lightgray text-sm">Use Embeds for Responses</Label>
            <Switch
              checked={useEmbeds}
              onCheckedChange={setUseEmbeds}
            />
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-discord-lightgray text-sm">Use AI for Unknown Questions</Label>
              <p className="text-xs text-discord-lightgray/60 mt-1">When enabled, the bot will use AI to generate responses for questions not in the knowledge base</p>
            </div>
            <Switch
              checked={useAI}
              onCheckedChange={setUseAI}
            />
          </div>
        </div>
      </Card>

      {/* Command Prefix Settings */}
      <Card className="bg-discord-darkbg rounded-lg p-5 shadow">
        <h3 className="text-lg font-semibold mb-4">Command Settings</h3>
        
        <div className="mb-4">
          <Label className="block text-discord-lightgray mb-2 text-sm">Command Prefix</Label>
          <div className="flex">
            <Input 
              type="text" 
              value={commandPrefix}
              onChange={(e) => setCommandPrefix(e.target.value)}
              className="w-full bg-discord-bg border border-black/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-discord-blurple"
            />
          </div>
          <p className="text-xs text-discord-lightgray mt-1">Users will type this character before commands (e.g., !ask)</p>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <Label className="text-discord-lightgray text-sm">Use Slash Commands</Label>
            <Switch
              checked={useSlashCommands}
              onCheckedChange={setUseSlashCommands}
            />
          </div>
          <p className="text-xs text-discord-lightgray mt-1">Enable Discord's integrated slash commands (e.g., /ask)</p>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <Label className="text-discord-lightgray text-sm">Auto-Reply to Mentions</Label>
            <Switch
              checked={autoReplyToMentions}
              onCheckedChange={setAutoReplyToMentions}
            />
          </div>
          <p className="text-xs text-discord-lightgray mt-1">Bot will respond when mentioned (@AhmadiyyaBot)</p>
        </div>
      </Card>
    </div>
  );
}
