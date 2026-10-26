import {describe,it,expect} from 'vitest';
import {parseCsv} from '../study/csv';
describe('study CSV import',()=>{
 it('preserves multiline answer keys, commas, and quotes',()=>{
  expect(parseCsv('ID,Answer\r\n"a","strings, then\n""chorus"""\r\n')).toEqual([['ID','Answer'],['a','strings, then\n"chorus"']]);
 });
 it('accepts BOM, empty answers and blank trailing lines',()=>expect(parseCsv('\uFEFFID,Answer\na,\n\n')).toEqual([['ID','Answer'],['a','']]));
 it('rejects truncated quoted notes',()=>expect(()=>parseCsv('ID,Answer\na,"broken')).toThrow('unclosed'));
});
