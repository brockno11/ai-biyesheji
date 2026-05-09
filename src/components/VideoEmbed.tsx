interface Props {
  url: string;
  title?: string;
}

export default function VideoEmbed({ url, title }: Props) {
  // Extract BV id from URL to build the embed URL
  const bvidMatch = url.match(/bvid=([^&]+)/);
  const bvid = bvidMatch ? bvidMatch[1] : '';
  const embedUrl = bvid
    ? `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&autoplay=0`
    : url;

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-black">
      {title && (
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-700">{title}</span>
        </div>
      )}
      <div className="relative" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={embedUrl}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          title={title || 'B站视频'}
        />
      </div>
    </div>
  );
}
