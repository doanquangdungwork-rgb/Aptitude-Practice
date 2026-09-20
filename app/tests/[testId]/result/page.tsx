import { appCatalog, pillarMap } from "../../../../lib/data";
import { questionsForEngine } from "../../../../lib/question-source";
import ResultPageClient from "../../../../components/result-page-client";

export default async function ResultPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const test = appCatalog.tests.find((x: any) => x.test_id === testId) ?? null;
  const qs = questionsForEngine(testId);
  return <ResultPageClient testId={testId} test={test} qs={qs} pillarMap={pillarMap} />;
}
