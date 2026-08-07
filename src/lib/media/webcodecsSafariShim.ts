/**
 * Workaround for a Safari 26.x WebCodecs spec-compliance bug (Mediabunny #456).
 *
 * On Safari 26.x, `VideoEncoder.isConfigSupported()` throws a native
 * `TypeError: Type error` for certain H.264 dimension/profile combinations
 * instead of resolving to `{ supported: false }` as the WebCodecs spec requires.
 * Mediabunny doesn't guard that call during codec negotiation, so the throw
 * propagates and every transcode (resize/compress) fails outright on Safari —
 * even though `canEncodeVideo('avc')` probed with a default config says "yes".
 *
 * We wrap `isConfigSupported` so it never throws: on a native throw we probe by
 * actually configuring a throwaway encoder, and only report `supported: false`
 * when that also rejects the config synchronously (i.e. it's genuinely malformed).
 * Otherwise we let negotiation proceed; a real encode failure still surfaces
 * later and is handled by compressVideo's fallback-to-original.
 *
 * Idempotent, and a no-op anywhere `isConfigSupported` already behaves. Remove
 * once Mediabunny ships a fix and we bump the dependency.
 */

interface ShimmableEncoder {
  isConfigSupported?: (config: VideoEncoderConfig) => Promise<VideoEncoderSupport>;
  __safariConfigShim?: boolean;
}

export function installWebCodecsSafariShim(): void {
  if (typeof window === 'undefined') return;

  const VE = window.VideoEncoder as (typeof window.VideoEncoder & ShimmableEncoder) | undefined;
  if (!VE || VE.__safariConfigShim || typeof VE.isConfigSupported !== 'function') return;

  const original = VE.isConfigSupported.bind(VE);

  VE.isConfigSupported = async (config: VideoEncoderConfig): Promise<VideoEncoderSupport> => {
    try {
      return await original(config);
    } catch {
      // Safari threw instead of answering. Probe with a real, throwaway encoder:
      // configure() only synchronously throws for a malformed/invalid config;
      // an unsupported-but-valid config surfaces asynchronously, so treating a
      // clean configure() as "supported" lets the real pipeline try.
      try {
        const probe = new window.VideoEncoder({ output: () => {}, error: () => {} });
        probe.configure(config);
        probe.close();
        return { supported: true, config };
      } catch {
        return { supported: false, config };
      }
    }
  };

  VE.__safariConfigShim = true;
}
