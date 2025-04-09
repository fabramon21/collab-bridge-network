
import { useState } from "react";
import { NetworkLayout } from "@/components/network/NetworkLayout";
import { NetworkSearch } from "@/components/network/NetworkSearch";
import { NetworkConnections } from "@/components/network/NetworkConnections";
import { NetworkFeatures } from "@/components/network/NetworkFeatures";
import { useNetworkConnections } from "@/hooks/useNetworkConnections";

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
        />
        
        <NetworkFeatures />
      </>
    </NetworkLayout>
  );
}
