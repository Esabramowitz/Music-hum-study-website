const clientId=import.meta.env.VITE_SPOTIFY_CLIENT_ID as string|undefined;
export const redirectUri=import.meta.env.VITE_SPOTIFY_REDIRECT_URI||new URL(import.meta.env.BASE_URL,window.location.origin).href;
const scopes='playlist-read-private playlist-read-collaborative streaming user-read-private user-modify-playback-state';
const tokenUrl='https://accounts.spotify.com/api/token';
let finishing:Promise<boolean>|undefined;
let refreshing:Promise<string>|undefined;
const keys=['spotify_token','spotify_refresh_token','spotify_expires_at','spotify_verifier','spotify_state'];

export function spotifyConfigured(){return Boolean(clientId&&clientId!=='your_spotify_client_id');}
export function disconnectSpotify(){
  keys.forEach(key=>sessionStorage.removeItem(key));
  window.dispatchEvent(new Event('spotify-session-changed'));
}
function saveTokens(data:{access_token:string;refresh_token?:string;expires_in:number}){
  if(!data.access_token||!Number.isFinite(data.expires_in))throw Error('Spotify returned an invalid sign-in response. Please reconnect.');
  sessionStorage.setItem('spotify_token',data.access_token);
  sessionStorage.setItem('spotify_expires_at',String(Date.now()+data.expires_in*1000));
  if(data.refresh_token)sessionStorage.setItem('spotify_refresh_token',data.refresh_token);
}
export async function connectSpotify(){
  if(!spotifyConfigured())throw Error('Spotify is not configured. Ask the study group organizer to finish setup.');
  const verifier=crypto.randomUUID()+crypto.randomUUID(),state=crypto.randomUUID();
  const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier)));
  const challenge=btoa(String.fromCharCode(...digest)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  sessionStorage.setItem('spotify_verifier',verifier);
  sessionStorage.setItem('spotify_state',state);
  const url=new URL('https://accounts.spotify.com/authorize');
  url.search=new URLSearchParams({client_id:clientId!,response_type:'code',redirect_uri:redirectUri,code_challenge_method:'S256',code_challenge:challenge,scope:scopes,state,show_dialog:'true'}).toString();
  window.location.assign(url);
}
async function exchangeCode():Promise<boolean>{
  const query=new URLSearchParams(window.location.search);
  if(!query.has('code')&&!query.has('error'))return false;
  const verifier=sessionStorage.getItem('spotify_verifier'),state=sessionStorage.getItem('spotify_state');
  // Remove OAuth parameters without erasing unrelated URL state.
  for(const key of ['code','state','error','error_description'])query.delete(key);
  const original=new URLSearchParams(window.location.search);
  history.replaceState({},'',window.location.pathname+(query.size?'?'+query:'')+window.location.hash);
  sessionStorage.removeItem('spotify_verifier');sessionStorage.removeItem('spotify_state');
  if(!state||original.get('state')!==state)throw Error('Spotify sign-in could not be verified. Please connect again from this browser.');
  if(original.has('error'))throw Error('Spotify sign-in was cancelled or denied. Connect again when you are ready.');
  if(!verifier||!clientId)throw Error('Spotify sign-in session expired. Please connect again.');
  const response=await fetch(tokenUrl,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:clientId,grant_type:'authorization_code',code:original.get('code')!,redirect_uri:redirectUri,code_verifier:verifier})});
  if(!response.ok)throw Error('Spotify sign-in failed. Please reconnect; the organizer may need to check the registered redirect address.');
  saveTokens(await response.json());
  return true;
}
export function finishAuth():Promise<boolean>{
  // React StrictMode can run startup twice; exchange a one-use code only once.
  if(!finishing)finishing=exchangeCode().finally(()=>{finishing=undefined;});
  return finishing;
}
export async function accessToken(forceRefresh=false):Promise<string>{
  const token=sessionStorage.getItem('spotify_token');
  if(!token)throw Error('Connect Spotify first. Your account must be approved by the study group organizer.');
  const expires=Number(sessionStorage.getItem('spotify_expires_at'));
  if(!forceRefresh&&(!expires||expires>Date.now()+30000))return token;
  if(refreshing)return refreshing;
  refreshing=(async()=>{
    const refresh=sessionStorage.getItem('spotify_refresh_token');
    if(!refresh||!clientId){disconnectSpotify();throw Error('Spotify session expired. Please reconnect.');}
    const response=await fetch(tokenUrl,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:clientId,grant_type:'refresh_token',refresh_token:refresh})});
    if(!response.ok){disconnectSpotify();throw Error('Spotify session expired. Please reconnect.');}
    const data=await response.json();saveTokens(data);return data.access_token as string;
  })().finally(()=>{refreshing=undefined;});
  return refreshing;
}
export async function authorizedFetch(path:string,options:RequestInit={}):Promise<Response>{
  const send=async(force=false)=>fetch('https://api.spotify.com/v1'+path,{...options,headers:{...options.headers,Authorization:'Bearer '+await accessToken(force)}});
  let response=await send();
  if(response.status===401)response=await send(true);
  if(response.status===401){disconnectSpotify();throw Error('Spotify session expired. Please reconnect.');}
  return response;
}
export async function spotifyProfile():Promise<{id:string;display_name:string}|undefined>{
  if(!sessionStorage.getItem('spotify_token'))return undefined;
  const response=await authorizedFetch('/me');
  if(response.status===403){disconnectSpotify();throw Error('This Spotify account is not approved for this study group. Ask the organizer to add it under Users and Access in the Spotify developer dashboard, and confirm the app owner has Premium.');}
  if(!response.ok)throw Error('Could not check your Spotify account. Please reconnect.');
  return response.json();
}
