"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = Array.from({ length: 10 }, (_, index) => ({
  name: `近${10 - index}`,
  胜平负: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1][index] * 100,
  进球数: [1, 0, 1, 1, 0, 1, 1, 1, 0, 1][index] * 100
}));

export function TrendChart() {
  return (
    <div className="card h-80">
      <h3 className="mb-4 font-display text-xl font-bold">最近 10 场预测表现趋势</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" />
          <YAxis unit="%" />
          <Tooltip />
          <Line type="monotone" dataKey="胜平负" stroke="#2563eb" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="进球数" stroke="#18805c" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
