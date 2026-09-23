import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const sql = fs.readFileSync(
  path.join(process.cwd(), 'db/supabase/manual/20260923_seed_decision_graph_first_batch.sql'),
  'utf8',
);
const start = sql.indexOf('DO $decision_graph_seed$');
const end = sql.lastIndexOf('$decision_graph_seed$;');
const taskCleanup = sql.indexOf('DROP TABLE IF EXISTS pg_temp.decision_graph_seed_task_capabilities;');
const relationCleanup = sql.indexOf('DROP TABLE IF EXISTS pg_temp.decision_graph_seed_relations;');
const createTask = sql.indexOf('CREATE TEMP TABLE decision_graph_seed_task_capabilities');
const createRelation = sql.indexOf('CREATE TEMP TABLE decision_graph_seed_relations');
const lastClaimLink = sql.lastIndexOf('INSERT INTO public.tool_task_fit_claims');
const dropRelation = sql.lastIndexOf('DROP TABLE pg_temp.decision_graph_seed_relations;');
const dropTask = sql.lastIndexOf('DROP TABLE pg_temp.decision_graph_seed_task_capabilities;');

assert.ok(start >= 0 && end > start, 'the editor must submit one complete DO statement');
assert.equal((sql.match(/^DO /gm) || []).length, 1, 'no other top-level statement may use temp tables');
assert.doesNotMatch(sql, /^BEGIN;|^COMMIT;|ON COMMIT DROP/gm);
assert.ok(start < taskCleanup && taskCleanup < relationCleanup && relationCleanup < createTask);
assert.ok(createTask < createRelation && createRelation < lastClaimLink);
assert.match(sql, /ON COMMIT PRESERVE ROWS/g);
assert.equal((sql.match(/ON COMMIT PRESERVE ROWS/g) || []).length, 2);
assert.ok(lastClaimLink < dropRelation && dropRelation < dropTask && dropTask < end);
assert.match(sql.slice(dropTask, end), /^DROP TABLE pg_temp\.decision_graph_seed_task_capabilities;\nEND\n$/);

console.log(JSON.stringify({ success: true, atomicTopLevelStatements: 1, tempTablesExplicitlyDropped: 2 }, null, 2));
