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
    <div className="space-y-4">
      {state?.success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
          Puja registrada correctamente
        </div>
      )}
      {state?.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      {pendingIncrement !== null ? (
        <div className="space-y-3 rounded-lg border-2 border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">
            Confirmar puja de{" "}
            <strong>{formatCurrency(pendingAmount)}</strong>
          </p>

          <div className="h-2 w-full overflow-hidden rounded-full bg-green-200">
            <div
              className="h-full rounded-full bg-green-600 transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / COUNTDOWN_SECONDS) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelPending}
              disabled={isPending}
            >
              ✕ Cancelar
            </Button>
            <span className="font-mono text-sm text-green-700">
              {countdown}s
            </span>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              disabled={isPending}
              onClick={() => executeBid(pendingAmount)}
            >
              {isPending ? "Pujando..." : "✓ Confirmar"}
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
              className="w-full"
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
            className="flex-1"
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? "Pujando..." : "Pujar"}
          </Button>
        </form>
      )}
    </div>
  );
}
