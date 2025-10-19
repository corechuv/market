// src/types/mux-embed.d.ts
declare module 'mux-embed' {
  export type StreamType = 'on-demand' | 'live' | 'event';

  export interface MonitorData {
    env_key: string;
    player_name?: string;
    player_init_time?: number;
    video_id?: string;
    video_title?: string;
    video_stream_type?: StreamType;
    viewer_user_id?: string;
    page_type?: string;
    experiment_name?: string;
    experiment_variant?: string;
    custom_1?: string;
    custom_2?: string;
    custom_3?: string;
    custom_4?: string;
    custom_5?: string;
  }

  export interface MonitorOptions {
    debug?: boolean;
    data: MonitorData;
    hlsjs?: any;
    hlsjsver?: string;
    player_software_name?: string;
    player_software_version?: string;
  }

  const mux: {
    monitor: (element: HTMLMediaElement, opts: MonitorOptions) => void;
    destroyMonitor: (element: HTMLMediaElement) => void;
  };

  export default mux;
}
