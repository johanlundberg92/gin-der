"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

import { useLocale } from "@/components/locale-provider";
import type { FlavorField } from "@/lib/constants";

type FlavorProfileChartProps = {
  title: string;
  groupAverages: Record<FlavorField, number>;
  labels: Record<FlavorField, string>;
  participantNote?: ({
    overallScore: number;
    customNotes: string | null;
  } & Record<FlavorField, number>) | null;
};

export function FlavorProfileChart({
  title,
  groupAverages,
  labels,
  participantNote,
}: FlavorProfileChartProps) {
  const { messages } = useLocale();
  const data = (Object.keys(labels) as FlavorField[]).map((field) => ({
    flavor: labels[field],
    group: groupAverages[field],
    yours: participantNote?.[field] ?? null,
  }));

  return (
    <div className="field-shell rounded-3xl p-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.12)" />
            <PolarAngleAxis
              dataKey="flavor"
              tick={{ fill: "rgba(255,255,255,0.72)", fontSize: 12 }}
            />
            <Radar
              name={messages.results.groupSeries}
              dataKey="group"
              stroke="#d7a85b"
              fill="#d7a85b"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            {participantNote ? (
              <Radar
                name={messages.results.youSeries}
                dataKey="yours"
                stroke="#7dd3c7"
                fill="#7dd3c7"
                fillOpacity={0.16}
                strokeWidth={2}
              />
            ) : null}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
