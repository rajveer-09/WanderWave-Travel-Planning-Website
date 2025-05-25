// "use client"

// import type React from "react"

// import { useEffect, useState, useRef } from "react"
// import { useSession } from "next-auth/react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { useToast } from "@/hooks/use-toast"
// import { formatDate } from "@/lib/utils"
// import { Send, MessageSquare } from "lucide-react"
// import { io, type Socket } from "socket.io-client"

// interface Message {
//   _id: string
//   content: string
//   sender: {
//     _id: string
//     name: string
//     email: string
//     profileImage?: string
//   }
//   createdAt: string
//   readBy: string[]
// }

// interface TripChatProps {
//   tripId: string
// }

// export default function TripChat({ tripId }: TripChatProps) {
//   const { data: session } = useSession()
//   const { toast } = useToast()
//   const [messages, setMessages] = useState<Message[]>([])
//   const [newMessage, setNewMessage] = useState("")
//   const [loading, setLoading] = useState(true)
//   const [socket, setSocket] = useState<Socket | null>(null)
//   const messagesEndRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     fetchMessages()

//     // Initialize socket connection
//     initSocket()

//     return () => {
//       if (socket) {
//         socket.disconnect()
//       }
//     }
//   }, [tripId])

//   useEffect(() => {
//     scrollToBottom()
//   }, [messages])

//   const initSocket = async () => {
//     try {
//       // Initialize socket connection
//       await fetch("/api/socket")

//       const socketInstance = io({
//         path: "/api/socket",
//         auth: {
//           token: localStorage.getItem("next-auth.session-token") || "",
//         },
//       })

//       socketInstance.on("connect", () => {
//         console.log("Socket connected")
//         socketInstance.emit("join-trip", tripId)
//       })

//       socketInstance.on("new-message", (message) => {
//         if (message.tripId === tripId) {
//           setMessages((prev) => [...prev, message])
//         }
//       })

//       socketInstance.on("disconnect", () => {
//         console.log("Socket disconnected")
//       })

//       setSocket(socketInstance)
//     } catch (error) {
//       console.error("Socket initialization error:", error)
//     }
//   }

//   const fetchMessages = async () => {
//     try {
//       const response = await fetch(`/api/trips/${tripId}/messages`)
//       const data = await response.json()

//       if (response.ok) {
//         setMessages(data.messages)
//       }
//     } catch (error) {
//       console.error("Error fetching messages:", error)
//       toast({
//         title: "Error",
//         description: "Failed to load messages",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const sendMessage = async (e: React.FormEvent) => {
//     e.preventDefault()

//     if (!newMessage.trim()) return

//     try {
//       const response = await fetch(`/api/trips/${tripId}/messages`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ content: newMessage }),
//       })

//       const data = await response.json()

//       if (!response.ok) {
//         throw new Error(data.error || "Failed to send message")
//       }

//       // If using socket, the message will be added via the socket event
//       // Otherwise, add it manually
//       if (!socket || !socket.connected) {
//         setMessages((prev) => [...prev, data.data])
//       }

//       setNewMessage("")
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       })
//     }
//   }

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
//   }

//   const formatMessageDate = (date: string) => {
//     const messageDate = new Date(date)
//     const today = new Date()

//     if (messageDate.toDateString() === today.toDateString()) {
//       return messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
//     }

//     return formatDate(date)
//   }

//   return (
//     <Card className="flex flex-col h-[600px]">
//       <CardHeader className="pb-2">
//         <CardTitle>Trip Chat</CardTitle>
//       </CardHeader>
//       <CardContent className="flex flex-col flex-1 p-0">
//         <div className="flex-1 p-4 overflow-y-auto">
//           {loading ? (
//             <div className="flex items-center justify-center h-full">
//               <p>Loading messages...</p>
//             </div>
//           ) : messages.length === 0 ? (
//             <div className="flex flex-col items-center justify-center h-full text-center">
//               <MessageSquare className="w-12 h-12 mb-4 text-gray-400" />
//               <h3 className="mb-2 text-xl font-semibold">No messages yet</h3>
//               <p className="text-gray-600">Start the conversation with your trip members.</p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {messages.map((message) => {
//                 const isCurrentUser = message.sender._id === session?.user.id

