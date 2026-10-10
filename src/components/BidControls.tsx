"use client";

import { useActionState, useState, useEffect, useRef, useCallback, startTransition } from "react";
import { placeBidAction } from "@/app/actions/bids";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BidControlsProps {
  assetId: string;
  currentPrice: number;
}

const QUICK_INCREMENTS = [50000, 100000, 1000000];
const COUNTDOWN_SECONDS = 3;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BidControls({ assetId, currentPrice }: BidControlsProps) {
  const [state, formAction, isPending] = useActionState(placeBidAction, null);
  const [pendingIncrement, setPendingIncrement] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const submittedRef = useRef(false);

  const pendingAmount = pendingIncrement !== null ? currentPrice + pendingIncrement : 0;

  const executeBid = useCallback(
    (amount: number) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      const fd = new FormData();
      fd.set("assetId", assetId);
      fd.set("amount", String(amount));
      startTransition(() => {
        formAction(fd);
      });
      setPendingIncrement(null);
      setCountdown(COUNTDOWN_SECONDS);
    },
    [assetId, formAction]
  );

  const cancelPending = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPendingIncrement(null);
    setCountdown(COUNTDOWN_SECONDS);
    submittedRef.current = false;
  }, []);

  useEffect(() => {
    if (pendingIncrement === null) return;

    submittedRef.current = false;

    if (countdown <= 0) {
      executeBid(pendingAmount);
      return;
    }

    timerRef.current = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [pendingIncrement, countdown, pendingAmount, executeBid]);

  useEffect(() => {
    if (state?.success || state?.error) {
      cancelPending();
    }
  }, [state, cancelPending]);

  const handleQuickBid = (increment: number) => {
    cancelPending();
    setPendingIncrement(increment);
    setCountdown(COUNTDOWN_SECONDS);
  };

  const suggestedBids = QUICK_INCREMENTS.map((inc) => currentPrice + inc);

  return (
    <div className="space-y-3">
      {state?.success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-400">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Puja registrada correctamente
        </div>
      )}
      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {state.error}
        </div>
      )}

      {pendingIncrement !== null ? (
        <div className="space-y-3 rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-400">Confirmar puja</p>
            <p className="text-sm font-bold tabular-nums text-white">
              {formatCurrency(pendingAmount)}
            </p>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-orange-500 transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / COUNTDOWN_SECONDS) * 100}%` }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelPending}
              disabled={isPending}
              className="flex-1 text-neutral-500 hover:text-white hover:bg-white/5"
            >
              Cancelar
            </Button>
            <span className="text-xs tabular-nums text-neutral-500">
              {countdown}s
            </span>
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => executeBid(pendingAmount)}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isPending ? "Pujando..." : "Confirmar"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {suggestedBids.map((suggested, i) => (
            <Button
              key={suggested}
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleQuickBid(QUICK_INCREMENTS[i])}
              className="w-full border-neutral-700 text-neutral-300 hover:bg-white/5 hover:text-white hover:border-neutral-600"
            >
              +{formatCurrency(QUICK_INCREMENTS[i])}
            </Button>
          ))}
        </div>
      )}

      {!pendingIncrement && (
        <form
          action={(formData) => {
            formData.set("assetId", assetId);
            formAction(formData);
          }}
          className="flex gap-2"
        >
          <Input
            name="amount"
            type="number"
            min={currentPrice + 1}
            step="1"
            placeholder={`Mínimo ${formatCurrency(currentPrice + 50000)}`}
            required
            className="flex-1 border-neutral-700 bg-neutral-800 text-white placeholder:text-neutral-500 focus:border-orange-500 focus:ring-orange-500/20"
          />
          <Button
            type="submit"
            disabled={isPending}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isPending ? "Pujando..." : "Pujar"}
          </Button>
        </form>
      )}
    </div>
  );
}
