import {beforeEach,afterEach,describe,it,expect,vi} from 'vitest';

let store:Map<string,string>;
beforeEach(()=>{
 vi.resetModules();store=new Map();
 vi.stubEnv('VITE_SPOTIFY_CLIENT_ID','0123456789abcdef0123456789abcdef');
 vi.stubGlobal('sessionStorage',{getItem:(k:string)=>store.get(k)??null,setItem:(k:string,v:string)=>store.set(k,v),removeItem:(k:string)=>store.delete(k)});
 vi.stubGlobal('window',{location:{origin:'https://example.com',pathname:'/study/',search:'',hash:''},dispatchEvent:vi.fn()});
 vi.stubGlobal('history',{replaceState:vi.fn()});
});
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
describe('Spotify sessions',()=>{
 it('refreshes expiring tokens once for simultaneous requests',async()=>{
  store.set('spotify_token','old');store.set('spotify_expires_at','1');store.set('spotify_refresh_token','refresh');
  const request=vi.fn().mockResolvedValue(new Response(JSON.stringify({access_token:'new',expires_in:3600}),{status:200}));vi.stubGlobal('fetch',request);
  const {accessToken}=await import('../spotify/auth');
  expect(await Promise.all([accessToken(),accessToken()])).toEqual(['new','new']);
  expect(request).toHaveBeenCalledTimes(1);expect(store.get('spotify_token')).toBe('new');expect(store.get('spotify_refresh_token')).toBe('refresh');
 });
 it('clears expired credentials when renewal is rejected',async()=>{
  store.set('spotify_token','old');store.set('spotify_expires_at','1');store.set('spotify_refresh_token','bad');
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(null,{status:400})));
  const {accessToken}=await import('../spotify/auth');
  await expect(accessToken()).rejects.toThrow('reconnect');expect(store.has('spotify_token')).toBe(false);
 });
 it('does not claim an unapproved account is connected',async()=>{
  store.set('spotify_token','token');vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(null,{status:403})));
  const {spotifyProfile}=await import('../spotify/auth');
  await expect(spotifyProfile()).rejects.toThrow('not approved');expect(store.has('spotify_token')).toBe(false);
 });
 it('rejects a mismatched OAuth state without exchanging the code',async()=>{
  window.location.search='?code=code&state=wrong';store.set('spotify_state','expected');store.set('spotify_verifier','verifier');
  const request=vi.fn();vi.stubGlobal('fetch',request);const {finishAuth}=await import('../spotify/auth');
  await expect(finishAuth()).rejects.toThrow('could not be verified');expect(request).not.toHaveBeenCalled();
 });
 it('exchanges a callback once when startup is invoked twice',async()=>{
  window.location.search='?code=code&state=expected';store.set('spotify_state','expected');store.set('spotify_verifier','verifier');
  const request=vi.fn().mockResolvedValue(new Response(JSON.stringify({access_token:'connected',refresh_token:'refresh',expires_in:3600}),{status:200}));vi.stubGlobal('fetch',request);
  const {finishAuth}=await import('../spotify/auth');await Promise.all([finishAuth(),finishAuth()]);
  expect(request).toHaveBeenCalledTimes(1);expect(store.get('spotify_token')).toBe('connected');expect(store.has('spotify_verifier')).toBe(false);
 });
});
