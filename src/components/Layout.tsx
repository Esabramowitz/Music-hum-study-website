import { type ReactNode } from 'react';
export type Page='study'|'pieces'|'playlists'|'progress'|'settings';
export function Layout({page,setPage,children}:{page:Page;setPage:(p:Page)=>void;children:ReactNode}){return <><header><div className="brand"><span>MH</span><div>Music Humanities<small>local study studio</small></div></div><nav>{(['study','pieces','playlists','progress','settings'] as Page[]).map(x=><button className={page===x?'active':''} onClick={()=>setPage(x)} key={x}>{x}</button>)}</nav></header><main>{children}</main></>}
export function Notice({children}:{children:ReactNode}){return <div className="notice">{children}</div>}
