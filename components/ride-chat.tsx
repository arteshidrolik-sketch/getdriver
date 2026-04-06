"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, MessageSquare, Loader2, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

interface Message {
  id: string;
  senderId: string;
  senderType: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface RideChatProps {
  rideId: string;
  rideStatus: string;
  currentUserType: "CUSTOMER" | "DRIVER";
  otherPartyName: string;
  initialMessages?: Message[];
}

export function RideChat({ 
  rideId, 
  rideStatus, 
  currentUserType, 
  otherPartyName,
  initialMessages = []
}: RideChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const isRideActive = !["COMPLETED", "CANCELLED"].includes(rideStatus);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/rides/messages?rideId=${rideId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Mesajlar yüklenemedi", error);
    }
  }, [rideId]);

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 5 seconds if ride is active
    let interval: NodeJS.Timeout;
    if (isRideActive) {
      interval = setInterval(fetchMessages, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchMessages, isRideActive]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !isRideActive) return;

    setSending(true);
    try {
      const res = await fetch("/api/rides/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rideId, content: newMessage.trim() })
      });
      const data = await res.json();

      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        setNewMessage("");
      } else {
        toast({
          title: "Hata",
          description: data.error || "Mesaj gönderilemedi",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Mesaj gönderilemedi",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3 px-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">
              {otherPartyName} ile Mesajlaşma
            </CardTitle>
          </div>
          {!isRideActive && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              <Lock className="h-3 w-3" />
              <span>Salt okunur</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Security Notice */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-3 py-2">
          <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span>Tüm mesajlar kayıt altındadır ve olaşı uyuşmazlıklarda kanıt niteğindedir.</span>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-8">
              <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
              <p className="text-sm">Henüz mesaj yok</p>
              {isRideActive && (
                <p className="text-xs mt-1">Mesaj göndererek iletişime başlayın</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const isMine = msg.senderType === currentUserType;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        isMine
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${
                        isMine ? "text-green-100" : "text-muted-foreground"
                      }`}>
                        {new Date(msg.createdAt).toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-3 border-t bg-background">
          {isRideActive ? (
            <div className="flex gap-2">
              <Input
                placeholder="Mesajınızı yazın..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sending}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
                size="icon"
                className="bg-green-600 hover:bg-green-700"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-2">
              <Lock className="h-4 w-4 inline mr-1" />
              Yolculuk tamamlandığı için mesajlaşma kapatıldı
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
