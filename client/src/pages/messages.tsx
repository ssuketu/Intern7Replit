import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/userAuth";
import { apiRequest } from "@/lib/queryClient";
import { User, Message } from "@shared/schema";
import { Search, Send, User2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function Messages() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not logged in
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  // Fetch all users (in real app, we would fetch contacts or recent conversation partners)
  const { data: allUsers, isLoading: isUsersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!user,
  });

  // Fetch messages with the selected user
  const { 
    data: messages, 
    isLoading: isMessagesLoading, 
    refetch: refetchMessages 
  } = useQuery<Message[]>({
    queryKey: [user && selectedUserId ? `/api/messages/${user.id}/${selectedUserId}` : null],
    enabled: !!user && !!selectedUserId,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });

  // Filter users by search query
  const filteredUsers = allUsers?.filter(u => 
    u.id !== user?.id && 
    (searchQuery === "" || u.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Send a message
  const sendMessage = async () => {
    if (!messageText.trim() || !selectedUserId || !user) return;
    
    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/messages", {
        senderId: user.id,
        receiverId: selectedUserId,
        content: messageText.trim(),
      });
      
      setMessageText("");
      refetchMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        variant: "destructive",
        title: "Message not sent",
        description: "There was a problem sending your message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle key press to send message
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 bg-gray-50">
          <div className="h-[calc(100vh-8rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate mb-6">
              Messages
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
              {/* Users List */}
              <div className="md:col-span-1 h-full">
                <Card className="h-full flex flex-col">
                  <div className="p-4 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-1 p-4">
                    {isUsersLoading ? (
                      <div className="text-center text-gray-500 py-4">
                        Loading users...
                      </div>
                    ) : filteredUsers && filteredUsers.length > 0 ? (
                      <div className="space-y-4">
                        {filteredUsers.map((otherUser) => (
                          <div 
                            key={otherUser.id}
                            className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                              selectedUserId === otherUser.id ? "bg-gray-100" : ""
                            }`}
                            onClick={() => setSelectedUserId(otherUser.id)}
                          >
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 overflow-hidden">
                              <User2 className="h-5 w-5" />
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-gray-900">{otherUser.name}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {otherUser.role.charAt(0).toUpperCase() + otherUser.role.slice(1)}
                              </p>
                            </div>
                            <Badge variant="outline" className="ml-2 text-xs">
                              0
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        No users found.
                      </div>
                    )}
                  </ScrollArea>
                </Card>
              </div>
              
              {/* Messages Area */}
              <div className="md:col-span-2 h-full">
                <Card className="h-full flex flex-col">
                  {selectedUserId ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 border-b flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 overflow-hidden">
                          <User2 className="h-5 w-5" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {allUsers?.find(u => u.id === selectedUserId)?.name || "User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {allUsers?.find(u => u.id === selectedUserId)?.role.charAt(0).toUpperCase() + 
                             allUsers?.find(u => u.id === selectedUserId)?.role.slice(1) || "User"}
                          </p>
                        </div>
                      </div>
                      
                      {/* Messages */}
                      <ScrollArea className="flex-1 p-4">
                        {isMessagesLoading ? (
                          <div className="text-center text-gray-500 py-4">
                            Loading messages...
                          </div>
                        ) : messages && messages.length > 0 ? (
                          <div className="space-y-4">
                            {messages.map((message) => {
                              const isOwnMessage = message.senderId === user?.id;
                              
                              return (
                                <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                                  <div className={`max-w-[70%] ${isOwnMessage ? "bg-primary-100 text-primary-900" : "bg-gray-100 text-gray-900"} rounded-lg py-2 px-4`}>
                                    <p className="text-sm">{message.content}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                            <div ref={messagesEndRef} />
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 py-4">
                            No messages yet. Start a conversation!
                          </div>
                        )}
                      </ScrollArea>
                      
                      {/* Message Input */}
                      <div className="p-4 border-t">
                        <div className="flex items-center">
                          <Input
                            placeholder="Type a message..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={handleKeyPress}
                            disabled={isSubmitting}
                            className="flex-1"
                          />
                          <Button
                            onClick={sendMessage}
                            disabled={!messageText.trim() || isSubmitting}
                            className="ml-2"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-4">
                          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Your Messages</h3>
                        <p className="text-sm text-gray-500 max-w-md">
                          Select a user from the list to start a conversation or to continue an existing one.
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
