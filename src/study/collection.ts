import type {Piece,Playlist} from '../models';

export function selectedPieces(pieces:Piece[],playlists:Playlist[]):Piece[]{
  const ids=new Set(playlists.filter(p=>p.selected).flatMap(p=>p.trackIds));
  return pieces.filter(piece=>ids.has(piece.id));
}

// Refresh Spotify metadata without replacing personal study edits.
export function mergeImportedPiece(incoming:Piece,existing?:Piece):Piece{
  return existing?{...incoming,title:existing.title,composer:existing.composer,answerKey:existing.answerKey,createdAt:existing.createdAt}:incoming;
}
