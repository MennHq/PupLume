import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { 
  Activity, 
  Copy, 
  Check, 
  Trash2, 
  Send, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  Terminal,
  Zap,
  Globe
} from 'lucide-react';

export const PaddleLogPage: React.FC = () => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  const logs = useQuery(api.debugLogs.getWebhookLogs);
  const clearLogsMutation = useMutation(api.debugLogs.clearWebhookLogs);
  const simulateMutation = useMutation(api.debugLogs.simulateTestWebhook);

  const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN || '';
  const priceId = import.meta.env.VITE_PADDLE_PRICE_ID || '';
  const smartTagPriceId = import.meta.env.VITE_PADDLE_SMART_TAG_PRICE_ID || '';
  const isSandbox = clientToken.startsWith('test_');
  const webhookUrl = 'https://energetic-partridge-407.convex.site/paddle-webhook';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyPayload = (logId: string, payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedLogId(logId);
    setTimeout(() => setCopiedLogId(null), 2000);
  };

  const handleSimulate = async (type: string = 'transaction.completed') => {
    setSimulating(true);
    try {
      await simulateMutation({
        eventType: type,
        email: 'test-parent@puplume.com',
      });
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear all webhook logs?')) {
      await clearLogsMutation();
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#2C211B] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Navigation & Brand */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8DDD3] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#8B5E3C] rounded-2xl flex items-center justify-center text-white shadow-md">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#2C211B]">
                  Paddle Webhook Live Console
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  isSandbox 
                    ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {isSandbox ? 'Sandbox Mode' : 'Live Mode'}
                </span>
              </div>
              <p className="text-xs text-[#766A63] mt-0.5">
                Real-time debugger for Paddle checkout transactions, events, and webhook deliveries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FAF6F0] hover:bg-[#F3E7DA] text-[#2C211B] text-xs font-bold rounded-xl border border-[#E8DDD3] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to App</span>
            </a>
          </div>
        </div>

        {/* Configuration Overview Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Webhook Endpoint */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8DDD3] shadow-xs md:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                Active Convex Webhook Endpoint
              </span>
              <button
                onClick={handleCopyUrl}
                className="text-xs font-bold text-[#8B5E3C] hover:text-[#5F3E29] flex items-center gap-1 cursor-pointer"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied URL!' : 'Copy Endpoint'}</span>
              </button>
            </div>
            <div className="p-2.5 bg-[#FAF6F0] rounded-xl font-mono text-xs text-[#2C211B] break-all border border-[#E8DDD3]">
              {webhookUrl}
            </div>
            <p className="text-[11px] text-[#766A63] leading-relaxed">
              Paste this URL in Paddle Dashboard under <strong>Developer tools &gt; Notifications &gt; New destination</strong>. It accepts events from both Sandbox and Live.
            </p>
          </div>

          {/* Active Credentials Summary */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8DDD3] shadow-xs space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Active Config
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#766A63]">Environment:</span>
                <span className="font-bold font-mono">{isSandbox ? 'sandbox' : 'production'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#766A63]">Client Token:</span>
                <span className="font-mono text-[10px] truncate max-w-[140px] bg-neutral-100 px-1.5 py-0.5 rounded">
                  {clientToken ? `${clientToken.substring(0, 10)}...` : 'None'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#766A63]">App Price ID:</span>
                <span className="font-mono text-[10px] truncate max-w-[140px] bg-neutral-100 px-1.5 py-0.5 rounded">
                  {priceId ? `${priceId.substring(0, 12)}...` : 'None'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#766A63]">Tag Price ID:</span>
                <span className="font-mono text-[10px] truncate max-w-[140px] bg-neutral-100 px-1.5 py-0.5 rounded">
                  {smartTagPriceId ? `${smartTagPriceId.substring(0, 12)}...` : 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Simulator */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FFF9F2] p-4 rounded-2xl border border-[#E8DDD3]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#5F3E29]">Testing Tools:</span>
            <button
              onClick={() => handleSimulate('transaction.completed')}
              disabled={simulating}
              className="px-3.5 py-2 bg-[#8B5E3C] hover:bg-[#6D492F] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{simulating ? 'Injecting...' : 'Simulate transaction.completed'}</span>
            </button>
            <button
              onClick={() => handleSimulate('subscription.activated')}
              disabled={simulating}
              className="px-3 py-2 bg-white hover:bg-neutral-50 text-[#2C211B] text-xs font-bold rounded-xl border border-[#E8DDD3] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3 h-3 text-blue-600" />
              <span>Simulate subscription</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#766A63]">
              {logs ? `${logs.length} events logged` : 'Loading logs...'}
            </span>
            <button
              onClick={handleClear}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Logs</span>
            </button>
          </div>
        </div>

        {/* Live Logs Stream */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#8B5E3C] flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
              Live Webhook Stream ({logs?.length || 0})
            </h2>
            <span className="text-[11px] text-[#766A63]">Updates automatically in real time</span>
          </div>

          {logs === undefined ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E8DDD3] shadow-xs">
              <div className="w-8 h-8 border-2 border-[#8B5E3C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-[#766A63]">Connecting to Convex real-time stream...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E8DDD3] shadow-xs space-y-3">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-700 mx-auto">
                <Activity className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#2C211B]">No Webhook Events Received Yet</h3>
              <p className="text-xs text-[#766A63] max-w-md mx-auto leading-relaxed">
                When Paddle completes a payment or sends a notification to your Convex webhook URL, it will appear here in real time.
              </p>
              <button
                onClick={() => handleSimulate()}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#8B5E3C] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send a Test Event</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log: any) => {
                const isExpanded = expandedLogId === log._id;
                const eventType = log.payload?.event_type || log.action || 'Unknown Event';
                const eventId = log.payload?.event_id || log.payload?.id || 'No ID';
                const customerEmail = log.payload?.data?.customer?.email || log.payload?.data?.custom_data?.email || log.payload?.user?.email || 'N/A';
                const amount = log.payload?.data?.details?.totals?.total || log.payload?.data?.amount || log.payload?.data?.items?.[0]?.price?.unit_price?.amount;
                const formattedAmount = amount ? `$${(Number(amount) / 100).toFixed(2)}` : null;
                const timeString = log.processedAt 
                  ? new Date(log.processedAt).toLocaleString() 
                  : new Date(log._creationTime).toLocaleString();

                const logEnv = log.environment || (log.payload?.data?.status === 'sandbox' ? 'sandbox' : 'live');

                return (
                  <div
                    key={log._id}
                    className="bg-white rounded-2xl border border-[#E8DDD3] shadow-2xs overflow-hidden transition-all hover:border-[#8B5E3C]/40"
                  >
                    {/* Header Bar */}
                    <div
                      onClick={() => setExpandedLogId(isExpanded ? null : log._id)}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none hover:bg-[#FAF6F0]/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <button className="text-[#766A63] hover:text-[#2C211B]">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            logEnv === 'sandbox' || logEnv === 'sandbox_simulated'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {logEnv}
                          </span>
                          <span className="text-xs font-mono font-bold text-[#2C211B]">{eventType}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-medium text-[#766A63]">
                        {formattedAmount && (
                          <span className="font-bold text-[#2C211B] bg-[#FFF9F2] px-2.5 py-1 rounded-lg border border-[#E8DDD3]">
                            {formattedAmount}
                          </span>
                        )}
                        <span className="truncate max-w-[180px] text-[#5F3E29]">{customerEmail}</span>
                        <span className="text-[11px] text-[#A69B95]">{timeString}</span>
                      </div>
                    </div>

                    {/* Expanded Detail Viewer */}
                    {isExpanded && (
                      <div className="border-t border-[#E8DDD3] bg-[#FAF6F0] p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-[#766A63]">Event ID: {eventId}</span>
                          <button
                            onClick={() => handleCopyPayload(log._id, log.payload)}
                            className="px-2.5 py-1 bg-white hover:bg-[#F3E7DA] text-[#2C211B] text-xs font-bold rounded-lg border border-[#E8DDD3] transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            {copiedLogId === log._id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Copied JSON!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy JSON</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Raw JSON code block */}
                        <div className="bg-[#2C211B] text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-96 shadow-inner">
                          <pre>{JSON.stringify(log.payload, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
