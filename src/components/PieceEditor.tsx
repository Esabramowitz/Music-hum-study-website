import {useState} from 'react';
import type {Piece} from '../models';

export function PieceEditor({piece,onSave,onCancel}:{piece:Piece;onSave:(piece:Piece)=>Promise<void>;onCancel:()=>void}){
  const [title,setTitle]=useState(piece.title);
  const [composer,setComposer]=useState(piece.composer);
  const [answerKey,setAnswerKey]=useState(piece.answerKey);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  async function submit(e:React.FormEvent){
    e.preventDefault();
    if(saving)return;
    setSaving(true);setError('');
    try{
      await onSave({...piece,title:title.trim(),composer:composer.trim(),answerKey,updatedAt:new Date().toISOString()});
      onCancel();
    }catch(e){setError(e instanceof Error?e.message:'Could not save your changes.');}
    finally{setSaving(false);}
  }
  return <form className="piece-editor" onSubmit={submit}>
    <label>Title<input required value={title} onChange={e=>setTitle(e.target.value)}/></label>
    <label>Composer<input required value={composer} onChange={e=>setComposer(e.target.value)}/></label>
    <label>Answer notes<textarea value={answerKey} onChange={e=>setAnswerKey(e.target.value)} placeholder="Instrumentation, period, form, and other listening clues…"/></label>
    <p className="muted">Saved only in this browser. Your score and written response stay unchanged.</p>
    {error&&<p role="alert">{error}</p>}
    <div className="button-row"><button className="primary" disabled={saving||!title.trim()||!composer.trim()}>{saving?'Saving…':'Save information'}</button><button type="button" className="secondary" disabled={saving} onClick={onCancel}>Cancel</button></div>
  </form>;
}
