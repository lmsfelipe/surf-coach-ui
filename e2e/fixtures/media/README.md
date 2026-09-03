# Media fixtures

The upload flow (`/sessions/:id/upload`) runs real client-side compression
before validation — images through `compressorjs`, video through
`mediabunny`/WebCodecs — so it can't be exercised with synthetic or empty
files. Add six real files here (not committed by default; see below):

- `sample-photo1.jpg` … `sample-photo5.jpg` — five distinct real JPEGs (or
  PNG/WebP). Any reasonable phone-photo size is fine; they get compressed
  down regardless. Kept distinct (rather than one file reused three times)
  so multi-photo specs exercise real, differently-sized uploads.
- `sample-video.mp4` — a real short MP4 (H.264/AAC), **~3-8 seconds** and
  low resolution. Real WebCodecs transcoding takes real wall-clock time, and
  the video-upload spec's timeout is sized around a short clip — a longer or
  higher-resolution file will slow down (or time out) `upload-video.spec.ts`
  and CI.

Until all six files are present, the specs under `e2e/upload/`, `e2e/review/`,
and `e2e/plan/` that depend on them call `test.skip()` at runtime rather than
failing, so the rest of the suite (`e2e/auth/`, `e2e/sessions/`,
`e2e/boards/`) stays green independently.

These are real (if small/throwaway) binary assets, not generated code, so
they're intentionally left out of `.gitignore` — commit them once added,
unless your team prefers to fetch/generate them in CI instead.
