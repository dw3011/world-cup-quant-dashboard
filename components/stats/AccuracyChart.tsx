"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { risk: "低", hit: 88 },
  { risk: "中低", hit: 79 },
  { risk: "中", hit: 68 },
  { risk: "中高", hit: 55 },
  { risk: "高", hit: 42 }
];

export function AccuracyChart() {
  return (
    <div className="card h-80">
      <h3 className="mb-4 font-display text-xl font-bold">不同风险等级命中率</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="risk" />
          <YAxis unit="%" />
          <Tooltip />
          <Bar dataKey="hit" fill="#2563eb" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
