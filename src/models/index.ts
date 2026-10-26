export type Piece = { id: string; composer: string; title: string; artist: string; durationMs: number; albumArt?: string; answerKey: string; createdAt: string; updatedAt: string };
export type Playlist = { id: string; name: string; trackIds: string[]; selected: boolean; createdAt: string; updatedAt: string };
export type Attempt = { id?: number; spotifyTrackId: string; timestamp: string; score: 1|2|3|4|5; response?: string };
export type Backup = { version: 1; pieces: Piece[]; playlists: Playlist[]; attempts: Attempt[] };
