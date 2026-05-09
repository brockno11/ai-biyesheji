import type { Algorithm } from '../types';

interface Props {
  algorithm?: Algorithm;
}

export default function RandomForestViz(_props: Props) {
  return (
    <div className="flex items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-2xl">
      <p className="text-sm text-slate-400">随机森林可视化即将上线</p>
    </div>
  );
}
