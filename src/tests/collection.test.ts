import {describe,it,expect} from 'vitest';
import {mergeImportedPiece,selectedPieces} from '../study/collection';
import type {Piece,Playlist} from '../models';
const piece=(id:string)=>({id,title:id,composer:'Composer',artist:'Artist',durationMs:120000,answerKey:'',createdAt:'',updatedAt:''} satisfies Piece);
const playlist=(id:string,selected:boolean,trackIds:string[])=>({id,name:id,selected,trackIds,createdAt:'',updatedAt:''} satisfies Playlist);
describe('selected playlist collection',()=>{
  it('shows only selected membership and deduplicates overlapping playlists',()=>{
    expect(selectedPieces([piece('a'),piece('b'),piece('c')],[playlist('one',true,['a','b']),playlist('two',true,['b']),playlist('three',false,['c'])]).map(p=>p.id)).toEqual(['a','b']);
  });
  it('shows no pieces when all playlists are unchecked or removed',()=>{
    const pieces=[piece('a')];
    expect(selectedPieces(pieces,[playlist('one',false,['a'])])).toEqual([]);
    expect(selectedPieces(pieces,[])).toEqual([]);
    expect(pieces[0].id).toBe('a');
  });
  it('preserves personal notes and labels when a playlist is re-imported',()=>{
    const saved={...piece('a'),title:'Edited title',composer:'Edited composer',answerKey:'My notes',createdAt:'2026-01-01'};
    const incoming={...piece('a'),durationMs:180000,albumArt:'https://example.com/art'};
    expect(mergeImportedPiece(incoming,saved)).toMatchObject({title:'Edited title',composer:'Edited composer',answerKey:'My notes',createdAt:'2026-01-01',durationMs:180000,albumArt:'https://example.com/art'});
    expect(mergeImportedPiece(incoming)).toBe(incoming);
  });
});
