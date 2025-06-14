
// Type declarations for model-viewer custom element
// This is a custom type definition for the model-viewer Web Component
// We're defining all types locally instead of importing from @types/model-viewer

declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      src: string;
      alt?: string;
      'camera-controls'?: boolean;
      'auto-rotate'?: boolean;
      ar?: boolean;
      'ar-modes'?: string;
      exposure?: string;
      'shadow-intensity'?: string;
      'animation-name'?: string;
      'rotation-per-second'?: string;
      'camera-orbit'?: string;
      'field-of-view'?: string;
      'min-camera-orbit'?: string;
      'max-camera-orbit'?: string;
      'min-field-of-view'?: string;
      'max-field-of-view'?: string;
      'camera-target'?: string;
      'interaction-prompt'?: string;
      'interaction-prompt-style'?: string;
      'interaction-prompt-threshold'?: string;
      style?: React.CSSProperties;
      className?: string;
      poster?: string;
      'environment-image'?: string;
      'skybox-image'?: string;
      'loading'?: 'auto' | 'lazy' | 'eager';
      onLoad?: () => void;
    }, HTMLElement>;
  }
}
