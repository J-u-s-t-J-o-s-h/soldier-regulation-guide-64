
import { MessageSquare, Send } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const Chats = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How can I help you with Army regulations today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm processing your request about Army regulations. How else can I assist you?",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
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
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-military-gold/10 hover:bg-military-gold/20 transition-colors"
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
