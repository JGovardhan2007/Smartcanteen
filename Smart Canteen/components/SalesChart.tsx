import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SalesReportData } from '../types';
import { analyzeSalesData } from '../services/geminiService';
import { Sparkles, Loader2 } from 'lucide-react';

interface SalesChartProps {
  data: SalesReportData[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const dataString = JSON.stringify(data);
    const result = await analyzeSalesData(dataString);
    setAnalysis(result);
    setLoading(false);
  };

  const colors = ['#f97316', '#84cc16', '#0ea5e9', '#8b5cf6', '#ec4899'];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Daily Sales Report</h2>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex items-center gap-2 text-sm bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          AI Analysis
        </button>
      </div>

      <div className="h-64 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {analysis && (
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 animate-in fade-in duration-500">
            <h4 className="text-indigo-900 font-semibold text-sm mb-2 flex items-center gap-2">
                <Sparkles size={14} /> AI Insights
            </h4>
            <div className="prose prose-sm text-indigo-800 max-w-none">
                <p className="whitespace-pre-line">{analysis}</p>
            </div>
        </div>
      )}
    </div>
  );
};