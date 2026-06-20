import Link from "next/link";
import {
  BarChart3,
  Bookmark,
  Eye,
  MessageCircle,
  Repeat2,
  ThumbsUp,
  type LucideIcon
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

type Snapshot = {
  id: string;
  title: string;
  href: string;
  topic: string;
  hook: string;
  format: string;
  recordedAt: Date;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
};

type GroupScore = {
  label: string;
  count: number;
  views: number;
  engagements: number;
  saves: number;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

function engagementTotal(snapshot: Pick<Snapshot, "likes" | "comments" | "shares" | "saves">) {
  return snapshot.likes + snapshot.comments + snapshot.shares + snapshot.saves;
}

function engagementRate(views: number, engagements: number) {
  return views > 0 ? `${((engagements / views) * 100).toFixed(1)}%` : "0.0%";
}

function getHook(content: string) {
  const firstLine = content
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);
  const hook = firstLine ?? content.trim();

  return hook.length > 96 ? `${hook.slice(0, 93)}...` : hook || "Untitled hook";
}

function scoreGroups(snapshots: Snapshot[], getLabel: (snapshot: Snapshot) => string) {
  const groups = new Map<string, GroupScore>();

  snapshots.forEach((snapshot) => {
    const label = getLabel(snapshot);
    const current = groups.get(label) ?? {
      label,
      count: 0,
      views: 0,
      engagements: 0,
      saves: 0
    };

    current.count += 1;
    current.views += snapshot.views;
    current.engagements += engagementTotal(snapshot);
    current.saves += snapshot.saves;
    groups.set(label, current);
  });

  return Array.from(groups.values())
    .sort((a, b) => b.engagements + b.saves - (a.engagements + a.saves))
    .slice(0, 5);
}

export default async function AnalyticsPage() {
  const drafts = await prisma.draft.findMany({
    where: {
      analytics: {
        some: {}
      }
    },
    orderBy: { updatedAt: "desc" },
    include: {
      idea: {
        include: {
          contentPillar: true
        }
      },
      posts: {
        orderBy: { position: "asc" }
      },
      analytics: {
        orderBy: { recordedAt: "desc" },
        take: 1
      }
    }
  });

  const snapshots: Snapshot[] = drafts.flatMap((draft) => {
    const latest = draft.analytics[0];

    if (!latest) {
      return [];
    }

    const postCount = draft.posts.length || 1;
    const format = postCount > 1 ? `${draft.platform} thread (${postCount} posts)` : `${draft.platform} post`;

    return [
      {
        id: latest.id,
        title: draft.idea?.title ?? "Standalone draft",
        href: `/drafts/${draft.id}`,
        topic: draft.idea?.topic || draft.idea?.contentPillar?.name || "Unlabeled topic",
        hook: getHook(draft.posts[0]?.content ?? draft.content),
        format,
        recordedAt: latest.recordedAt,
        views: latest.views,
        likes: latest.likes,
        comments: latest.comments,
        shares: latest.shares,
        saves: latest.saves
      }
    ];
  });

  const totals = snapshots.reduce(
    (acc, snapshot) => {
      acc.views += snapshot.views;
      acc.likes += snapshot.likes;
      acc.comments += snapshot.comments;
      acc.shares += snapshot.shares;
      acc.saves += snapshot.saves;
      return acc;
    },
    { views: 0, likes: 0, comments: 0, shares: 0, saves: 0 }
  );
  const totalEngagements = totals.likes + totals.comments + totals.shares + totals.saves;
  const topSnapshots = [...snapshots]
    .sort((a, b) => engagementTotal(b) + b.saves - (engagementTotal(a) + a.saves))
    .slice(0, 8);
  const topTopics = scoreGroups(snapshots, (snapshot) => snapshot.topic);
  const topHooks = scoreGroups(snapshots, (snapshot) => snapshot.hook);
  const topFormats = scoreGroups(snapshots, (snapshot) => snapshot.format);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Analytics"
        description="Review manually entered performance to learn which topics, hooks, and formats are working."
      />

      {snapshots.length === 0 ? (
        <EmptyState
          title="No performance data yet"
          description="Open a published draft and save views, likes, comments, shares, saves, and notes after it goes live."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Tracked posts", value: snapshots.length, icon: BarChart3 },
              { label: "Total views", value: formatNumber(totals.views), icon: Eye },
              { label: "Engagements", value: formatNumber(totalEngagements), icon: ThumbsUp },
              { label: "Engagement rate", value: engagementRate(totals.views, totalEngagements), icon: Repeat2 }
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <Card key={stat.label}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                    <Icon className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-semibold">{stat.value}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ScoreCard title="Top topics" groups={topTopics} />
            <ScoreCard title="Top hooks" groups={topHooks} />
            <ScoreCard title="Top formats" groups={topFormats} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent performance snapshots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {topSnapshots.map((snapshot) => {
                  const engagements = engagementTotal(snapshot);

                  return (
                    <Link key={snapshot.id} href={snapshot.href} className="block py-4 hover:bg-muted/50">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="font-medium">{snapshot.title}</h2>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {snapshot.topic} - {snapshot.format} - {formatDate(snapshot.recordedAt)}
                          </p>
                        </div>
                        <Badge>{engagementRate(snapshot.views, engagements)}</Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <Metric icon={Eye} label={`${formatNumber(snapshot.views)} views`} />
                        <Metric icon={ThumbsUp} label={`${formatNumber(snapshot.likes)} likes`} />
                        <Metric icon={MessageCircle} label={`${formatNumber(snapshot.comments)} comments`} />
                        <Metric icon={Repeat2} label={`${formatNumber(snapshot.shares)} shares`} />
                        <Metric icon={Bookmark} label={`${formatNumber(snapshot.saves)} saves`} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function ScoreCard({ title, groups }: { title: string; groups: GroupScore[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {groups.map((group) => (
            <div key={group.label} className="rounded-lg border p-3">
              <p className="line-clamp-2 text-sm font-medium">{group.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {group.count} post{group.count === 1 ? "" : "s"} - {formatNumber(group.views)} views -{" "}
                {formatNumber(group.engagements)} engagements - {formatNumber(group.saves)} saves
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