//                 return (
//                   <div key={message._id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
//                     <div className={`flex max-w-[70%] ${isCurrentUser ? "flex-row-reverse" : ""}`}>
//                       {!isCurrentUser && (
//                         <Avatar className="w-8 h-8 mr-2">
//                           <AvatarImage src={message.sender.profileImage} alt={message.sender.name} />
//                           <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
//                         </Avatar>
//                       )}
//                       <div>
//                         <div
//                           className={`px-4 py-2 rounded-lg ${
//                             isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
//                           }`}
//                         >
//                           <p>{message.content}</p>
//                         </div>
//                         <div className={`flex mt-1 text-xs text-gray-500 ${isCurrentUser ? "justify-end" : ""}`}>
//                           <span>{message.sender.name}</span>
//                           <span className="mx-1">•</span>
//                           <span>{formatMessageDate(message.createdAt)}</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )
//               })}
//               <div ref={messagesEndRef} />
//             </div>
//           )}
//         </div>
//         <div className="p-4 border-t">
//           <form onSubmit={sendMessage} className="flex space-x-2">
//             <Input
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               placeholder="Type your message..."
//               className="flex-1"
//             />
//             <Button type="submit" size="icon">
//               <Send className="w-4 h-4" />
//             </Button>
//           </form>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }
"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRelativeTime } from "@/lib/utils";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  trip: string;
  createdAt: string;
}

export default function TripChat({ tripId }: { tripId: string }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageTimeRef = useRef<string | null>(null);

  // Fetch initial messages and set up polling
  useEffect(() => {
    fetchMessages();

    // Set up polling for new messages every 3 seconds
    pollingIntervalRef.current = setInterval(() => {
      checkForNewMessages();
    }, 3000);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [tripId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/trips/${tripId}/messages`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data.messages);

      // Store timestamp of the latest message for polling
      if (data.messages.length > 0) {
        lastMessageTimeRef.current = data.messages[data.messages.length - 1].createdAt;
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewMessages = async () => {
    if (loading || sending) return;

    try {
      const response = await fetch(`/api/trips/${tripId}/messages`);

      if (!response.ok) return;

      const data = await response.json();

      // If we have new messages (comparing by timestamp or array length)
      if (data.messages.length > messages.length) {
        // Get only the new messages
        const newMessages = data.messages.filter((msg: Message) => {
          // If we don't have a lastMessageTime, all messages are new
          if (!lastMessageTimeRef.current) return true;

          // Check if this message is newer than our latest
          return new Date(msg.createdAt) > new Date(lastMessageTimeRef.current);
        });

        if (newMessages.length > 0) {
          // Update the messages list with new messages
          setMessages(prev => [...prev, ...newMessages]);

          // Update the latest message timestamp
          lastMessageTimeRef.current = data.messages[data.messages.length - 1].createdAt;
        }
      }
    } catch (error) {
      console.error("Error checking for new messages:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      setSending(true);

      const response = await fetch(`/api/trips/${tripId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Add the new message to our list
      if (data.data) {
        setMessages(prev => [...prev, data.data]);
        lastMessageTimeRef.current = data.data.createdAt;
      }

      setNewMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const isSentByMe = (message: Message) => {
    return message.sender?._id === session?.user.id;
  };

  return (
    <div className="flex flex-col h-[70vh] bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 backdrop-blur-lg bg-opacity-80 dark:bg-opacity-80">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Trip Chat</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {messages.length} messages
        </p>
      </div>

      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        {loading ? (
          <div className="flex flex-col space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-2 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => {
                const sentByMe = isSentByMe(message);
                return (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${sentByMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex items-start max-w-[80%] ${sentByMe ? "flex-row-reverse" : ""}`}>
                      {!sentByMe && (
                        <Avatar className="w-8 h-8 mr-2">
                          <AvatarImage src={message.sender.profileImage} alt={message.sender.name} />
                          <AvatarFallback className="bg-blue-500 text-white text-xs">
                            {message.sender.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        {!sentByMe && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {message.sender.name}
                          </p>
                        )}
                        <div className={`flex flex-col`}>
                          <div
                            className={`p-3 rounded-2xl ${sentByMe
                                ? "bg-blue-500 text-white rounded-tr-none"
                                : "bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-tl-none"
                              }`}
                          >
                            <p className="break-words">{message.content}</p>
                          </div>
                          <span className={`text-xs mt-1 text-gray-500 dark:text-gray-400 ${sentByMe ? "text-right" : ""}`}>
                            {formatRelativeTime(new Date(message.createdAt))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950"
      >
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={sending}
              className="pr-10 py-6 rounded-full bg-gray-100 dark:bg-gray-900 border-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="rounded-full w-12 h-12 p-0 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
