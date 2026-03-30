"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import {
  FieldSurveysList,
  type FieldSurveyListItem,
} from "@/components/dashboard/FieldSurveysList";
import { cn } from "@/lib/utils";
import { SurveyForm } from "./SurveyForm";

type SurveyPageTabsProps = {
  rows: FieldSurveyListItem[];
  tankTitle: string;
  wardLabel: string | null;
};

export function SurveyPageTabs({ rows, tankTitle, wardLabel }: SurveyPageTabsProps) {
  const router = useRouter();
  const [tab, setTab] = React.useState<"list" | "new">("list");

  const subtitle = (
    <>
      Showing <strong className="font-medium text-foreground">{rows.length}</strong> record
      {rows.length === 1 ? "" : "s"} for{" "}
      <strong className="font-medium text-foreground">{tankTitle}</strong>
      {wardLabel ? (
        <>
          {" "}
          <span className="text-muted">({wardLabel})</span>
        </>
      ) : null}
      . Only entries tied to your assigned tank appear here.
    </>
  );

  return (
    <Card className="p-0">
      <div className="flex border-b border-border px-6 pt-5">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "list"}
          className={cn(
            "-mb-px border-b-2 px-4 pb-3 text-sm font-semibold transition-colors",
            tab === "list"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setTab("list")}
        >
          Submissions
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "new"}
          className={cn(
            "-mb-px border-b-2 px-4 pb-3 text-sm font-semibold transition-colors",
            tab === "new"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setTab("new")}
        >
          New survey
        </button>
      </div>

      <div className="p-6 pt-5" role="tabpanel" hidden={tab !== "list"}>
        {tab === "list" ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Submissions for your tank
              </h2>
              <p className="mt-1 text-sm text-muted">{subtitle}</p>
            </div>
            <FieldSurveysList rows={rows} />
          </div>
        ) : null}
      </div>

      <div className="p-6 pt-5" role="tabpanel" hidden={tab !== "new"}>
        {tab === "new" ? (
          <SurveyForm
            embedded
            onSaved={() => {
              router.refresh();
              setTab("list");
            }}
          />
        ) : null}
      </div>
    </Card>
  );
}
