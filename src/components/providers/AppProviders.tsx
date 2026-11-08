import React, { Component, ErrorInfo, Suspense } from "react";
import { ClerkProvider, useAuth } from "@clerk/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexProvider } from "convex/react";
import { SkulletProvider } from "skullet/react";
import "skullet/styles.css";
import { PupLumeSkeleton } from "../common/PupLumeSkeleton";
import { convex } from "../../lib/convex";

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white p-8 rounded-3xl border border-[#E8DDD3] shadow-sm flex flex-col items-center gap-4">
            <span className="text-4xl">🐾</span>
            <h2 className="text-xl font-bold text-[#2C211B]">Something went wrong</h2>
            <p className="text-xs text-[#766A63] leading-relaxed">
              We encountered a minor hiccup loading your puppy data. Please reload the page to reconnect.
            </p>
            {this.state.error && (
              <details className="w-full text-left bg-red-50/80 border border-red-200/60 rounded-xl p-3 text-[11px] text-red-700">
                <summary className="cursor-pointer font-bold select-none text-red-800">Error Details</summary>
                <div className="mt-2 font-mono whitespace-pre-wrap break-words">{this.state.error.message || String(this.state.error)}</div>
              </details>
            )}
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full pt-1">
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:flex-1 px-5 py-2.5 bg-[#8B5E3C] hover:bg-[#6D492F] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
              >
                Reload PupLume
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                  } catch (_) {}
                  window.location.href = '/';
                }}
                className="w-full sm:flex-1 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-[#5F3E29] font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Reset Cache
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const defaultClerkKey = "pk_test_aGVscGZ1bC1ndWxsLTkwMTQuY2xlcmsuYWNjb3VudHMuZGV2JA";
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || defaultClerkKey;

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <SkulletProvider
        reveal="smart"
        theme={{
          light: {
            base: "#D8DEE4",
            highlight: "#FFFFFF",
          },
          dark: {
            base: "#D8DEE4",
            highlight: "#FFFFFF",
          },
          radius: "14px",
          animation: "shimmer",
          speed: "fast",
        }}
      >
        <Suspense fallback={<PupLumeSkeleton label="Loading PupLume..." />}>
          {clerkPublishableKey ? (
            <ClerkProvider publishableKey={clerkPublishableKey}>
              <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                {children}
              </ConvexProviderWithClerk>
            </ClerkProvider>
          ) : (
            <ConvexProvider client={convex}>
              {children}
            </ConvexProvider>
          )}
        </Suspense>
      </SkulletProvider>
    </ErrorBoundary>
  );
};
