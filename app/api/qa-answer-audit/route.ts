import { canonicalTests } from "../../../lib/question-source";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (token !== "aptitude-audit-20260920") return Response.json({ error: "not found" }, { status: 404 });
  const focus = new Set(["TEST_005","TEST_006","TEST_007","TEST_008","TEST_009","TEST_010","TEST_023","TEST_024","TEST_025","TEST_026","TEST_027","TEST_028","TEST_029","TEST_035","TEST_036","TEST_037","TEST_038","TEST_039","TEST_043","TEST_044","TEST_045","TEST_046","TEST_047","TEST_048","TEST_049","TEST_050","TEST_051","TEST_052","TEST_053","TEST_054","TEST_055","TEST_056","TEST_057","TEST_058","TEST_059","TEST_100","TEST_101","TEST_102"]);
  return Response.json(canonicalTests.filter(t => focus.has(t.id)).map(t => ({
    id:t.id,title:t.title,count:t.questions.length,
    responseTypes:[...new Set(t.questions.map(q=>q.response.type))],
    optionCounts:[...new Set(t.questions.map(q=>q.options.length))],
    answers:t.questions.map(q=>({id:q.id,n:q.number,sub:q.subquestion,response:q.response,options:q.options.map(o=>({id:o.id,text:o.content.type==="text"?o.content.value:"[non-text]"})),answer:q.answer}))
  })));
}
