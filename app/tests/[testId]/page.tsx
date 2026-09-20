import { appCatalog, pillarMap } from "../../../lib/data";
import { questionsForEngine } from "../../../lib/question-source";
import TestPageClient from "../../../components/test-page-client";

export default async function TestPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const test = appCatalog.tests.find((x: any) => x.test_id === testId) ?? null;
  const qs = questionsForEngine(testId);
  return <TestPageClient testId={testId} test={test} qs={qs} pillarMap={pillarMap} />;
}
