
import { MessageSquare, Send } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Message {
  id: string;
  content: string;
  is_user: boolean;
  created_at: string;
}

const Chats = () => {
  const { toast } = useToast();
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Get current user
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  // Fetch chat history
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['chat-messages', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!userId
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading || !userId) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-with-ai', {
        body: {
          prompt: inputMessage,
          userId
        },
      });

      if (error) throw error;
      
      // Refetch messages to show new conversation
      refetchMessages();
      setInputMessage("");
    } catch (error) {
      console.error("Error calling AI:", error);
      toast({
        title: "Error",
        description: "Failed to get response from AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <div className="p-6 flex-1 flex flex-col">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-6 w-6 text-military-gold" />
                <h1 className="text-3xl font-bold text-military-gold">
                  Army Regulations Assistant
                </h1>
              </div>
              <p className="text-military-muted">
                Ask questions about Army regulations and get instant answers with citations.
              </p>
            </div>

            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full bg-white/5 backdrop-blur-sm rounded-lg border border-military-accent/20 overflow-hidden">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 && !isLoading && (
                    <div className="text-center text-military-muted p-4">
                      Start a conversation by asking a question about Army regulations.
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.is_user ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.is_user
                            ? "bg-military-gold/10 text-military-gold"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <span className="text-xs opacity-50 mt-1 block">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] p-3 rounded-lg bg-white/10 text-white">
                        <p className="text-sm">Searching regulations...</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-military-accent/20"
              >
                <div className="relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about Army regulations..."
                    className="w-full bg-white/5 backdrop-blur-sm rounded-lg py-3 pl-4 pr-12 text-military-text placeholder:text-military-muted focus:outline-none focus:ring-2 focus:ring-military-gold/50"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-military-gold/10 hover:bg-military-gold/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    <Send className="h-5 w-5 text-military-gold" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Chats;
