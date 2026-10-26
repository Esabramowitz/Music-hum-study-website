import type { Attempt, Backup, Piece, Playlist } from '../models';
const DB = 'music-humanities-study', VERSION = 1;
function open(): Promise<IDBDatabase> { return new Promise((resolve,reject) => { const r=indexedDB.open(DB,VERSION); r.onupgradeneeded=()=>{const d=r.result; d.createObjectStore('pieces',{keyPath:'id'}); d.createObjectStore('playlists',{keyPath:'id'}); const a=d.createObjectStore('attempts',{keyPath:'id',autoIncrement:true}); a.createIndex('track','spotifyTrackId');}; r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error); }); }
async function tx<T>(store: string, mode: IDBTransactionMode, fn:(s:IDBObjectStore)=>IDBRequest<T>):Promise<T>{const d=await open(); return new Promise((resolve,reject)=>{const t=d.transaction(store,mode),r=fn(t.objectStore(store)); let result:T; r.onsuccess=()=>{result=r.result;}; t.oncomplete=()=>{d.close();resolve(result);}; t.onabort=()=>{d.close();reject(t.error||new Error('Database transaction aborted.'));}; t.onerror=()=>reject(t.error);});}
export const db={
 getAll:<T>(store:string)=>tx<T[]>(store,'readonly',s=>s.getAll()), get:<T>(store:string,id:string)=>tx<T>(store,'readonly',s=>s.get(id)),
 put:<T>(store:string,value:T)=>tx(store,'readwrite',s=>s.put(value)), add:<T>(store:string,value:T)=>tx(store,'readwrite',s=>s.add(value)),
 delete:(store:string,id:string)=>tx(store,'readwrite',s=>s.delete(id)),
 async snapshot():Promise<Backup>{return {version:1,pieces:await this.getAll<Piece>('pieces'),playlists:await this.getAll<Playlist>('playlists'),attempts:await this.getAll<Attempt>('attempts')};},
 async restore(b:Backup){
  if(b.version!==1)throw new Error('Unsupported backup version.');
  if(!Array.isArray(b.pieces)||!Array.isArray(b.playlists)||!Array.isArray(b.attempts)||
    b.pieces.some(p=>!p||typeof p.id!=='string'||!p.id||typeof p.title!=='string'||typeof p.composer!=='string'||typeof p.answerKey!=='string'||!Number.isFinite(p.durationMs)||p.durationMs<0)||
    b.playlists.some(p=>!p||typeof p.id!=='string'||!p.id||typeof p.name!=='string'||typeof p.selected!=='boolean'||!Array.isArray(p.trackIds)||p.trackIds.some(id=>typeof id!=='string'))||
    b.attempts.some(a=>!a||typeof a.spotifyTrackId!=='string'||!Number.isInteger(a.score)||a.score<1||a.score>5||!Number.isFinite(Date.parse(a.timestamp))))throw new Error('This is not a valid backup.');
  const d=await open();
  await new Promise<void>((resolve,reject)=>{
   const t=d.transaction(['pieces','playlists','attempts'],'readwrite');
   const attempts=t.objectStore('attempts');
   const signature=(a:Attempt)=>JSON.stringify([a.spotifyTrackId,a.timestamp,a.score,a.response??'']);
   attempts.getAll().onsuccess=e=>{
    const seen=new Set(((e.target as IDBRequest<Attempt[]>).result).map(signature));
    for(const p of b.pieces)t.objectStore('pieces').put(p);
    for(const p of b.playlists)t.objectStore('playlists').put(p);
    for(const a of b.attempts){const key=signature(a);if(!seen.has(key)){const {id,...value}=a;attempts.add(value);seen.add(key);}}
   };
   t.oncomplete=()=>{d.close();resolve();};
   t.onabort=()=>{d.close();reject(t.error||new Error('Backup restore aborted.'));};
  });
 }
};
