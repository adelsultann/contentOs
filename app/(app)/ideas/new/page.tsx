import { IdeaForm } from "@/components/idea-form";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { createIdea } from "@/lib/actions/ideas";

export default function NewIdeaPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="New idea" description="Capture the thought now. Shape can come later." />
      <Card>
        <CardContent className="p-5">
          <IdeaForm onSubmit={createIdea} submitLabel="Create idea" />
        </CardContent>
      </Card>
    </div>
  );
}
