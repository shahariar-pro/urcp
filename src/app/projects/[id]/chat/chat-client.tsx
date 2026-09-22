"use client";

import { useState, useEffect, useRef } from "react";
import { Message, Profile } from "@/types/database.types";
import { sendMessageAction } from "@/app/actions/communication";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Shield, Lock, MessageSquare } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface Props {
  projectId: string;
  initialMessages: Message[];
  currentUser: Profile;
}

export function ChatClient({ projectId, initialMessages, currentUser }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputBody, setInputBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set up Supabase realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`project-chat-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `project_id=eq.${projectId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          // If we already have it from optimistic update, skip
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = inputBody.trim();
    if (!body || isSending) return;

    setInputBody("");
    setIsSending(true);

    const optimisticMsg: Message = {
      id: `opt-${Date.now()}`,
      project_id: projectId,
      sender_id: currentUser.id,
      body,
      created_at: new Date().toISOString(),
      sender: currentUser,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await sendMessageAction(projectId, body);
    } catch (err: any) {
      console.error("Error sending message:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Privacy Notice Banner */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-900">
        <Lock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
        <span>
          <strong>Strictly Scoped:</strong> Only enrolled project members can read or post to this chat.
          Admins and third parties do not have access.
        </span>
      </div>

      <Card className="bg-white border-slate-200 shadow-2xs flex flex-col h-[600px]">
        <CardHeader className="py-3 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-sm font-bold text-slate-800">
              Live Team Thread
            </CardTitle>
          </div>
          <span className="text-[11px] text-slate-400">
            {messages.length} messages
          </span>
        </CardHeader>

        {/* Message Stream */}
        <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs space-y-1">
              <MessageSquare className="h-8 w-8 text-slate-300" />
              <p className="font-semibold text-slate-600">No messages yet</p>
              <p>Start the conversation with your supervisor and group members.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === currentUser.id;
              const sender = msg.sender;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isMine ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-semibold text-slate-700">
                      {isMine ? "You" : sender?.full_name || "Member"}
                    </span>
                    {sender?.role && (
                      <Badge
                        variant={sender.role === "faculty" ? "default" : "secondary"}
                        className="text-[9px] capitalize px-1.5 py-0"
                      >
                        {sender.role}
                      </Badge>
                    )}
                    <span className="text-[10px] text-slate-400">
                      {formatDateTime(msg.created_at)}
                    </span>
                  </div>

                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      isMine
                        ? "bg-blue-600 text-white rounded-tr-xs shadow-xs"
                        : "bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/60"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.body}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Chat Input Bar */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 rounded-b-lg">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <Input
              placeholder="Type your message to the team..."
              value={inputBody}
              onChange={(e) => setInputBody(e.target.value)}
              className="text-xs h-10 bg-white"
            />
            <Button
              type="submit"
              disabled={isSending || !inputBody.trim()}
              className="h-10 px-4 gap-1.5 text-xs shadow-sm shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
