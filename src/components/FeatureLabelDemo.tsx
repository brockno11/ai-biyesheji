import { useState, useMemo } from 'react';
import type { Algorithm } from '../types';

interface HousingRow {
  面积: number;
  房间数: number;
  地段等级: number;
  房价: number;
}

const sampleData: HousingRow[] = [
  { 面积: 120, 房间数: 3, 地段等级: 5, 房价: 350 },
  { 面积: 85, 房间数: 2, 地段等级: 3, 房价: 180 },
  { 面积: 150, 房间数: 4, 地段等级: 4, 房价: 420 },
  { 面积: 60, 房间数: 1, 地段等级: 2, 房价: 90 },
  { 面积: 200, 房间数: 5, 地段等级: 5, 房价: 650 },
  { 面积: 95, 房间数: 3, 地段等级: 4, 房价: 280 },
];

type ColumnKey = keyof HousingRow;

const columns: { key: ColumnKey; label: string; defaultRole: 'feature' | 'label' }[] = [
  { key: '面积', label: '面积 (m²)', defaultRole: 'feature' },
  { key: '房间数', label: '房间数', defaultRole: 'feature' },
  { key: '地段等级', label: '地段等级', defaultRole: 'feature' },
  { key: '房价', label: '房价 (万)', defaultRole: 'label' },
];

interface FeatureLabelDemoProps {
  algorithm?: Algorithm;
}

export default function FeatureLabelDemo({ algorithm: _algorithm }: FeatureLabelDemoProps) {
  const [labelCol, setLabelCol] = useState<ColumnKey>('房价');

  const featureCols = useMemo(
    () => columns.filter((c) => c.key !== labelCol).map((c) => c.key),
    [labelCol],
  );

  const toggleColumn = (key: ColumnKey) => {
    // Label column can't be a feature, feature columns can become label
    if (key === labelCol) return;
    setLabelCol(key);
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="text-center">
        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight mb-1">
          🏷️ 特征与标签
        </h3>
        <p className="text-sm text-gray-500">
          点击列标题切换「标签」列，理解 X 和 y 的区别
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/60 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {columns.map((col) => {
                const isLabel = col.key === labelCol;
                return (
                  <th
                    key={col.key}
                    onClick={() => toggleColumn(col.key)}
                    className={`px-4 py-3 text-center font-bold cursor-pointer select-none transition-all duration-300 border-b-2 ${
                      isLabel
                        ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white border-amber-500'
                        : 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white border-blue-500'
                    }`}
                    title={isLabel ? '标签 (y) — 点击切换' : '特征 (X) — 点击切换标签'}
                  >
                    <div className="text-xs opacity-80 mb-0.5">
                      {isLabel ? '🏷️ 标签 (y)' : '📊 特征 (X)'}
                    </div>
                    {col.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sampleData.map((row, i) => (
              <tr
                key={i}
                className={`${
                  i % 2 === 0 ? 'bg-white/40' : 'bg-gray-50/40'
                } hover:bg-blue-50/50 transition-colors`}
              >
                {columns.map((col) => {
                  const isLabel = col.key === labelCol;
                  return (
                    <td
                      key={col.key}
                      className={`px-4 py-2.5 text-center font-mono ${
                        isLabel
                          ? 'bg-amber-50/80 text-amber-800 font-bold'
                          : 'text-gray-700'
                      }`}
                    >
                      {row[col.key]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Shape Info & Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* X Info Card */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 p-5">
          <h4 className="flex items-center gap-2 text-sm font-extrabold text-blue-700 tracking-tight mb-3">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs">
              X
            </span>
            特征矩阵
          </h4>
          <div className="space-y-2">
            <p className="text-xs font-mono bg-white/80 rounded-lg px-3 py-2 text-blue-800">
              shape = (6, {featureCols.length})
            </p>
            <p className="text-xs text-blue-600">
              <span className="font-bold">n_samples = 6</span>（样本行数）
              <br />
              <span className="font-bold">n_features = {featureCols.length}</span>（特征列数）
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {featureCols.map((key) => (
                <span
                  key={key}
                  className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium"
                >
                  {columns.find((c) => c.key === key)?.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* y Info Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-5">
          <h4 className="flex items-center gap-2 text-sm font-extrabold text-amber-700 tracking-tight mb-3">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs">
              y
            </span>
            标签向量
          </h4>
          <div className="space-y-2">
            <p className="text-xs font-mono bg-white/80 rounded-lg px-3 py-2 text-amber-800">
              shape = (6,)
            </p>
            <p className="text-xs text-amber-600">
              <span className="font-bold">n_samples = 6</span>（每个样本一个标签值）
              <br />
              一维数组，对应每行数据的目标值
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                {columns.find((c) => c.key === labelCol)?.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Friendly Explanation */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl border border-primary-100 p-4">
        <p className="text-sm text-gray-700 leading-relaxed text-center">
          💡 <span className="font-bold">通俗理解：</span>
          模型根据 <span className="text-blue-600 font-bold">X（特征矩阵）</span> 学习规律，
          再去预测 <span className="text-amber-600 font-bold">y（标签向量）</span>。
          {labelCol === '房价'
            ? ' 就像通过面积、房间数、地段来预测房价！'
            : labelCol === '面积'
              ? ' 就像通过房间数、地段、房价来反推面积！'
              : labelCol === '房间数'
                ? ' 就像通过面积、地段、房价来推测房间数！'
                : ' 就像通过面积、房间数、房价来推断地段等级！'}
        </p>
      </div>
    </div>
  );
}
