import {afterEach,beforeEach,describe,it,expect,vi} from 'vitest';
const {request}=vi.hoisted(()=>({request:vi.fn()}));
vi.mock('../spotify/auth',()=>({authorizedFetch:request,accessToken:vi.fn(),connectSpotify:vi.fn(),finishAuth:vi.fn(),spotifyConfigured:vi.fn(),spotifyProfile:vi.fn(),disconnectSpotify:vi.fn()}));
beforeEach(()=>{vi.stubGlobal('sessionStorage',{getItem:()=> 'test-token'});request.mockReset();});
afterEach(()=>vi.unstubAllGlobals());
describe('Spotify playlist import',()=>{
 it('imports paginated tracks using the current endpoint and excludes episodes',async()=>{
  const track=(id:string)=>({item:{id,type:'track',name:id,duration_ms:120000,artists:[{name:'Composer'}]}});
  request.mockResolvedValueOnce(new Response(JSON.stringify({name:'Course'}))).mockResolvedValueOnce(new Response(JSON.stringify({items:[track('a'),{item:{type:'episode',id:'podcast'}}],next:'https://api.spotify.com/v1/playlists/id/items?offset=50'}))).mockResolvedValueOnce(new Response(JSON.stringify({items:[track('b'),track('a')],next:null})));
  const {importPlaylist}=await import('../spotify/spotify');const result=await importPlaylist('https://open.spotify.com/playlist/id');
  expect(result.playlist.trackIds).toEqual(['a','b']);expect(request.mock.calls.map(c=>c[0])).toEqual(['/playlists/id','/playlists/id/items?limit=50','/playlists/id/items?offset=50']);
 });
 it('explains ownership and approved account checks on a 403',async()=>{
  request.mockResolvedValue(new Response(JSON.stringify({error:{message:'Forbidden'}}),{status:403}));
  const {importPlaylist}=await import('../spotify/spotify');await expect(importPlaylist('https://open.spotify.com/playlist/id')).rejects.toThrow('You must own this playlist');
 });
});
