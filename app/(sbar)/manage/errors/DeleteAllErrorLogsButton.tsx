"use client";

import { useTransition } from "react";
import { deleteAllErrorLogs } from "@/actions/errors";

export function DeleteAllErrorLogsButton({ disabled }: { disabled: boolean }) {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            type="button"
            disabled={disabled || isPending}
            onClick={() => {
                if (!confirm("Delete all error logs? This cannot be undone.")) return;
                startTransition(async () => {
                    await deleteAllErrorLogs();
                });
            }}
            style={{
                border: "1px solid #fecaca",
                background: disabled || isPending ? "#f8fafc" : "#fff1f2",
                color: disabled || isPending ? "#94a3b8" : "#be123c",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: disabled || isPending ? "not-allowed" : "pointer",
                whiteSpace: "nowrap"
            }}
        >
            {isPending ? "Deleting..." : "Delete All Logs"}
        </button>
    );
}
