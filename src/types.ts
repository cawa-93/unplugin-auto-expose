export interface CommonOptions {
  exposeName?: (name: string) => string;
}

export interface PreloadOptions extends CommonOptions {
  noContextBridgeEntries?: string[];
}

export interface RendererOptions extends CommonOptions {
  preloadEntry?: string;
  virtualModuleMap?: Record<string, string>; // virtual module name to preloadEntry path
}

export interface ExportInfo {
  name: string;
  as: string;
  from: string;
}
