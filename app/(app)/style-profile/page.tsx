import { PageHeader } from "@/components/page-header";
import { StyleProfileForm } from "@/components/style-profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { upsertStyleProfile } from "@/lib/actions/style-profile";
import { prisma } from "@/lib/prisma";

export default async function StyleProfilePage() {
  const profile = await prisma.styleProfile.findFirst({
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Style profile"
        description="Define the voice future agents should learn before any AI execution is added."
      />

      <Card>
        <CardHeader>
          <CardTitle>Writing style</CardTitle>
          <CardDescription>
            Store your Saudi Arabic voice, audience, rules, phrases, and examples locally.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StyleProfileForm
            defaultValues={{
              dialect: profile?.dialect ?? "",
              tone: profile?.tone ?? "",
              audience: profile?.audience ?? "",
              writingRules: profile?.writingRules ?? "",
              bannedPhrases: profile?.bannedPhrases ?? "",
              commonPhrases: profile?.commonPhrases ?? "",
              examplePosts: profile?.examplePosts ?? ""
            }}
            onSubmit={upsertStyleProfile}
          />
        </CardContent>
      </Card>
    </div>
  );
}
