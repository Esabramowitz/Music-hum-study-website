// Parse quoted cells, including commas, escaped quotes, and multiline notes.
export function parseCsv(text:string):string[][] {
  const rows:string[][]=[]; let row:string[]=[], cell='', quoted=false;
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"'){
      if(quoted&&text[i+1]==='"'){cell+='"';i++;}
      else quoted=!quoted;
    }else if(c===','&&!quoted){row.push(cell);cell='';}
    else if((c==='\n'||c==='\r')&&!quoted){
      if(c==='\r'&&text[i+1]==='\n')i++;
      row.push(cell);if(row.some(v=>v!==''))rows.push(row);row=[];cell='';
    }else cell+=c;
  }
  if(quoted)throw Error('CSV contains an unclosed quoted cell.');
  row.push(cell);if(row.some(v=>v!==''))rows.push(row);
  return rows;
}
