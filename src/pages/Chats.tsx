
import { MessageSquare, Send } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const Chats = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How can I help you with Army regulations today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-with-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: inputMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.generatedText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
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
                  Chat Assistant
                </h1>
              </div>
              <p className="text-military-muted">
                Ask questions about Army regulations and get instant answers.
              </p>
            </div>

            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full bg-white/5 backdrop-blur-sm rounded-lg border border-military-accent/20 overflow-hidden">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.isUser
                            ? "bg-military-gold/10 text-military-gold"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <span className="text-xs opacity-50 mt-1 block">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] p-3 rounded-lg bg-white/10 text-white">
                        <p className="text-sm">Thinking...</p>
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
                    placeholder="Type your message..."
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
