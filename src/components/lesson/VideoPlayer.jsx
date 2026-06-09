function getYoutubeEmbed(url) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/i);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function getVimeoEmbed(url) {
  const match = url.match(/vimeo\.com\/(\d+)/i);
  return match ? `https://player.vimeo.com/video/${match[1]}` : null;
}

export default function VideoPlayer({ url, provider }) {
  if (!url) {
    return <div className="video-player video-player--empty">Vídeo não disponível.</div>;
  }

  const normalizedProvider = provider || "external";
  const youtube = getYoutubeEmbed(url);
  const vimeo = getVimeoEmbed(url);

  if (normalizedProvider === "youtube" || youtube) {
    return (
      <div className="video-player">
        <iframe src={youtube || url} title="Vídeo da aula" allowFullScreen />
      </div>
    );
  }

  if (normalizedProvider === "vimeo" || vimeo) {
    return (
      <div className="video-player">
        <iframe src={vimeo || url} title="Vídeo da aula" allowFullScreen />
      </div>
    );
  }

  return (
    <div className="video-player">
      <video controls src={url}>
        <track kind="captions" />
      </video>
    </div>
  );
}
