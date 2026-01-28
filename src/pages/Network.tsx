
import { useState } from "react";
import { NetworkLayout } from "@/components/network/NetworkLayout";
import { NetworkSearch } from "@/components/network/NetworkSearch";
import { NetworkConnections } from "@/components/network/NetworkConnections";
import { NetworkFeatures } from "@/components/network/NetworkFeatures";
import { useNetworkConnections } from "@/hooks/useNetworkConnections";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Network() {
  const {
    connections,
    pendingConnections,
    suggestions,
    loading,
    actionLoading,
    searchTerm,
    setSearchTerm,
    searchResults,
    tableError,
    sendConnectionRequest,
    respondToRequest
  } = useNetworkConnections();
  
  const [activeTab, setActiveTab] = useState('connections');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const sendMessage = async (recipientId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to send a message.",
        variant: "destructive",
      });
      return;
    }

    try {
      // try recipient_id first
      let { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        recipient_id: recipientId,
        content: "Hi! Thanks for connecting – want to chat?",
      });
      if (error && typeof error.message === "string" && error.message.toLowerCase().includes("recipient_id")) {
        const retry = await supabase.from("messages").insert({
          sender_id: user.id,
          receiver_id: recipientId,
          content: "Hi! Thanks for connecting – want to chat?",
        });
        error = retry.error;
      }
      if (error) throw error;
      toast({ title: "Message sent", description: "Opening your inbox..." });
      navigate("/messages");
    } catch (err: any) {
      console.error("Error sending message", err);
      toast({
        title: "Error sending message",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <NetworkLayout tableError={tableError}>
      <>
        <NetworkSearch 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <NetworkConnections
          connections={connections}
          pendingConnections={pendingConnections}
          suggestions={suggestions}
          loading={loading}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          actionLoading={actionLoading}
          sendConnectionRequest={sendConnectionRequest}
          respondToRequest={respondToRequest}
          searchResults={searchResults}
          sendMessage={sendMessage}
        />
        
        <NetworkFeatures />
      </>
    </NetworkLayout>
  );
}
