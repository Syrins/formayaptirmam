
import React from 'react';

interface SketchfabEmbedProps {
  modelId: string;
  title?: string;
  height?: string;
}

/**
 * A component to embed Sketchfab 3D models
 */
const SketchfabEmbed: React.FC<SketchfabEmbedProps> = ({ modelId, title = "3D Model", height = "400px" }) => {
  // Build the embed URL with parameters to hide ALL UI elements, including branding and buttons
  const embedUrl = `https://sketchfab.com/models/${modelId}/embed?autospin=1&autostart=1&preload=1&ui_animations=0&ui_inspector=0&ui_controls=0&ui_infos=0&ui_stop=0&ui_watermark=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&ui_hint=0&ui_ar=0&ui_fadeout=0&ui_theme=dark&ui_color=white&dnt=1&transparent=1`;

  return (
    <div className="sketchfab-embed-wrapper" style={{ height }}>
      <iframe
        title={title}
        width="100%"
        height="100%"
        src={embedUrl}
        frameBorder="0"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
        data-moz-allowfullscreen="true"
        data-webkit-allowfullscreen="true"
      ></iframe>
    </div>
  );
};

export default SketchfabEmbed;
